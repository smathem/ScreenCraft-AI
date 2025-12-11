import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    // Handle the specific pathing for GitHub Pages if the repo name is known, 
    // but relative base './' often works best for generic deployments.
    base: './', 
    define: {
      // Polyfill process.env for the Google GenAI SDK usage in the app
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY)
    },
    build: {
      outDir: 'dist',
    }
  };
});