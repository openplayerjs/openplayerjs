// eslint-disable-next-line import/no-extraneous-dependencies
import { expect, test } from '@playwright/test';
import { clickPause, clickPlay, loadExample, openSettings, openSubmenu, sel, waitForPlayback } from './helpers/player';

test.describe('Live — HLS live stream', () => {
  test.beforeEach(async ({ page }) => {
    await loadExample(page, '/examples/live.html');
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

  test('hls.js attaches and swaps src to a MediaSource blob URL', async ({ page }) => {
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

  test('live stream advances currentTime past 1 second', async ({ page }) => {
    await clickPlay(page);
    await waitForPlayback(page, 1);
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

  test('back button inside speed submenu returns to root settings', async ({ page }) => {
    await clickPlay(page);
    await waitForPlayback(page, 1);

    await openSettings(page);
    await openSubmenu(page, /speed/i);

    await page.locator(sel.settingsBack).click();

    // Back button should disappear (we're at the root menu)
    await expect(page.locator(sel.settingsBack)).toBeHidden();
    // Root Speed item should be visible again
    await expect(page.locator(sel.settingsItems, { hasText: /speed/i }).first()).toBeVisible();
  });

  test('settings panel closes when clicking outside', async ({ page }) => {
    await clickPlay(page);
    await waitForPlayback(page, 1);

    await openSettings(page);
    // Click somewhere outside the menu container
    await page.click(sel.wrapper, { position: { x: 10, y: 10 } });
    await expect(page.locator(sel.settingsPanel)).toBeHidden({ timeout: 3_000 });
  });

  // ── Captions ───────────────────────────────────────────────────────────────

  test('captions button toggles on and off during live playback', async ({ page }) => {
    // For a live stream the media currentTime is the live-edge position (a large
    // number), so VTT cue timestamps (00:00:01 …) will never align with it.
    // Instead, verify that the captions toggle button itself works correctly:
    // aria-pressed flips between "true" and "false" on each click.
    await clickPlay(page);
    await waitForPlayback(page, 1);

    const captionsBtn = page.locator(sel.captions);

    // Normalise to OFF first so the test is deterministic regardless of the
    // <track default> attribute's initial browser state.
    const isOn = await captionsBtn.getAttribute('aria-pressed');
    if (isOn === 'true') {
      await captionsBtn.click();
      await expect(captionsBtn).toHaveAttribute('aria-pressed', 'false', { timeout: 3_000 });
    }

    // Turn ON — button should reflect the change.
    await captionsBtn.click();
    await expect(captionsBtn).toHaveAttribute('aria-pressed', 'true', { timeout: 3_000 });

    // Turn OFF again — confirm the toggle is reversible.
    await captionsBtn.click();
    await expect(captionsBtn).toHaveAttribute('aria-pressed', 'false', { timeout: 3_000 });
  });
});
