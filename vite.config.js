import { defineConfig } from 'vite';

// Relative paths, so the built app works from any folder, such as GitHub Pages'
// https://<user>.github.io/snapsplode/
export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 1000 }, // three.js alone is ~500 kB; that's expected
});
