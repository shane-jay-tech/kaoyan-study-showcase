import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/kaoyan-study-showcase/',
  plugins: [react()],
  build: {
    sourcemap: false,
    target: 'es2020',
  },
  server: {
    host: '127.0.0.1',
    port: 4173,
  },
  preview: {
    host: '127.0.0.1',
    port: 4174,
  },
});
