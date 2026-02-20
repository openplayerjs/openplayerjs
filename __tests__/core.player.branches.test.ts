import type { MediaEngineContext, MediaSource } from '../src/core/media';
import { Player } from '../src/core/player';

class EngineA {
  name = 'engine-a';
  version = '0';
  capabilities = ['media-engine'];
  priority = 10;
  canPlay(source: MediaSource) {
    return source.type === 'video/mp4';
  }
  attach(ctx: MediaEngineContext) {
    // emit ready to cover state transitions
    ctx.events.emit('playback:ready');
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
    const p = new Player(media, { plugins: [new EngineB(), new EngineA()] });

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
    const p = new Player(media, { plugins: [new EngineB()] });

    const seen: string[] = [];
    p.on('source:set', () => seen.push('source:set'));
    p.src = 'https://example.com/b.mp4';

    // flush queued microtask load
    await Promise.resolve();
    expect(seen).toContain('source:set');
  });

  test('maybeAutoLoad branches: no engines, no sources, and try/catch protection', () => {
    // no engines: create via selector path and then remove the default engine by overriding registerPlugin
    const media1 = document.createElement('video');
    // Make it have no sources
    const p1 = new Player(media1, { plugins: [] });
    // Ensure it does not crash
    expect(p1).toBeTruthy();

    // sources length 0 branch
    const media2 = document.createElement('video');
    const p2 = new Player(media2, { plugins: [new EngineB()] });
    expect(p2).toBeTruthy();

    // try/catch branch: force querySelectorAll to throw
    const media3 = document.createElement('video');
    media3.src = 'https://example.com/c.mp4';
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    media3.querySelectorAll = () => {
      throw new Error('boom');
    };
    const p3 = new Player(media3, { plugins: [new EngineB()] });
    expect(p3).toBeTruthy();
  });

  test('destroy detaches engine when context exists', () => {
    const media = document.createElement('video');
    media.src = 'https://example.com/a.mp4';
    const detachSpy = jest.fn();
    const engine = new EngineB();
    engine.detach = detachSpy;
    const p = new Player(media, { plugins: [engine] });
    p.destroy();
    expect(detachSpy).toHaveBeenCalled();
  });
});
