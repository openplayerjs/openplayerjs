/** @jest-environment jsdom */

jest.mock('@openplayer/core', () => {
  const actual = jest.requireActual('@openplayer/core');
  return {
    ...actual,
    isMobile: jest.fn(() => false),
  };
});

import { isMobile, Player } from '@openplayer/core';
import type { Control } from '../src/control';
import { createUI } from '../src/ui';

describe('ui/index - createUI', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    (isMobile as unknown as jest.Mock).mockReturnValue(false);
  });

  test('audio UI supports ui:addControl and cleans up on player.destroy()', () => {
    const media = document.createElement('audio');
    document.body.appendChild(media);
    const player = new Player(media, { width: 320, height: 50 });

    const destroySpy = jest.fn();
    const control: Control = {
      id: 'c1',
      placement: { v: 'bottom', h: 'left' },
      create: () => {
        const el = document.createElement('div');
        el.textContent = 'c1';
        return el;
      },
      destroy: destroySpy,
    };

    const ctx = createUI(player, media, [control]);
    expect(ctx.wrapper.classList.contains('op-player__audio')).toBe(true);

    const dynDestroy = jest.fn();
    const dynControl: Control = {
      id: 'dyn',
      placement: { v: 'bottom', h: 'right' },
      create: () => document.createElement('button'),
      destroy: dynDestroy,
    };

    const payload: { control: typeof dynControl; el?: HTMLElement } = { control: dynControl };
    player.emit('ui:addControl', payload);
    expect(payload.el).toBeInstanceOf(HTMLElement);

    const extra = document.createElement('span');
    player.emit('ui:addElement', { el: extra });
    expect(ctx.controlsRoot.contains(extra)).toBe(true);

    player.destroy();
    expect(destroySpy).toHaveBeenCalledTimes(1);
    expect(dynDestroy).toHaveBeenCalledTimes(1);
  });

  test('video UI creates overlay and runs autoplay-unmute flow on desktop', async () => {
    const media = document.createElement('video');
    media.autoplay = true;
    document.body.appendChild(media);

    const player = new Player(media, { labels: { click: 'Click to unmute!' }, startVolume: 0.4 });
    player.canAutoplayMuted = true;
    player.canAutoplay = false;

    jest.spyOn(player, 'play').mockResolvedValue(undefined);

    const ctx = createUI(player, media, []);
    expect(ctx.wrapper.classList.contains('op-player__video')).toBe(true);
    expect(ctx.wrapper.querySelector('.op-media')).not.toBeNull();

    // flush the microtask that mounts the unmute button
    await new Promise<void>((resolve) => queueMicrotask(() => resolve()));
    await new Promise((r) => setTimeout(r, 0));

    const btn = ctx.wrapper.querySelector('button.op-player__unmute') as HTMLButtonElement | null;
    expect(btn?.textContent).toBe('Click to unmute!');

    btn?.click();
    expect(player.userInteracted).toBe(true);
    expect(player.muted).toBe(false);
    expect(player.volume).toBeCloseTo(0.4, 5);
    expect(ctx.wrapper.querySelector('button.op-player__unmute')).toBeNull();

    player.destroy();
  });

  test('video UI uses tap label when isMobile() is true', async () => {
    (isMobile as unknown as jest.Mock).mockReturnValue(true);
    const media = document.createElement('video');
    media.autoplay = true;
    document.body.appendChild(media);

    const player = new Player(media, { labels: { tap: 'Tap to unmute!' }, startVolume: 0.2 });
    player.canAutoplayMuted = true;
    player.canAutoplay = false;
    jest.spyOn(player, 'play').mockResolvedValue(undefined);

    const ctx = createUI(player, media, []);
    await new Promise<void>((resolve) => queueMicrotask(() => resolve()));
    await new Promise((r) => setTimeout(r, 0));

    const btn = ctx.wrapper.querySelector('button.op-player__unmute') as HTMLButtonElement | null;
    expect(btn?.textContent).toBe('Tap to unmute!');
  });
});
