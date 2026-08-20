import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    globalSetup: ['./tests/global-setup.ts'],
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.test.ts', 'tests/unit/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      all: true,
      include: ['src/**/*.{ts,tsx,astro}'],
      exclude: [
        'src/**/*.test.ts',
        // Framework wiring bound to the astro:content virtual module;
        // exercised by `astro check` (schema validation) and the build.
        'src/content.config.ts',
      ],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 95,
        statements: 95,
      },
    },
  },
});
