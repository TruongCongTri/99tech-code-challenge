import bcrypt from 'bcryptjs';
import { env } from '../../configs/env';

export const PasswordUtil = {
  /**
   * Compare original password with its hash. Returns false if either is missing or if they don't match.
   */
  compare: async (plainPassword?: string, hash?: string): Promise<boolean> => {
    if (!plainPassword || !hash) return false;
    return bcrypt.compare(plainPassword, hash);
  },

  /**
   * Hash password if it hasn't been hashed yet.
   * Detect bcrypt hash by its prefix $2a$, $2b$, $2y$.
   */
  hashIfNeeded: async (password: string): Promise<string> => {
    if (
      !password ||
      typeof password !== 'string' ||
      password.startsWith('$2a$') ||
      password.startsWith('$2b$') ||
      password.startsWith('$2y$')
    ) {
      // Already hashed or invalid input
      return password;
    }

    // Call env.BCRYPT_SALT_ROUNDS directly (Zod has ensured this is definitely a number >= 1)
    return bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
  },
};
