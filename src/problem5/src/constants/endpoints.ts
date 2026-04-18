/**
 * @file endpoints.ts
 * @description Registry of all API routes. 
 * Prevents hardcoding URLs in controllers, services, or test suites.
 */

export const API_VERSION = '/api/v1';

export const ENDPOINTS = {
  /* --- Authentication Module --- */
  AUTH: {
    BASE: '/auth',
    REGISTER: '/register',
    LOGIN: '/login',
    LOGOUT: '/logout',
    REFRESH_TOKEN: '/refresh-token',
    GOOGLE: '/google',
    GOOGLE_CALLBACK: '/google/callback',
    SEND_VERIFY_EMAIL: '/send-verify-email',
    VERIFY_EMAIL: '/verify-email',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    CHANGE_PASSWORD: '/change-password',
    SESSIONS: '/sessions',
    REVOKE_SESSION: '/sessions/:sessionId',
    REVOKE_OTHER_SESSIONS: '/sessions/others',
  },

  /* --- Example Endpoints --- */
  PUBLIC: {
    CATEGORIES: '/categories',
    PRODUCTS: '/products',
    PRODUCT_DETAIL: '/products/:slug', // Product detail by slug (SEO-friendly)
    PRODUCT_REVIEWS: '/products/:slug/reviews', // View public reviews
    SELLERS: '/sellers',
    SELLER_DETAIL: '/sellers/:id', // View seller profile
    WEBHOOK_PAYMENT: '/payments/webhook',
  },

  /* --- Score Event Module --- */
  SCORE_EVENT: {
    BASE: '/score-events',
    SCOREBOARD: '/scoreboard',                                                            
    RESOURCE: '/:id',                
  }
} as const;
