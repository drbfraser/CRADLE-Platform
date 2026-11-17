import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  base: '/',
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
    viteTsconfigPaths(),
    svgr(),
  ],
  server: {
    open: !process.env.CI, // Open browser when server starts (Except in CI environment).
    port: 3000,
    host: true,
  },
  define: {
    global: 'globalThis',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/*.test.?(c|m)[jt]s?(x)'],
    setupFiles: ['./src/testing/vitest.setup.ts'],
    reporters: ['default', 'junit', 'html'],
    outputFile: {
      junit: './test-reports/report.xml',
      html: './test-reports/unit-tests/index.html',
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.*',
        'src/**/*.d.ts',
        'src/testing/**',
      ],
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: './test-reports/coverage',
      reportOnFailure: true,
    },
  },
  build: {
    outDir: 'build',
  },
  optimizeDeps: {
    exclude: ['js-big-decimal'],
  },
});
