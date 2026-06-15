import { z } from 'zod';

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
});

export const envelopeSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema.nullable(),
    error: apiErrorSchema.nullable(),
    meta: z.record(z.unknown()).nullable().optional(),
  });

export const paginationMetaSchema = z.object({
  total: z.number().optional(),
  page: z.number().optional(),
  nextCursor: z.string().nullable().optional(),
});
