/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
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
  },
  build: {
    outDir: 'build',
  },
  optimizeDeps: {
    exclude: ['js-big-decimal'],
  },
});
