import { z } from 'zod';
import { envelopeSchema } from './common.js';

export const libraryItemSchema = z.object({
  bookId: z.string(),
  type: z.enum(['own', 'rent']),
  daysLeft: z.number().int().nonnegative().optional(),
});

export const libraryResponseSchema = envelopeSchema(
  z.object({
    owned: z.array(libraryItemSchema),
    renting: z.array(libraryItemSchema),
    expired: z.array(libraryItemSchema),
  }),
);

export const contentUrlResponseSchema = envelopeSchema(
  z.object({
    url: z.string().url(),
    expiresIn: z.number().int().positive().max(900),
  }),
);
