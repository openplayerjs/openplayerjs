// eslint-disable-next-line import/no-extraneous-dependencies
import { expect, test } from '@playwright/test';
import { loadExample, sel } from './helpers/player';

const PAGE = '/examples/source-fallback.html';

// Abort the first (broken) source for every test so fallback always triggers.
async function abortFirstSource(page: Parameters<typeof loadExample>[0]) {
  await page.route('**/broken-video-source.mp4', (route) => route.abort('failed'));
}

test.describe('Source fallback', () => {
  // ── Render ─────────────────────────────────────────────────────────────────

  test('renders full player wrapper with controls and progress bar', async ({ page }) => {
    await abortFirstSource(page);
    await loadExample(page, PAGE);

    await expect(page.locator(sel.wrapper)).toBeVisible();
    await expect(page.locator(sel.play)).toBeVisible();
    await expect(page.locator(sel.volume)).toBeVisible();
    await expect(page.locator(sel.progress)).toBeVisible();
    await expect(page.locator(sel.fullscreen)).toBeVisible();
    await expect(page.locator(sel.settings)).toBeVisible();
  });

  // ── fallback fires ─────────────────────────────────────────────────────────

  test('source:fallback event fires with the failed and next source URLs', async ({ page }) => {
    await abortFirstSource(page);
    await loadExample(page, PAGE);

    const payload = await page.waitForFunction(
      () => (window as unknown as Record<string, unknown>).__sourceFallbackPayload,
      { timeout: 10_000 }
    );

    const { failed, next } = (await payload.jsonValue()) as { failed: string; next: string };
    expect(failed).toMatch(/broken-video-source\.mp4/);
    expect(next).toMatch(/flower\.mp4/);
  });

  // ── state after fallback ───────────────────────────────────────────────────

  test('player is not in error state immediately after fallback fires', async ({ page }) => {
    await abortFirstSource(page);
    await loadExample(page, PAGE);

    // Wait until the fallback event has fired — at that exact moment the player
    // has transitioned back to loading the next source, not to error state.
    await page.waitForFunction(() => (window as unknown as Record<string, unknown>).__sourceFallbackPayload, {
      timeout: 10_000,
    });

    const hasError = await page.evaluate(() => (window as unknown as Record<string, unknown>).__playerError);
    expect(hasError).toBeFalsy();
  });

  // ── all sources fail ───────────────────────────────────────────────────────

  test('error event fires when all sources fail', async ({ page }) => {
    // Block both the broken source and the fallback source.
    await page.route('**/broken-video-source.mp4', (route) => route.abort('failed'));
    await page.route('**/flower.mp4', (route) => route.abort('failed'));

    await loadExample(page, PAGE);

    await page.waitForFunction(() => (window as unknown as Record<string, unknown>).__playerError === true, {
      timeout: 15_000,
    });

    const hasError = await page.evaluate(() => (window as unknown as Record<string, unknown>).__playerError);
    expect(hasError).toBe(true);
  });
});
