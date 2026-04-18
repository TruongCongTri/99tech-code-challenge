import * as crypto from 'crypto';
import { ActionType} from '../src/generated/client';
import { prisma } from '../src/common/configs/prisma';

async function main() {
  console.log('Clearing existing data...');
  // Delete in correct order to avoid foreign key constraints (if any were added)
  await prisma.scoreEvent.deleteMany();
  await prisma.playerScore.deleteMany();

  console.log('Generating 20 unique Player UUIDs...');
  const playerIds = Array.from({ length: 20 }).map(() => crypto.randomUUID());

  const actionTypes = Object.values(ActionType);
  const TOTAL_EVENTS = 100;

  console.log(`Seeding ${TOTAL_EVENTS} Score Events and calculating Live Scores...`);

  let flaggedCount = 0;

  for (let i = 0; i < TOTAL_EVENTS; i++) {
    // 1. Pick a random player and action type
    const playerId = playerIds[Math.floor(Math.random() * playerIds.length)];
    const actionType = actionTypes[Math.floor(Math.random() * actionTypes.length)];

    // 2. Generate points. ~10% chance to simulate a hacker trying to inject 10,000+ points
    const isSimulatedCheat = Math.random() > 0.9;
    const pointsAwarded = isSimulatedCheat 
      ? Math.floor(Math.random() * 5000) + 10001 // Yields 10001 - 15000
      : Math.floor(Math.random() * 1000) + 10;   // Yields 10 - 1010

    const isFlagged = pointsAwarded > 10000;
    if (isFlagged) flaggedCount++;

    const metadata = {
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      sessionTime: Math.floor(Math.random() * 3600)
    };

    // 3. Execute the ACID Transaction (Mirroring our Repository Logic)
    await prisma.$transaction(async (tx) => {
      // Step A: Always insert into the audit ledger
      await tx.scoreEvent.create({
        data: {
          playerId,
          actionType,
          pointsAwarded,
          isFlagged,
          metadata,
        },
      });

      // Step B: Update Materialized View ONLY if not flagged
      if (!isFlagged) {
        await tx.playerScore.upsert({
          where: { playerId },
          update: { totalPoints: { increment: pointsAwarded } },
          create: { playerId, totalPoints: pointsAwarded },
        });
      }
    });

    // Simple progress logger
    if ((i + 1) % 25 === 0) {
      console.log(`   ...seeded ${i + 1}/${TOTAL_EVENTS} events`);
    }
  }

  console.log('Seeding completed successfully!');
  console.log(`Total Fraudulent Events Caught: ${flaggedCount}`);
  
  // Quick validation check
  const topPlayer = await prisma.playerScore.findFirst({
    orderBy: { totalPoints: 'desc' }
  });
  console.log(`Current Leader: ${topPlayer?.playerId} with ${topPlayer?.totalPoints} pts.`);
}

main()
  .catch((e) => {
    console.error('Seeding failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });