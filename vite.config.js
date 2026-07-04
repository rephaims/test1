import { defineConfig } from 'vite';

export default defineConfig({
  base: '/test1/',
  server: {
    port: 5173,
  },
  build: {
    target: 'es2020',
  },
});
