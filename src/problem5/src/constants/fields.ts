// Defines ALL field names used for UI labels and validation messages
export const FIELDS = {
  // --- AUTH & USER ---
  EMAIL: 'Email',
  PHONE: 'Phone number',
  PASSWORD: 'Password',
  CURRENT_PASSWORD: 'Current password',
  NEW_PASSWORD: 'New password',
  CONFIRM_PASSWORD: 'Confirm password',
  FULL_NAME: 'Full name',
  AVATAR: 'Avatar',
  DEVICE_ID: 'Device ID',
  SESSION_ID: 'Session ID',
  IDENTIFIER: 'Identifier (Email/Phone)',
  OTP_CODE: 'Verification code (OTP)',
  CHANNEL: 'Delivery channel',
  TOKEN: 'Token',
  REFRESH_TOKEN: 'Refresh Token',

  // --- PRODUCT ---
  TITLE: 'Title',
  DESCRIPTION: 'Description',
  PRICE: 'Price',
  THUMBNAIL: 'Thumbnail',
  CATEGORY: 'Category',
  SELLER: 'Seller',
  INSTRUCTOR: 'Instructor',
  MIN_PRICE: 'Minimum price',
  MAX_PRICE: 'Maximum price',

  // --- GENERAL ---
  ID: 'ID',
  SLUG: 'Slug',
  STATUS: 'Status',
} as const;

export type FieldName = (typeof FIELDS)[keyof typeof FIELDS];
