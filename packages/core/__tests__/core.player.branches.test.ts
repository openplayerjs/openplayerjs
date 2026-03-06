/** @jest-environment jsdom */

import { Core } from '../src/core';
import type { MediaEngineContext, MediaSource } from '../src/core/media';

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
