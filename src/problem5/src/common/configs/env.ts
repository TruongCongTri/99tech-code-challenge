import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  DATABASE_URL: z.string().min(1, 'Please configure DATABASE_URL'),
  CLIENT_URL: z.string().min(1, 'Please configure CLIENT_URL'),

  JWT_SECRET: z.string().min(10),
  JWT_EXPIRES_IN: z.string().default('15m'), //_Default is 15 minutes
  JWT_REFRESH_SECRET: z.string().min(10),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'), // Default is 7 days

  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(1).default(10), // Automatically coerce to number!
});

const envParsed = envSchema.safeParse(process.env);

if (!envParsed.success) {
  console.error('❌ ERROR Invalid environment variables:');
  console.error(envParsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = envParsed.data;
