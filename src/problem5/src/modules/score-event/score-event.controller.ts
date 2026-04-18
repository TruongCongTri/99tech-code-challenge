/**
 * @file score-event.controller.ts
 * @description Request handler for Score Event endpoints.
 * Maps HTTP requests to service methods and formats standardized API responses using the Response utility.
 * @module Modules/ScoreEvent/Controller
 */
import { Request, Response } from 'express';
import { ScoreEventService } from './score-event.service';
import { successResponse } from '@/common/utils/responses/api-response';
import { MESSAGES } from '@/constants/messages';
import { RESOURCES } from '@/constants/resources';
import { CreateScoreEventDTO, GetScoreboardQueryDTO, GetScoreEventsQueryDTO, UpdateScoreEventDTO } from './score-event.schema';

/**
 * @class ScoreEventController
 * @description Bridges the Express HTTP layer and the underlying Service logic.
 * Assumes a global async-error handler wrapper is active in the Express app.
 */
export class ScoreEventController {
  private readonly scoreEventService: ScoreEventService;

  constructor() {
    this.scoreEventService = new ScoreEventService();
  }

  /**
   * @description [POST] Extracts body and initiates event creation.
   */
  public create = async (req: Request, res: Response) => {
    const payload = req.body as CreateScoreEventDTO; 
    const result = await this.scoreEventService.create(payload);

    successResponse(res, {
      statusCode: 201,
      message: MESSAGES.COMMON.SUCCESS.CREATED(RESOURCES.SCORE_EVENT),
      data: result,
    });
  };

  /**
   * @description [GET] Extracts validated query and fetches the Audit Ledger.
   */
  public getAll = async (req: Request, res: Response) => {
    const filters = req.query as unknown as GetScoreEventsQueryDTO;
    const result = await this.scoreEventService.getAll(filters);

    successResponse(res, {
      statusCode: 200,
      message: MESSAGES.COMMON.SUCCESS.FETCHED(RESOURCES.SCORE_EVENT),
      data: result.data,
      meta: result.meta,
    });
  };

  /**
   * @description [GET] Extracts validated query and fetches the Live Scoreboard.
   */
  public getLiveScoreboard = async (req: Request, res: Response) => {
    const filters = req.query as unknown as GetScoreboardQueryDTO;
    const result = await this.scoreEventService.getLiveScoreboard(filters);

    successResponse(res, {
      statusCode: 200,
      message: MESSAGES.COMMON.SUCCESS.FETCHED(RESOURCES.LIVE_SCOREBOARD),
      data: result.data,
      meta: result.meta
    });
  };
  
  /**
   * @description [GET] Get details ScoreEvent
   */
  public getDetail = async (req: Request, res: Response) => {
    const id = req.params.id as string; 
    
    const result = await this.scoreEventService.getDetail(id);

    successResponse(res, {
      statusCode: 200,
      message: MESSAGES.COMMON.SUCCESS.FETCHED(RESOURCES.SCORE_EVENT),
      data: result,
    });
  };

  /**
   * @description [PATCH] Update ScoreEvent
   */
  public update = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const payload = req.body as UpdateScoreEventDTO;

    const result = await this.scoreEventService.update(id, payload);

    successResponse(res, {
      statusCode: 200,
      message: MESSAGES.COMMON.SUCCESS.UPDATED(RESOURCES.SCORE_EVENT),
      data: result,
    });
  };

  /**
   * @description [DELETE] Delete ScoreEvent
   */
  public delete = async (req: Request, res: Response) => {
    const id = req.params.id as string; 
    
    await this.scoreEventService.delete(id);

    successResponse(res, {
      statusCode: 200, // Or 204 No Content
      message: MESSAGES.COMMON.SUCCESS.DELETED(RESOURCES.SCORE_EVENT),
    });
  };
}