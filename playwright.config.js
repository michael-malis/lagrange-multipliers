import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/interactions',
  timeout: 45000,
  workers: 1,
  reporter: [['list']],
  use: {
    viewport: { width: 1440, height: 900 },
    headless: true,
    launchOptions: { args: ['--enable-unsafe-swiftshader'] },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  }
});
