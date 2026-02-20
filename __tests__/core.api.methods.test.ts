import { Player } from '../src/core/player';
import { AdsPlugin, extendAds } from '../src/plugins/ads';
import { createUI } from '../src/ui';
import type { Control } from '../src/ui/control';
import { extendControls } from '../src/ui/extend';

describe('imperative APIs via instance-level extensions', () => {
  test('addCaptions appends a track and emits texttrack events', () => {
    const video = document.createElement('video');
    document.body.appendChild(video);

    const p = new Player(video);

    const onAdd = jest.fn();
    const onList = jest.fn();
    p.on('texttrack:add', onAdd);
    p.on('texttrack:listchange', onList);

    const track = p.addCaptions({
      src: 'https://example.com/captions.vtt',
      srclang: 'en',
      label: 'English',
      kind: 'subtitles',
      default: true,
    });

    expect(track).toBeInstanceOf(HTMLTrackElement);
    expect(video.querySelectorAll('track').length).toBe(1);
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onList).toHaveBeenCalledTimes(1);
  });

  test('ads plugin can be registered and extended onto player.ads', () => {
    const video = document.createElement('video');
    document.body.appendChild(video);

    const p = new Player(video);
    const ads = new AdsPlugin({ allowNativeControls: false });

    p.registerPlugin(ads);
    extendAds(p as any, ads);

    expect((p as any).getPlugin('ads')).toBe(ads);
    expect((p as any).ads).toBe(ads);
    expect((p as any).ads.name).toBe('ads');
  });

  test('controls extension delegates UI operations without polluting core', () => {
    const video = document.createElement('video');
    document.body.appendChild(video);

    const p = new Player(video);

    const controls = extendControls(p);

    // error paths (UI not initialized)
    expect(() => controls.addElement(document.createElement('div'))).toThrow(/UI not initialized/);

    const dummyControl: Control = {
      id: 'dummy',
      placement: { v: 'bottom', h: 'right' },
      create: () => {
        const b = document.createElement('button');
        b.textContent = 'X';
        return b;
      },
    };
    expect(() => controls.addControl(dummyControl)).toThrow(/UI not initialized/);

    // init UI
    const ui = createUI(p, video, []);
    expect(ui?.controlsRoot).toBeTruthy();

    const el = document.createElement('div');
    el.className = 'custom-el';
    controls.addElement(el, { v: 'bottom', h: 'left' });
    expect(document.querySelector('.custom-el')).toBeTruthy();

    const btn = controls.addControl(dummyControl);
    expect(btn).toBeInstanceOf(HTMLButtonElement);
    expect(btn?.dataset.controlId).toBe('dummy');
  });

  test('destroy restores the original media element when UI was created', () => {
    const video = document.createElement('video');
    const host = document.createElement('div');
    host.id = 'host';
    host.appendChild(video);
    document.body.appendChild(host);

    const p = new Player(video);
    const ui = createUI(p, video, []);
    expect(ui?.wrapper).toBeTruthy();
    expect(host.firstElementChild?.classList.contains('op-player')).toBe(true);
    expect(host.querySelector('video')).toBeTruthy();

    p.destroy();

    expect(host.firstElementChild?.tagName.toLowerCase()).toBe('video');
    expect(host.childNodes).toHaveLength(1);
  });
});
