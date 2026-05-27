// eslint-disable-next-line import/no-extraneous-dependencies
import { expect, test } from '@playwright/test';

import { clickPlay, loadExample, sel, waitForPlayback } from './helpers/player';

const PAGE = '/examples/src-switch.html';

// ─── suite ───────────────────────────────────────────────────────────────────

test.describe('Source switching', () => {
  test.beforeEach(async ({ page }) => {
    await loadExample(page, PAGE);
  });

  // ── page structure ─────────────────────────────────────────────────────────

  test('page renders the video element and switch buttons', async ({ page }) => {
    await expect(page.locator('#player')).toBeVisible();
    await expect(page.locator('#btn-switch')).toBeVisible();
    await expect(page.locator('#btn-restore')).toBeVisible();
  });

  // ── browser-default behaviour: new source starts paused ───────────────────

  test('play button resets to "play" icon after source switch (new source starts paused)', async ({ page }) => {
    // Start playback so the button shows the pause icon (playing state).
    await clickPlay(page);
    await waitForPlayback(page, 1);

    // Confirm play button is in "playing" state before the switch.
    await expect(page.locator(sel.play)).toHaveClass(/op-controls__playpause--pause/);

    // Switch source — mirrors browser behaviour: new src starts paused.
    await page.click('#btn-switch');

    // The play button must immediately revert to the "play" icon.
    // No native pause event fires on a forced engine detach, so PlayControl must
    // handle source:set explicitly to reset its icon.
    await expect(page.locator(sel.play)).not.toHaveClass(/op-controls__playpause--pause/, {
      timeout: 3_000,
    });
  });

  test('new source does not auto-play after switch (user must press play)', async ({ page }) => {
    // Play the first source for a moment.
    await clickPlay(page);
    await waitForPlayback(page, 1);

    // Switch source.
    await page.click('#btn-switch');

    // Wait for the new source to be ready (readyState >= 1 = HAVE_METADATA).
    await expect
      .poll(() => page.evaluate(() => (document.querySelector('video') as HTMLVideoElement | null)?.readyState ?? 0), {
        timeout: 20_000,
        message: 'Expected new source to reach HAVE_METADATA',
      })
      .toBeGreaterThanOrEqual(1);

    // The video element must be paused — the new source should NOT auto-play.
    const paused = await page.evaluate(
      () => (document.querySelector('video') as HTMLVideoElement | null)?.paused ?? true
    );
    expect(paused).toBe(true);

    // After pressing play the new source advances from 0.
    await clickPlay(page);
    await waitForPlayback(page, 0.5);
  });

  // ── currentTime resets to 0 ────────────────────────────────────────────────

  test('currentTime resets to 0 immediately when core.src is assigned', async ({ page }) => {
    // Wait until the first stream has delivered at least 1 s of playback so
    // currentTime is meaningfully > 0 before we switch.
    await clickPlay(page);
    await waitForPlayback(page, 1);

    const timeBefore = await page.evaluate(() => {
      const el = document.querySelector('video') as HTMLVideoElement | null;
      return el?.currentTime ?? -1;
    });
    expect(timeBefore).toBeGreaterThan(0);

    // Switch the source via the exposed core instance — identical to what
    // application code would do (core.src = '…').
    await page.evaluate(() => {
      const SOURCE_B = 'https://playertest.longtailvideo.com/adaptive/progdatime/playlist2.m3u8';
      (window as Record<string, unknown>).__core.src = SOURCE_B;
    });

    // Core.src setter immediately sets _currentTime = 0. The surface (new
    // engine) hasn't attached yet, so the DOM element's currentTime is also
    // at 0 (browser resets it on src change).
    const timeAfter = await page.evaluate(() => {
      const el = document.querySelector('video') as HTMLVideoElement | null;
      return el?.currentTime ?? -1;
    });
    expect(timeAfter).toBe(0);
  });

  test('currentTime stays at 0 after the new source loads and begins buffering', async ({ page }) => {
    // Let the first source play a little.
    await clickPlay(page);
    await waitForPlayback(page, 1);

    // Trigger source switch via the UI button.
    await page.click('#btn-switch');

    // Immediately after the click, currentTime must be 0.
    const timeImmediate = await page.evaluate(() => {
      const el = document.querySelector('video') as HTMLVideoElement | null;
      return el?.currentTime ?? -1;
    });
    expect(timeImmediate).toBe(0);

    // Give the new engine a moment to attach and emit loadedmetadata.
    // readyState >= 1 means metadata (including duration) is available — the
    // player has fully transitioned to the new source.
    await expect
      .poll(() => page.evaluate(() => (document.querySelector('video') as HTMLVideoElement | null)?.readyState ?? 0), {
        timeout: 20_000,
        message: 'Expected new source to reach readyState >= 1',
      })
      .toBeGreaterThanOrEqual(1);

    // currentTime must still be 0 — the new source hasn't been played yet.
    const timeAfterLoad = await page.evaluate(() => {
      const el = document.querySelector('video') as HTMLVideoElement | null;
      return el?.currentTime ?? -1;
    });
    expect(timeAfterLoad).toBe(0);
  });

  test('switching back to original source also resets currentTime to 0', async ({ page }) => {
    // Advance past 1 s on source A.
    await clickPlay(page);
    await waitForPlayback(page, 1);

    // Switch to source B.
    await page.click('#btn-switch');

    // Wait for source B to reach readyState >= 1 (metadata available).
    await expect
      .poll(() => page.evaluate(() => (document.querySelector('video') as HTMLVideoElement | null)?.readyState ?? 0), {
        timeout: 20_000,
      })
      .toBeGreaterThanOrEqual(1);

    // Switch back to source A.
    await page.click('#btn-restore');

    const timeAfterRestore = await page.evaluate(() => {
      const el = document.querySelector('video') as HTMLVideoElement | null;
      return el?.currentTime ?? -1;
    });
    expect(timeAfterRestore).toBe(0);
  });
});
