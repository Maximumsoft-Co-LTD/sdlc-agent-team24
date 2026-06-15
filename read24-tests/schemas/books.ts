import { z } from 'zod';
import { envelopeSchema } from './common.js';

export const bookListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  author: z.string(),
  coverUrl: z.string().url().optional(),
  priceBuy: z.number().int().nonnegative(),
  priceRent: z.number().int().nonnegative().nullable(),
  rentDays: z.number().int().positive().optional(),
  rentAvailable: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional(),
});

export const booksListResponseSchema = envelopeSchema(
  z.object({
    items: z.array(bookListItemSchema),
    nextCursor: z.string().nullable(),
  }),
);

export const bookDetailResponseSchema = envelopeSchema(bookListItemSchema);

/** FR-12 — must not expose epub_key or internal storage paths */
export const bookDetailForbiddenKeys = ['epub_key', 'epubKey', 'storageKey'] as const;

export type BookListItem = z.infer<typeof bookListItemSchema>;
