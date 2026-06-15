import { z } from 'zod';
import { envelopeSchema } from './common.js';

export const walletBalanceSchema = envelopeSchema(
  z.object({
    balance: z.number().int().nonnegative(),
  }),
);

export const walletTransactionSchema = z.object({
  id: z.string(),
  type: z.enum(['topup', 'bonus', 'spend', 'refund']),
  amount: z.number().int(),
  balance_after: z.number().int(),
  createdAt: z.string().datetime().optional(),
});

export const walletTransactionsSchema = envelopeSchema(
  z.object({
    items: z.array(walletTransactionSchema),
    nextCursor: z.string().nullable().optional(),
  }),
);

export const topupResponseSchema = envelopeSchema(
  z.object({
    topupId: z.string(),
    amount: z.number().int().positive(),
    balance: z.number().int().nonnegative(),
  }),
);
