/**
 * @file score-event.integration.test.ts
 * @description Integration test suite for the Score Event module.
 * Verifies the integrity of the full request-response lifecycle against the dedicated test database.
 * @module Modules/ScoreEvent/Test
 */
import request from 'supertest';
import app from '@/app'; 
import { prisma } from '@/common/configs/prisma';
import { ActionType } from '../../generated/client';

// Keep track of an ID to use in the dynamic route tests
let validEventId: string;
const testPlayerId = crypto.randomUUID(); // Valid UUID

describe('Score Event Module Integration Tests', () => {
  // Clean up the database before running the suite to ensure a pristine state
  beforeAll(async () => {
    const transactions = [
      prisma.scoreEvent.deleteMany(),
      prisma.playerScore.deleteMany(),
    ];
    await prisma.$transaction(transactions);
  });  

  // 🔌 Disconnect Prisma after all tests finish
  afterAll(async () => {
    await prisma.$disconnect();
  });

  // FOLDER 1: EVENT CREATION & ANTI-CHEAT (POST /)
  describe('POST /api/v1/score-events', () => {
    it('Case 1.1: Should create a legitimate score event and update PlayerScore', async () => {
      const payload = {
        playerId: testPlayerId,
        actionType: ActionType.SLOT_SPIN,
        pointsAwarded: 500,
      };

      const res = await request(app).post('/api/v1/score-events').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.data.isFlagged).toBe(false);
      expect(res.body.data.pointsAwarded).toBe(500);

      validEventId = res.body.data.id; // Save for Folder 4 tests

      // Verify the CQRS Materialized View updated
      const playerScore = await prisma.playerScore.findUnique({ where: { playerId: testPlayerId } });
      expect(playerScore?.totalPoints).toBe(500);
    });

    it('Case 1.2: Should flag a simulated hacker and NOT update PlayerScore', async () => {
      const hackerId = '999e4567-e89b-12d3-a456-426614174999';
      const payload = {
        playerId: hackerId,
        actionType: ActionType.DAILY_LOGIN,
        pointsAwarded: 999999, // Triggers the > 10000 anti-cheat
      };

      const res = await request(app).post('/api/v1/score-events').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.data.isFlagged).toBe(true); // Flagged!

      // Verify CQRS protected the live leaderboard
      const hackerScore = await prisma.playerScore.findUnique({ where: { playerId: hackerId } });
      expect(hackerScore).toBeNull();
    });

    it('Case 1.3: Should reject bad data via Zod validation', async () => {
      const badPayload = {
        playerId: 'not-a-uuid', // Invalid
        actionType: 'INVALID_ACTION', // Not in Enum
        pointsAwarded: -50, // Negative
      };

      const res = await request(app).post('/api/v1/score-events').send(badPayload);

      expect(res.status).toBe(422); // Bad Request
      expect(res.body.meta.success).toBe(false);
    });
  });

  // FOLDER 2: THE LIVE SCOREBOARD (GET /scoreboard)
  describe('GET /api/v1/score-events/scoreboard', () => {
    it('Case 2.1: Should fetch Global Leaderboard from the Materialized View', async () => {
      const res = await request(app).get('/api/v1/score-events/scoreboard');

      expect(res.status).toBe(200);
      expect(res.body.meta.pagination.page).toBe(1);
      expect(res.body.meta.pagination.limit).toBe(10);
      expect(res.body.data.length).toBeGreaterThan(0);
      
      // Ensure it returned PlayerScore shape (no actionType)
      expect(res.body.data[0]).toHaveProperty('totalPoints');
      expect(res.body.data[0]).not.toHaveProperty('actionType');
    });

    it('Case 2.2: Should dynamically route Granular Action Tournaments', async () => {
      const res = await request(app).get(`/api/v1/score-events/scoreboard?actionType=${ActionType.SLOT_SPIN}&limit=5`);

      expect(res.status).toBe(200);
      expect(res.body.meta.pagination.limit).toBe(5);
      expect(res.body.data.length).toBeGreaterThan(0);
      
      // It should still look like a PlayerScore object to the frontend
      expect(res.body.data[0]).toHaveProperty('totalPoints');
    });
  });

  // FOLDER 3: THE AUDIT LEDGER (GET /)
  describe('GET /api/v1/score-events', () => {
    it('Case 3.1: Should successfully parse complex query parameters and range filters', async () => {
      const url = `/api/v1/score-events?actionType=${ActionType.SLOT_SPIN}&isFlagged=false&minPoints=100&maxPoints=1000&sortBy=highest_points`;
      const res = await request(app).get(url);

      expect(res.status).toBe(200);
      
      res.body.data.forEach((event: any) => {
        expect(event.actionType).toBe(ActionType.SLOT_SPIN);
        expect(event.isFlagged).toBe(false);
        expect(event.pointsAwarded).toBeGreaterThanOrEqual(100);
        expect(event.pointsAwarded).toBeLessThanOrEqual(1000);
      });
    });

    it('Case 3.2: Should reject queries with invalid UUIDs or conflicting ranges', async () => {
      // minPoints > maxPoints should trigger the Zod .refine() block
      const url = `/api/v1/score-events?playerId=invalid-uuid&minPoints=500&maxPoints=100`;
      const res = await request(app).get(url);

      expect(res.status).toBe(422);
      
      // Depending on your global error handler, check for stringified Zod errors
      const errorString = JSON.stringify(res.body);
      expect(errorString).toContain('Player ID'); 
      expect(errorString).toContain('Point'); 
    });
  });

  // FOLDER 4: ADMINISTRATIVE ACTIONS (GET, PATCH, DELETE /:id)
  describe('Administrative Actions by ID', () => {
    it('Case 4.1: Should fetch detail of a specific event', async () => {
      const res = await request(app).get(`/api/v1/score-events/${validEventId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(validEventId);
    });

    it('Case 4.2: Should protect routes with UUID validation', async () => {
      const res = await request(app).get('/api/v1/score-events/not-a-real-uuid');

      expect(res.status).toBe(422); // Fails the Zod getIDSchema
    });

    it('Case 4.3: Should return 404 for a non-existent UUID', async () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000000';
      const res = await request(app).get(`/api/v1/score-events/${fakeUuid}`);

      expect(res.status).toBe(404);
    });

    it('Case 4.4: Should successfully update an event (e.g., manual override)', async () => {
      const res = await request(app)
        .patch(`/api/v1/score-events/${validEventId}`)
        .send({ isFlagged: true });

      expect(res.status).toBe(200);
      expect(res.body.data.isFlagged).toBe(true);
    });

    it('Case 4.5: Should delete the event completely', async () => {
      const res = await request(app).delete(`/api/v1/score-events/${validEventId}`);

      expect(res.status).toBe(200);

      // Verify it's actually gone
      const verifyRes = await request(app).get(`/api/v1/score-events/${validEventId}`);
      expect(verifyRes.status).toBe(404);
    });
  });
});