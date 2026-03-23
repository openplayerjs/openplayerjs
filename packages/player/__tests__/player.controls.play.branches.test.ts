/** @jest-environment jsdom */

/**
 * Targets uncovered branches in controls/play.ts:
 *  - `labels[key] ?? key` right branch in fmt (key not in labels)
 *  - `labels['pause'] ? fmt('play') : 'Playing'` false branch (labels.pause undefined)
 *  - `labels['pause'] ?? 'Paused'` right branch (labels.pause undefined)
 *  - `if (!core.media.seeking) announce(...)` false branch (seeking = true)
 */

import { Core } from '@openplayerjs/core';
import type { PlayerUIConfig } from '../src/configuration';
import createPlayControl from '../src/controls/play';

jest.useFakeTimers();

function makeCore(labelOverrides?: Record<string, string | undefined>) {
  const v = document.createElement('video');
  v.src = 'https://example.com/video.mp4';
  document.body.appendChild(v);
  const core = new Core(v, { labels: labelOverrides } as PlayerUIConfig);
  return core;
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('PlayControl: uncovered fmt and playing-event branches', () => {
  test('playing event with seeking=true skips announce call', () => {
    const p = makeCore();
    // Wrap in .op-player so createAnnouncer appends live regions to a container
    const opPlayer = document.createElement('div');
    opPlayer.className = 'op-player';
    document.body.appendChild(opPlayer);
    opPlayer.appendChild(p.media);

    const c = createPlayControl();
    const el = c.create(p);
    opPlayer.appendChild(el);

    // seeking=true → the `if (!core.media.seeking)` branch is false → announce NOT called
    Object.defineProperty(p.media, 'seeking', { configurable: true, value: true });
    p.events.emit('playing');

    // No exception and button still has correct state
    expect(el.classList.contains('op-controls__playpause--pause')).toBe(true);
  });

  test('playing event with labels.pause undefined uses "Playing" fallback', () => {
    // Override pause to undefined so labels['pause'] is falsy
    const p = makeCore({ pause: undefined });

    const opPlayer = document.createElement('div');
    opPlayer.className = 'op-player';
    document.body.appendChild(opPlayer);
    opPlayer.appendChild(p.media);

    const c = createPlayControl();
    const el = c.create(p);
    opPlayer.appendChild(el);

    Object.defineProperty(p.media, 'seeking', { configurable: true, value: false });

    // labels['pause'] is falsy → `'Playing'` literal branch is taken
    p.events.emit('playing');
    expect(el.classList.contains('op-controls__playpause--pause')).toBe(true);
  });

  test('pause event with labels.pause undefined uses "Paused" fallback', () => {
    // Override pause to undefined so `labels['pause'] ?? 'Paused'` uses the fallback
    const p = makeCore({ pause: undefined });

    const opPlayer = document.createElement('div');
    opPlayer.className = 'op-player';
    document.body.appendChild(opPlayer);
    opPlayer.appendChild(p.media);

    const c = createPlayControl();
    const el = c.create(p);
    opPlayer.appendChild(el);

    p.events.emit('play');
    // Now emit pause — labels['pause'] is undefined → ?? 'Paused' fallback
    p.events.emit('pause');
    expect(el.classList.contains('op-controls__playpause--pause')).toBe(false);
  });

  test('playing event with labels.play undefined triggers ?? key fallback in fmt', () => {
    // Override play to undefined → fmt('play') falls back to key ('play')
    const p = makeCore({ play: undefined });

    const opPlayer = document.createElement('div');
    opPlayer.className = 'op-player';
    document.body.appendChild(opPlayer);
    opPlayer.appendChild(p.media);

    const c = createPlayControl();
    const el = c.create(p);
    opPlayer.appendChild(el);

    Object.defineProperty(p.media, 'seeking', { configurable: true, value: false });
    // labels['pause'] defaults to 'Pause' (truthy), labels['play'] is undefined → fmt uses ?? fallback
    p.events.emit('playing');
    expect(el.classList.contains('op-controls__playpause--pause')).toBe(true);
  });
});
