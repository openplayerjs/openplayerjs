// eslint-disable-next-line import/no-extraneous-dependencies
import { expect, test } from '@playwright/test';
import { loadExample, openSettings, openSubmenu, sel } from './helpers/player';

test.describe('Captions', () => {
  test.beforeEach(async ({ page }) => {
    await loadExample(page, '/examples/captions.html');
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  test('renders player with captions and settings buttons', async ({ page }) => {
    await expect(page.locator(sel.wrapper)).toBeVisible();
    await expect(page.locator(sel.captions)).toBeVisible();
    await expect(page.locator(sel.settings)).toBeVisible();
  });

  // ── Caption button initial state (content video, no ad active) ────────────

  test('captions button is visible once content tracks are detected', async ({ page }) => {
    // The control hides itself when no tracks exist. With a <track default>
    // on the content video it becomes visible after loadedmetadata fires.
    await expect(page.locator(sel.captions)).toBeVisible({ timeout: 10_000 });
  });

  test('captions are active by default (aria-pressed="true") when track has "default" attribute', async ({ page }) => {
    await expect(page.locator(sel.captions)).toHaveAttribute('aria-pressed', 'true', {
      timeout: 10_000,
    });
    await expect(page.locator(sel.captionsOn)).toBeVisible();
  });

  // ── Caption toggle (content video, no ad active) ───────────────────────────

  test('clicking captions button toggles them off (aria-pressed becomes false)', async ({ page }) => {
    await expect(page.locator(sel.captions)).toHaveAttribute('aria-pressed', 'true', {
      timeout: 10_000,
    });

    await page.click(sel.captions);

    await expect(page.locator(sel.captions)).toHaveAttribute('aria-pressed', 'false', {
      timeout: 3_000,
    });
    await expect(page.locator(sel.captionsOn)).not.toBeVisible();
  });

  test('clicking captions button a second time re-enables them', async ({ page }) => {
    await expect(page.locator(sel.captions)).toHaveAttribute('aria-pressed', 'true', {
      timeout: 10_000,
    });

    await page.click(sel.captions);
    await expect(page.locator(sel.captions)).toHaveAttribute('aria-pressed', 'false', {
      timeout: 3_000,
    });

    await page.click(sel.captions);
    await expect(page.locator(sel.captions)).toHaveAttribute('aria-pressed', 'true', {
      timeout: 3_000,
    });
  });

  test('toggling off disables the native text track on the content video element', async ({ page }) => {
    await expect(page.locator(sel.captions)).toHaveAttribute('aria-pressed', 'true', {
      timeout: 10_000,
    });

    await page.click(sel.captions);

    const showingCount = await page.evaluate(() => {
      const v = document.querySelector('#player') as HTMLVideoElement | null;
      if (!v) return -1;
      let count = 0;
      for (const track of v.textTracks) {
        if (track.mode === 'showing') count++;
      }
      return count;
    });
    expect(showingCount).toBe(0);
  });

  // ── Captions in Settings menu (content video, no ad active) ─────────────
  //
  // The inline VAST in captions.html uses an AES-encrypted HLS stream whose
  // duration is unpredictable in CI, so we cannot reliably wait for the ad to
  // end. Instead these tests open the settings panel before clicking play —
  // the content <track label="English"> is registered as soon as
  // loadedmetadata fires, which happens during page load (autoplay=false,
  // the player loads metadata eagerly).

  test('settings panel lists a Captions option on the content video', async ({ page }) => {
    // Wait for the settings button to be visible (player initialised + metadata loaded)
    await expect(page.locator(sel.settings)).toBeVisible({ timeout: 10_000 });

    await openSettings(page);
    // The captions menu item label is "CC/Subtitles" (defaultLabels.captions).
    await expect(page.locator(sel.settingsItems, { hasText: /subtitles/i }).first()).toBeVisible({ timeout: 5_000 });
  });

  test('Captions submenu lists available tracks and Off option', async ({ page }) => {
    await expect(page.locator(sel.settings)).toBeVisible({ timeout: 10_000 });

    await openSettings(page);
    await openSubmenu(page, /subtitles/i);

    await expect(page.locator(sel.settingsItems, { hasText: /off/i }).first()).toBeVisible();
    await expect(page.locator(sel.settingsItems, { hasText: /english/i }).first()).toBeVisible();
  });

  test('selecting Off in the captions submenu turns captions off', async ({ page }) => {
    await expect(page.locator(sel.settings)).toBeVisible({ timeout: 10_000 });

    await openSettings(page);
    await openSubmenu(page, /subtitles/i);
    await page.locator(sel.settingsItems, { hasText: /off/i }).first().click();

    await expect(page.locator(sel.captions)).toHaveAttribute('aria-pressed', 'false', {
      timeout: 3_000,
    });
  });

  test('selecting a track in the submenu turns captions on', async ({ page }) => {
    // Start with captions off so the selection has a visible effect
    await page.click(sel.captions);
    await expect(page.locator(sel.captions)).toHaveAttribute('aria-pressed', 'false', {
      timeout: 3_000,
    });

    await expect(page.locator(sel.settings)).toBeVisible({ timeout: 10_000 });

    await openSettings(page);
    await openSubmenu(page, /subtitles/i);
    await page
      .locator(sel.settingsItems, { hasText: /english/i })
      .first()
      .click();

    await expect(page.locator(sel.captions)).toHaveAttribute('aria-pressed', 'true', {
      timeout: 3_000,
    });
  });
});
