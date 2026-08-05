import { z } from 'zod';

export const authUserSchema = z.object({
  id: z.string().min(1),
  email: z.email(),
  name: z.string().min(1),
});

export const loginInputSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must contain at least 8 characters.'),
});

export const loginResponseSchema = z.object({ user: authUserSchema });

export type AuthUser = z.infer<typeof authUserSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
