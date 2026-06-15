import { z } from 'zod';
import { envelopeSchema } from './common.js';

export const orderResponseSchema = envelopeSchema(
  z.object({
    id: z.string(),
    status: z.enum(['pending', 'paid', 'failed', 'refunded']),
    type: z.enum(['buy', 'rent']),
    bookId: z.string(),
    amountGross: z.number().int().nonnegative(),
    entitlement: z
      .object({
        type: z.enum(['own', 'rent']),
        status: z.enum(['active', 'expired']),
        expiresAt: z.string().datetime().nullable().optional(),
      })
      .optional(),
  }),
);

export const revenueSplitSchema = z.object({
  gross: z.number().int(),
  gateway_fee: z.number().int().nonnegative(),
  net: z.number().int(),
  platform_cut: z.number().int(),
  publisher_share: z.number().int(),
}).refine(
  (s) => s.platform_cut + s.publisher_share === s.net,
  { message: 'platform_cut + publisher_share must equal net (NFR-5)' },
);

export type OrderResponse = z.infer<typeof orderResponseSchema>;
