import rateLimit from 'express-rate-limit';
import { APP_CONFIG } from '../constants/app.constant';
import { MESSAGES } from '../constants/messages';
import { ERROR_CODES } from '../constants/error-codes';

// 1. General limiter for all APIs (Prevent request spamming)
export const apiLimiter = rateLimit({
  windowMs: APP_CONFIG.RATE_LIMIT.API_WINDOW_MINUTES * 60 * 1000, 
  max: APP_CONFIG.RATE_LIMIT.API_MAX_REQUESTS,
  message: {
    success: false,
    message: MESSAGES.RATE_LIMIT.API_SPAM(APP_CONFIG.RATE_LIMIT.API_WINDOW_MINUTES),
    error_code: ERROR_CODES.RATE_LIMIT.TOO_MANY_REQUESTS,
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// 2. Stricter limiter specifically for Auth routes (Prevent password guessing/OTP spamming)
export const authLimiter = rateLimit({
  windowMs: APP_CONFIG.RATE_LIMIT.AUTH_WINDOW_MINUTES * 60 * 1000, 
  max: APP_CONFIG.RATE_LIMIT.AUTH_MAX_REQUESTS, 
  message: {
    success: false,
    message: MESSAGES.RATE_LIMIT.AUTH_SPAM(APP_CONFIG.RATE_LIMIT.AUTH_WINDOW_MINUTES),
    error_code: ERROR_CODES.RATE_LIMIT.TOO_MANY_REQUESTS,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
