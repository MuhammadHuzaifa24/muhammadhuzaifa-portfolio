import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': 'http://127.0.0.1:3001' },
    // Generated videos and capture files can be locked by Windows while writing.
    watch: { ignored: ['**/creative/**', '**/docs/**', '**/public/media/**'] },
  },
  preview: { proxy: { '/api': 'http://127.0.0.1:3001' } },
  build: { rollupOptions: { output: { manualChunks: { three: ['three', '@react-three/fiber', '@react-three/drei'] } } } },
});
