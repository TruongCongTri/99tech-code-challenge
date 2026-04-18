/**
 * @file jwt.util.ts
 * @description Utility for signing and verifying JSON Web Tokens (JWT).
 * Supports dual-token strategy (Access & Refresh) with isolated secrets.
 * @module Common/Utils
 */

import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../configs/env';

/**
 * @interface JwtPayload
 * @description The standard structure of data encoded within an Access Token.
 */
export interface JwtPayload {
  id: string;
  role: string;
  [key: string]: any;
}

export const JwtUtil = {
  // 1. ACCESS TOKEN LOGIC (Short-lived)

  /**
   * @method generateAccessToken
   * @description Generates a token for resource authorization. 
   * Uses JWT_SECRET and defaults to JWT_EXPIRES_IN from env.
   */
  generateAccessToken: (payload: JwtPayload, options: SignOptions = {}): string => {
    const signOptions: SignOptions = { ...options };
    if (signOptions.expiresIn === undefined) {
      signOptions.expiresIn = env.JWT_EXPIRES_IN as any;
    }
    return jwt.sign(payload, env.JWT_SECRET, signOptions);
  },

  /**
   * @method verifyAccessToken
   * @description Validates an access token and returns the decoded payload.
   * Throws an error if the token is expired or tampered with.
   */
  verifyAccessToken: (token: string): JwtPayload => {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  },

  // 2. REFRESH TOKEN LOGIC (Long-lived)

  /**
   * @method generateRefreshToken
   * @description Generates a token used to request new access tokens.
   * Uses JWT_REFRESH_SECRET for added security isolation.
   */
  generateRefreshToken: (payload: { id: string }, options: SignOptions = {}): string => {
    const signOptions: SignOptions = { ...options };
    if (signOptions.expiresIn === undefined) {
      signOptions.expiresIn = env.JWT_REFRESH_EXPIRES_IN as any;
    }
    // Use JWT_REFRESH_SECRET
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, signOptions);
  },

  /**
   * @method verifyRefreshToken
   * @description Validates a refresh token against the Refresh Secret.
   */
  verifyRefreshToken: (token: string): { id: string } => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as { id: string };
  },
};
