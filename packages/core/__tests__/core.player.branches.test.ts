/** @jest-environment jsdom */

import { Core } from '../src/core';
import type { MediaEngineContext, MediaSource } from '../src/core/media';
import type { MediaSurface } from '../src/core/surface';

class EngineA {
  name = 'engine-a';
  version = '0';
  capabilities = ['media-engine'];
  priority = 10;
  canPlay(source: MediaSource) {
    return source.type === 'video/mp4';
  }
  attach(ctx: MediaEngineContext) {
    // emit loadedmetadata to cover state transitions
    ctx.events.emit('loadedmetadata');
  }
  detach() {
    // no-op
  }
}

class EngineB {
  name = 'engine-b';
  version = '0';
  capabilities = ['media-engine'];
  priority = 5;
  canPlay(_source: MediaSource) {
    return true;
  }
  attach() {
    // no-op
  }
  detach() {
    // no-op
  }
}

describe('core/player branches', () => {
  test('load returns early when not idle and selects highest priority compatible engine', async () => {
    const media = document.createElement('video');
    media.src = 'https://example.com/a.mp4';
    const p = new Core(media, { plugins: [new EngineB(), new EngineA()] });

    // autoload may run on a microtask; flush once
    await Promise.resolve();
    expect(p.state.current).toBe('ready');
    expect((p as any).activeEngine?.name).toBe('engine-a');

    // load again should early-return (not idle)
    const prevState = p.state.current;
    p.load();
    expect(p.state.current).toBe(prevState);
  });

  test('src setter schedules load and emit source:set', async () => {
    const media = document.createElement('video');
    const p = new Core(media, { plugins: [new EngineB()] });

    const seen: string[] = [];
    p.on('source:set', () => seen.push('source:set'));
    p.src = 'https://example.com/b.mp4';

    // flush queued microtask load
    await Promise.resolve();
    expect(seen).toContain('source:set');
  });

  test('src setter resets player to idle when already in a non-idle state (source switching)', async () => {
    const media = document.createElement('video');
    media.src = 'https://example.com/a.mp4';
    // EngineA emits loadedmetadata synchronously in attach(), so state becomes ready immediately.
    const p = new Core(media, { plugins: [new EngineA()] });

    await Promise.resolve();
    expect(p.state.current).toBe('ready');

    // Switch to a new source while non-idle.
    p.src = 'https://example.com/b.mp4';

    // The setter must reset to idle so load() can run.
    expect(p.state.current).toBe('idle');
    expect(p.src).toBe('https://example.com/b.mp4');

    // Flush the queued microtask — EngineA will attach and emit loadedmetadata again.
    await Promise.resolve();
    expect(p.state.current).toBe('ready');
  });

  test('maybeAutoLoad branches: no engines, no sources, and try/catch protection', () => {
    // no engines: create via selector path and then remove the default engine by overriding registerPlugin
    const media1 = document.createElement('video');
    // Make it have no sources
    const p1 = new Core(media1, { plugins: [] });
    // Ensure it does not crash
    expect(p1).toBeTruthy();

    // sources length 0 branch
    const media2 = document.createElement('video');
    const p2 = new Core(media2, { plugins: [new EngineB()] });
    expect(p2).toBeTruthy();

    // try/catch branch: force querySelectorAll to throw
    const media3 = document.createElement('video');
    media3.src = 'https://example.com/c.mp4';
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    media3.querySelectorAll = () => {
      throw new Error('boom');
    };
    const p3 = new Core(media3, { plugins: [new EngineB()] });
    expect(p3).toBeTruthy();
  });

  test('constructor accepts a CSS selector string', () => {
    const media = document.createElement('video');
    media.id = 'op-test-video';
    document.body.appendChild(media);

    const p = new Core('#op-test-video');
    expect(p.media).toBe(media);

    p.destroy();
    document.body.removeChild(media);
  });

  test('constructor throws when selector matches nothing or a non-media element', () => {
    document.body.innerHTML = '<div id="not-media"></div>';
    expect(() => new Core('#nonexistent')).toThrow('OpenPlayer');
    expect(() => new Core('#not-media')).toThrow('OpenPlayer');
    document.body.innerHTML = '';
  });

  test('pause() is a no-op when player is idle or loading', () => {
    const media = document.createElement('video');
    const p = new Core(media);

    const spy = jest.fn();
    p.events.on('cmd:pause', spy);

    // idle state — early return
    p.pause();
    expect(spy).not.toHaveBeenCalled();

    // loading state — early return
    p.events.emit('loadstart');
    expect(p.state.current).toBe('loading');
    p.pause();
    expect(spy).not.toHaveBeenCalled();

    p.destroy();
  });

  test('addCaptions appends a track element with all optional properties set', () => {
    const media = document.createElement('video');
    document.body.appendChild(media);
    const p = new Core(media);

    const track = p.addCaptions({
      src: 'https://example.com/subs.vtt',
      srclang: 'fr',
      label: 'Français',
      kind: 'subtitles',
      default: true,
    });
    expect(track.srclang).toBe('fr');
    expect(track.label).toBe('Français');
    expect(track.kind).toBe('subtitles');
    expect(track.default).toBe(true);
    expect(media.contains(track)).toBe(true);

    // Without optional fields — uses default kind ('captions')
    const track2 = p.addCaptions({ src: 'https://example.com/subs2.vtt' });
    expect(track2.kind).toBe('captions');

    p.destroy();
    document.body.removeChild(media);
  });

  test('extend() merges new keys, skips existing keys, and deep-merges nested objects', () => {
    const media = document.createElement('video');
    const p = new Core(media) as Core & Record<string, unknown>;

    // null/non-object extension → returns this unchanged
    expect(p.extend(null as unknown as Record<string, unknown>)).toBe(p);

    // New primitive key
    p.extend({ _marker: 'hello' });
    expect(p._marker).toBe('hello');

    // Existing primitive key → not overwritten
    const prevVolume = p.volume;
    p.extend({ volume: 999 });
    expect(p.volume).toBe(prevVolume);

    // Nested object: new key added to existing nested object
    p.extend({ _nested: { a: 1 } });
    p.extend({ _nested: { b: 2 } });
    expect((p._nested as Record<string, number>).a).toBe(1);
    expect((p._nested as Record<string, number>).b).toBe(2);

    p.destroy();
  });

  test('error event rejects the ready promise while it is in flight', async () => {
    const media = document.createElement('video');
    media.src = 'https://example.com/v.mp4';

    // Engine that attaches but never fires loadedmetadata, keeping readyPromise pending
    class PendingEngine {
      name = 'pending-engine';
      version = '0';
      capabilities = ['media-engine'];
      priority = 100;
      canPlay(_s: MediaSource) { return true; }
      attach(_ctx: MediaEngineContext) { /* intentionally silent */ }
      detach() {}
    }

    const p = new Core(media, { plugins: [new PendingEngine()] });
    await Promise.resolve(); // flush maybeAutoLoad → load() → createReadyPromise()

    const rejected = jest.fn();
    const pending = p.whenReady().catch(rejected);

    // Emitting 'error' should invoke readyReject and clear it
    p.events.emit('error', null);
    await pending;

    expect(rejected).toHaveBeenCalledTimes(1);
    expect(p.state.current).toBe('error');

    p.destroy();
  });

  test('readMediaSources reads <source> children with and without explicit type', async () => {
    const media = document.createElement('video');

    const s1 = document.createElement('source');
    s1.src = 'https://example.com/v.mp4';
    s1.type = 'video/mp4'; // explicit type — left side of el.type || predictMimeType()
    media.appendChild(s1);

    const s2 = document.createElement('source');
    s2.src = 'https://example.com/v.m3u8';
    // no type — predictMimeType() infers 'application/x-mpegURL' (right side)
    media.appendChild(s2);

    const p = new Core(media, { plugins: [new EngineB()] });
    await Promise.resolve();

    // Both source elements processed → player started loading (state left loading by EngineB)
    expect(p.state.current).toBe('loading');

    p.destroy();
  });

  test('setSurface and resetSurface update the active surface on the player context', async () => {
    const media = document.createElement('video');
    media.src = 'https://example.com/v.mp4';

    let capturedCtx: MediaEngineContext | null = null;

    class CapturingEngine {
      name = 'capturing-engine';
      version = '0';
      capabilities = ['media-engine'];
      priority = 100;
      canPlay(_s: MediaSource) { return true; }
      attach(ctx: MediaEngineContext) { capturedCtx = ctx; }
      detach() {}
    }

    const p = new Core(media, { plugins: [new CapturingEngine()] });
    await Promise.resolve();

    expect(capturedCtx).not.toBeNull();

    // setSurface() swaps the active surface and returns it
    const fakeSurface: MediaSurface = {
      currentTime: 0,
      duration: 0,
      volume: 1,
      muted: false,
      playbackRate: 1,
      paused: true,
      ended: false,
      play: () => Promise.resolve(),
      pause: () => {},
      on: () => () => {},
    };

    const returned = capturedCtx!.setSurface(fakeSurface);
    expect(returned).toBe(fakeSurface);
    expect(p.surface).toBe(fakeSurface);

    // resetSurface() restores the native HtmlMediaSurface
    capturedCtx!.resetSurface();
    expect(p.surface).not.toBe(fakeSurface);

    p.destroy();
  });

  test('destroy detaches engine when context exists', async () => {
    const media = document.createElement('video');
    media.src = 'https://example.com/a.mp4';
    const detachSpy = jest.fn();
    const engine = new EngineB();
    engine.detach = detachSpy;
    const p = new Core(media, { plugins: [engine] });
    // Flush queueMicrotask so maybeAutoLoad runs and playerContext is set before destroy
    await Promise.resolve();
    p.destroy();
    expect(detachSpy).toHaveBeenCalled();
  });
});
