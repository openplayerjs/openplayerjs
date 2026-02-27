# @openplayer/core

> Core player engine, plugin system, event bus, and public API for [OpenPlayerJS](https://github.com/openplayerjs/openplayerjs).

---

## Installation

```bash
npm install @openplayer/core
```

---

## What's inside

| Export | Purpose |
|--------|---------|
| `Player` | Main player class — manages engines, plugins, state, and events |
| `PluginRegistry` | Registers and coordinates `PlayerPlugin` instances |
| `EventBus` | Internal typed publish/subscribe system |
| `BaseMediaEngine` | Abstract base class for custom media engines |
| `DefaultMediaEngine` | Built-in HTML5 `<video>`/`<audio>` engine (MP4, MP3, WebM, OGG, etc.) |
| `getOverlayManager` | Access the overlay priority queue (used by ad plugins and loaders) |
| `DisposableStore` | Manages a collection of cleanup functions; cleared on `dispose()` |
| `StateManager` | Simple typed state machine used to track playback state |
| `Lease` | Cooperative lock for exclusive playback access (used by ads to pause content) |
| `formatTime` | Utility: formats a number of seconds as `mm:ss` or `hh:mm:ss` |
| `isAudio` | Utility: returns `true` if a media element is `<audio>` |
| `isMobile` | Utility: returns `true` when running on a mobile browser |
| `offset` | Utility: returns the `{ top, left }` offset of an element relative to the document |

---

## Quick start

```ts
import { Player } from '@openplayer/core';

const video = document.querySelector<HTMLVideoElement>('#player')!;

const player = new Player(video, {
  startTime: 0,
  startVolume: 1,
  startPlaybackRate: 1,
  // Set to Infinity for live streams:
  // duration: Infinity,
});

player.on('playing', () => console.log('playback started'));
player.on('ended',   () => console.log('media ended'));

await player.play();
```

---

## Configuration

Pass options as the second argument to `new Player(...)`:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `plugins` | `PlayerPlugin[]` | `[]` | Plugins and engines to activate at startup |
| `startTime` | `number` | `0` | Initial playback position in seconds |
| `startVolume` | `number` | `1` | Initial volume from `0` to `1` |
| `startPlaybackRate` | `number` | `1` | Initial playback speed (`1` = normal, `2` = double, `0.5` = half) |
| `step` | `number` | `0` | Seek distance in seconds for keyboard shortcuts. `0` means use the default (5 s) |
| `duration` | `number` | `0` | Override the detected duration. Use `Infinity` for live streams |
| `width` | `number \| string` | `0` | Force a specific player width |
| `height` | `number \| string` | `0` | Force a specific player height |
| `labels` | `Record<string, string>` | — | Override built-in UI label strings (see full list in [docs/api.md](../../docs/api.md#default-labels)) |
| `debug` | `boolean` | `false` | Enable verbose logging |

---

## Public API

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `media` | `HTMLMediaElement` | The underlying `<video>` or `<audio>` element |
| `config` | `PlayerConfig` | The resolved configuration for this instance |
| `events` | `EventBus` | The internal event bus (use `player.on(...)` for most cases) |
| `state` | `StateManager` | Current playback state (`'idle'`, `'loading'`, `'playing'`, `'paused'`, etc.) |
| `isLive` | `boolean` | `true` when `duration` is `Infinity` or the engine signals a live stream |
| `src` | `string \| undefined` | Get or set the active media URL |
| `volume` | `number` | Current volume (`0`–`1`) |
| `muted` | `boolean` | Whether the player is currently muted |
| `playbackRate` | `number` | Current playback speed multiplier |
| `currentTime` | `number` | Current playback position in seconds |
| `duration` | `number` | Total duration in seconds (`Infinity` for live streams) |
| `userInteracted` | `boolean` | `true` after the user's first gesture — useful for autoplay eligibility checks |
| `canAutoplay` | `boolean` | `true` if the browser allows autoplay with sound |
| `canAutoplayMuted` | `boolean` | `true` if the browser allows autoplay when muted |

### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `on` | `on(event, callback) => () => void` | Subscribe to a player event. Returns an unsubscribe function |
| `emit` | `emit(event, payload?)` | Emit an event on the player bus (also calls `onEvent` on all non-engine plugins) |
| `play` | `async play() => Promise<void>` | Start or resume playback. Resolves once the browser begins rendering frames |
| `pause` | `pause()` | Pause playback |
| `load` | `load()` | Re-read `<source>` tags, pick the right engine, and begin loading the media |
| `destroy` | `destroy()` | Remove all event listeners, destroy all plugins, and restore the original media element |
| `registerPlugin` | `registerPlugin(plugin)` | Register a plugin or engine after the player was constructed |
| `getPlugin` | `getPlugin<T>(name) => T \| undefined` | Retrieve a registered plugin instance by its `name` property |
| `addCaptions` | `addCaptions(args)` | Append a `<track>` element to the media tag at runtime |
| `extend` | `extend(properties)` | Mix extra properties into the player instance (used internally by `extendControls`, `extendAds`, etc.) |
| `whenReady` | `async whenReady() => Promise<void>` | Resolves when the engine has parsed enough metadata to start playback |
| `determineAutoplaySupport` | `async determineAutoplaySupport()` | Probe the browser for autoplay capabilities and update `canAutoplay` / `canAutoplayMuted` |

---

## Events

Subscribe with `player.on(eventName, handler)`. The handler receives an optional payload whose type matches the event.

```ts
player.on('playing',    () => console.log('▶ playing'));
player.on('timeupdate', () => console.log(player.currentTime));
player.on('error',      (err) => console.error('media error', err));
```

| Event | Payload | When it fires |
|-------|---------|---------------|
| `loadstart` | — | The browser begins loading the media source |
| `loadedmetadata` | — | Duration and dimensions are known |
| `durationchange` | — | The reported duration changed |
| `play` | — | A play request was made |
| `playing` | — | The first frame rendered; playback is active |
| `pause` | — | Playback was paused |
| `timeupdate` | — | Current time updated during playback |
| `seeking` | — | Seeking to a new position started |
| `seeked` | — | Seeking completed |
| `waiting` | — | Playback stalled (buffering) |
| `ended` | — | Media finished playing |
| `volumechange` | — | Volume or mute state changed |
| `ratechange` | — | Playback rate changed |
| `error` | `MediaError \| null` | A media error occurred |
| `source:set` | `string` | A new source URL was set on the player |
| `player:interacted` | — | The user's first gesture was detected |
| `player:destroy` | — | The player is about to be destroyed |
| `texttrack:add` | `HTMLTrackElement` | A caption/subtitle track was appended |
| `texttrack:remove` | `HTMLTrackElement` | A caption/subtitle track was removed |
| `texttrack:listchange` | — | The list of available tracks changed |
| `overlay:changed` | — | The overlay state changed (loader, ads, etc.) |

---

## Writing a plugin

A plugin is a class (or plain object) that implements `PlayerPlugin`. It receives a `PluginContext` in `setup()` and can subscribe to events, manipulate the media element, or register cleanup callbacks.

```ts
import type { PlayerPlugin, PluginContext } from '@openplayer/core';

export class AnalyticsPlugin implements PlayerPlugin {
  name = 'analytics';
  version = '1.0.0';

  setup({ player, on }: PluginContext) {
    // `on` auto-unsubscribes when the player is destroyed
    on('playing', () => track('video_play', { time: player.media.currentTime }));
    on('ended',   () => track('video_complete'));
  }
}

const player = new Player(video, {
  plugins: [new AnalyticsPlugin()],
});
```

### PluginContext

| Property | Type | Description |
|----------|------|-------------|
| `player` | `Player` | The player instance |
| `media` | `HTMLMediaElement` | The `<video>` or `<audio>` element |
| `events` | `EventBus` | The shared event bus |
| `state` | `StateManager` | Current playback state |
| `leases` | `Lease` | Cooperative playback lock (used by ads to pause content) |
| `dispose` | `DisposableStore` | Cleanup store; all entries run when the plugin is torn down |
| `add` | `(fn) => void` | Register a teardown function |
| `on` | `(event, cb) => void` | Subscribe to an event — auto-removed on teardown |
| `listen` | `(target, type, handler) => void` | Attach a DOM event listener — auto-removed on teardown |

### Plugin lifecycle hooks

| Hook | When it is called |
|------|------------------|
| `setup(ctx)` | Once, when the plugin is registered |
| `onEvent(event, payload)` | After every event emitted on the player bus (optional) |
| `dispose()` | When the player is destroyed or the plugin is unregistered |

---

## Writing a custom media engine

Extend `BaseMediaEngine` and implement `IEngine` to handle a new media format or streaming protocol.

```ts
import { BaseMediaEngine } from '@openplayer/core';
import type { IEngine, MediaEngineContext, MediaSource } from '@openplayer/core';

export class MyStreamEngine extends BaseMediaEngine implements IEngine {
  name = 'my-stream-engine';
  version = '1.0.0';
  capabilities = ['media-engine'] as const;

  // Higher priority = preferred over lower-priority engines.
  // DefaultMediaEngine = 0, HlsMediaEngine = 50.
  priority = 20;

  canPlay(source: MediaSource): boolean {
    return source.src.endsWith('.mystream');
  }

  attach(ctx: MediaEngineContext): void {
    // Wire up your streaming library to ctx.media.
    // Emit 'loadedmetadata' when ready so player.whenReady() resolves:
    // ctx.events.emit('loadedmetadata');
  }

  detach(ctx: MediaEngineContext): void {
    // Tear down your library.
  }
}
```

---

## Code samples

| Level | Description | Link |
|-------|-------------|------|
| 🟢 Beginner | Minimal player setup | https://codepen.io/rafa8626/pen/BqazxX |
| 🟢 Beginner | `preload="none"` (no controls) | https://codepen.io/rafa8626/pen/OJyMwxX |
| 🟡 Intermediate | Change source after init | https://codepen.io/rafa8626/pen/YzzgJrK |
| 🔴 Advanced | Basic playlist | https://codepen.io/rafa8626/pen/GRREQpX |
| 🔴 Advanced | Seamless transitions (custom control) | https://codepen.io/rafa8626/pen/oNXmEza |

---

## License

MIT — see [LICENSE](../../LICENSE).
