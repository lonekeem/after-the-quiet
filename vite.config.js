import { defineConfig } from 'vite';
// Relative base works on GitHub Pages (/lonekeem-studios/) and inside the Capacitor Android app.
export default defineConfig({ base: './', build: { chunkSizeWarningLimit: 1200 } });
