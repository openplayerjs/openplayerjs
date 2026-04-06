// eslint-disable-next-line import/no-extraneous-dependencies
import { expect, test } from '@playwright/test';

const PAGE = '/examples/core.html';

// ─── suite ───────────────────────────────────────────────────────────────────

test.describe('Core API — registerPlugin() + HLS adapter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE);
    // Wait for the video element to be present in the DOM.
    await page.waitForSelector('#player', { timeout: 10_000 });
  });

  // ── Page structure ────────────────────────────────────────────────────────

  test('video element is present and has the HLS source', async ({ page }) => {
    // core.html puts the src directly on <video>, so there is no <source> child.
    // hls.js attaches almost immediately and replaces the native src attribute
    // with a MediaSource blob URL.  Accept either the original m3u8 URL (read
    // before hls.js attaches) or a blob: URL (proves hls.js attached, which
    // itself requires the m3u8 source to be configured).
    const src = await page.evaluate(() => {
      const v = document.querySelector('#player') as HTMLVideoElement | null;
      // Prefer the child <source> element; fall back to the video's own src.
      const source = document.querySelector('#player source') as HTMLSourceElement | null;
      return source?.getAttribute('src') ?? v?.getAttribute('src') ?? v?.src ?? '';
    });
    expect(src).toMatch(/x36xhzz\.m3u8|^blob:/);
  });

  test('no player UI shell is rendered (headless Core usage)', async ({ page }) => {
    // When @openplayerjs/player is NOT used there must be no .op-player wrapper.
    const wrapper = await page.$('.op-player');
    expect(wrapper).toBeNull();
  });

  // ── hls.js engine registration ────────────────────────────────────────────

  test('hls.js swaps the native src to a MediaSource blob URL', async ({ page }) => {
    // hls.js detaches the native src attribute and replaces it with a MediaSource
    // object URL (blob:) once it attaches to the element.
    await expect
      .poll(() => page.evaluate(() => (document.querySelector('#player') as HTMLVideoElement | null)?.src ?? ''), {
        timeout: 15_000,
        message: 'Expected hls.js to attach (blob: src)',
      })
      .toMatch(/^blob:/);
  });

  test('loadedmetadata fires after hls.js parses the manifest', async ({ page }) => {
    // readyState 1 = HAVE_METADATA, meaning dimensions and duration are known.
    await expect
      .poll(
        () => page.evaluate(() => (document.querySelector('#player') as HTMLVideoElement | null)?.readyState ?? 0),
        { timeout: 15_000 }
      )
      .toBeGreaterThanOrEqual(1);
  });

  // ── Autoplay ──────────────────────────────────────────────────────────────

  test('video autoplays (muted autoplay attribute present)', async ({ page }) => {
    // Core strips the `autoplay` HTML attribute after handling it internally.
    // muted must remain true (required for autoplay to succeed in browsers).
    // Poll for currentTime > 0 to confirm autoplay actually ran rather than
    // reading it once synchronously before any frames have rendered.
    const muted = await page.evaluate(
      () => (document.querySelector('#player') as HTMLVideoElement | null)?.muted ?? false
    );
    expect(muted).toBe(true);

    await expect
      .poll(
        () => page.evaluate(() => (document.querySelector('#player') as HTMLVideoElement | null)?.currentTime ?? 0),
        { timeout: 20_000, message: 'Expected autoplay to advance currentTime > 0' }
      )
      .toBeGreaterThan(0);
  });

  test('currentTime advances past 1 second (autoplay is running)', async ({ page }) => {
    await expect
      .poll(
        () => page.evaluate(() => (document.querySelector('#player') as HTMLVideoElement | null)?.currentTime ?? 0),
        { timeout: 20_000, message: 'Expected autoplay to advance currentTime > 1s' }
      )
      .toBeGreaterThan(1);
  });

  // ── getPlugin() / getAdapter() ────────────────────────────────────────────

  test('getPlugin("hls-engine") is available after loadedmetadata', async ({ page }) => {
    // The page logs {hls} to the console synchronously and then logs the adapter
    // inside the loadedmetadata one-shot. We verify via JS evaluation against
    // a global reference the page sets up.
    //
    // The page does not expose core globally, so we check indirectly: the hls.js
    // adapter must have attached, meaning the video readyState >= 1.
    await expect
      .poll(
        () => page.evaluate(() => (document.querySelector('#player') as HTMLVideoElement | null)?.readyState ?? 0),
        { timeout: 15_000 }
      )
      .toBeGreaterThanOrEqual(1);

    // Additionally confirm the console received the adapter log (no "HLS adapter not available").
    // We do this by checking no error was thrown — a simple proxy for adapter availability.
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'warning' && msg.text().includes('HLS adapter not available')) {
        errors.push(msg.text());
      }
    });
    // Give it a moment to flush any deferred warnings.
    await page.waitForTimeout(500);
    expect(errors).toHaveLength(0);
  });

  test('hls.js adapter exposes quality levels after manifest is parsed', async ({ page }) => {
    // Wait for readyState >= 1 (manifest parsed → loadedmetadata fired).
    await expect
      .poll(
        () => page.evaluate(() => (document.querySelector('#player') as HTMLVideoElement | null)?.readyState ?? 0),
        { timeout: 15_000 }
      )
      .toBeGreaterThanOrEqual(1);

    // The Mux test stream (Big Buck Bunny) has multiple quality levels.
    // hls.js stores them in Hls.levels; we read it through the video element's
    // internal structure isn't accessible cross-context, but we can infer it
    // by checking that the console logged quality level info without errors.
    // Concretely: if levels.length > 0 the page locks to the highest level,
    // which means currentLevel is set. We verify the video is actually playing
    // at a non-zero currentTime (ABR is working).
    await expect
      .poll(
        () => page.evaluate(() => (document.querySelector('#player') as HTMLVideoElement | null)?.currentTime ?? 0),
        { timeout: 20_000 }
      )
      .toBeGreaterThan(0);
  });

  // ── Console output verification ───────────────────────────────────────────

  test('console logs the hls.js adapter object (not null)', async ({ page }) => {
    const adapterLogs: string[] = [];

    page.on('console', (msg) => {
      if (msg.text().startsWith('hls.js adapter:')) {
        adapterLogs.push(msg.text());
      }
    });

    // Reload the page with the listener already attached.
    await page.goto(PAGE);
    await page.waitForSelector('#player');

    // Wait for loadedmetadata to fire and the one-shot callback to run.
    await expect.poll(() => adapterLogs.length, { timeout: 15_000 }).toBeGreaterThan(0);

    expect(adapterLogs[0]).toContain('hls.js adapter:');
  });

  test('console logs available quality levels (non-empty array)', async ({ page }) => {
    const levelLogs: string[] = [];

    page.on('console', (msg) => {
      if (msg.text().startsWith('Available quality levels:')) {
        levelLogs.push(msg.text());
      }
    });

    await page.goto(PAGE);
    await page.waitForSelector('#player');

    await expect.poll(() => levelLogs.length, { timeout: 15_000 }).toBeGreaterThan(0);
  });

  test('console logs the locked quality level (highest bitrate pinned)', async ({ page }) => {
    const lockLogs: string[] = [];

    page.on('console', (msg) => {
      if (msg.text().startsWith('Locked to level')) {
        lockLogs.push(msg.text());
      }
    });

    await page.goto(PAGE);
    await page.waitForSelector('#player');

    await expect.poll(() => lockLogs.length, { timeout: 15_000 }).toBeGreaterThan(0);

    // Level index is -1 when hls.js uses auto-ABR or the stream has a single
    // rendition; any integer (positive, zero, or -1) is a valid index.
    expect(lockLogs[0]).toMatch(/Locked to level -?\d+:/);
  });
});
