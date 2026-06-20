/** @jest-environment jsdom */

import { Core } from '../src/core';
import type { MediaEngineContext, MediaSource } from '../src/core/media';

// Emits 'error' immediately on attach — simulates a source that fails to load.
class FailingEngine {
  name = 'failing-engine';
  version = '0';
  capabilities = ['media-engine'];
  priority = 50;
  canPlay(s: MediaSource) {
    return s.type === 'audio/mpeg';
  }
  attach(ctx: MediaEngineContext) {
    ctx.events.emit('error', null);
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  detach() {}
}

// Emits 'loadedmetadata' immediately on attach — simulates a healthy source.
class SucceedingEngine {
  name = 'succeeding-engine';
  version = '0';
  capabilities = ['media-engine'];
  priority = 100;
  canPlay(s: MediaSource) {
    return s.type === 'video/mp4';
  }
  attach(ctx: MediaEngineContext) {
    ctx.events.emit('loadedmetadata');
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  detach() {}
}

function makeAudioSource(n: number): HTMLSourceElement {
  const s = document.createElement('source');
  s.src = `https://example.com/audio-${n}.mp3`;
  s.type = 'audio/mpeg';
  return s;
}

function makeVideoSource(n: number): HTMLSourceElement {
  const s = document.createElement('source');
  s.src = `https://example.com/video-${n}.mp4`;
  s.type = 'video/mp4';
  return s;
}

describe('source fallback', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  // ── default (enabled for <source> tags) ─────────────────────────────────

  test('sourceFallback is enabled by default: second <source> tag is tried after first fails', async () => {
    const media = document.createElement('audio');
    media.appendChild(makeAudioSource(1)); // fails
    media.appendChild(makeVideoSource(1)); // succeeds
    document.body.appendChild(media);

    const p = new Core(media, { plugins: [new FailingEngine(), new SucceedingEngine()] });
    await Promise.resolve();

    expect(p.state.current).toBe('ready');
  });

  test('with sourceFallback: false, error transitions to error state immediately even with multiple sources', async () => {
    const media = document.createElement('audio');
    media.appendChild(makeAudioSource(1));
    media.appendChild(makeAudioSource(2));
    document.body.appendChild(media);

    const p = new Core(media, { sourceFallback: false, plugins: [new FailingEngine()] });
    await Promise.resolve();

    expect(p.state.current).toBe('error');
  });

  test('single programmatic src does not trigger fallback even with default sourceFallback: true', async () => {
    class HighPriorityFailingEngine {
      name = 'hp-failing-engine';
      version = '0';
      capabilities = ['media-engine'];
      priority = 999;
      canPlay(_s: MediaSource) {
        return true;
      }
      attach(ctx: MediaEngineContext) {
        ctx.events.emit('error', null);
      }
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      detach() {}
    }

    const media = document.createElement('audio');
    document.body.appendChild(media);

    const p = new Core(media, { plugins: [new HighPriorityFailingEngine()] });
    p.src = 'https://example.com/audio-1.mp3';
    await Promise.resolve();

    expect(p.state.current).toBe('error');
  });

  // ── enabled ───────────────────────────────────────────────────────────────

  test('with sourceFallback, second source is tried after first fails', async () => {
    const media = document.createElement('audio');
    media.appendChild(makeAudioSource(1)); // fails
    media.appendChild(makeVideoSource(1)); // succeeds
    document.body.appendChild(media);

    const p = new Core(media, {
      sourceFallback: true,
      plugins: [new FailingEngine(), new SucceedingEngine()],
    });
    await Promise.resolve();

    expect(p.state.current).toBe('ready');
  });

  test('with sourceFallback, cascades through multiple failing sources until one succeeds', async () => {
    const media = document.createElement('audio');
    media.appendChild(makeAudioSource(1)); // fails
    media.appendChild(makeAudioSource(2)); // fails
    media.appendChild(makeVideoSource(1)); // succeeds
    document.body.appendChild(media);

    const p = new Core(media, {
      sourceFallback: true,
      plugins: [new FailingEngine(), new SucceedingEngine()],
    });
    await Promise.resolve();

    expect(p.state.current).toBe('ready');
  });

  test('with sourceFallback, enters error state only when all sources are exhausted', async () => {
    const media = document.createElement('audio');
    media.appendChild(makeAudioSource(1));
    media.appendChild(makeAudioSource(2));
    document.body.appendChild(media);

    const p = new Core(media, {
      sourceFallback: true,
      plugins: [new FailingEngine()],
    });
    await Promise.resolve();

    expect(p.state.current).toBe('error');
  });

  test('with sourceFallback and a single source, behaves the same as without (error state)', async () => {
    const media = document.createElement('audio');
    media.appendChild(makeAudioSource(1));
    document.body.appendChild(media);

    const p = new Core(media, {
      sourceFallback: true,
      plugins: [new FailingEngine()],
    });
    await Promise.resolve();

    expect(p.state.current).toBe('error');
  });

  // ── source:fallback event ─────────────────────────────────────────────────

  test('source:fallback event fires with the failed and next source URLs', async () => {
    const media = document.createElement('audio');
    const s1 = makeAudioSource(1);
    const s2 = makeVideoSource(1);
    media.appendChild(s1);
    media.appendChild(s2);
    document.body.appendChild(media);

    const payloads: { failed: string; next: string }[] = [];

    const p = new Core(media, {
      sourceFallback: true,
      plugins: [new FailingEngine(), new SucceedingEngine()],
    });
    p.on('source:fallback', (payload) => {
      payloads.push(payload!);
    });

    await Promise.resolve();

    expect(payloads).toHaveLength(1);
    expect(payloads[0].failed).toBe(s1.src);
    expect(payloads[0].next).toBe(s2.src);
  });

  test('source:fallback fires for each failing source in sequence', async () => {
    const media = document.createElement('audio');
    const s1 = makeAudioSource(1);
    const s2 = makeAudioSource(2);
    const s3 = makeVideoSource(1);
    media.appendChild(s1);
    media.appendChild(s2);
    media.appendChild(s3);
    document.body.appendChild(media);

    const payloads: { failed: string; next: string }[] = [];

    const p = new Core(media, {
      sourceFallback: true,
      plugins: [new FailingEngine(), new SucceedingEngine()],
    });
    p.on('source:fallback', (payload) => {
      payloads.push(payload!);
    });

    await Promise.resolve();

    expect(payloads).toHaveLength(2);
    expect(payloads[0].failed).toBe(s1.src);
    expect(payloads[0].next).toBe(s2.src);
    expect(payloads[1].failed).toBe(s2.src);
    expect(payloads[1].next).toBe(s3.src);
    expect(p.state.current).toBe('ready');
  });

  test('error event fires for each failing source but state only becomes error when all are exhausted', async () => {
    const media = document.createElement('audio');
    media.appendChild(makeAudioSource(1));
    media.appendChild(makeVideoSource(1));
    document.body.appendChild(media);

    const errors: unknown[] = [];
    const p = new Core(media, {
      sourceFallback: true,
      plugins: [new FailingEngine(), new SucceedingEngine()],
    });
    p.on('error', (e) => errors.push(e));

    await Promise.resolve();

    // The first source fired 'error' (useful for per-source error tracking).
    expect(errors).toHaveLength(1);
    // But the player recovered: state is 'ready', not 'error'.
    expect(p.state.current).toBe('ready');
  });

  // ── whenReady() integration ───────────────────────────────────────────────

  test('whenReady() resolves after a successful fallback', async () => {
    const media = document.createElement('audio');
    media.appendChild(makeAudioSource(1));
    media.appendChild(makeVideoSource(1));
    document.body.appendChild(media);

    const p = new Core(media, {
      sourceFallback: true,
      plugins: [new FailingEngine(), new SucceedingEngine()],
    });

    // whenReady() is called before the microtask that triggers load.
    const ready = p.whenReady();

    await Promise.resolve(); // flush maybeAutoLoad → load() → fallback → second engine

    await expect(ready).resolves.toBeUndefined();
    expect(p.state.current).toBe('ready');
  });

  test('whenReady() rejects when all sources fail', async () => {
    const media = document.createElement('audio');
    media.appendChild(makeAudioSource(1));
    media.appendChild(makeAudioSource(2));
    document.body.appendChild(media);

    const p = new Core(media, {
      sourceFallback: true,
      plugins: [new FailingEngine()],
    });

    const ready = p.whenReady();
    await Promise.resolve();

    await expect(ready).rejects.toBeDefined();
    expect(p.state.current).toBe('error');
  });
});
