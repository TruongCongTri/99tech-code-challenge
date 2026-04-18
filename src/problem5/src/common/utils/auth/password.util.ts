/**
 * @file password.util.ts
 * @description Cryptographic utility for secure password handling using BcryptJS.
 * Handles salt-based hashing and timing-safe comparisons.
 * @module Common/Utils
 */
import bcrypt from 'bcryptjs';
import { env } from '../../configs/env';

export const PasswordUtil = {
  /**
   * @method compare
   * @description Timing-safe comparison of a plain-text password against a hashed value.
   * @returns {Promise<boolean>} True if match, false if no match or missing input.
   */
  compare: async (plainPassword?: string, hash?: string): Promise<boolean> => {
    if (!plainPassword || !hash) return false;
    return bcrypt.compare(plainPassword, hash);
  },

  /**
   * @method hashIfNeeded
   * @description Checks if a string is already a Bcrypt hash. If not, hashes it.
   * This is an idempotent operation designed for use in Service layers or Prisma Middlewares.
   * Detects hashes by standard bcrypt prefixes: $2a$, $2b$, or $2y$.
   */
  hashIfNeeded: async (password: string): Promise<string> => {
    if (
      !password ||
      typeof password !== 'string' ||
      password.startsWith('$2a$') ||
      password.startsWith('$2b$') ||
      password.startsWith('$2y$')
    ) {
      // Input is either empty, invalid, or already contains a valid hash prefix
      return password;
    }

    // BCRYPT_SALT_ROUNDS is validated as a number >= 1 by the Env schema
    return bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
  },
};
