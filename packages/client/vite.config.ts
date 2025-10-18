import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true,
    fs: {
      strict: false,
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    target: 'esnext',
    minify: true,
    sourcemap: true,
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
      target: 'esnext'
    },
    // Exclude lucid-cardano from optimization to prevent WASM issues
    exclude: ['lucid-cardano']
  },
  // Enable WASM support
  worker: {
    format: 'es'
  }
});
