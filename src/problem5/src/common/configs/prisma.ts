import { PrismaClient } from '../../generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { env } from './env'; 

// 1. Generate pool to connect to PostgreSQL using the connection string from environment variables
const pool = new pg.Pool({ connectionString: env.DATABASE_URL });

// 2. Create an adapter so that Prisma can talk to 'pg' pool
const adapter = new PrismaPg(pool as any);

// 3. Create a Prisma Client instance using the adapter
export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
