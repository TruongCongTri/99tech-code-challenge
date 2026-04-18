/**
 * @file env.ts
 * @description Centralized environment variable management. 
 * Uses Zod to enforce type-safety and presence of required variables at runtime.
 */
import { z } from 'zod';
import dotenv from 'dotenv';
import { APP_CONFIG } from '@/constants/app.constant';
import { FIELDS } from '@/constants/fields';
import { MESSAGES } from '@/constants/messages';

// Initialize dotenv to load .env file into process.env
dotenv.config();

/**
 * @schema envSchema
 * @description Defines the shape and validation rules for application environment variables.
 */
const envSchema = z.object({
  /* --- Server Configuration --- */
  PORT: z.string().default(APP_CONFIG.SERVER.DEFAULT_PORT),
  DATABASE_URL: z.string().min(1, MESSAGES.SERVER.CONFIGURE(FIELDS.DB)),
  CLIENT_URL: z.string().min(1, MESSAGES.SERVER.CONFIGURE(FIELDS.CLIENT)),

  /* --- Authentication (JWT) --- */
  JWT_SECRET: z.string().min(10),
  JWT_EXPIRES_IN: z.string().default(APP_CONFIG.SECURITY.JWT.ACCESS_EXPIRES_IN),
  JWT_REFRESH_SECRET: z.string().min(10),
  JWT_REFRESH_EXPIRES_IN: z.string().default(APP_CONFIG.SECURITY.JWT.REFRESH_EXPIRES_IN),

  /* --- Security --- */
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(1).default(APP_CONFIG.SECURITY.BCRYPT_SALT_ROUNDS),
});

/**
 * Perform safe parsing of process.env.
 * If validation fails, it triggers an immediate process exit to prevent unstable runtime states.
 */
const envParsed = envSchema.safeParse(process.env);

if (!envParsed.success) {
  console.error('FATAL: Invalid environment variables:');
  console.error(envParsed.error.flatten().fieldErrors);
  process.exit(1);
}

/**
 * @exports env
 * @description Immutable, validated environment configuration object.
 */
export const env = envParsed.data;
