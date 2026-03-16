# @openplayer/core

> Core player engine, plugin system, event bus, and public API for [OpenPlayerJS](https://openplayerjs.com).

[![npm](https://img.shields.io/npm/v/@openplayerjs/core?color=blue&logo=npm&label=npm)](https://www.npmjs.com/package/@openplayerjs/core)
[![npm downloads](https://img.shields.io/npm/dm/@openplayerjs/core?logo=npm&label=downloads)](https://www.npmjs.com/package/@openplayerjs/core)
[![License](https://img.shields.io/npm/l/@openplayerjs/core)](../../LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![JSDelivr](https://data.jsdelivr.com/v1/package/npm/@openplayerjs/core/badge)](https://www.jsdelivr.com/package/npm/@openplayerjs/core)

## Installation

```bash
npm install @openplayer/core
```

### Constructor

```ts
new Core(media: HTMLMediaElement | string, config?: PlayerConfig)
```

| Parameter | Type                         | Description                                                                     |
| --------- | ---------------------------- | ------------------------------------------------------------------------------- |
| `media`   | `HTMLMediaElement \| string` | The `<video>` or `<audio>` element, or a CSS selector string that points to one |
| `config`  | `PlayerConfig`               | Optional configuration object ([see below](#configuration))                     |

---

## What's inside

| Export               | Purpose                                                                            |
| -------------------- | ---------------------------------------------------------------------------------- |
| `Core`               | Main core class — manages engines, plugins, state, and events                      |
| `PluginRegistry`     | Registers and coordinates `PlayerPlugin` instances                                 |
| `EventBus`           | Internal typed publish/subscribe system                                            |
| `BaseMediaEngine`    | Abstract base class for custom media engines                                       |
| `DefaultMediaEngine` | Built-in HTML5 `<video>`/`<audio>` engine (MP4, MP3, WebM, OGG, etc.)              |
| `getOverlayManager`  | Access the overlay priority queue (used by ad plugins and loaders)                 |
| `DisposableStore`    | Manages a collection of cleanup functions; cleared on `dispose()`                  |
| `StateManager`       | Simple typed state machine used to track playback state                            |
| `Lease`              | Cooperative lock for exclusive playback access (used by ads to pause content)      |
| `formatTime`         | Utility: formats a number of seconds as `mm:ss` or `hh:mm:ss`                      |
| `isAudio`            | Utility: returns `true` if a media element is `<audio>`                            |
| `isMobile`           | Utility: returns `true` when running on a mobile browser                           |
| `offset`             | Utility: returns the `{ top, left }` offset of an element relative to the document |

---

## Quick start

```ts
import { Core } from '@openplayer/core';

const video = document.querySelector<HTMLVideoElement>('#player')!;

const core = new Core(video, {
  startTime: 0,
  startVolume: 1,
  startPlaybackRate: 1,
  // Set to Infinity for live streams:
  // duration: Infinity,
});

core.on('playing', () => console.log('playback started'));
core.on('ended', () => console.log('media ended'));

await core.play();
```

---

## Configuration

Pass options as the second argument to `new Core(...)`:

| Option              | Type             | Default | Description                                                       |
| ------------------- | ---------------- | ------- | ----------------------------------------------------------------- |
| `plugins`           | `PlayerPlugin[]` | `[]`    | Plugins and engines to activate at startup                        |
| `startTime`         | `number`         | `0`     | Initial playback position in seconds                              |
| `startVolume`       | `number`         | `1`     | Initial volume from `0` to `1`                                    |
| `startPlaybackRate` | `number`         | `1`     | Initial playback speed (`1` = normal, `2` = double, `0.5` = half) |
| `duration`          | `number`         | `0`     | Override the detected duration. Use `Infinity` for live streams   |

---

## Public API

### Properties

| Property           | Type                  | Description                                                                    |
| ------------------ | --------------------- | ------------------------------------------------------------------------------ |
| `media`            | `HTMLMediaElement`    | The underlying `<video>` or `<audio>` element                                  |
| `config`           | `PlayerConfig`        | The resolved configuration for this instance                                   |
| `events`           | `EventBus`            | The internal event bus (use `core.on(...)` for most cases)                     |
| `state`            | `StateManager`        | Current playback state (`'idle'`, `'loading'`, `'playing'`, `'paused'`, etc.)  |
| `isLive`           | `boolean`             | `true` when `duration` is `Infinity` or the engine signals a live stream       |
| `src`              | `string \| undefined` | Get or set the active media URL                                                |
| `volume`           | `number`              | Current volume (`0`–`1`)                                                       |
| `muted`            | `boolean`             | Whether the player is currently muted                                          |
| `playbackRate`     | `number`              | Current playback speed multiplier                                              |
| `currentTime`      | `number`              | Current playback position in seconds                                           |
| `duration`         | `number`              | Total duration in seconds (`Infinity` for live streams)                        |
| `userInteracted`   | `boolean`             | `true` after the user's first gesture — useful for autoplay eligibility checks |
| `canAutoplay`      | `boolean`             | `true` if the browser allows autoplay with sound                               |
| `canAutoplayMuted` | `boolean`             | `true` if the browser allows autoplay when muted                               |

### Methods

| Method                     | Signature                              | Description                                                                                            |
| -------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `on`                       | `on(event, callback) => () => void`    | Subscribe to a player event. Returns an unsubscribe function                                           |
| `emit`                     | `emit(event, payload?)`                | Emit an event on the player bus (also calls `onEvent` on all non-engine plugins)                       |
| `play`                     | `async play() => Promise<void>`        | Start or resume playback. Resolves once the browser begins rendering frames                            |
| `pause`                    | `pause()`                              | Pause playback                                                                                         |
| `load`                     | `load()`                               | Re-read `<source>` tags, pick the right engine, and begin loading the media                            |
| `destroy`                  | `destroy()`                            | Remove all event listeners, destroy all plugins, and restore the original media element                |
| `registerPlugin`           | `registerPlugin(plugin)`               | Register a plugin or engine after the player was constructed                                           |
| `getPlugin`                | `getPlugin<T>(name) => T \| undefined` | Retrieve a registered plugin instance by its `name` property                                           |
| `addCaptions`              | `addCaptions(args)`                    | Append a `<track>` element to the media tag at runtime                                                 |
| `extend`                   | `extend(properties)`                   | Mix extra properties into the player instance (used internally by `extendControls`, `extendAds`, etc.) |
| `whenReady`                | `async whenReady() => Promise<void>`   | Resolves when the engine has parsed enough metadata to start playback                                  |
| `determineAutoplaySupport` | `async determineAutoplaySupport()`     | Probe the browser for autoplay capabilities and update `canAutoplay` / `canAutoplayMuted`              |

## Adding captions at runtime

Use `core.addCaptions(...)` from `@openplayer/core` to inject subtitle tracks after the player is already running (this is the preferred approach for single-page applications):

```ts
core.addCaptions({
  src: '/captions/en.vtt', // URL to the caption/subtitle file (.vtt, .srt). MUST BE IN THE SAME DOMAIN AS THE PLAYER'S
  srclang: 'en', // BCP-47 language code, e.g. 'en', 'es', 'ja'
  kind: 'subtitles', // 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata'
  label: 'English', // Human-readable label shown in the Settings menu
  default: true, // Set this track as the default/active track
});
```

> **Safari note:** Safari requires at least one `<track>` element in the markup (even an empty one) for the programmatic captions API to work. Add this placeholder to your HTML when all captions are loaded dynamically:
>
> ```html
> <track kind="subtitles" src="/captions/empty.vtt" />
> ```

OpenPlayerJS supports **WebVTT** (`.vtt`) and **SubRip** (`.srt`) files. WebVTT is recommended for full compatibility, especially in iOS fullscreen mode where the native player takes over.

---

## Events

Subscribe with `core.on(eventName, handler)`. The handler receives an optional payload whose type matches the event.

```ts
core.on('playing', () => console.log('▶ playing'));
core.on('timeupdate', () => console.log(core.currentTime));
core.on('error', (err) => console.error('media error', err));
```

| Event                  | Payload              | When it fires                                                      |
| ---------------------- | -------------------- | ------------------------------------------------------------------ |
| `loadstart`            | —                    | The browser begins loading the media source                        |
| `loadedmetadata`       | —                    | Duration and dimensions are known; safe to call `play()`           |
| `durationchange`       | —                    | The reported duration changes (common during HLS live streams)     |
| `play`                 | —                    | A play request was made (may fire before any frames are displayed) |
| `playing`              | —                    | The first frame is rendered; playback is actually running          |
| `pause`                | —                    | Playback was paused                                                |
| `timeupdate`           | —                    | The current time updated during playback                           |
| `seeking`              | —                    | The player is seeking to a new position                            |
| `seeked`               | —                    | Seeking completed                                                  |
| `waiting`              | —                    | Playback stalled while the buffer catches up                       |
| `ended`                | —                    | The media finished playing                                         |
| `volumechange`         | —                    | Volume or mute state changed                                       |
| `ratechange`           | —                    | Playback rate changed                                              |
| `error`                | `MediaError \| null` | A media error occurred                                             |
| `source:set`           | `string`             | A new source URL was set on the player                             |
| `player:interacted`    | —                    | The user interacted with the page for the first time               |
| `player:destroy`       | —                    | The player is about to be destroyed                                |
| `texttrack:add`        | `HTMLTrackElement`   | A new caption/subtitle track was appended                          |
| `texttrack:remove`     | `HTMLTrackElement`   | A caption/subtitle track was removed                               |
| `texttrack:listchange` | —                    | The list of available tracks changed                               |
| `overlay:changed`      | —                    | The overlay state changed (used by ads, loaders, etc.)             |

> **HTML5 command events** (`cmd:play`, `cmd:pause`, `cmd:seek`, etc.) are lower-level bus messages intended for engines and plugins. In most cases you should use the higher-level `play` / `pause` / `timeupdate` / `ended` events instead.

---

## Writing a plugin

A plugin is a class (or plain object) that implements `PlayerPlugin`. It receives a `PluginContext` in `setup()` and can subscribe to events, manipulate the media element, or register cleanup callbacks. Plugins have access to the player instance, the event bus, the media element, and a disposable store for automatic cleanup.

```ts
import type { PlayerPlugin, PluginContext } from '@openplayer/core';

export class AnalyticsPlugin implements PlayerPlugin {
  name = 'analytics';
  version = '1.0.0';

  setup({ player, events, on }: PluginContext) {
    // `on` is a shorthand for events.on(...) that cleans up automatically
    on('playing', () => {
      sendAnalyticsEvent('video_play', { currentTime: core.media.currentTime });
    });

    on('ended', () => {
      sendAnalyticsEvent('video_complete');
    });
  }
}

const core = new Core(video, {
  plugins: [new AnalyticsPlugin()],
});
```

### PluginContext properties

| Property  | Type                                     | Description                                                     |
| --------- | ---------------------------------------- | --------------------------------------------------------------- |
| `player`  | `Player`                                 | The player instance                                             |
| `media`   | `HTMLMediaElement`                       | The underlying `<video>` / `<audio>` element                    |
| `events`  | `EventBus`                               | The shared event bus                                            |
| `state`   | `StateManager`                           | Current playback state machine                                  |
| `leases`  | `Lease`                                  | Playback lease management (used by ads)                         |
| `dispose` | `DisposableStore`                        | Tracks cleanup functions; all entries run on `plugin.dispose()` |
| `add`     | `(fn) => void`                           | Register a teardown function in the disposable store            |
| `on`      | `(event, cb) => void`                    | Subscribe to an event and auto-unsubscribe on dispose           |
| `listen`  | `(target, type, handler, opts?) => void` | Add a DOM `addEventListener` that auto-removes on dispose       |

### Plugin lifecycle hooks

| Hook                      | When it runs                                                      |
| ------------------------- | ----------------------------------------------------------------- |
| `setup(ctx)`              | Called once when the plugin is registered, before any media loads |
| `onEvent(event, payload)` | Called after every event emitted on the player bus (optional)     |
| `dispose()`               | Called when the player is destroyed or the plugin is unregistered |

---

## Writing a custom media engine

A media engine is a plugin with `capabilities: ['media-engine']` that handles a specific media type. When `core.load()` is called, the player iterates over all registered engines and calls `canPlay(source)` on each. The engine with the highest `priority` that returns `true` wins.

Extend `BaseMediaEngine` and implement `IEngine` to handle a new media format or streaming protocol.

Engines are excluded from the `onEvent` broadcast loop.

### The surface model

Every engine operates through a **`MediaSurface`** — a normalized abstraction over the playback backend. The context object (`MediaEngineContext`) provides:

| Field                | Use                                                                                                                                                                                                                                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ctx.surface`        | The current playback surface — use this for all playback operations (seek, volume, play, pause, rate)                                                                                                                                                                                  |
| `ctx.setSurface(s)`  | Replace the default `HtmlMediaSurface` with your own (e.g. an `IframeMediaSurface`); returns the new surface                                                                                                                                                                           |
| `ctx.resetSurface()` | Restore the native `HtmlMediaSurface` (call this in `detach()` if you replaced it)                                                                                                                                                                                                     |
| `ctx.container`      | The DOM element inside which your engine should render visual output                                                                                                                                                                                                                   |
| `ctx.media`          | The underlying `<video>`/`<audio>` element — **only** use this for: attaching third-party adapters (`myLib.attachMedia(ctx.media)`), reading DOM attributes (`ctx.media.preload`, `ctx.media.autoplay`), and registering raw DOM listeners via `this.addMediaListener(ctx.media, ...)` |

### Native / MSE engine (wraps a `<video>` element)

For engines that extend native HTML5 playback (like HLS or DASH via MSE), use `bindMediaEvents` to bridge DOM events into the player bus, and `bindCommands` to register the standard playback commands:

```ts
import { BaseMediaEngine } from '@openplayer/core';
import type { IEngine, MediaEngineContext, MediaSource } from '@openplayer/core';

export class MyStreamEngine extends BaseMediaEngine implements IEngine {
  name = 'my-stream-engine';
  version = '1.0.0';
  capabilities: string[] = ['media-engine'];

  // Higher priority = preferred over lower-priority engines.
  // DefaultMediaEngine = 0, HlsMediaEngine = 50.
  priority = 20;

  private adapter: MyLib | null = null;

  canPlay(source: MediaSource): boolean {
    return source.src.endsWith('.mystream');
  }

  attach(ctx: MediaEngineContext): void {
    // Bridge native <video> events into the player event bus:
    this.bindMediaEvents(ctx.media, ctx.events);
    // Register standard cmd:play / cmd:pause / cmd:seek / cmd:setVolume etc.:
    this.bindCommands(ctx);

    // Attach your streaming library to the native element (ctx.media is correct here):
    this.adapter = new MyLib();
    this.adapter.attachMedia(ctx.media);
    this.adapter.loadSource(ctx.activeSource?.src ?? '');

    // Signal readiness once the manifest / metadata is available:
    this.adapter.on('manifestParsed', () => ctx.events.emit('loadedmetadata'));

    // Autoplay: use ctx.surface for playback operations, not ctx.media directly:
    if (ctx.media.autoplay) {
      ctx.surface.muted = true;
      void ctx.surface.play();
    }
  }

  detach(): void {
    this.unbindCommands();
    this.unbindMediaEvents();
    this.adapter?.destroy();
    this.adapter = null;
  }
}
```

### Iframe engine (YouTube, Vimeo, etc.)

For engines that embed a third-party player inside an iframe, use `IframeMediaSurface` to adapt the provider's API into the standard surface contract, then call `ctx.setSurface()` to register it:

```ts
import { BaseMediaEngine, IframeMediaSurface } from '@openplayer/core';
import type {
  IEngine,
  IframeMediaAdapter,
  IframeMediaAdapterEvents,
  IframePlaybackState,
  MediaEngineContext,
  MediaSource,
} from '@openplayer/core';

// 1. Implement the provider-specific adapter:
class MyProviderAdapter implements IframeMediaAdapter {
  on<E extends keyof IframeMediaAdapterEvents>(evt: E, cb: IframeMediaAdapterEvents[E]): void {
    /* … */
  }
  off<E extends keyof IframeMediaAdapterEvents>(evt: E, cb: IframeMediaAdapterEvents[E]): void {
    /* … */
  }
  mount(container: HTMLElement): void | Promise<void> {
    /* inject iframe here */
  }
  destroy(): void {
    /* remove iframe */
  }
  play(): void {
    /* … */
  }
  pause(): void {
    /* … */
  }
  seekTo(s: number): void {
    /* … */
  }
  setVolume(v: number): void {
    /* v is 0..1 */
  }
  getVolume(): number {
    return 1;
  }
  mute(): void {
    /* … */
  }
  unmute(): void {
    /* … */
  }
  isMuted(): boolean {
    return false;
  }
  setPlaybackRate(r: number): void {
    /* … */
  }
  getPlaybackRate(): number {
    return 1;
  }
  getCurrentTime(): number {
    return 0;
  }
  getDuration(): number {
    return NaN;
  }
}

// 2. Build the engine:
export class MyProviderEngine extends BaseMediaEngine implements IEngine {
  name = 'my-provider-engine';
  version = '1.0.0';
  capabilities: string[] = ['media-engine'];
  priority = 30;

  private iframeSurface: IframeMediaSurface | null = null;

  canPlay(source: MediaSource): boolean {
    // Check explicit MIME type first — allows bare IDs via <source type="x-video/myprovider">
    if (source.type === 'x-video/myprovider') return true;
    return source.src.includes('myprovider.com');
  }

  async attach(ctx: MediaEngineContext): Promise<void> {
    const adapter = new MyProviderAdapter(/* videoId */);
    const surface = new IframeMediaSurface(adapter);

    // Replace the native surface with the iframe surface:
    ctx.setSurface(surface);
    this.iframeSurface = surface;

    // Bridge surface events → player event bus, register playback commands:
    this.bindSurfaceEvents(surface, ctx.events);
    this.bindCommands(ctx);

    // Hide the native <video> element and mount the iframe in its place:
    ctx.media.style.display = 'none';
    await surface.mount(ctx.container);
  }

  detach(ctx: MediaEngineContext): void {
    this.unbindCommands();
    this.unbindSurfaceEvents();
    this.iframeSurface?.destroy();
    this.iframeSurface = null;
    ctx.media.style.display = '';
    ctx.resetSurface();
  }
}
```

> See `@openplayerjs/youtube` for a complete real-world example using this pattern.

### Declaring the source for an iframe engine

There are three ways to tell the player which video to load when using an iframe engine:

**1. `<source>` element with explicit type (recommended for markup-first workflows)**

The `type` attribute is the most reliable signal for `canPlay()`. It lets the engine claim a source even when the URL format is ambiguous (e.g. bare video IDs):

```html
<video id="my-video">
  <source src="https://www.myprovider.com/embed/VIDEO_ID" type="x-video/myprovider" />
</video>
<script>
  const player = new OpenPlayerJS('my-video');
  player.init();
</script>
```

**2. URL-only `<source>` (autodetection)**

If the URL is unambiguous (e.g. a well-known provider domain), the engine's URL check in `canPlay()` handles it without an explicit type:

```html
<video id="my-video">
  <source src="https://www.myprovider.com/embed/VIDEO_ID" />
</video>
```

**3. `player.src` or `core.src` (runtime / SPA)**

Set the source programmatically at any time after `init()`:

```ts
// ESM
core.src = 'https://www.myprovider.com/embed/VIDEO_ID';

// UMD
const player = new OpenPlayerJS('my-video', {
  plugins: [new MyProviderEngine()],
});
player.init();
player.src = 'https://www.myprovider.com/embed/VIDEO_ID';
```

> **Note on bare video IDs via `<source>`:** A browser resolves `<source src="VIDEO_ID">` to an absolute URL (`http://example.com/VIDEO_ID`). Your `extractVideoId()` helper should check the last path segment, or require users to pass an explicit `type` attribute when bare IDs are used.

---

## Code samples

A wide collection of ready-to-run examples — from engine setup and custom plugins to playback control and event handling — is available as a living cookbook in the CodePen collection below.

CodePen Collection: [https://codepen.io/collection/WQORze](https://codepen.io/collection/WQORze)

---

## License

MIT — see [LICENSE](../../LICENSE).
