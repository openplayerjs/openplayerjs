/** @jest-environment jsdom */

import { Core, getOverlayManager } from '@openplayerjs/core';
import createCaptionsControl from '../src/controls/captions';
import createSettingsControl from '../src/controls/settings';

function makeCore() {
  const v = document.createElement('video');
  v.src = 'https://example.com/video.mp4';
  document.body.appendChild(v);
  const p = new Core(v, { plugins: [] });
  // Avoid jsdom play() errors
  p.play = jest.fn(async () => {
    p.events.emit('playback:playing');
  }) as unknown as Core['play'];
  p.pause = jest.fn(() => {
    p.events.emit('playback:paused');
  }) as unknown as Core['pause'];
  return p;
}

function addTextTracks(media: HTMLVideoElement, tracks: { label: string; kind?: TextTrackKind; language?: string }[]) {
  const list = {
    length: tracks.length,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    item: (i: number) => (list as any)[i] ?? null,
  } as unknown as TextTrackList & Record<number, TextTrack>;
  tracks.forEach((t, i) => {
    (list as Record<number, TextTrack>)[i] = {
      kind: t.kind || 'captions',
      label: t.label,
      language: t.language || 'en',
      mode: 'disabled',
    } as unknown as TextTrack;
  });
  Object.defineProperty(media, 'textTracks', {
    configurable: true,
    get: () => list,
  });
  return list;
}

describe('Settings control + registry', () => {
  test('SettingsControl hides when no providers are available, shows when providers exist', () => {
    const p = makeCore();
    const settings = createSettingsControl().create(p) as HTMLDivElement;
    expect(settings.style.display).not.toBe('none');
  });

  test('Captions submenu appears in Settings when tracks exist and selecting item enables track', () => {
    const p = makeCore();
    addTextTracks(p.media as HTMLVideoElement, [{ label: 'English', kind: 'captions' }]);

    // Create controls (captions registers its submenu provider)
    const captionsBtn = createCaptionsControl().create(p) as HTMLButtonElement;
    expect(captionsBtn.classList.contains('op-controls__captions')).toBe(true);

    const settings = createSettingsControl().create(p) as HTMLDivElement;
    const gear = settings.querySelector('button.op-controls__settings') as HTMLButtonElement;
    expect(gear).toBeTruthy();

    // Open settings panel
    gear.click();

    // Root menu should include Captions and Speed
    const items = Array.from(settings.querySelectorAll('.op-controls__menu-item')) as HTMLButtonElement[];
    const labels = items.map((b) => (b.textContent || '').trim());
    expect(labels).toEqual(expect.arrayContaining(['CC/Subtitles', 'Speed']));

    // Enter captions submenu
    const captionsItem = items.find((b) => (b.textContent || '').includes('CC/Subtitles'))!;
    captionsItem.click();

    // Select the first track (not Off)
    const submenuItems = Array.from(settings.querySelectorAll('.op-controls__menu-item')) as HTMLButtonElement[];
    const trackItem = submenuItems.find((b) => (b.textContent || '').includes('English'))!;
    trackItem.click();

    // Track should be showing now
    const tracks = (p.media as HTMLVideoElement).textTracks;
    expect(tracks[0].mode).toBe('showing');
  });

  test('Captions button toggles on/off without opening a menu', () => {
    const p = makeCore();
    addTextTracks(p.media as HTMLVideoElement, [{ label: 'English', kind: 'captions' }]);

    const btn = createCaptionsControl().create(p) as HTMLButtonElement;

    // Toggle ON
    btn.click();
    expect((p.media as HTMLVideoElement).textTracks[0].mode).toBe('showing');
    expect(btn.getAttribute('aria-pressed')).toBe('true');

    // Toggle OFF
    btn.click();
    expect((p.media as HTMLVideoElement).textTracks[0].mode).toBe('disabled');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
  });

  test('Captions submenu "Off" item disables all tracks', () => {
    const p = makeCore();
    const trackList = addTextTracks(p.media as HTMLVideoElement, [{ label: 'English', kind: 'captions' }]);
    (trackList as any)[0].mode = 'showing';

    createCaptionsControl().create(p);
    const settings = createSettingsControl().create(p) as HTMLDivElement;
    const gear = settings.querySelector('button.op-controls__settings') as HTMLButtonElement;

    gear.click();

    const items = Array.from(settings.querySelectorAll('.op-controls__menu-item')) as HTMLButtonElement[];
    const captionsItem = items.find((b) => (b.textContent || '').includes('CC/Subtitles'))!;
    captionsItem.click();

    const submenuItems = Array.from(settings.querySelectorAll('.op-controls__menu-item')) as HTMLButtonElement[];
    const offItem = submenuItems.find((b) => (b.textContent || '').trim() === 'Off')!;
    expect(offItem).toBeTruthy();
    offItem.click();

    expect((p.media as HTMLVideoElement).textTracks[0].mode).toBe('disabled');
  });

  test('Speed submenu is not available during ads (overlay active)', () => {
    const p = makeCore();

    // Simulate ads overlay becoming active
    getOverlayManager(p).activate({
      id: 'ads',
      priority: 100,
      mode: 'countdown',
      canSeek: false,
      duration: 10,
      value: 10,
      label: 'Ad',
    });

    const settings = createSettingsControl().create(p) as HTMLDivElement;
    const gear = settings.querySelector('button.op-controls__settings') as HTMLButtonElement;

    // Open settings panel
    gear.click();

    // Root menu should NOT include Speed
    const items = Array.from(settings.querySelectorAll('.op-controls__menu-item')) as HTMLButtonElement[];
    const labels = items.map((b) => (b.textContent || '').trim());
    expect(labels).not.toEqual(expect.arrayContaining(['Speed']));

    // Even if toggled repeatedly, Speed should never appear when the panel is open
    for (let i = 0; i < 5; i++) {
      gear.click(); // close
      gear.click(); // open
      const anySpeedRow = Array.from(settings.querySelectorAll('.op-controls__menu-item')).some((b) =>
        (b.textContent || '').includes('Speed')
      );
      expect(anySpeedRow).toBe(false);
    }
  });
});
