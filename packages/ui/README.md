# @openplayer/ui

> UI layer, built-in controls, and extension APIs for [OpenPlayerJS](https://github.com/openplayerjs/openplayerjs).

---

## Installation

```bash
npm install @openplayer/ui @openplayer/core
```

---

## What's inside

| Export | Purpose |
|--------|---------|
| `createUI` | Mounts the player wrapper, centre overlay, and control grid into the DOM |
| `buildControls` | Resolves a layout config object into an array of `Control` instances |
| `registerControl` | Registers a custom control factory globally, making it usable by string ID in `buildControls` |
| `extendControls` | Attaches the `player.controls` imperative API (`addElement`, `addControl`) to a `Player` instance |
| `createPlayControl` | Factory for the built-in play/pause button |
| `createVolumeControl` | Factory for the volume slider and mute/unmute button |
| `createProgressControl` | Factory for the seek bar with current-time tooltip |
| `createCurrentTimeControl` | Factory for the current playback position display (e.g. `1:23`) |
| `createDurationControl` | Factory for the total duration display (e.g. `5:00`) |
| `createTimeControl` | Factory for the combined time display (e.g. `1:23 / 5:00`) |
| `createCaptionsControl` | Factory for the captions/subtitle toggle button |
| `createSettingsControl` | Factory for the settings menu (speed, caption language) |
| `createFullscreenControl` | Factory for the fullscreen toggle |
| `BaseControl` | Base class you can extend to share common control lifecycle logic |

---

## Stylesheet

The UI ships a standalone CSS file. Import it once per application:

```ts
// Bundler (Vite / webpack / esbuild)
import '@openplayer/ui/style.css';
```

```html
<!-- CDN / plain HTML -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/openplayerjs/dist/openplayer.css">
```

---

## Quick start

```ts
import { Player } from '@openplayer/core';
import { createUI, buildControls } from '@openplayer/ui';
import '@openplayer/ui/style.css';

const video = document.querySelector<HTMLVideoElement>('#player')!;
const player = new Player(video, { plugins: [] });

const controls = buildControls({
  bottom: {
    left:  ['play', 'time', 'volume'],
    right: ['captions', 'settings', 'fullscreen'],
  },
  main: ['progress'],
});

createUI(player, video, controls);
```

---

## Built-in control IDs

Use these string IDs in `buildControls` to place the built-in controls:

| ID | Description |
|----|-------------|
| `play` | Play / Pause toggle button |
| `volume` | Volume slider + Mute / Unmute button |
| `progress` | Seek bar with a current-time tooltip |
| `time` | Combined current time / duration display (e.g. `1:23 / 5:00`) |
| `currentTime` | Current playback position only (e.g. `1:23`) |
| `duration` | Total duration only (e.g. `5:00`) |
| `captions` | Caption / subtitle toggle button |
| `settings` | Settings menu (speed, caption language selection) |
| `fullscreen` | Fullscreen toggle |

> **`time` vs separate `currentTime` + `duration`:** Use `'time'` for the classic combined display. Use `'currentTime'` and `'duration'` individually when you want to place them in different positions or style them independently.

---

## Control placement

`buildControls` accepts a layout object:

```ts
const controls = buildControls({
  top: {
    left:   [],
    middle: [],
    right:  [],
  },
  main: ['progress'], // full-width row
  bottom: {
    left:   ['play', 'currentTime', 'volume'],
    middle: [],
    right:  ['duration', 'captions', 'settings', 'fullscreen'],
  },
});
```

Omitting a slot or leaving it as an empty array means nothing is rendered there.

---

## Public API

### `createUI(player, media, controls)`

Mounts the player's DOM structure. Call this after creating your `Player` instance and building your controls:

```ts
createUI(player, video, controls);
```

After `createUI` runs, the original media element is wrapped inside `.op-player`, the centre overlay and control grid are injected, and each control's `create(player)` factory is called to render the buttons.

### `buildControls(layout)`

Converts a layout config object into an array of `Control` instances that `createUI` can render.

### `registerControl(id, factory)`

Registers a custom control globally so it can be referenced by string ID in `buildControls`:

```ts
import { registerControl } from '@openplayer/ui';

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
import { extendControls } from '@openplayer/ui';

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

| Argument | Type | Description |
|----------|------|-------------|
| `el` | `HTMLElement` | The DOM element to insert |
| `placement` | `{ v: 'top' \| 'bottom', h: 'left' \| 'right' }` | Where to place it in the player |

> **Security note:** Because you create the DOM element yourself with standard browser APIs, there is no risk of XSS. Never set `.innerHTML` from untrusted input on your custom elements.

#### `player.controls.addControl(control)`

Register and mount a typed `Control` object in the control bar. Good for interactive buttons (skip intro, next episode, quality picker):

```ts
import type { Control } from '@openplayer/ui';

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

## Writing a custom control

A `Control` is a plain object (or class instance) with this shape:

```ts
import type { Control, ControlPlacement } from '@openplayer/ui';
import type { Player } from '@openplayer/core';

function createMyControl(): Control {
  return {
    id: 'my-control',
    placement: { v: 'bottom', h: 'right' } satisfies ControlPlacement,

    create(player: Player): HTMLElement {
      const btn = document.createElement('button');
      btn.className = 'op-control__my-control';
      btn.setAttribute('aria-label', 'My action');
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

The `Control` interface:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier used for tracking and deduplication |
| `placement` | `ControlPlacement` | Yes | Where to place the control: `{ v: 'bottom' \| 'top', h: 'left' \| 'right' }` |
| `create` | `(player: Player) => HTMLElement` | Yes | Returns the rendered DOM element. Receives the player instance for event binding |
| `destroy` | `() => void` | No | Called when the control is removed or the player is destroyed |

---

## Adding captions at runtime

Use `player.addCaptions(...)` from `@openplayer/core` to inject subtitle tracks after the player is already running:

```ts
player.addCaptions({
  src: '/captions/en.vtt',
  srclang: 'en',
  kind: 'subtitles',
  label: 'English',
  default: true,
});
```

> **Safari note:** Safari requires at least one `<track>` element in the HTML markup before the programmatic captions API will work. Add an empty placeholder track to your markup when all captions are loaded dynamically.

---

## Code samples

| Level | Description | Link |
|-------|-------------|------|
| 🟢 Beginner | `fill` mode (CSS) | https://codepen.io/rafa8626/pen/xxZXQoO |
| 🟢 Beginner | `fit` mode (CSS) | https://codepen.io/rafa8626/pen/abmboKV |
| 🟢 Beginner | `preload="none"` (no controls) | https://codepen.io/rafa8626/pen/OJyMwxX |
| 🟡 Intermediate | Custom element (watermark) | https://codepen.io/rafa8626/pen/JjLQNjo |
| 🔴 Advanced | Fully customised audio player | https://codepen.io/rafa8626/pen/ExPLVRE |
| 🔴 Advanced | Seamless transitions (custom control) | https://codepen.io/rafa8626/pen/oNXmEza |

---

## License

MIT — see [LICENSE](../../LICENSE).
