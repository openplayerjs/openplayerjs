# @openplayer/ui

> UI layer, built-in controls, and accessibility utilities for [OpenPlayerJS](https://github.com/openplayerjs/openplayerjs).

## Installation

```bash
npm install @openplayer/ui @openplayer/core
```

## What's inside

| Export | Purpose |
|--------|---------|
| `createUI` | Mounts the player wrapper, center overlay, and controls grid into the DOM |
| `buildControls` | Resolves a control config object into `Control[]` instances |
| `registerControl` | Registers a custom control factory by ID |
| `extendControls` | Adds the `player.controls` imperative API to a `Player` instance |
| `create*Control` | Factory functions for each built-in control (play, volume, progress…) |

### Built-in controls

`createPlayControl` · `createVolumeControl` · `createProgressControl` ·
`createCurrentTimeControl` · `createDurationControl` · `createTimeControl` ·
`createCaptionsControl` · `createFullscreenControl` · `createSettingsControl`

## Stylesheet

The UI ships a standalone CSS file. Import it once per app:

```ts
// Bundler (Vite / webpack / esbuild)
import '@openplayer/ui/style.css';
```

```html
<!-- CDN / plain HTML -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/openplayerjs/dist/openplayer.css">
```

## Basic usage

```ts
import { Player } from '@openplayer/core';
import {
  createUI,
  buildControls,
  createPlayControl,
  createVolumeControl,
  createProgressControl,
} from '@openplayer/ui';
import '@openplayer/ui/style.css';

const video = document.querySelector('video')!;
const player = new Player(video, { plugins: [] });

const controls = buildControls({
  bottom: { left: ['play', 'volume'], right: ['fullscreen'] },
  main:   ['progress'],
});

createUI(player, video, controls);
```

## Writing a custom control

```ts
import type { Control, ControlPlacement } from '@openplayer/ui';
import type { Player } from '@openplayer/core';

function createMyControl(): Control {
  return {
    id: 'my-control',
    placement: { v: 'bottom', h: 'right' } satisfies ControlPlacement,
    create(player: Player): HTMLElement {
      const btn = document.createElement('button');
      btn.textContent = 'My Action';
      btn.addEventListener('click', () => player.pause());
      return btn;
    },
    destroy() {
      // optional cleanup
    },
  };
}
```

## License

MIT — see [LICENSE](../../LICENSE).
