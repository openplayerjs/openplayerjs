/** @jest-environment jsdom */

import { Player } from '@openplayer/core';

// Drive mobile branch in createUI() (mobile uses pointerdown).
jest.mock('@openplayer/core', () => {
  const actual = jest.requireActual('@openplayer/core');
  return { ...actual, isMobile: jest.fn() };
});

import { isMobile } from '@openplayer/core';
import { createUI } from '../src/ui';

jest.useFakeTimers();

function nn<T>(v: T | null | undefined): T {
  expect(v).toBeTruthy();
  return v as T;
}

describe('UI createUI mobile branch coverage', () => {
  test('mobile registers pointerdown and auto-hides after 3s', () => {
    (isMobile as unknown as jest.Mock).mockReturnValue(true);

    const media = document.createElement('video');
    media.src = 'https://example.com/video.mp4';
    document.body.appendChild(media);

    const p = new Player(media, { plugins: [] });
    createUI(p, media, []);

    const wrapper = nn(media.closest('.op-player')) as HTMLElement;
    const controlsRoot = nn(wrapper.querySelector('.op-controls')) as HTMLElement;

    // Simulate playing so scheduleHide is active
    Object.defineProperty(media, 'paused', { value: false, configurable: true });

    // Trigger mobile pointerdown path
    wrapper.dispatchEvent(new Event('pointerdown', { bubbles: true }));

    // Avoid focusing wrapper/controls; focus-in on wrapper would clear the hide timer.
    document.body.tabIndex = 0;
    document.body.focus();

    jest.advanceTimersByTime(3100);
    expect(controlsRoot.getAttribute('aria-hidden')).toBe('true');
  });
});
