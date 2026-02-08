import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/tests/**/*.test.ts', 'src/**/*.spec.ts'],
    exclude: ['dist/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'json'],
      
      // --- THE QUALITY GATE ---
      thresholds: {
        lines: 75,
        functions: 70,
        branches: 70,
        statements: 75,
      },

      // --- CRITICAL ADDITION: Ignore Boilerplate ---
      // Without this, your 75% goal will be very hard to hit!
      exclude: [
        // Standard stuff
        'node_modules/**',
        'dist/**',
        '**/*.spec.ts',
        '**/*.test.ts',

        // NestJS Specifics (Logic-less files)
        '**/*.module.ts',       // Modules are just wiring
        '**/*.dto.ts',          // DTOs are just definitions
        '**/*.entity.ts',       // Database schemas
        '**/*.interface.ts',    // TS Interfaces
        '**/main.ts',           // App entry point
        '**/index.ts',          // Barrel files
        '**/*.config.ts',       // Env configs
        '**/*.guard.ts',        // (Optional) often hard to unit test, better for E2E
      ],
    },
  },
});
