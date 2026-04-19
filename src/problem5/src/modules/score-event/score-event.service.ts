/**
 * @file score-event.service.ts
 * @description Business Logic Layer for the Score Event module.
 * Orchestrates repository calls, anti-cheat validation, and data transformation for the scoreboard.
 * @module Modules/ScoreEvent/Service
 */
import { ScoreEventRepository } from './score-event.repository';
import { CreateScoreEventDTO, GetScoreboardQueryDTO, GetScoreEventsQueryDTO, UpdateScoreEventDTO } from './score-event.schema';
import { AppError } from '@/common/errors/app.error';
import { MESSAGES } from '@/constants/messages';
import { RESOURCES } from '@/constants/resources';
import { PaginationMetaDto } from '@/data/dtos/pagination.dto';
import { APP_CONFIG } from '@/constants/app.constant';

/**
 * @class ScoreEventService
 * @description Orchestrates business logic, verifies entity existence before mutations, 
 * and constructs standardized pagination metadata for the client layer.
 */
export class ScoreEventService {
  private readonly scoreEventRepository: ScoreEventRepository;

  constructor() {
    this.scoreEventRepository = new ScoreEventRepository();
  }

  /**
   * @description Processes the creation of a new score event.
   */
  public async create(data: CreateScoreEventDTO) {
    const isFlagged = data.pointsAwarded > APP_CONFIG.SCORE_EVENT.MAX_POINT;
    return await this.scoreEventRepository.createWithTransaction({
      ...data,
      isFlagged,
    });
  }

  /**
   * @description Retrieves the administrative audit ledger and formats pagination metadata.
   */
  public async getAll(query: GetScoreEventsQueryDTO) {
    const { total, data } = await this.scoreEventRepository.getScoreEvents(query);
    const meta = PaginationMetaDto.create(query.page, query.limit, total);

    return { meta, data };
  }

  /**
   * @description Retrieves the live scoreboard for end-users and formats pagination metadata.
   */
  public async getLiveScoreboard(query: GetScoreboardQueryDTO) {
    const { total, data } = await this.scoreEventRepository.getLiveScoreboard(query);
    const meta = PaginationMetaDto.create(query.page, query.limit, total);
    return { meta, data };
  }
  
  /**
   * @description Fetches a specific event. Throws a 404 AppError if not found.
   */
  public async getDetail(id: string) {
    const result = await this.scoreEventRepository.findById(id);
    if (!result) 
      throw new AppError(404, MESSAGES.COMMON.ERROR.NOT_FOUND(RESOURCES.SCORE_EVENT));
    return result;
  }

  /**
   * @description Updates an event, verifying existence first to prevent ghost updates.
   */
  public async update(id: string, data: UpdateScoreEventDTO) {
    // 1. Verify existence
    await this.getDetail(id);

    // 2. Call Repository to update
    return await this.scoreEventRepository.updateWithSync(id, data);
  }

  /**
   * @description Deletes an event, verifying existence first.
   */
  public async delete(id: string) {
    // 1. Verify existence
    await this.getDetail(id);

    // 2. Call Repository to delete
    return await this.scoreEventRepository.deleteWithSync(id);
  }
  
}