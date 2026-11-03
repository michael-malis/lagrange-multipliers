import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { execSync } from 'node:child_process';

let commit = 'development';
try { commit = process.env.GITHUB_SHA || execSync('git rev-parse HEAD').toString().trim(); } catch { /* Unversioned local copy. */ }
export default defineConfig({
  base: './',
  plugins: [viteSingleFile()],
  define: { __BUILD_ID__: JSON.stringify(commit) },
  build: { assetsInlineLimit: 10000000, chunkSizeWarningLimit: 5000 },
  test: { include: ['tests/math/**/*.test.js'] }
});
