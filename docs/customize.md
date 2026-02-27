# Customisation

> **v3 note:** The v2 `addElement` / `addControl` API accepted a large configuration object passed to the player constructor. In v3 that API has been redesigned for two reasons:
>
> 1. **Security** — the old API accepted arbitrary HTML strings (`content`, `icon`) that could be used for XSS attacks. The new API works with real DOM elements that you create yourself.
> 2. **Clarity** — separating UI extensions from the player constructor makes it obvious what is "core player" and what is "visual customisation".
>
> See [MIGRATION.v3.md](../MIGRATION.v3.md) for a complete before/after comparison.

---

## Table of contents

- [Player layout](#player-layout)
- [Built-in controls](#built-in-controls)
- [Adding a custom element (watermark, badge, overlay)](#adding-a-custom-element)
- [Adding a custom control (button in the control bar)](#adding-a-custom-control)
- [Writing a reusable control](#writing-a-reusable-control)
- [Registering a control globally](#registering-a-control-globally)
- [Writing a custom plugin](#writing-a-custom-plugin)
- [Writing a custom media engine](#writing-a-custom-media-engine)
- [CSS customisation](#css-customisation)

---

## Player layout

The v3 UI renders the following DOM structure inside the player wrapper:

```
.op-player                  ← outer wrapper (position: relative)
├── .op-player__media       ← your original <video> / <audio> element
├── .op-player__overlay     ← centre overlay (play icon, pause flash, loader)
└── .op-player__controls    ← control bar
    ├── [top row]           ← optional, only rendered when you add top controls
    ├── [main row]          ← holds the progress bar by default
    └── [bottom row]        ← holds play, volume, time, captions, fullscreen, etc.
        ├── [left slot]
        ├── [middle slot]
        └── [right slot]
```

Controls are placed into named slots using the `buildControls` configuration:

```ts
import { buildControls } from '@openplayer/ui';

const controls = buildControls({
  top: {
    left:   [],
    middle: [],
    right:  [],
  },
  main: ['progress'],   // the progress bar spans the full width
  bottom: {
    left:   ['play', 'time', 'volume'],
    right:  ['captions', 'settings', 'fullscreen'],
  },
});
```

The available slot names for `buildControls` are:
- `main` — full-width row (typically the progress bar)
- `bottom.left`, `bottom.middle`, `bottom.right`
- `top.left`, `top.middle`, `top.right`

---

## Built-in controls

The following control IDs can be used in `buildControls`:

| ID | Description |
|----|-------------|
| `play` | Play / Pause toggle button |
| `volume` | Volume slider and Mute / Unmute button |
| `progress` | Seek bar with current-time tooltip |
| `time` | Combined current time / duration display (e.g. `1:23 / 5:00`) |
| `currentTime` | Current playback position only (e.g. `1:23`) |
| `duration` | Total duration only (e.g. `5:00`) |
| `captions` | Caption / subtitle toggle button |
| `settings` | Settings menu (speed, captions language) |
| `fullscreen` | Fullscreen toggle |

> **`time` vs `currentTime` + `duration`:** Use `'time'` for the classic combined display. Use `'currentTime'` and `'duration'` separately if you want to place them in different positions or style them independently.

---

## Adding a custom element

Use `addElement` to place any HTML element you create at a specific position in the player. This is the right approach for watermarks, brand logos, chapter markers, or anything that is not a button in the control bar.

```ts
import { extendControls } from '@openplayer/ui';

// Call this once, after createUI(...)
extendControls(player);

// Create your element however you like
const badge = document.createElement('div');
badge.className = 'my-live-badge';
badge.textContent = '● LIVE';

// Place it in the top-right corner
player.controls.addElement(badge, { v: 'top', h: 'right' });
```

The `placement` argument:

| Key | Values | Description |
|-----|--------|-------------|
| `v` | `'top'` \| `'bottom'` | Vertical position relative to the player |
| `h` | `'left'` \| `'right'` | Horizontal position within that row |

> **Security note:** Because you create the DOM element yourself with standard browser APIs (`document.createElement`, `element.textContent`, etc.), there is no risk of XSS. Never set `.innerHTML` or `.outerHTML` from untrusted input on your custom elements.

> **Timing:** `addElement` must be called **after** `createUI(player, media, controls)`. The UI DOM must exist before you can attach elements to it.

---

## Adding a custom control

Use `addControl` to place a typed `Control` object into the control bar. This is the right approach for interactive buttons (skip intro, next episode, quality picker, etc.).

```ts
import { extendControls } from '@openplayer/ui';
import type { Control } from '@openplayer/ui';

extendControls(player);

const skipIntro: Control = {
  id: 'skip-intro',           // unique ID, used internally
  placement: { v: 'bottom', h: 'right' },
  create(player) {
    const btn = document.createElement('button');
    btn.className = 'op-control__skip-intro';
    btn.textContent = 'Skip Intro';
    btn.addEventListener('click', () => {
      player.media.currentTime = 90;
    });
    return btn;
  },
  destroy() {
    // Optional: clean up any timers or subscriptions here
  },
};

player.controls.addControl(skipIntro);
```

The `Control` interface:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier for this control |
| `placement` | `ControlPlacement` | Yes | Where in the control bar to place it: `{ v: 'bottom' \| 'top', h: 'left' \| 'right' }` |
| `create` | `(player: Player) => HTMLElement` | Yes | Factory function that returns the rendered DOM element |
| `destroy` | `() => void` | No | Called when the control is removed or the player is destroyed |

---

## Writing a reusable control

If you want to share a control across multiple player instances, package it as a factory function:

```ts
import type { Control, ControlPlacement } from '@openplayer/ui';

function createNextEpisodeControl(onNext: () => void): Control {
  return {
    id: 'next-episode',
    placement: { v: 'bottom', h: 'right' } satisfies ControlPlacement,
    create(player) {
      const btn = document.createElement('button');
      btn.className = 'op-control__next-episode';
      btn.setAttribute('aria-label', 'Next episode');
      btn.textContent = '⏭';
      btn.addEventListener('click', () => {
        player.pause();
        onNext();
      });
      return btn;
    },
  };
}

// Usage:
player.controls.addControl(createNextEpisodeControl(() => loadNextEpisode()));
```

---

## Registering a control globally

Use `registerControl` to make a custom control available by string ID in `buildControls`. This is useful in plugin libraries or when you want to decouple the control definition from the layout configuration:

```ts
import { registerControl, buildControls } from '@openplayer/ui';

registerControl('next-episode', () => ({
  id: 'next-episode',
  placement: { v: 'bottom', h: 'right' },
  create(player) {
    const btn = document.createElement('button');
    btn.textContent = '⏭';
    btn.onclick = () => console.log('next');
    return btn;
  },
}));

// Now you can reference it by ID, just like built-in controls:
const controls = buildControls({
  bottom: {
    left:  ['play', 'volume'],
    right: ['next-episode', 'fullscreen'], // ← your custom control
  },
  main: ['progress'],
});
```

---

## Writing a custom plugin

A plugin is a class (or plain object) that implements the `PlayerPlugin` interface. Plugins have access to the player instance, the event bus, the media element, and a disposable store for automatic cleanup.

```ts
import type { PlayerPlugin, PluginContext } from '@openplayer/core';

export class AnalyticsPlugin implements PlayerPlugin {
  name = 'analytics';
  version = '1.0.0';

  setup({ player, events, on }: PluginContext) {
    // `on` is a shorthand for events.on(...) that cleans up automatically
    on('playing', () => {
      sendAnalyticsEvent('video_play', { currentTime: player.media.currentTime });
    });

    on('ended', () => {
      sendAnalyticsEvent('video_complete');
    });
  }
}

// Register at construction time:
const player = new Player(media, {
  plugins: [new AnalyticsPlugin()],
});
```

### PluginContext properties

| Property | Type | Description |
|----------|------|-------------|
| `player` | `Player` | The player instance |
| `media` | `HTMLMediaElement` | The underlying `<video>` / `<audio>` element |
| `events` | `EventBus` | The shared event bus |
| `state` | `StateManager` | Current playback state machine |
| `leases` | `Lease` | Playback lease management (used by ads) |
| `dispose` | `DisposableStore` | Tracks cleanup functions; all entries run on `plugin.dispose()` |
| `add` | `(fn) => void` | Register a teardown function in the disposable store |
| `on` | `(event, cb) => void` | Subscribe to an event and auto-unsubscribe on dispose |
| `listen` | `(target, type, handler, opts?) => void` | Add a DOM `addEventListener` that auto-removes on dispose |

### Plugin lifecycle hooks

| Hook | When it runs |
|------|-------------|
| `setup(ctx)` | Called once when the plugin is registered, before any media loads |
| `onEvent(event, payload)` | Called after every event emitted on the player bus (optional) |
| `dispose()` | Called when the player is destroyed or the plugin is unregistered |

### Plugin capabilities

Set `capabilities: ['media-engine']` on your plugin to mark it as an engine. Engines are excluded from the `onEvent` broadcast loop:

```ts
export class MyEngine extends BaseMediaEngine implements IEngine {
  name = 'my-engine';
  capabilities = ['media-engine'] as const;
  priority = 10; // higher priority wins over DefaultMediaEngine (priority 0)

  canPlay(source: MediaSource): boolean {
    return source.type === 'video/x-my-format';
  }

  attach(ctx: MediaEngineContext): void {
    // Bind your engine to ctx.media here
  }

  detach(ctx: MediaEngineContext): void {
    // Clean up your engine
  }
}
```

---

## Writing a custom media engine

A media engine is a plugin with `capabilities: ['media-engine']` that handles a specific media type. When `player.load()` is called, the player iterates over all registered engines and calls `canPlay(source)` on each. The engine with the highest `priority` that returns `true` wins.

```ts
import { BaseMediaEngine, EVENT_OPTIONS } from '@openplayer/core';
import type { IEngine, MediaEngineContext, MediaSource } from '@openplayer/core';

export class MyStreamEngine extends BaseMediaEngine implements IEngine {
  name = 'my-stream-engine';
  version = '1.0.0';
  capabilities = ['media-engine'] as const;
  priority = 20; // higher than DefaultMediaEngine (0) and HlsMediaEngine (50 default)

  canPlay(source: MediaSource): boolean {
    // Return true when this engine should handle the given source
    return source.src.includes('my-stream-server.com');
  }

  attach(ctx: MediaEngineContext): void {
    const { media } = ctx;

    // Set up your streaming library against the media element
    // Example: myLib.attach(media);

    // Emit 'loadedmetadata' when the engine is ready so player.whenReady() resolves
    // ctx.events.emit('loadedmetadata');
  }

  detach(ctx: MediaEngineContext): void {
    // Tear down your library
    // Example: myLib.detach();
  }
}
```

> **Priority guide:** `DefaultMediaEngine` has priority `0`. `HlsMediaEngine` has priority `50`. Set your engine's `priority` higher than both if you want it to take precedence, or lower if you only want it as a fallback.

---

## CSS customisation

All player elements use the `op-` CSS prefix. Key classes:

| Class | Element |
|-------|---------|
| `.op-player` | Outer wrapper |
| `.op-player__media` | The `<video>` / `<audio>` element |
| `.op-player__overlay` | Centre overlay area |
| `.op-player__controls` | Control bar container |
| `.op-control` | Any single control element |
| `.op-control__play` | Play button |
| `.op-control__volume` | Volume control |
| `.op-control__progress` | Progress / seek bar |
| `.op-control__time` | Combined time display |
| `.op-control__currentTime` | Current time only |
| `.op-control__duration` | Duration only |
| `.op-control__captions` | Captions toggle |
| `.op-control__settings` | Settings button |
| `.op-control__fullscreen` | Fullscreen button |
| `.op-ads__nonlinear` | Non-linear ad container |

Import the base stylesheet once per app:

```ts
// Bundler
import '@openplayer/ui/style.css';
```

```html
<!-- CDN -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/openplayerjs/dist/openplayer.css" />
```

Then override any variables or classes in your own stylesheet. No `!important` should be needed for most overrides.
