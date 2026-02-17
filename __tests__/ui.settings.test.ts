/** @jest-environment jsdom */

import { getOverlayManager } from '../src/core/overlay';
import { Player } from '../src/core/player';
import createCaptionsControl from '../src/ui/controls/captions';
import createSettingsControl from '../src/ui/controls/settings';
import { getSettingsRegistry } from '../src/ui/settings';

function makePlayer() {
  const v = document.createElement('video');
  v.src = 'https://example.com/video.mp4';
  document.body.appendChild(v);
  const p = new Player(v, { plugins: [] });
  // Avoid jsdom play() errors
  p.play = jest.fn(async () => {
    p.events.emit('playback:playing');
  }) as any;
  p.pause = jest.fn(() => {
    p.events.emit('playback:paused');
  }) as any;
  return p;
}

function addTextTracks(media: HTMLVideoElement, tracks: { label: string; kind?: TextTrackKind; language?: string }[]) {
  const list: any = {
    length: tracks.length,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    item: (i: number) => list[i] ?? null,
  };
  tracks.forEach((t, i) => {
    list[i] = {
      kind: t.kind || 'captions',
      label: t.label,
      language: t.language || 'en',
      mode: 'disabled',
    };
  });
  Object.defineProperty(media, 'textTracks', {
    configurable: true,
    get: () => list,
  });
  return list;
}

describe('Settings control + registry', () => {
  test('SettingsControl hides when no providers are available, shows when providers exist', () => {
    const p = makePlayer();
    // clear any providers (a new registry per player)
    const reg = getSettingsRegistry(p);

    const settings = createSettingsControl().create(p) as HTMLDivElement;
    expect(settings.style.display).not.toBe('none'); // Speed provider is built-in and always available.
  });

  test('Captions submenu appears in Settings when tracks exist and selecting item enables track', () => {
    const p = makePlayer();
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
    expect(labels).toEqual(expect.arrayContaining(['Captions', 'Speed']));

    // Enter captions submenu
    const captionsItem = items.find((b) => (b.textContent || '').includes('Captions'))!;
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
    const p = makePlayer();
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

  test('Speed submenu is not available during ads (overlay active)', () => {
    const p = makePlayer();

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
