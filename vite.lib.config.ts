import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

/**
 * THE LIBRARY BUILD, which is not the app build.
 *
 * `vite.config.ts` builds the docs site: one HTML entry, everything inlined, a
 * bundle nobody imports. This builds what a consumer installs — `src/index.ts`
 * as a library, with React left external because the consumer already has it and
 * a second copy is a second React.
 *
 * Types are emitted separately by `tsc --emitDeclarationOnly`; a bundler cannot
 * produce them.
 */
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Liminal',
      formats: ['es', 'cjs'],
      fileName: (format) => `liminal.${format === 'es' ? 'js' : 'cjs'}`,
    },
    outDir: 'dist-lib',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      // NOT bundled: the consumer's React, and the icon set they may or may not
      // use. A library that ships its own React is a library that breaks the
      // consumer's hooks.
      external: ['react', 'react-dom', 'react/jsx-runtime', '@phosphor-icons/react'],
      output: {
        globals: { react: 'React', 'react-dom': 'ReactDOM' },
        // The CSS a component imports by path has to land somewhere a consumer
        // can import. One file, named.
        assetFileNames: (info) => (info.name?.endsWith('.css') ? 'liminal.css' : 'assets/[name][extname]'),
      },
    },
  },
});
