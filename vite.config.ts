import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    rollupOptions: {
      // ZERO ABSOLUTE: only `index.html` remains — the site that shows the living
      // engine. `studio.html` and the app entries were archived with the components;
      // they return when the components are born again.
      input: {
        main: 'index.html',
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true
  }
});
