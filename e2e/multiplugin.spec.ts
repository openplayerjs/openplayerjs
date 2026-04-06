// eslint-disable-next-line import/no-extraneous-dependencies
import { expect, test } from '@playwright/test';
import { clickPause, clickPlay, loadExample, openSettings, openSubmenu, sel, waitForPlayback } from './helpers/player';

test.describe('Multi-plugin — chapters + HLS', () => {
  test.beforeEach(async ({ page }) => {
    await loadExample(page, '/examples/multiplugin.html');
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  test('renders player wrapper and controls', async ({ page }) => {
    await expect(page.locator(sel.wrapper)).toBeVisible();
    await expect(page.locator(sel.play)).toBeVisible();
    await expect(page.locator(sel.progress)).toBeVisible();
    await expect(page.locator(sel.settings)).toBeVisible();
  });

  // ── Play / Pause ───────────────────────────────────────────────────────────

  test('play button enters paused-icon state', async ({ page }) => {
    await clickPlay(page);
    await expect(page.locator(sel.play)).toHaveClass(/op-controls__playpause--pause/);
  });

  test('pause restores play-icon state', async ({ page }) => {
    await clickPlay(page);
    await clickPause(page);
    await expect(page.locator(sel.play)).not.toHaveClass(/op-controls__playpause--pause/);
  });

  // ── Media advancement ──────────────────────────────────────────────────────

  test('HLS stream advances currentTime past 1 second', async ({ page }) => {
    await clickPlay(page);
    await waitForPlayback(page, 1);
  });

  test('hls.js swaps src to a MediaSource blob URL', async ({ page }) => {
    await clickPlay(page);
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const v = document.querySelector('video') as HTMLVideoElement | null;
            return v?.src ?? '';
          }),
        { timeout: 15_000 }
      )
      .toMatch(/^blob:/);
  });

  // ── Chapter banner plugin ──────────────────────────────────────────────────

  test('chapter banner element is mounted in the DOM', async ({ page }) => {
    // The chapterUi plugin appends a .chapter-banner div to the media parent.
    await expect(page.locator('.chapter-banner')).toBeAttached({ timeout: 5_000 });
  });

  test('chapter banner shows "Intro" once playback starts (0–30s)', async ({ page }) => {
    await clickPlay(page);
    // The chapters plugin fires chapter:changed on the first timeupdate,
    // which the chapterUi plugin uses to populate the banner.
    await expect
      .poll(() => page.locator('.chapter-banner').textContent(), {
        timeout: 20_000,
        message: 'Expected chapter banner to display "Intro"',
      })
      .toBe('Intro');
    await expect(page.locator('.chapter-banner')).toBeVisible();
  });

  test('console logs chapter changes from core.on("chapter:changed")', async ({ page }) => {
    const chapterLogs: string[] = [];

    page.on('console', (msg) => {
      if (msg.text().startsWith('Now in chapter:')) {
        chapterLogs.push(msg.text());
      }
    });

    // Reload with listener already attached so we capture the first event.
    await page.goto('/examples/multiplugin.html');
    await page.waitForSelector(sel.wrapper, { timeout: 15_000 });

    await page.click(sel.play);

    await expect
      .poll(() => chapterLogs.length, {
        timeout: 20_000,
        message: 'Expected core.on("chapter:changed") to log at least one entry',
      })
      .toBeGreaterThan(0);

    expect(chapterLogs[0]).toMatch(/Now in chapter:/);
  });

  // ── Settings panel ─────────────────────────────────────────────────────────

  test('settings panel opens on button click', async ({ page }) => {
    await clickPlay(page);
    await waitForPlayback(page, 1);

    const panel = await openSettings(page);
    await expect(panel).toBeVisible();
    await expect(page.locator(sel.settings)).toHaveAttribute('aria-expanded', 'true');
  });

  test('settings panel lists Speed submenu', async ({ page }) => {
    await clickPlay(page);
    await waitForPlayback(page, 1);

    await openSettings(page);
    await expect(page.locator(sel.settingsItems, { hasText: /speed/i }).first()).toBeVisible();
  });

  test('speed submenu shows playback rate choices', async ({ page }) => {
    await clickPlay(page);
    await waitForPlayback(page, 1);

    await openSettings(page);
    await openSubmenu(page, /speed/i);

    await expect(page.locator(sel.settingsItems, { hasText: /normal/i }).first()).toBeVisible();
    await expect(page.locator(sel.settingsItems, { hasText: '0.5x' }).first()).toBeVisible();
    await expect(page.locator(sel.settingsItems, { hasText: '2x' }).first()).toBeVisible();
  });
});
