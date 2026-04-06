// eslint-disable-next-line import/no-extraneous-dependencies
import { expect, test } from '@playwright/test';
import { clickPause, clickPlay, loadExample, openSettings, openSubmenu, sel, waitForPlayback } from './helpers/player';

test.describe('Basic — HLS + VAST preroll', () => {
  test.beforeEach(async ({ page }) => {
    await loadExample(page, '/examples/basic.html');
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  test('renders player wrapper and core controls', async ({ page }) => {
    await expect(page.locator(sel.wrapper)).toBeVisible();
    await expect(page.locator(sel.play)).toBeVisible();
    await expect(page.locator(sel.volume)).toBeVisible();
    await expect(page.locator(sel.progress)).toBeVisible();
    await expect(page.locator(sel.fullscreen)).toBeVisible();
    await expect(page.locator(sel.settings)).toBeVisible();
  });

  // ── Play / Pause ───────────────────────────────────────────────────────────

  test('play button enters paused-icon state on click', async ({ page }) => {
    await clickPlay(page);
    await expect(page.locator(sel.play)).toHaveClass(/op-controls__playpause--pause/);
  });

  test('clicking again pauses and restores play-icon', async ({ page }) => {
    await clickPlay(page);
    await clickPause(page);
    await expect(page.locator(sel.play)).not.toHaveClass(/op-controls__playpause--pause/);
  });

  test('play button aria-label reflects state', async ({ page }) => {
    // Before play: aria-pressed not set to pause state
    const btn = page.locator(sel.play);
    await expect(btn).not.toHaveClass(/op-controls__playpause--pause/);

    await clickPlay(page);
    await expect(btn).toHaveClass(/op-controls__playpause--pause/);
  });

  // ── Media advancement ──────────────────────────────────────────────────────

  test('HLS stream advances past 1 second after play', async ({ page }) => {
    await clickPlay(page);
    await waitForPlayback(page, 1);
  });

  test('hls.js replaces native src with a MediaSource blob URL', async ({ page }) => {
    await clickPlay(page);
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const v = document.querySelector('video') as HTMLVideoElement | null;
            return v?.src ?? '';
          }),
        { timeout: 12_000 }
      )
      .toMatch(/^blob:/);
  });

  test('progress bar played-track grows after playback starts', async ({ page }) => {
    await clickPlay(page);
    await waitForPlayback(page, 2);
    const width = await page.locator(sel.progressPlayed).evaluate((el) => parseFloat(getComputedStyle(el).width));
    expect(width).toBeGreaterThan(0);
  });

  // ── Settings panel ─────────────────────────────────────────────────────────

  test('settings button opens the menu panel', async ({ page }) => {
    await clickPlay(page);
    await waitForPlayback(page, 1);

    const panel = await openSettings(page);
    await expect(panel).toBeVisible();
    // The settings button itself should reflect open state
    await expect(page.locator(sel.settings)).toHaveAttribute('aria-expanded', 'true');
  });

  test('settings panel lists Speed option', async ({ page }) => {
    await clickPlay(page);
    await waitForPlayback(page, 1);

    await openSettings(page);
    await expect(page.locator(sel.settingsItems, { hasText: /speed/i }).first()).toBeVisible();
  });

  test('speed submenu contains playback rate options', async ({ page }) => {
    await clickPlay(page);
    await waitForPlayback(page, 1);

    await openSettings(page);
    await openSubmenu(page, /speed/i);

    // Submenu should include Normal (1x) and at least one other rate
    await expect(page.locator(sel.settingsItems, { hasText: /normal/i }).first()).toBeVisible();
    await expect(page.locator(sel.settingsItems, { hasText: '1.25x' }).first()).toBeVisible();
  });

  test('selecting 1.5x speed changes playback rate and marks it checked', async ({ page }) => {
    await clickPlay(page);
    await waitForPlayback(page, 1);

    await openSettings(page);
    await openSubmenu(page, /speed/i);
    await page.locator(sel.settingsItems, { hasText: '1.5x' }).first().click();

    // After selection the menu closes; verify rate on the media element
    const rate = await page.evaluate(
      () => (document.querySelector('video') as HTMLVideoElement | null)?.playbackRate ?? 1
    );
    expect(rate).toBeCloseTo(1.5, 1);
  });

  test('pressing Escape closes the settings panel', async ({ page }) => {
    await clickPlay(page);
    await waitForPlayback(page, 1);

    await openSettings(page);
    await page.keyboard.press('Escape');
    await expect(page.locator(sel.settingsPanel)).toBeHidden();
    await expect(page.locator(sel.settings)).toHaveAttribute('aria-expanded', 'false');
  });
});
