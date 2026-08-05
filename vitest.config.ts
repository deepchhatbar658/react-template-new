import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'src/shared/api/**/*.{ts,tsx}',
        'src/app/router/auth-guard.tsx',
        'src/features/auth/api/**/*.{ts,tsx}',
        'src/features/auth/components/login-form.tsx',
        'src/features/users/api/**/*.{ts,tsx}',
        'src/features/users/components/user-form.tsx',
      ],
      exclude: [
        '**/*.test.{ts,tsx}',
        'src/main.tsx',
        'src/mocks/**',
        'src/test/**',
        'src/vite-env.d.ts',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 65,
        statements: 70,
      },
    },
  },
});
