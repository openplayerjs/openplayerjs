import type { Page } from '@playwright/test';
// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from '@playwright/test';

/** CSS selectors for common player elements. */
export const sel = {
  wrapper: '.op-player',
  media: '.op-player__media',
  controls: '.op-controls',
  play: '.op-controls__playpause',
  volume: '.op-controls__volume',
  progress: '.op-controls__progress',
  progressPlayed: '.op-controls__progress--played',
  fullscreen: '.op-controls__fullscreen',
  captions: '.op-controls__captions',
  captionsOn: '.op-controls__captions--on',
  settings: '.op-controls__settings',
  settingsPanel: '.op-menu',
  settingsItems: '.op-controls__menu-item',
  settingsBack: '.op-submenu__back',
  centerOverlay: '.op-player__play',
} as const;

/**
 * Navigate to an example page and wait until the player wrapper and controls
 * bar are present. The page is served from the repo root via Playwright's
 * static server so all absolute `/packages/…` paths resolve correctly.
 */
export async function loadExample(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForSelector(sel.wrapper, { timeout: 15_000 });
  await page.waitForSelector(sel.controls, { timeout: 10_000 });
}

/**
 * Click play and wait until the button enters the paused-icon state
 * (`op-controls__playpause--pause` class is present, meaning the player
 * believes it is playing).
 */
export async function clickPlay(page: Page): Promise<void> {
  await page.click(sel.play);
  await expect(page.locator(sel.play)).toHaveClass(/op-controls__playpause--pause/, {
    timeout: 12_000,
  });
}

/**
 * Click the button while in playing state and wait until the play-icon state
 * is restored (`op-controls__playpause--pause` class removed).
 */
export async function clickPause(page: Page): Promise<void> {
  await page.click(sel.play);
  await expect(page.locator(sel.play)).not.toHaveClass(/op-controls__playpause--pause/, {
    timeout: 6_000,
  });
}

/** Read the `currentTime` of the primary media element. */
export async function currentTime(page: Page): Promise<number> {
  return page.evaluate(() => {
    const el = document.querySelector('video, audio') as HTMLMediaElement | null;
    return el?.currentTime ?? 0;
  });
}

/**
 * Poll until `currentTime` has advanced past `minSeconds`. Confirms the
 * stream is actually delivering frames, not just buffering silently.
 */
export async function waitForPlayback(page: Page, minSeconds = 1): Promise<void> {
  await expect
    .poll(() => currentTime(page), {
      timeout: 25_000,
      message: `Expected currentTime > ${minSeconds}s`,
    })
    .toBeGreaterThan(minSeconds);
}

/**
 * Open the settings panel and wait for it to become visible.
 * Returns the locator for the settings panel so callers can chain assertions.
 */
export async function openSettings(page: Page) {
  const panel = page.locator(sel.settingsPanel);
  await page.click(sel.settings);
  await expect(panel).toBeVisible({ timeout: 3_000 });
  return panel;
}

/**
 * Open a named submenu inside the settings panel (e.g. "Speed", "Captions").
 * Assumes the panel is already open.
 */
export async function openSubmenu(page: Page, label: string | RegExp): Promise<void> {
  const item = page.locator(sel.settingsItems, { hasText: label }).first();
  await expect(item).toBeVisible({ timeout: 3_000 });
  await item.click();
  // Back button appears when a submenu is active
  await expect(page.locator(sel.settingsBack)).toBeVisible({ timeout: 3_000 });
}
