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
      // TWO ENTRIES, TWO JOBS. `index.html` is the site — a product page that tells a
      // story. `studio.html` is the tool that produces and inspects components. Running
      // one inside the other meant every change to the tool touched the page a visitor
      // reads.
      input: {
        main: 'index.html',
        studio: 'studio.html',
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true
  }
});
