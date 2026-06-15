import { z } from 'zod';
import { envelopeSchema } from './common.js';

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  role: z.enum(['reader', 'publisher', 'admin']),
});

export const authLoginResponseSchema = envelopeSchema(
  z.object({
    accessToken: z.string().min(1),
    user: userSchema,
  }),
);

export const meResponseSchema = envelopeSchema(userSchema);

export type AuthLoginResponse = z.infer<typeof authLoginResponseSchema>;
