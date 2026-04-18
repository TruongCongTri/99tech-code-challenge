/**
 * @file score-event.repository.ts
 * @description Data Access Layer for the Score Event module.
 * Encapsulates all Prisma database operations including CRUD and complex leaderboard queries.
 * @module Modules/ScoreEvent/Repository
 */
import { PlayerScore, Prisma, ScoreEvent } from '@/generated/client';
import { prisma } from '@/common/configs/prisma';
import { BaseRepository } from '@/common/repositories/base.repository';
import { CreateScoreEventDTO, GetScoreboardQueryDTO, GetScoreEventsQueryDTO, UpdateScoreEventDTO } from './score-event.schema';
import { APP_CONFIG } from '@/constants/app.constant';

/**
 * @class ScoreEventRepository
 * @description Handles all raw database interactions, atomic transactions, and CQRS routing
 * for the ScoreEvent and PlayerScore domains.
 */
export class ScoreEventRepository extends BaseRepository<Prisma.ScoreEventDelegate> {
  constructor() {
    // inject Prisma client delegate for ScoreEvent model
    super('scoreEvent');
  }

  /**
   * @method createWithTransaction
   * @description Executes an ACID-compliant transaction to log the event AND update the materialized view.
   * Implements anti-cheat gating at the database level.
   * @param data - The validated event payload
   * @returns The created audit record
   */
  public async createWithTransaction(data: CreateScoreEventDTO) {
    const isFlagged = data.pointsAwarded > APP_CONFIG.SCORE_EVENT.MAX_POINT;

    return await prisma.$transaction(async (tx) => {
      const event = await tx.scoreEvent.create({
        data: {
          playerId: data.playerId,
          actionType: data.actionType,
          pointsAwarded: data.pointsAwarded,
          metadata: data.metadata ? data.metadata : undefined, 
          isFlagged: isFlagged 
        },
      });

      // Maintain CQRS state: Only update the live leaderboard if the event is legitimate
      if (!isFlagged) {
        await tx.playerScore.upsert({
          where: { playerId: data.playerId },
          update: { totalPoints: { increment: data.pointsAwarded } },
          create: { playerId: data.playerId, totalPoints: data.pointsAwarded },
        });
      }

      return event;
    });
  }

  /**
   * @method updateWithSync
   * @description Updates an event and adjusts the aggregate PlayerScore if points changed.
   * 
   * @param id - The strictly validated UUID of the score event
   * @param data - The partial data payload to update
   * @returns The updated audit record
   */
  public async updateWithSync(id: string, data: UpdateScoreEventDTO) {
    return await prisma.$transaction(async (tx) => {
      const oldEvent = await tx.scoreEvent.findUnique({ where: { id } });
      if (!oldEvent) return null;

      const updateData: Prisma.ScoreEventUpdateInput = {
        ...(data.isFlagged !== undefined && { isFlagged: data.isFlagged }),
        ...(data.pointsAwarded !== undefined && { pointsAwarded: data.pointsAwarded }),
        ...(data.metadata !== undefined && { metadata: data.metadata }),
      };

      const updatedEvent = await tx.scoreEvent.update({
        where: { id },
        data: updateData,
      });

      // If points changed and neither the old nor new state is flagged, sync the difference
      if (data.pointsAwarded !== undefined && !oldEvent.isFlagged && !updatedEvent.isFlagged) {
        const diff = data.pointsAwarded - oldEvent.pointsAwarded;
        await tx.playerScore.update({
          where: { playerId: updatedEvent.playerId },
          data: { totalPoints: { increment: diff } }
        });
      }
      return updatedEvent;
    });
  }

  /**
   * @method getScoreEvents
   * @description Fetches paginated records from the raw audit ledger (ScoreEvent table).
   * @param query - The formatted search parameters
   * @returns 
   */
  public async getScoreEvents(query: GetScoreEventsQueryDTO) {
    const page = Number(query.page) || APP_CONFIG.COMMON.PAGINATION.DEFAULT_PAGE;
    const limit = Number(query.limit) || APP_CONFIG.COMMON.PAGINATION.DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const args = {
      where: this.buildWhereClause(query),
      orderBy: this.buildOrderBy(query.sortBy),
      skip,
      take: limit,
    };

    return await this.executePagination<ScoreEvent>(args);
  }

  /**
   * @method getLiveScoreboard
   * @description Implements Dynamic Query Routing. Reads from the fast PlayerScore table
   * for global leaderboards, or falls back to calculating the ScoreEvent table for action-specific tournaments.
   * @param query - The formatted search parameters
   * @returns 
   */
  public async getLiveScoreboard(query: GetScoreboardQueryDTO) {
    const page = Number(query.page) || APP_CONFIG.COMMON.PAGINATION.DEFAULT_PAGE;
    const limit = Number(query.limit) || APP_CONFIG.COMMON.PAGINATION.DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    // Route A: Granular calculation for specific action tournaments
    if (query.actionType) {
      const where: Prisma.ScoreEventWhereInput = {
        actionType: query.actionType,
        isFlagged: false, // Anti-cheat: ignore flagged events
      };
      if (query.playerId) where.playerId = query.playerId;

      const uniquePlayers = await prisma.scoreEvent.findMany({
        distinct: ['playerId'],
        where,
        select: { playerId: true }
      });
      const groupedScores = await prisma.scoreEvent.groupBy({
        by: ['playerId'],
        _sum: { pointsAwarded: true },
        where,
        orderBy: { _sum: { pointsAwarded: 'desc' } },
        skip,
        take: limit,
      });

      const scores = groupedScores.map(g => ({
        playerId: g.playerId,
        totalPoints: g._sum.pointsAwarded || 0,
        updatedAt: new Date() 
      }));

      return { total: uniquePlayers.length, data: scores };
    }

    // Route B: Global Live Scoreboard
    const where: Prisma.PlayerScoreWhereInput = {};
    
    if (query.playerId) 
      where.playerId = { contains: query.playerId, mode: 'insensitive' };
    
    if (query.minPoints !== undefined || query.maxPoints !== undefined) {
      where.totalPoints = {};
      if (query.minPoints !== undefined) where.totalPoints.gte = Number(query.minPoints);
      if (query.maxPoints !== undefined) where.totalPoints.lte = Number(query.maxPoints);
    }

    const args = {
      where,
      skip,
      take: query.limit,
      orderBy: { totalPoints: 'desc' },
      select: {
          playerId: true,
          totalPoints: true,
          updatedAt: true
      }
    };

    return await this.executePagination<PlayerScore>(args, prisma.playerScore);
  }


  /**
   * @method deleteWithSync
   * @description Removes an event and subtracts its points from the player's aggregate score.
   * 
   * @param id - The strictly validated UUID of the score event
   */
  public async deleteWithSync(id: string) {
  return await prisma.$transaction(async (tx) => {
    const event = await tx.scoreEvent.findUnique({ where: { id } });
    if (!event) return null;

    // 1. Remove the event
    await tx.scoreEvent.delete({ where: { id } });

    // 2. Subtract points from aggregate if it wasn't a flagged event
    if (!event.isFlagged) {
      await tx.playerScore.update({
        where: { playerId: event.playerId },
        data: { totalPoints: { decrement: event.pointsAwarded } }
      });
    }
    return event;
  });
}
  /**
   * Helper: Translates HTTP Query into Prisma Where Input
   */
  private buildWhereClause(query: GetScoreEventsQueryDTO): Prisma.ScoreEventWhereInput {
    const where: Prisma.ScoreEventWhereInput = {};
    
    if (query.playerId) where.playerId = query.playerId;
    if (query.actionType) where.actionType = query.actionType;
    if (query.isFlagged !== undefined) {
      where.isFlagged = String(query.isFlagged) === 'true';
    }
    
    if (query.minPoints !== undefined || query.maxPoints !== undefined) {
      where.pointsAwarded = {};
      if (query.minPoints !== undefined) where.pointsAwarded.gte = Number(query.minPoints);
      if (query.maxPoints !== undefined) where.pointsAwarded.lte = Number(query.maxPoints);
    }

    return where;
  }

  /**
   * Helper: Translates String Sort into Prisma OrderBy Input
   */
  private buildOrderBy(sortBy?: string): Prisma.ScoreEventOrderByWithRelationInput {
    switch (sortBy) {
      case 'oldest': return { createdAt: 'asc' };
      case 'highest_points': return { pointsAwarded: 'desc' };
      case 'lowest_points': return { pointsAwarded: 'asc' };
      case 'newest': 
      default: return { createdAt: 'desc' };
    }
  }
}