import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// React is loaded from cdnjs as UMD globals, so the app bundle stays small and self-contained.
export default defineConfig({
  plugins: [react({ jsxRuntime: 'classic' }), viteSingleFile()],
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    rollupOptions: {
      external: ['react', 'react-dom', 'react-dom/client'],
      output: { format: 'iife', globals: { react: 'React', 'react-dom': 'ReactDOM', 'react-dom/client': 'ReactDOM' } },
    },
  },
  test: { environment: 'jsdom', globals: true, setupFiles: ['./tests/setup.ts'] },
});
