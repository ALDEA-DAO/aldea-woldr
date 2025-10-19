import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    nodePolyfills({
      // Enable polyfills for all common Node.js modules
      include: ['buffer', 'process', 'util', 'stream', 'events', 'crypto', 'path', 'timers'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
    {
      name: 'resolve-node-polyfills',
      enforce: 'pre',
      resolveId(id, importer) {
        // Handle stream/web polyfills
        if (id === 'stream/web' || id === 'stream-browserify/web') {
          return path.resolve(__dirname, 'src/polyfills/stream-web.ts');
        }
        if (importer && id.includes('stream-browserify/web')) {
          return path.resolve(__dirname, 'src/polyfills/stream-web.ts');
        }
        
        // Handle node:net polyfill
        if (id === 'node:net') {
          return path.resolve(__dirname, 'src/polyfills/net.ts');
        }
        
        // Handle node:url polyfill
        if (id === 'node:url') {
          return path.resolve(__dirname, 'src/polyfills/url.ts');
        }
        
        // Handle node:util polyfill
        if (id === 'node:util') {
          return path.resolve(__dirname, 'src/polyfills/util.ts');
        }
        
        // Handle node:fs polyfill
        if (id === 'node:fs') {
          return path.resolve(__dirname, 'src/polyfills/fs.ts');
        }
        
        // Handle node:path polyfill
        if (id === 'node:path') {
          return path.resolve(__dirname, 'src/polyfills/path.ts');
        }
      },
      load(id) {
        // Intercept any attempts to load from stream-browserify/web path
        if (id.includes('stream-browserify/web') || id.includes('stream/web')) {
          return {
            code: `
              export const ReadableStream = globalThis.ReadableStream || class ReadableStream {};
              export const WritableStream = globalThis.WritableStream || class WritableStream {};
              export const TransformStream = globalThis.TransformStream || class TransformStream {};
              export default { ReadableStream, WritableStream, TransformStream };
            `,
            map: null
          };
        }
      },
    },
  ],
  server: {
    port: 3000,
    open: true,
    fs: {
      strict: false,
    },
  },
  resolve: {
    alias: {
      // Provide browser-compatible alternatives
      util: 'util',
      stream: 'stream-browserify',
      'stream/web': new URL('./src/polyfills/stream-web.ts', import.meta.url).pathname,
      'stream-browserify/web': new URL('./src/polyfills/stream-web.ts', import.meta.url).pathname,
      buffer: 'buffer',
      http: 'stream-http',
      https: 'https-browserify',
      zlib: 'browserify-zlib',
      url: 'url',
      path: 'path-browserify',
      fs: 'memfs',
      crypto: 'crypto-browserify',
      process: 'process/browser',
      events: 'events',
      timers: 'timers-browserify',
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    target: 'esnext',
    minify: true,
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
          lucid: ['lucid-cardano']
        }
      }
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
      define: {
        global: 'globalThis',
      },
    },
    // Exclude lucid-cardano from optimization to prevent WASM issues
    exclude: ['lucid-cardano']
  },
  // Enable WASM support
  worker: {
    format: 'es'
  }
});
