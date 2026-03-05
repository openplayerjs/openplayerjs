# @openplayerjs/player

> UI layer, built-in controls, and extension APIs for [OpenPlayerJS](https://github.com/openplayerjs/openplayerjs)

---

This is the ESM equivalent to the v2 old `OpenPlayerJS` constructor

> **v3 note:** The v2 `addElement` / `addControl` API accepted a large configuration object passed to the player constructor. In v3 that API has been redesigned for two reasons:
>
> 1. **Security** — the old API accepted arbitrary HTML strings (`content`, `icon`) that could be used for XSS attacks. The new API works with real DOM elements that you create yourself.
> 2. **Clarity** — separating UI extensions from the player constructor makes it obvious what is "core player" and what is "visual customisation".
>
> See [MIGRATION.v3.md](../MIGRATION.v3.md) for a complete before/after comparison.

---

## Installation

```bash
npm install @openplayerjs/player @openplayerjs/core
```

## Quick start (ESM / bundlers)

```ts
import { Core } from '@openplayerjs/core';
import { createUI, buildControls } from '@openplayerjs/player';
import '@openplayerjs/player/openplayer.css';

const video = document.querySelector<HTMLVideoElement>('#player')!;
const core = new Core(video, { plugins: [] });

const controls = buildControls({
  top: ['progress'],
  'bottom-left': ['play', 'time', 'volume'],
  'bottom-right': ['captions', 'settings', 'fullscreen'],
});

createUI(core, video, controls);
```

---

## Configuration

`@openplayerjs/player` owns UI-specific configuration (labels, sizing, keyboard seek step, and progress-bar interaction flags), but it **augments** the `PlayerConfig` type from `@openplayerjs/core`.

That means you can pass both core and UI options to the `Player` constructor:

```ts
import { Player } from '@openplayerjs/core';
import { createUI } from '@openplayerjs/player';

const core = new Core(video, {
  // core
  startTime: 0,
  startVolume: 1,

  // player
  width: 640,
  height: 360,
  step: 5,
  allowSkip: true,
  allowRewind: false,
  labels: {
    play: 'Play',
    pause: 'Pause',
  },
});

createUI(core, video, controls);
```

### UI options

| Option        | Type                     | Default | Description                                                                      |
| ------------- | ------------------------ | ------- | -------------------------------------------------------------------------------- |
| `width`       | `number \| string`       | —       | Force a specific player width (applied to the wrapper)                           |
| `height`      | `number \| string`       | —       | Force a specific player height (applied to the wrapper)                          |
| `step`        | `number`                 | `0`     | Seek distance in seconds for keyboard shortcuts. `0` means use the default (5 s) |
| `allowSkip`   | `boolean`                | `true`  | Allow seeking forward via the progress bar                                       |
| `allowRewind` | `boolean`                | `true`  | Allow seeking backward via the progress bar                                      |
| `labels`      | `Record<string, string>` | —       | Override built-in UI label strings (e.g. `play`, `pause`, `fullscreen`, etc.)    |
| `controls`    | `ControlsConfig`         | see below | Layout of the built-in controls and auto-hide behaviour                        |

> For engine/plugins and initial playback state options like `plugins`, `startTime`, `startVolume`, `startPlaybackRate`, and `duration`, see `@openplayerjs/core`.

---

### Controls configuration

When using the `Player` class (UMD / script tag), a default controls layout is applied automatically when `controls` is not provided:

```js
controls: {
  top: ['progress'],
  'bottom-left': ['play', 'time', 'volume'],
  'bottom-right': ['captions', 'settings', 'fullscreen'],
}
```

You can fully override the layout using the **flat format** (same keys accepted by `buildControls`):

```js
const player = new Player('video', {
  controls: {
    top: ['progress'],
    'bottom-left': ['play', 'time', 'volume'],
    'bottom-right': ['captions', 'settings', 'fullscreen'],
  },
});
```

#### Legacy `layers` format

The previous `layers`-based configuration is also supported for backwards compatibility. The keys `left`, `middle`, and `right` map to `bottom-left`, `top`, and `bottom-right` respectively:

```js
const player = new Player('video', {
  controls: {
    layers: {
      left: ['play', 'time', 'volume'],
      middle: ['progress'],
      right: ['captions', 'settings', 'fullscreen'],
    },
  },
});
```

#### `alwaysVisible`

By default the control bar auto-hides after 3 seconds of inactivity during playback. Set `alwaysVisible: true` to keep the controls permanently visible:

```js
const player = new Player('video', {
  controls: {
    alwaysVisible: true,
    top: ['progress'],
    'bottom-left': ['play', 'time', 'volume'],
    'bottom-right': ['captions', 'settings', 'fullscreen'],
  },
});
```

`alwaysVisible` can be combined with both the flat format and the `layers` format.

---

## What's inside?

| Export                     | Purpose                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| `createUI`                 | Mounts the player wrapper, centre overlay, and control grid into the DOM                          |
| `buildControls`            | Resolves a layout config object into an array of `Control` instances                              |
| `registerControl`          | Registers a custom control factory globally, making it usable by string ID in `buildControls`     |
| `extendControls`           | Attaches the `player.controls` imperative API (`addElement`, `addControl`) to a `Player` instance |
| `createPlayControl`        | Factory for the built-in play/pause button                                                        |
| `createVolumeControl`      | Factory for the volume slider and mute/unmute button                                              |
| `createProgressControl`    | Factory for the seek bar with current-time tooltip                                                |
| `createCurrentTimeControl` | Factory for the current playback position display (e.g. `1:23`)                                   |
| `createDurationControl`    | Factory for the total duration display (e.g. `5:00`)                                              |
| `createTimeControl`        | Factory for the combined time display (e.g. `1:23 / 5:00`)                                        |
| `createCaptionsControl`    | Factory for the captions/subtitle toggle button                                                   |
| `createSettingsControl`    | Factory for the settings menu (speed, caption language)                                           |
| `createFullscreenControl`  | Factory for the fullscreen toggle                                                                 |
| `BaseControl`              | Base class you can extend to share common control lifecycle logic (**for dev purposes only**)     |

---

## Stylesheet

The UI ships a standalone CSS file. Import it once per application:

### Bundler (Vite / webpack / esbuild) — recommended

The package exposes a `./openplayer.css` export entry that resolves to `dist/openplayer.css` via the `exports` map in `package.json`. Use this path in any modern bundler:

```ts
import '@openplayerjs/player/openplayer.css';
```

If your bundler does not support package `exports` (older webpack 4, some legacy setups), reference the `dist/` path directly:

```ts
import '@openplayerjs/player/dist/openplayer.css';
```

### CSS `@import` (CodePen, CSS entry files)

In environments where you write CSS directly (a CodePen pen, a plain `.css` entry file, a `<style>` tag), use a regular CSS `@import` with the CDN URL:

```css
@import url('https://cdn.jsdelivr.net/npm/@openplayerjs/player@latest/dist/openplayer.css');
```

### `<link>` tag (CDN / plain HTML)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@openplayerjs/player@latest/dist/openplayer.css" />
```

> All player elements use the `op-` CSS prefix. You can override any variables or classes in your own stylesheet. No `!important` should be needed for most overrides.

---

## Built-in control IDs

Use these string IDs in `buildControls` to place the built-in controls:

| ID            | Description                                                                   |
| ------------- | ----------------------------------------------------------------------------- |
| `play`        | Play / Pause toggle button                                                    |
| `volume`      | Volume slider + Mute / Unmute button                                          |
| `progress`    | Seek bar with a current-time tooltip                                          |
| `time`        | Combined current time / duration display (e.g. `1:23 / 5:00`)                 |
| `currentTime` | Current playback position only (e.g. `1:23`)                                  |
| `duration`    | Total duration only (e.g. `5:00`)                                             |
| `captions`    | Caption / subtitle toggle button                                              |
| `settings`    | Settings menu (speed, caption language selection if `captions` are activated) |
| `fullscreen`  | Fullscreen toggle                                                             |

> **`time` vs separate `currentTime` + `duration`:** Use `'time'` for the classic combined display. Use `'currentTime'` and `'duration'` individually when you want to place them in different positions or style them independently.

The built-in keyboard handling is active whenever the player wrapper has focus. You can override the `step` config option to change seek distances.

| Key               | Action                                                             |
| ----------------- | ------------------------------------------------------------------ |
| `Space` / `Enter` | Play / Pause (when player has focus)                               |
| `K`               | Play / Pause                                                       |
| `M`               | Mute / Unmute                                                      |
| `F`               | Toggle fullscreen                                                  |
| `←` (Left arrow)  | Seek back 5 s (or the configured `step` value)                     |
| `→` (Right arrow) | Seek forward 5 s (or the configured `step` value)                  |
| `J`               | Seek back 10 s (or double the configured `step` value)             |
| `L`               | Seek forward 10 s (or double the configured `step` value)          |
| `↑` (Up arrow)    | Volume up                                                          |
| `↓` (Down arrow)  | Volume down                                                        |
| `Home`            | Seek to the beginning                                              |
| `End`             | Seek to the end of the media (no-op for live streams)              |
| `0`–`9`           | While the progress bar has focus: seek to 0%–90% of total duration |
| `,`               | While paused: step back one frame                                  |
| `.`               | While paused: step forward one frame                               |
| `<`               | Slow down playback rate by `0.25`                                  |
| `>`               | Speed up playback rate by `0.25`                                   |

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

---

## Control placement

`buildControls` accepts an object with position:

```ts
const controls = buildControls({
  'top-left': [],
  'top-middle': [], // this is the same as 'top'
  'top-right': [],
  'center-left': ['progress'], // full-width row
  'center-middle': [], // this is the same as 'center'
  'center-right': [], // full-width row
  'bottom-left': ['play', 'currentTime', 'volume'],
  'bottom-middle': [], // this is the same as 'bottom'
  'bottom-right': ['duration', 'captions', 'settings', 'fullscreen'],
});
```

Omitting a slot or leaving it as an empty array means nothing would be rendered there.

---

## Public API

### `createUI(player, media, controls)`

Mounts the player's DOM structure. Call this after creating your `Player` instance and building your controls:

```ts
createUI(player, video, controls);
```

After `createUI` runs, the original media element is wrapped inside `.op-player`, the center overlay and control grid are injected, and each control's `create(player)` factory is called to render the buttons.

### `buildControls(config?)`

Converts a controls configuration into an array of `Control` instances that `createUI` can render. Calling it with no argument (or an empty object) applies the default layout automatically.

`buildControls` accepts **three equivalent formats**:

**Default** — omit the argument entirely:

```ts
const controls = buildControls(); // progress on top, play/time/volume left, captions/settings/fullscreen right
```

**Flat format** — explicit slot keys (`top`, `bottom-left`, `bottom-right`, …):

```ts
const controls = buildControls({
  top:            ['progress'],
  'bottom-left':  ['play', 'time', 'volume'],
  'bottom-right': ['captions', 'settings', 'fullscreen'],
});
```

**Layers format** — semantic `left / middle / right` keys (maps to `bottom-left / top / bottom-right`):

```ts
const controls = buildControls({
  layers: {
    left:   ['play', 'time', 'volume'],
    middle: ['progress'],
    right:  ['captions', 'settings', 'fullscreen'],
  },
});
```

Non-array properties (e.g. `alwaysVisible`) are silently ignored by `buildControls` so you can pass the same config object to both `buildControls` and `createUI`:

```ts
import { buildControls, createUI } from '@openplayerjs/player';

const config = {
  layers: { left: ['play', 'volume'], middle: ['progress'], right: ['fullscreen'] },
  alwaysVisible: true,
};

createUI(core, video, buildControls(config), { alwaysVisible: config.alwaysVisible });
```

The slot key format is a vertical position (`top`, `center`/`middle`, `bottom`) optionally joined with a horizontal position (`left`, `center`, `right`) by a hyphen. Each slot maps to an array of built-in control IDs or IDs registered via `registerControl`.

Valid vertical slots: `top`, `center` (alias `middle`), `bottom`.
Valid horizontal slots: `left`, `center` (alias `middle`), `right`.
Omit the horizontal part to default to center (e.g. `'top'` = `'top-center'`).

> **ESM + manual placement:** If you build the controls array yourself (instead of using `buildControls`), pass each control's `placement` directly on the object:
>
> ```ts
> import { createPlayControl, createProgressControl, createFullscreenControl } from '@openplayerjs/player';
>
> const controls = [
>   createPlayControl({ v: 'bottom', h: 'left' }),
>   createProgressControl({ v: 'top', h: 'left' }),
>   createFullscreenControl({ v: 'bottom', h: 'right' }),
> ];
>
> createUI(core, video, controls);
> ```

### `registerControl(id, factory)`

Registers a custom control globally so it can be referenced by string ID in `buildControls`:

```ts
import { registerControl } from '@openplayerjs/player';

registerControl('my-button', () => ({
  id: 'my-button',
  placement: { v: 'bottom', h: 'right' },
  create(player) {
    const btn = document.createElement('button');
    btn.textContent = 'My Action';
    btn.onclick = () => player.pause();
    return btn;
  },
}));

// Now usable by ID:
buildControls({ bottom: { right: ['my-button', 'fullscreen'] }, main: ['progress'] });
```

### `extendControls(player)`

Adds the `.controls` imperative API to a player instance. Call this once, **after** `createUI`:

```ts
import { extendControls } from '@openplayerjs/player';

extendControls(player);

// player.controls is now available:
player.controls.addElement(element, { v: 'top', h: 'right' });
player.controls.addControl(myControl);
```

> **Important:** `extendControls` (and `addElement` / `addControl`) can only be called after the player has been fully initialized and `createUI` has run. Calling them before initialization will throw, because the UI DOM does not exist yet.

#### `player.controls.addElement(el, placement)`

Place any HTML element at a specific position in the player. Good for watermarks, brand logos, and overlays:

```ts
const badge = document.createElement('span');
badge.textContent = '● LIVE';
player.controls.addElement(badge, { v: 'top', h: 'right' });
```

| Argument    | Type                                             | Description                     |
| ----------- | ------------------------------------------------ | ------------------------------- |
| `el`        | `HTMLElement`                                    | The DOM element to insert       |
| `placement` | `{ v: 'top' \| 'bottom', h: 'left' \| 'right' }` | Where to place it in the player |

> **Security note:** Because you create the DOM element yourself with standard browser APIs, there is no risk of XSS. Never set `.innerHTML` from untrusted input on your custom elements.

#### `player.controls.addControl(control)`

Register and mount a typed `Control` object in the control bar. This is the right approach for interactive buttons (skip intro, next episode, quality picker, etc.):

```ts
import type { Control } from '@openplayerjs/player';

const skipIntro: Control = {
  id: 'skip-intro',
  placement: { v: 'bottom', h: 'right' },
  create(player) {
    const btn = document.createElement('button');
    btn.textContent = 'Skip Intro';
    btn.onclick = () => (player.media.currentTime = 90);
    return btn;
  },
};

player.controls.addControl(skipIntro);
```

---

## Adding a custom element

Use `addElement` to place any HTML element you create at a specific position in the player. This is the right approach for watermarks, brand logos, chapter markers, or anything that is not a button in the control bar. The element(s) will be created in the visible media area.

> **Recommendation:** As best practice, when adding a custom control, to make it compliant with the WCAG 2.2 standards, use the `setA11yLabel` method to properly set ARIA-\* elements

```ts
import { extendControls } from '@openplayerjs/player';

// Call this once, after createUI(...)
extendControls(player);

// Create your element however you like
const badge = document.createElement('div');
badge.className = 'my-live-badge';
setA11yLabel(badge, 'Status of streaming');
badge.textContent = '● LIVE';

// Place it in the top-right corner of the visible media area
player.controls.addElement(badge, { v: 'top', h: 'right' });
```

The `placement` argument:

| Key | Values                | Description                              |
| --- | --------------------- | ---------------------------------------- |
| `v` | `'top'` \| `'bottom'` | Vertical position relative to the player |
| `h` | `'left'` \| `'right'` | Horizontal position within that row      |

> **Security note:** Because you create the DOM element yourself with standard browser APIs (`document.createElement`, `element.textContent`, etc.), there is no risk of XSS. Never set `.innerHTML` or `.outerHTML` from untrusted input on your custom elements.

---

## Writing a custom control

> **Recommendation:** As best practice, when adding a custom control, to make it compliant with the WCAG 2.2 standards, use the `setA11yLabel` method to properly set ARIA-\* elements

A `Control` is a plain object (or class instance) with this shape:

```ts
import type { Control, ControlPlacement } from '@openplayerjs/player';
import type { Player } from '@openplayerjs/core';
import { setA11yLabel } from '@openplayerjs/player';

function createMyControl(): Control {
  return {
    id: 'my-control',
    placement: { v: 'bottom', h: 'right' } satisfies ControlPlacement,

    create(player: Player): HTMLElement {
      const btn = document.createElement('button');
      btn.className = 'op-control__my-control';
      setA11yLabel(btn, 'My action');
      btn.textContent = 'Do it';
      btn.addEventListener('click', () => player.pause());
      return btn;
    },

    destroy() {
      // Optional: clean up any timers or subscriptions you set up in create().
    },
  };
}
```

If you want to share a control across multiple player instances, package it as a factory function:

```ts
import type { Control, ControlPlacement } from '@openplayerjs/player';

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

The `Control` interface:

| Property    | Type                              | Required | Description                                                                      |
| ----------- | --------------------------------- | -------- | -------------------------------------------------------------------------------- |
| `id`        | `string`                          | Yes      | Unique identifier used for tracking and deduplication                            |
| `placement` | `ControlPlacement`                | Yes      | Where to place the control: `{ v: 'bottom' \| 'top', h: 'left' \| 'right' }`     |
| `create`    | `(player: Player) => HTMLElement` | Yes      | Returns the rendered DOM element. Receives the player instance for event binding |
| `destroy`   | `() => void`                      | No       | Called when the control is removed or the player is destroyed                    |

---

## Registering a control globally

Use `registerControl` to make a custom control available by string ID in `buildControls`. This is useful in plugin libraries or when you want to decouple the control definition from the layout configuration:

```ts
import { registerControl, buildControls } from '@openplayerjs/player';

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
  'top-left': ['progress'],
  'bottom-left': ['play', 'volume'],
  'bottom-right': ['next-episode', 'fullscreen'], // ← your custom control
});
```

---

## Code samples

A wide collection of ready-to-run examples — from basic setup to advanced controls customisation, plugins, and accessibility patterns — is available as a living cookbook in the CodePen collection below.

CodePen Collection: [https://codepen.io/collection/KwqaKQ](https://codepen.io/collection/KwqaKQ)

---

## License

MIT — see [LICENSE](../../LICENSE).
