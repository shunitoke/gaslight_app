import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup/vitest.setup.ts'],
    include: ['tests/{unit,integration}/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      enabled: true,
      reporter: ['text', 'lcov']
    }
  }
});

