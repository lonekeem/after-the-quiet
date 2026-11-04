import { defineConfig } from 'vite';
// Relative base works on GitHub Pages (/lonekeem-studios/) and inside the Capacitor Android app.
export default defineConfig({ base: './', build: { target: ['es2019', 'safari13', 'chrome70'], chunkSizeWarningLimit: 1200 } });
