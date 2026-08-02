import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      // This tells Rollup to treat Firebase as an external module
      // and not try to bundle it, but instead rely on the installed package
      external: [],
    },
  },
  optimizeDeps: {
    include: [
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/analytics'
    ],
    // Force Vite to re-optimize these dependencies
    force: true,
  },
  // Ensure proper resolution of Firebase modules
  resolve: {
    dedupe: ['firebase'],
  },
});