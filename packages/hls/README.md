# @openplayer/hls

> HLS streaming engine for [OpenPlayerJS](https://openplayerjs.com), powered by [hls.js](https://github.com/video-dev/hls.js).

[![npm](https://img.shields.io/npm/v/@openplayerjs/hls?color=blue&logo=npm&label=npm)](https://www.npmjs.com/package/@openplayerjs/hls)
[![npm downloads](https://img.shields.io/npm/dm/@openplayerjs/hls?logo=npm&label=downloads)](https://www.npmjs.com/package/@openplayerjs/hls)
[![License](https://img.shields.io/npm/l/@openplayerjs/hls)](../../LICENSE.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![JSDelivr](https://data.jsdelivr.com/v1/package/npm/@openplayerjs/hls/badge)](https://www.jsdelivr.com/package/npm/@openplayerjs/hls)

## Installation

```bash
npm install @openplayer/hls @openplayer/core hls.js
```

---

## How it works

`HlsMediaEngine` implements the `IEngine` interface. When `player.load()` is called, the player asks each registered engine whether it `canPlay` the current source.

- **Chrome / Firefox** (and any browser without native HLS): `HlsMediaEngine` handles `.m3u8` sources using hls.js.
- **Safari / iOS**: HLS is natively supported, so `DefaultMediaEngine` (priority `0`) handles it and hls.js is never loaded.

`HlsMediaEngine` has a priority of `50`, which is higher than `DefaultMediaEngine` (`0`), so it wins on browsers that already have native support for HLS sources.

---

## ESM usage

```ts
import { Core } from '@openplayer/core';
import { HlsMediaEngine } from '@openplayer/hls';

const player = new Core(video, {
  plugins: [
    new HlsMediaEngine({
      // Any hls.js config option is accepted here
      // @see https://github.com/video-dev/hls.js/blob/master/docs/API.md#fine-tuning
      maxBufferLength: 60,
      lowLatencyMode: true,
    }),
  ],
  duration: Infinity, // set for live streams if preload="none" is set
});
```

---

## UMD / CDN usage

Load the bundles in order — core first, then the HLS add-on:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@openplayerjs/player@latest/dist/openplayer.css" />
<script src="https://cdn.jsdelivr.net/npm/@openplayerjs/player@latest/dist/openplayer.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@openplayerjs/hls@latest/dist/openplayer-hls.js"></script>
<script>
  const player = new OpenPlayerJS('player');
  player.init();
</script>
```

The HLS bundle self-registers as `window.OpenPlayerPlugins.hls`. The main UMD bundle discovers and activates it automatically on `init()`.

---

## hls.js configuration

Pass any [hls.js configuration option](https://github.com/video-dev/hls.js/blob/master/docs/API.md#fine-tuning) directly to the engine constructor:

```ts
new HlsMediaEngine({
  maxBufferLength: 60,
  enableWorker: true,
  startLevel: -1, // -1 = auto quality selection
});
```

---

## Surface model

`HlsMediaEngine` operates through the standard `MediaSurface` abstraction. All playback operations (play, pause, seek, volume, mute, playback rate) go through `ctx.surface` — never through `ctx.media` directly. `ctx.media` is used only for:

- Attaching hls.js to the element (`adapter.attachMedia(ctx.media)`)
- Reading DOM attributes (`ctx.media.preload`, `ctx.media.autoplay`)
- Registering raw DOM listeners via `addMediaListener(ctx.media, ...)`

This means `HlsMediaEngine` is compatible with the surface pipeline and can coexist correctly with other engine types (e.g. ad injection that swaps the surface temporarily).

---

## Public API

### `getAdapter()`

Returns the underlying hls.js instance when hls.js is active. Use this to access hls.js-specific APIs (quality levels, stats, P2P plugins, etc.):

```ts
import { HlsMediaEngine } from '@openplayer/hls';

const engine = player.getPlugin<HlsMediaEngine>('hls');
const hls = engine?.getAdapter();

hls?.on(Hls.Events.ERROR, (_event, data) => {
  if (data.fatal) {
    console.error('Fatal HLS error', data.type, data.details);
  }
});
```

---

## Listening to HLS events via the player

hls.js events are also forwarded through the player event bus, so you can listen without needing a direct reference to the hls.js instance:

```ts
import Hls from 'hls.js';

player.on(Hls.Events.MANIFEST_PARSED, () => {
  console.log('HLS manifest parsed');
});

player.on(Hls.Events.LEVEL_SWITCHED, (data) => {
  console.log('quality level switched to', data?.level);
});
```

> Use `player.on(...)` when you want HLS events to integrate cleanly with other plugins without importing `hls.js` directly.

---

## Quality / level switching

The core `levels` / `level` API was removed in v3. To build your own quality picker, access the `hls.js` instance directly:

```ts
import { HlsMediaEngine } from '@openplayer/hls';

const engine = player.getPlugin<HlsMediaEngine>('hls');
const hls = engine?.getAdapter();

if (hls) {
  // List available levels
  const levels = hls.levels; // array of HLS level objects

  // Switch to a specific level (0-based index, -1 = auto)
  hls.currentLevel = 2;
}
```

You can then use `extendControls` + `addControl` from `@openplayer/player` to build a custom quality selector button.

---

## Peer dependencies

| Package            | Required version |
| ------------------ | ---------------- |
| `@openplayer/core` | `>=3.0.0`        |
| `hls.js`           | `>=1.0.0`        |

---

## Code samples

A wide collection of ready-to-run examples — including adaptive bitrate streaming, live streams, and custom hls.js configuration — is available as a living cookbook in the CodePen collection below.

CodePen Collection: [https://codepen.io/collection/pjwRvL](https://codepen.io/collection/pjwRvL)

---

## License

MIT — see [LICENSE](../../LICENSE).
