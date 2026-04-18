/**
 * @file score-event.schema.ts
 * @description Zod validation schemas for the Score Event module.
 * Defines the structural requirements for creating, updating, and filtering score events.
 * @module Modules/ScoreEvent/Schema
 */
import { z } from 'zod';
import { MESSAGES } from '@/constants/messages';
import { FIELDS } from '@/constants/fields';
import { ActionType } from '@/generated/client';
import { paginationSchema } from '@/common/schemas/reusable.schema';
import { SORT_OPTIONS } from '@/constants/app.constant';

/**
 * @schema createScoreEventSchema
 * @description Validates incoming payload for creating a new score event.
 * Enforces non-negative points and strict ActionType enum compliance.
 */
export const createScoreEventSchema = z.object({
  body: z.object({
    playerId: z
      .string({ message: MESSAGES.VALIDATION.REQUIRED(FIELDS.PLAYER_ID) })
      .trim()
      .uuid({ message: MESSAGES.VALIDATION.INVALID_FORMAT(FIELDS.PLAYER_ID) }),
    actionType: z.enum(ActionType, {
      message: MESSAGES.VALIDATION.REQUIRED(FIELDS.ACTION_TYPE),
    }),
    pointsAwarded: z.number().int().nonnegative(MESSAGES.VALIDATION.INVALID_FORMAT(FIELDS.POINTS_AWARDED)),
    metadata: z.any().optional(),
  }),
});

/**
 * @schema updateScoreEventSchema
 * @description Validates partial payloads for administrative updates (e.g., fraud flag toggling).
 */
export const updateScoreEventSchema = z.object({
  body: z.object({
    isFlagged: z.boolean().optional(),
    pointsAwarded: z.number().int().nonnegative().optional(),
    metadata: z.any().optional(),
  }),
  params: z.object({
    id: z
      .string({ message: MESSAGES.VALIDATION.REQUIRED(FIELDS.ID) })
      .trim()
      .uuid({ message: MESSAGES.VALIDATION.INVALID_FORMAT(FIELDS.ID) }),
  })
});

/**
 * @schema getScoreEventsQuerySchema
 * @description Validates URL search parameters for the Admin Audit Ledger.
 * Converts stringified booleans and ensures valid min/max ranges.
 */
export const getScoreEventsQuerySchema = z.object({
  query: paginationSchema
    .extend({
      playerId: z.string().trim().uuid({message: MESSAGES.VALIDATION.INVALID_FORMAT(FIELDS.PLAYER_ID)}).optional(),
      actionType: z.nativeEnum(ActionType).optional(),
      isFlagged: z.preprocess(
        (val) => {
          if (val === 'true') return true;
          if (val === 'false') return false;
          return val;
        },
        z.boolean().optional()
      ),
      minPoints: z.coerce.number().min(0).optional(),
      maxPoints: z.coerce.number().min(0).optional(),
      sortBy: z.enum(SORT_OPTIONS.SCORE_EVENT).default(SORT_OPTIONS.SCORE_EVENT[0]),
    })
    .refine(
      (data) => {
        if (data.minPoints !== undefined && data.maxPoints !== undefined) {
          return data.minPoints <= data.maxPoints;
        }
        return true;
      },
      { message: MESSAGES.VALIDATION.MIN_VALUE_INVALID(FIELDS.POINT), path: [FIELDS.POINT] }
    ),
});

/**
 * @schema getScoreboardQuerySchema
 * @description Validates URL search parameters for the Live Scoreboard.
 * Allows filtering by specific game actions to generate micro-tournaments.
 */
export const getScoreboardQuerySchema = z.object({
  query: paginationSchema
    .extend({
      playerId: z.string().trim().uuid({message: MESSAGES.VALIDATION.INVALID_FORMAT(FIELDS.PLAYER_ID)}).optional(),
      minPoints: z.coerce.number().min(0).optional(),
      maxPoints: z.coerce.number().min(0).optional(),
      actionType: z.nativeEnum(ActionType).optional(),
    })
    .refine(
      (data) => {
        if (data.minPoints !== undefined && data.maxPoints !== undefined) {
          return data.minPoints <= data.maxPoints;
        }
        return true;
      },
      { message: MESSAGES.VALIDATION.MIN_VALUE_INVALID(FIELDS.POINT), path: [FIELDS.POINT] }
    ),
});

export type CreateScoreEventDTO = z.infer<typeof createScoreEventSchema>['body'];
export type UpdateScoreEventDTO = z.infer<typeof updateScoreEventSchema>['body'];
export type GetScoreEventsQueryDTO = z.infer<typeof getScoreEventsQuerySchema>['query'];
export type GetScoreboardQueryDTO = z.infer<typeof getScoreboardQuerySchema>['query'];