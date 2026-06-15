import { z } from 'zod';
import { envelopeSchema } from './common.js';

export const cartItemSchema = z.object({
  bookId: z.string(),
  title: z.string().optional(),
  priceBuy: z.number().int().nonnegative(),
});

export const cartResponseSchema = envelopeSchema(
  z.object({
    items: z.array(cartItemSchema),
    total: z.number().int().nonnegative(),
    count: z.number().int().nonnegative(),
  }),
);

export const cartCheckoutResponseSchema = envelopeSchema(
  z.object({
    orderId: z.string(),
    amount: z.number().int().nonnegative(),
    itemCount: z.number().int().positive(),
    entitlementsCreated: z.number().int().positive(),
  }),
);
