import { z } from 'zod';

const browserApiUrlSchema = z
  .string()
  .min(1)
  .refine(
    (value) => {
      if (value.startsWith('/')) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    {
      message: 'VITE_API_URL must be an absolute URL or a root-relative path.',
    },
  );

const envSchema = z.object({
  VITE_APP_NAME: z.string().min(1).default('Atlas Console'),
  VITE_API_URL: browserApiUrlSchema.default('/api'),
  VITE_ENABLE_MSW: z
    .enum(['true', 'false'])
    .default(import.meta.env.DEV ? 'true' : 'false')
    .transform((value) => value === 'true'),
});

const result = envSchema.safeParse(import.meta.env);

if (!result.success) {
  const details = z.prettifyError(result.error);
  throw new Error(`Invalid browser environment configuration:\n${details}`);
}

export const env = Object.freeze({
  apiUrl: result.data.VITE_API_URL,
  appName: result.data.VITE_APP_NAME,
  enableMsw: result.data.VITE_ENABLE_MSW,
});
