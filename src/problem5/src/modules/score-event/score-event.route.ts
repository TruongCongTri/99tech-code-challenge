/**
 * @file score-event.route.ts
 * @description Router configuration for the Score Event module.
 * Defines API endpoints and mounts the necessary validation and authentication middlewares.
 * @module Modules/ScoreEvent/Route
 */
import { Router } from 'express';
import { ScoreEventController } from './score-event.controller';
import { validate } from '@/middlewares/validate.middleware';
import { 
  createScoreEventSchema, 
  updateScoreEventSchema, 
  getScoreEventsQuerySchema,
  getScoreboardQuerySchema 
} from './score-event.schema';
import { ENDPOINTS } from '@/constants/endpoints';
import { getIDSchema } from '@/common/schemas/reusable.schema';

/**
 * @class ScoreEventRoute
 * @description Registers all RESTful endpoints, injects Zod validation middlewares,
 * and maintains strict path precedence to prevent routing conflicts.
 */
export class ScoreEventRoute {
  public router: Router;
  private readonly scoreEventController: ScoreEventController;

  /**
   * Init Route with Dependency Injection (DI)
   */
  constructor(controller?: ScoreEventController) {
    this.router = Router();
    this.scoreEventController = controller || new ScoreEventController();
    
    this.initializeRoutes();
  }

  private initializeRoutes() {

    // [POST] CREATE NEW ScoreEvent
    this.router.post(
      "/",
      validate(createScoreEventSchema),
      this.scoreEventController.create
    );

    // [GET] LIVE SCOREBOARD
    this.router.get(
      ENDPOINTS.SCORE_EVENT.SCOREBOARD, 
      validate(getScoreboardQuerySchema),
      this.scoreEventController.getLiveScoreboard
    );

    // [GET] GET ALL ScoreEvent (Audit Ledger)
    this.router.get(
      "/",
      validate(getScoreEventsQuerySchema),
      this.scoreEventController.getAll
    );
    
    // [GET] GET DETAILS OF ScoreEvent BY ID
    this.router.get(
      ENDPOINTS.SCORE_EVENT.RESOURCE,
      validate(getIDSchema),
      this.scoreEventController.getDetail
    );

    // [PATCH] UPDATE ScoreEvent BY ID
    this.router.patch(
      ENDPOINTS.SCORE_EVENT.RESOURCE,
      validate(getIDSchema),
      validate(updateScoreEventSchema),
      this.scoreEventController.update
    );

    // [DELETE] DELETE ScoreEvent BY ID
    this.router.delete(
      ENDPOINTS.SCORE_EVENT.RESOURCE,
      validate(getIDSchema),
      this.scoreEventController.delete
    );
  }
}

// Export default instance of Route to be used in main route configuration
export default new ScoreEventRoute().router;