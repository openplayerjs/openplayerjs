# Usage

> **v3 note:** This document covers OpenPlayerJS **v3**. The v2 config object shape (DASH, FLV, IMA SDK, `mode`, `detachMenus`, etc.) is no longer supported. See [MIGRATION.v3.md](../MIGRATION.v3.md) for the full list of changes.

---

## HTML setup

All you need in your markup is a standard `<video>` or `<audio>` element. Add the `controls` and `playsinline` attributes for cross-browser compatibility, and optionally include `<source>` and `<track>` children:

```html
<html>
  <head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/openplayerjs/dist/openplayer.css" />
  </head>
  <body>
    <video id="player" class="op-player__media" controls playsinline>
      <source src="/path/to/video.mp4" type="video/mp4" />
      <track kind="subtitles" src="/path/to/video.vtt" srclang="en" label="English" />
    </video>

    <script src="https://cdn.jsdelivr.net/npm/openplayerjs/dist/openplayer.umd.js"></script>
    <script>
      const player = new OpenPlayerJS('player');
      player.init();
    </script>
  </body>
</html>
```

> The `op-player__media` class applies the base player styles. The player's wrapper and controls are injected into the DOM automatically when `init()` is called.

---

## JavaScript / TypeScript (ESM — recommended)

Install the packages you need:

```bash
# Core + UI (covers MP4, MP3, OGG, and any other natively-supported format)
npm install @openplayer/core @openplayer/ui

# Add HLS support (powered by hls.js)
npm install @openplayer/hls hls.js

# Add ads support (VAST / VMAP)
npm install @openplayer/ads
```

Then wire everything up:

```ts
import { Player } from '@openplayer/core';
import { createUI, buildControls } from '@openplayer/ui';
import '@openplayer/ui/style.css';

const media = document.querySelector<HTMLVideoElement>('#player')!;

const player = new Player(media, {
  startTime: 0,
  startVolume: 1,
  startPlaybackRate: 1,
});

const controls = buildControls({
  bottom: {
    left:  ['play', 'time', 'volume'],
    right: ['captions', 'settings', 'fullscreen'],
  },
  main: ['progress'],
});

createUI(player, media, controls);
```

---

## Configuration options

Pass these as properties of the second argument to `new Player(...)` (ESM) or `new OpenPlayerJS(id, ...)` (UMD):

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `startTime` | `number` | `0` | Start playback from this position (seconds) |
| `startVolume` | `number` | `1` | Initial volume level, from `0` (silent) to `1` (full) |
| `startPlaybackRate` | `number` | `1` | Initial playback speed. `1` is normal speed, `2` is double speed, `0.5` is half speed |
| `step` | `number` | `0` | How many seconds to seek when using arrow keys or the seek API. Defaults to 5 s when `0` |
| `duration` | `number` | `0` | Override the detected media duration. Set to `Infinity` for live streams |
| `width` | `number \| string` | `0` | Force a specific player width (`350`, `"100%"`, etc.) |
| `height` | `number \| string` | `0` | Force a specific player height |
| `plugins` | `PlayerPlugin[]` | `[]` | List of plugins to activate at startup |
| `labels` | `Record<string, string>` | — | Override any built-in UI label string. See the [API reference](api.md#default-labels) for the full list |
| `debug` | `boolean` | `false` | Enable verbose logging |

### Removed options (v2 → v3)

The following configuration options **no longer exist** in v3. See [MIGRATION.v3.md](../MIGRATION.v3.md) for alternatives:

| Removed option | Why it was removed |
|----------------|--------------------|
| `mode` | Sizing mode (`responsive` / `fit` / `fill`) is now handled through CSS classes |
| `detachMenus` | Menu layout is now determined by the UI package |
| `forceNative` | Native vs hls.js is now determined by the HLS engine's `canPlay()` logic |
| `hidePlayBtnTimer` | Centre overlay visibility is managed internally by the UI package |
| `defaultLevel` | Quality levels are engine-specific; use `HlsMediaEngine.getAdapter()` |
| `allowSkip` | The skip button is automatically shown based on VAST `skipoffset` |
| `allowRewind` | Removed — no direct replacement |
| `live.showProgress` | Progress bar is always shown; hide it via CSS if needed |
| `live.showLive` | The live label is controlled by the UI package |
| `ads` (as a top-level object with IMA options) | Ads are now a separate plugin: `new AdsPlugin(config)` |
| `dash` | DASH support was removed |
| `flv` | FLV support was removed |
| `hls` (top-level key) | Pass hls.js options directly to `new HlsMediaEngine({ ... })` |
| `progress.showCurrentTimeOnly` | Use `buildControls` to omit or include the `duration` control |
| `progress.duration` | Use the top-level `duration` config option instead |

---

## UMD / CDN usage

If you prefer loading scripts from a CDN without a build step:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/openplayerjs/dist/openplayer.css" />

<video id="player" class="op-player__media" controls playsinline>
  <source src="/path/to/video.mp4" type="video/mp4" />
</video>

<!-- Core + UI -->
<script src="https://cdn.jsdelivr.net/npm/openplayerjs/dist/openplayer.umd.js"></script>
<!-- Optional: HLS support -->
<script src="https://cdn.jsdelivr.net/npm/openplayerjs/dist/openplayer-hls.umd.js"></script>
<!-- Optional: Ads support -->
<script src="https://cdn.jsdelivr.net/npm/openplayerjs/dist/openplayer-ads.umd.js"></script>

<script>
  const player = new OpenPlayerJS('player', {
    startTime: 0,
    startVolume: 1,
    duration: Infinity, // Set for live streams
    ads: {
      breaks: [
        { at: 'preroll', url: 'https://example.com/vast.xml', once: true },
      ],
    },
  });

  player.init();
</script>
```

> When the HLS and Ads UMD bundles are loaded **before** `player.init()`, they self-register under `window.OpenPlayerPlugins` and are discovered automatically.

> **Important:** When using UMD, `addElement` and `addControl` can only be called **after** `player.init()` has been called. Calling them before initialization will throw an error, because the UI DOM does not exist yet.

---

## Live streams

Set `duration: Infinity` whenever you know the source is a live stream. This tells the player and UI to skip progress-bar seeking and show the live indicator correctly:

```ts
const player = new Player(media, {
  duration: Infinity,
  plugins: [new HlsMediaEngine()],
});
```

In UMD:

```js
const player = new OpenPlayerJS('player', { duration: Infinity });
player.init();
```

---

## Captions and subtitles

### Static captions (markup)

Add a `<track>` element inside your `<video>` tag before the player is initialized:

```html
<video id="player" class="op-player__media" controls playsinline>
  <source src="/video.mp4" type="video/mp4" />
  <track kind="subtitles" src="/captions/en.vtt" srclang="en" label="English" default />
  <track kind="subtitles" src="/captions/es.vtt" srclang="es" label="Español" />
</video>
```

### Dynamic captions (JavaScript)

Use `player.addCaptions(...)` to inject tracks at runtime — this is the preferred approach for single-page applications:

```ts
player.addCaptions({
  src: '/captions/en.vtt',
  srclang: 'en',
  kind: 'subtitles',
  label: 'English',
  default: true,
});

player.addCaptions({
  src: '/captions/ja.vtt',
  srclang: 'ja',
  kind: 'subtitles',
  label: '日本語',
});
```

> **Safari note:** Safari requires at least one `<track>` element in the markup (even an empty one) for the programmatic captions API to work. Add this placeholder to your HTML when all captions are loaded dynamically:
>
> ```html
> <track kind="subtitles" src="/captions/empty.vtt" />
> ```

OpenPlayerJS supports **WebVTT** (`.vtt`) and **SubRip** (`.srt`) files. WebVTT is recommended for full compatibility, especially in iOS fullscreen mode where the native player takes over.

---

## Bandwidth optimisation

To avoid downloading media before the user presses play, set `preload="none"` on the media element:

```html
<video id="player" class="op-player__media" controls playsinline preload="none">
  <source src="/video.mp4" type="video/mp4" />
</video>
```

> **Side effect:** With `preload="none"` the player cannot read the media's duration until playback starts. Provide the `duration` option if you want the UI to show the correct total time before the user presses play:
>
> ```ts
> new Player(media, { duration: 315 }); // 5 min 15 s
> ```

---

## HLS streaming

```ts
import { HlsMediaEngine } from '@openplayer/hls';

const player = new Player(media, {
  duration: Infinity, // if live
  plugins: [
    new HlsMediaEngine({
      // Any hls.js config option is accepted here
      maxBufferLength: 60,
      lowLatencyMode: true,
    }),
  ],
});
```

- On browsers that **do not** support HLS natively (Chrome, Firefox), `HlsMediaEngine` intercepts `.m3u8` sources and uses hls.js.
- On **Safari** (and iOS), HLS is supported natively, so `DefaultMediaEngine` handles it and hls.js is not loaded.

### Accessing hls.js APIs

```ts
const engine = player.getPlugin<HlsMediaEngine>('hls');
const hls = engine?.getAdapter(); // raw hls.js instance

hls?.on(Hls.Events.ERROR, (_event, data) => {
  if (data.fatal) console.error('Fatal HLS error', data);
});
```

---

## Ads (VAST / VMAP)

```ts
import { AdsPlugin } from '@openplayer/ads';

const player = new Player(media, {
  plugins: [
    new AdsPlugin({
      breaks: [
        { at: 'preroll',  url: 'https://example.com/preroll.xml',  once: true },
        { at: 60,         url: 'https://example.com/midroll.xml',  once: true },
        { at: 'postroll', url: 'https://example.com/postroll.xml', once: true },
      ],
    }),
  ],
});
```

See [packages/ads/README.md](../packages/ads/README.md) and [API reference — Ads events](api.md#ads-events) for the full configuration and event list.

---

## CORS

When ads, captions, or streaming manifests are loaded from a different domain, the server must allow cross-origin requests. The typical error message looks like:

```
Access to fetch at 'https://cdn.example.com/video.m3u8' from origin 'https://myapp.com'
has been blocked by CORS policy.
```

To fix this on your server, add the following response headers:

```
Access-Control-Allow-Origin: https://myapp.com
Access-Control-Allow-Credentials: true
```

Or, for public assets, allow all origins:

```
Access-Control-Allow-Origin: *
```

---

## React / Next.js

```tsx
import { useEffect, useRef } from 'react';
import { Player } from '@openplayer/core';
import { createUI, buildControls } from '@openplayer/ui';
import '@openplayer/ui/style.css';

export default function VideoPlayer() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const player = new Player(ref.current, { plugins: [] });
    const controls = buildControls({
      bottom: { left: ['play', 'volume'], right: ['fullscreen'] },
      main: ['progress'],
    });
    createUI(player, ref.current, controls);

    return () => player.destroy();
  }, []);

  return (
    <video
      ref={ref}
      className="op-player__media"
      controls
      playsInline
    >
      <source src="https://example.com/video.mp4" type="video/mp4" />
    </video>
  );
}
```

---

## Vue.js

```js
import { onMounted, onUnmounted, ref } from 'vue';
import { Player } from '@openplayer/core';
import { createUI, buildControls } from '@openplayer/ui';
import '@openplayer/ui/style.css';

export default {
  setup() {
    const videoRef = ref(null);
    let player;

    onMounted(() => {
      player = new Player(videoRef.value, { plugins: [] });
      const controls = buildControls({
        bottom: { left: ['play', 'volume'], right: ['fullscreen'] },
        main: ['progress'],
      });
      createUI(player, videoRef.value, controls);
    });

    onUnmounted(() => player?.destroy());

    return { videoRef };
  },
};
```

> **Vue 3 note:** Do **not** store the `Player` instance in a reactive variable (e.g. `ref(player)` or `reactive({ player })`). Vue's reactivity system wraps objects in a Proxy, which breaks methods like `play()`, `pause()`, and `destroy()`. Store it in a plain local variable or use `shallowRef`.

---

## Changing the source at runtime

To switch to a different video after the player is already running:

```ts
player.src = 'https://example.com/new-video.mp4';
player.load(); // re-detects the engine and begins loading the new source
```

For HLS sources, the `HlsMediaEngine` will detach from the old stream and attach to the new one automatically.
