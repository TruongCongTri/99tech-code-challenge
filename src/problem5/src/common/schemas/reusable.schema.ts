import { z } from 'zod';
import { MESSAGES } from '@/constants/messages';
import { FIELDS } from '@/constants/fields';
import { APP_CONFIG, SORT_OPTIONS, TIMEFRAME_OPTIONS } from '@/constants/app.constant';

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9]{13}$/;

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(APP_CONFIG.COMMON.PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(APP_CONFIG.COMMON.PAGINATION.MAX_LIMIT)
    .default(APP_CONFIG.COMMON.PAGINATION.DEFAULT_LIMIT),
});

export const getProductsQuerySchema = z.object({
  query: paginationSchema
    .extend({
      search: z.string().trim().optional(),
      categorySlug: z.string().trim().optional(),
      sellerSlug: z.string().trim().optional(),

      minPrice: z.coerce.number().min(0).optional(),
      maxPrice: z.coerce.number().min(0).optional(),

      sortBy: z.enum(SORT_OPTIONS.PRODUCT).default(SORT_OPTIONS.PRODUCT[0]), // newest
      timeframe: z.enum(TIMEFRAME_OPTIONS).optional(), 
    })
    .refine(
      (data) => {
        if (data.minPrice !== undefined && data.maxPrice !== undefined) {
          return data.minPrice <= data.maxPrice;
        }
        return true;
      },
      { message: MESSAGES.VALIDATION.MIN_PRICE_INVALID, path: ['minPrice'] }
    ),
});

export const getSlugSchema = z.object({
  params: z.object({
    slug: z
      .string({ message: MESSAGES.VALIDATION.REQUIRED(FIELDS.SLUG) })
      .trim()
      .regex(SLUG_REGEX, { message: MESSAGES.VALIDATION.INVALID_FORMAT(FIELDS.SLUG) }),
  }),
});

export const getIDSchema = z.object({
  params: z.object({
    id: z
      .string({ message: MESSAGES.VALIDATION.REQUIRED(FIELDS.ID) })
      .trim()
      .uuid({ message: MESSAGES.VALIDATION.INVALID_FORMAT(FIELDS.ID) }),
  }),
});

export const getProductReviewsSchema = z.object({
  params: z.object({
    slug: z.string().trim().regex(SLUG_REGEX, { message: MESSAGES.VALIDATION.INVALID_FORMAT(FIELDS.SLUG)}),
  }),
  query: paginationSchema.extend({
    rating: z.coerce.number().int().min(1).max(5).optional(),
  }),
});

export const getSellersQuerySchema = z.object({
  query: paginationSchema.extend({
    sortBy: z.enum(SORT_OPTIONS.SELLER).default(SORT_OPTIONS.SELLER[0]), // popular
  }),
});

export const getSellerSlugSchema = z.object({
  params: z.object({
    slug: z
      .string({ message: MESSAGES.VALIDATION.MUST_BE_STRING(FIELDS.SLUG) })
      .trim()
      .regex(SLUG_REGEX, { message: MESSAGES.VALIDATION.INVALID_FORMAT(FIELDS.SLUG) }),
  }),
  query: getProductsQuerySchema.shape.query,
});

export const getCategoriesQuerySchema = z.object({
  query: paginationSchema.extend({
    sortBy: z.enum(SORT_OPTIONS.CATEGORY).default(SORT_OPTIONS.CATEGORY[0]), // popular
  }),
});

export const getCategorySlugSchema = z.object({
  params: z.object({
    slug: z
      .string({ message: MESSAGES.VALIDATION.MUST_BE_STRING(FIELDS.SLUG) })
      .trim()
      .regex(SLUG_REGEX, { message: MESSAGES.VALIDATION.INVALID_FORMAT(FIELDS.SLUG) }),
  }),
  query: getProductsQuerySchema.shape.query,
});


export type GetProductsQueryDTO = z.infer<typeof getProductsQuerySchema>['query'];
export type GetSellersQueryDTO = z.infer<typeof getSellersQuerySchema>['query'];
export type GetCategoriesQueryDTO = z.infer<typeof getCategoriesQuerySchema>['query'];

export type getProductReviewsQueryDTO = z.infer<typeof getProductReviewsSchema>['query'];