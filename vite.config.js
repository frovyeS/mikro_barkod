import { defineConfig } from 'vite';

// base './' : site, GitHub Pages'te depo adı altında (kullanici.github.io/depo/) da çalışır.
export default defineConfig({
  base: './',
  esbuild: { jsx: 'automatic' },
  build: { target: 'es2020', sourcemap: false },
});
