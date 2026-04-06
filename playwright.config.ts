// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],
  // Hard cap per test so a hung network call never blocks the suite indefinitely.
  timeout: 90_000,
  // Hard cap for the entire suite run; Playwright will exit with a non-zero
  // code once this is reached, preventing the process from hanging forever.
  globalTimeout: process.env.CI ? 10 * 60_000 : 0,

  use: {
    // Serve from repo root so importmap paths (./packages/*/dist/) resolve correctly.
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    // Permit muted autoplay; unmuted autoplay is never needed in tests.
    launchOptions: {
      args: ['--autoplay-policy=no-user-gesture-required'],
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    // Serve the entire repo root as static files; no bundling step needed.
    command: 'npx serve . --listen 4173 --no-clipboard',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
