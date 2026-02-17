import { EventBus } from '../src/core/events';
import { Lease } from '../src/core/lease';
import type { MediaEngineContext, MediaSource } from '../src/core/media';
import { StateManager } from '../src/core/state';
import { BaseMediaEngine } from '../src/engines/base';

class TestEngine extends BaseMediaEngine {
  name = 'test-engine';
  version = '0.0.0';
  capabilities = ['media-engine'];
  priority = 1;
  canPlay(_source: MediaSource): boolean {
    return true;
  }
  attach(_ctx: MediaEngineContext): void {
    // no-op
  }
  detach(): void {
    // no-op
  }

  public exposeBindCommands(ctx: MediaEngineContext) {
    this.bindCommands(ctx);
  }
  public exposeBindPlayPauseCommands(ctx: MediaEngineContext) {
    this.bindPlayPauseCommands(ctx);
  }
  public exposeBindMediaEvents(media: HTMLMediaElement, events: EventBus) {
    this.bindMediaEvents(media, events);
  }
  public exposeUnbindMediaEvents() {
    this.unbindMediaEvents();
  }
  public exposeUnbindCommands() {
    this.unbindCommands();
  }
}

function ctx(media: HTMLMediaElement) {
  return {
    media,
    events: new EventBus(),
    leases: new Lease(),
    state: new StateManager('idle'),
    config: {},
    activeSource: { src: 'https://example.com/a.mp4', type: 'video/mp4' },
    player: {
      leases: new Lease(),
      state: new StateManager('idle'),
    } as any,
  } as MediaEngineContext;
}

describe('BaseMediaEngine branch coverage', () => {
  test('bindCommands obeys playback lease owner and handles seek try/catch', () => {
    const media = document.createElement('video');
    const engine = new TestEngine();
    const context = ctx(media);

    // Exercise normal (no owner) path
    engine.exposeBindCommands(context);
    context.events.emit('media:volume', 0.5);
    context.events.emit('media:muted', true);
    context.events.emit('media:rate', 1.5);
    expect(media.volume).toBe(0.5);
    expect(media.muted).toBe(true);
    expect(media.playbackRate).toBe(1.5);

    // Force currentTime setter to throw to hit catch branch
    Object.defineProperty(media, 'currentTime', {
      set() {
        throw new Error('nope');
      },
      get() {
        return 0;
      },
      configurable: true,
    });
    context.events.emit('playback:seek', 10);

    // Now deny ownership and ensure early returns execute
    context.player.leases.acquire('playback', 'someone-else');
    context.events.emit('media:volume', 0.1);
    context.events.emit('media:muted', false);
    context.events.emit('media:rate', 0.75);
    // values should remain from earlier successful writes
    expect(media.volume).toBe(0.5);
    expect(media.muted).toBe(true);
    expect(media.playbackRate).toBe(1.5);

    engine.exposeUnbindCommands();
  });

  test('bindPlayPauseCommands calls play/pause when engine owns playback', async () => {
    const media = document.createElement('video');
    const engine = new TestEngine();
    const context = ctx(media);

    const playSpy = jest.fn(() => Promise.resolve());
    const pauseSpy = jest.fn();
    media.play = playSpy;
    media.pause = pauseSpy;

    engine.exposeBindPlayPauseCommands(context);
    context.events.emit('playback:play');
    // playImpl is async fire-and-forget; flush microtasks
    await Promise.resolve();
    expect(playSpy).toHaveBeenCalled();

    context.events.emit('playback:pause');
    expect(pauseSpy).toHaveBeenCalled();

    // Ownership denied => early-return branches
    context.player.leases.acquire('playback', 'not-test-engine');
    context.events.emit('playback:play');
    context.events.emit('playback:pause');
    expect(playSpy).toHaveBeenCalledTimes(1);
    expect(pauseSpy).toHaveBeenCalledTimes(1);

    engine.exposeUnbindCommands();
  });

  test('bind/unbindMediaEvents wires and unwires media -> event bus mapping', () => {
    const media = document.createElement('video');
    const engine = new TestEngine();
    const events = new EventBus();
    const seen: string[] = [];

    events.on('media:loadedmetadata', () => seen.push('loadedmetadata'));
    events.on('playback:ready', () => seen.push('ready'));
    events.on('playback:ended', () => seen.push('ended'));
    events.on('playback:paused', () => seen.push('paused'));
    events.on('playback:playing', () => seen.push('playing'));

    engine.exposeBindMediaEvents(media, events);

    media.dispatchEvent(new Event('loadedmetadata'));
    media.dispatchEvent(new Event('playing'));
    media.dispatchEvent(new Event('pause'));
    media.dispatchEvent(new Event('ended'));
    expect(seen).toEqual(expect.arrayContaining(['loadedmetadata', 'ready', 'playing', 'paused', 'ended']));

    // ensure unbind branch runs
    engine.exposeUnbindMediaEvents();
    const prevLen = seen.length;
    media.dispatchEvent(new Event('ended'));
    expect(seen.length).toBe(prevLen);
  });
});
