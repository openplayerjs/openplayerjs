// eslint-disable-next-line import/no-extraneous-dependencies
import { expect, test } from '@playwright/test';
import { loadExample, sel, waitForPlayback } from './helpers/player';

test.describe('Ads — VMAP schedule', () => {
  test.beforeEach(async ({ page }) => {
    await loadExample(page, '/examples/ads.html');
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  test('renders player wrapper and controls', async ({ page }) => {
    await expect(page.locator(sel.wrapper)).toBeVisible();
    await expect(page.locator(sel.play)).toBeVisible();
    await expect(page.locator(sel.progress)).toBeVisible();
  });

  // ── Ad request ─────────────────────────────────────────────────────────────

  test('clicking play fires a VMAP network request', async ({ page }) => {
    const vmapRequest = page.waitForRequest((req) => req.url().includes('ad_rule=1') || req.url().includes('vmap'), {
      timeout: 8_000,
    });

    await page.click(sel.play);
    const req = await vmapRequest;
    expect(req).toBeTruthy();
  });

  // ── Preroll ────────────────────────────────────────────────────────────────

  test('preroll ad container appears after play is clicked', async ({ page }) => {
    await page.click(sel.play);
    // Confirming the ad overlay mounts is sufficient — asserting content
    // currentTime is unreliable because the 10s test clip can play through
    // while the VMAP is being fetched and parsed.
    await expect(page.locator('.op-ads')).toBeVisible({ timeout: 12_000 });
  });

  test('play button is in paused-icon state during ad playback', async ({ page }) => {
    await page.click(sel.play);
    await expect(page.locator('.op-ads')).toBeVisible({ timeout: 12_000 });
    await expect(page.locator(sel.play)).toHaveClass(/op-controls__playpause--pause/);
  });

  // ── Post-ad content ────────────────────────────────────────────────────────

  test('content video plays after preroll ends', async ({ page }) => {
    await page.click(sel.play);

    // Wait for the ads overlay to be removed (preroll complete)
    await expect(page.locator('.op-ads')).toBeHidden({ timeout: 35_000 });

    // Content should now be advancing
    await waitForPlayback(page, 1);
  });

  test('content currentTime advances after all preroll ads are done', async ({ page }) => {
    await page.click(sel.play);
    await expect(page.locator('.op-ads')).toBeHidden({ timeout: 35_000 });

    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const v = document.querySelector('#player') as HTMLVideoElement | null;
            return v?.currentTime ?? 0;
          }),
        { timeout: 10_000 }
      )
      .toBeGreaterThan(0);
  });

  // ── Progress bar ───────────────────────────────────────────────────────────

  test('progress bar is visible during ad playback', async ({ page }) => {
    await page.click(sel.play);
    await expect(page.locator('.op-ads')).toBeVisible({ timeout: 12_000 });
    await expect(page.locator(sel.progress)).toBeVisible();
  });
});
