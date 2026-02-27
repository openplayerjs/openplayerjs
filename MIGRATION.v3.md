# Migration Guide: OpenPlayerJS v2 → v3

> v3 is a full internal rebuild. The player's purpose and its HTML markup stay the same, but the architecture changed from one big "mega-player" to a small, composable core with optional packages layered on top.
>
> The good news: if you use the **UMD bundles** (the classic "load a script tag" approach), most of your code keeps working. The bigger changes apply to ESM / bundler users and to advanced customisations.

---

## Table of contents

- [Mental model shift](#mental-model-shift)
- [Package changes](#package-changes)
- [Configuration changes](#configuration-changes)
- [New features](#new-features)
- [Removed features](#removed-features)
- [Migration paths](#migration-paths)
  - [Path A — UMD / CDN users](#path-a--umd--cdn-users)
  - [Path B — ESM / bundler users](#path-b--esm--bundler-users)
- [Migration recipes](#migration-recipes)
- [Final checklist](#final-checklist)

---

## Mental model shift

### v2

- One monolithic `openplayerjs` package
- One large config object that covered everything (UI, engine, ads, live, levels, mode…)
- Ads and HLS were built into the core; you couldn't use one without the other

### v3

- `@openplayer/core` — player lifecycle, event bus, plugin system, state machine
- `@openplayer/ui` — visual layer (controls, overlays, keyboard handling)
- `@openplayer/hls` — HLS streaming via hls.js
- `@openplayer/ads` — VAST / VMAP ad breaks
- Everything is a **plugin**. Ads, HLS, and even the default UI are plugins registered on the core `Player`

**Rule of thumb:**
- UI behaviour → `@openplayer/ui`
- Playback / streaming → engine plugin (`@openplayer/hls`, or your own)
- Extra features → dedicated plugins (`@openplayer/ads`, or your own)

---

## Package changes

### v2

```bash
npm install openplayerjs
```

```ts
import OpenPlayerJS from 'openplayerjs';
```

### v3

Install only the packages you need:

```bash
# Core + UI (MP4, MP3, WebM, OGG)
npm install @openplayer/core @openplayer/ui

# Add HLS
npm install @openplayer/hls hls.js

# Add Ads
npm install @openplayer/ads
```

```ts
import { Player } from '@openplayer/core';
import { createUI, buildControls } from '@openplayer/ui';
import { HlsMediaEngine } from '@openplayer/hls';
import { AdsPlugin } from '@openplayer/ads';
```

> **The name `OpenPlayer` is no longer supported.** Only `OpenPlayerJS` is supported from v3 onwards (both in ESM as `Player` and in UMD as `OpenPlayerJS`). Remove any references to the old `OpenPlayer` alias.

---

## Configuration changes

### Options that still exist (same key, same behaviour)

| Option | Notes |
|--------|-------|
| `startTime` | Unchanged |
| `startVolume` | Unchanged |
| `duration` | Unchanged (`Infinity` for live streams) |
| `step` | Unchanged |
| `width` / `height` | Unchanged |
| `pauseOthers` | Available via UI package |

### New options in v3

| Option | Package | Description |
|--------|---------|-------------|
| `startPlaybackRate` | `@openplayer/core` | Sets the initial playback speed (default: `1`). Previously you had to set this after `init()` |
| `labels` | `@openplayer/core` | Override any built-in UI string: `loading`, `media`, `container`, and all other control labels |
| `plugins` | `@openplayer/core` | Pass an array of plugins (engines, UI, ads) to the constructor |

### Removed options

These options **no longer exist** in v3. The table below explains what to use instead:

| Removed option | Reason / alternative |
|----------------|----------------------|
| `mode` | Sizing mode (`responsive`, `fit`, `fill`) is now handled through CSS classes on the wrapper element |
| `detachMenus` | Menu layout is determined by the UI package internally |
| `forceNative` | Engine selection is automatic. `HlsMediaEngine` only activates on browsers without native HLS support |
| `hidePlayBtnTimer` | The centre overlay hide timing is managed by the UI package |
| `defaultLevel` | Quality levels are engine-specific. Use `HlsMediaEngine.getAdapter().currentLevel` |
| `allowSkip` | The skip button appears automatically based on the VAST `skipoffset` attribute |
| `allowRewind` | Removed with no direct replacement |
| `live.showProgress` | Progress bar visibility is now controlled via CSS |
| `live.showLive` | The live label is shown automatically when `duration: Infinity` is set |
| `live.showLabel` | Combined with `live.showLive` — use `duration: Infinity` |
| `ads` (top-level IMA config) | Ads are now a separate plugin: `new AdsPlugin({ breaks: [...] })` |
| `ads.src` | Use `breaks: [{ at: 'preroll', url: '...' }]` instead |
| `ads.autoPlayAdBreaks` | Removed. Breaks play automatically by schedule |
| `ads.debug` | Pass `debug: true` to `new AdsPlugin({ debug: true })` |
| `ads.enablePreloading` | Preloading is handled automatically based on `preload` attribute |
| `ads.language` | No direct equivalent; localise your own skip/click labels via CSS or DOM |
| `ads.loop` | Removed |
| `ads.numRedirects` | Removed (handled by the VAST client library internally) |
| `ads.sdkPath` | IMA SDK is no longer used in v3. Ads are powered by `@dailymotion/vast-client` |
| `ads.customClick` | Removed |
| `ads.sessionId` | Removed |
| `ads.vpaidMode` | Removed (IMA SDK removed) |
| `ads.publisherId` | Removed |
| `dash` | DASH support was removed |
| `flv` | FLV support was removed |
| `hls` (top-level key) | Pass hls.js options directly to `new HlsMediaEngine({ ... })` |
| `progress.showCurrentTimeOnly` | Omit the `duration` control from `buildControls` to achieve the same effect |
| `progress.duration` | Use the top-level `duration` config option |
| `showLoaderOnInit` | Loader is shown automatically by the overlay system |
| `onError` | Listen for the `'error'` event instead: `player.on('error', handler)` |
| `useDeviceVolume` | Removed |
| `media.pauseOnClick` | Click-to-pause is always active in the UI package |

---

## New features

### `startPlaybackRate`

Set the initial playback speed at construction time, without needing to set it after init:

```ts
new Player(media, { startPlaybackRate: 1.5 });
```

### Separate `currentTime` and `duration` controls

v3 introduces `currentTime` and `duration` as independent controls that can be placed in different positions. Previously only `time` existed (always combined):

```ts
buildControls({
  bottom: {
    left:  ['play', 'currentTime'],   // shows only the current position
    right: ['duration', 'fullscreen'], // shows only the total duration
  },
  main: ['progress'],
});
```

### Customisable loader / aria labels

The player loader, media element, and container now have accessible `aria-label` attributes that can be overridden:

```ts
new Player(media, {
  labels: {
    loading:   'Cargando…',       // loader spinner text
    media:     'Video de muestra', // aria-label on the <video> element
    container: 'Reproductor',      // aria-label on the outer wrapper
  },
});
```

### Strict UI extension timing (UMD)

In v3, `addElement` and `addControl` can only be called **after** the player has been fully initialized. In UMD this means after `player.init()`:

```js
// ✅ Correct
const player = new OpenPlayerJS('player');
player.init();
// init() is synchronous, so this is safe immediately after:
player.controls.addElement(badge, { v: 'top', h: 'right' });

// ❌ Wrong — the UI DOM does not exist yet
const player = new OpenPlayerJS('player');
player.controls.addElement(badge, { v: 'top', h: 'right' }); // throws
player.init();
```

### New plugin / engine model

The v2 plugin model had a number of rough edges. v3 introduces a clean `PlayerPlugin` interface with explicit lifecycle hooks:

```ts
import type { PlayerPlugin, PluginContext } from '@openplayer/core';

export class MyPlugin implements PlayerPlugin {
  name = 'my-plugin';
  version = '1.0.0';

  setup({ player, on, listen, add }: PluginContext) {
    // Subscribe to events — auto-cleaned up on destroy
    on('playing', () => console.log('playing'));

    // Attach DOM listeners — auto-cleaned up on destroy
    listen(document, 'keydown', (e) => console.log(e));

    // Register teardown callbacks
    add(() => console.log('plugin destroyed'));
  }
}
```

For custom media engines, extend `BaseMediaEngine` and implement `IEngine`:

```ts
import { BaseMediaEngine } from '@openplayer/core';
import type { IEngine, MediaEngineContext, MediaSource } from '@openplayer/core';

export class MyEngine extends BaseMediaEngine implements IEngine {
  name = 'my-engine';
  capabilities = ['media-engine'] as const;
  priority = 20; // DefaultMediaEngine = 0, HlsMediaEngine = 50

  canPlay(source: MediaSource): boolean {
    return source.src.endsWith('.myformat');
  }

  attach(ctx: MediaEngineContext): void {
    // Set up your library against ctx.media
  }

  detach(ctx: MediaEngineContext): void {
    // Clean up
  }
}
```

See [docs/customize.md](./docs/customize.md) for a full walkthrough.

---

## Removed features

### DASH (M(PEG)-DASH) removed

**What breaks:** Any source with a `.mpd` extension or `application/dash+xml` MIME type.

**Mitigation:** Stay on v2 for DASH-only apps, or implement a custom media engine plugin that wraps `dash.js`.

---

### FLV removed

**What breaks:** Any source with a `.flv` extension.

**Mitigation:** Stay on v2 for FLV-only legacy apps. FLV is not supported by most modern browsers natively.

---

### Core `levels` / quality API removed

**What breaks:** Any code that used `player.getMedia().levels`, `player.getMedia().level`, or the `levels` control in `controls.layers`.

**Mitigation:** Access quality levels through `HlsMediaEngine.getAdapter()`:

```ts
const hls = player.getPlugin<HlsMediaEngine>('hls')?.getAdapter();
if (hls) {
  const levels = hls.levels;           // available quality levels
  hls.currentLevel = 2;                // switch to a specific level
}
```

Then build your own quality picker control using `extendControls` + `addControl` from `@openplayer/ui`.

---

### IMA SDK (Google) removed

v2 used the Google IMA SDK for ads. v3 replaces it with `@dailymotion/vast-client` and `@dailymotion/vmap`, which are bundled inside `@openplayer/ads` and require no additional CDN load.

**What breaks:** Any IMA-specific config (`sdkPath`, `vpaidMode`, `publisherId`, `sessionId`, `customClick`, `language`).

**Mitigation:** Use `@openplayer/ads` with VAST / VMAP ad tags. The new plugin supports linear, non-linear, and companion ads.

---

### `addElement` and `addControl` API redesigned

The v2 `addElement` and `addControl` methods accepted a plain configuration object with optional HTML string properties (`content`, `icon`), which introduced XSS risks and made the API harder to use correctly.

In v3 these methods accept real DOM elements and typed `Control` objects that you create yourself.

```ts
// v2 — configuration object (no longer supported)
player.addElement({
  id: 'my-badge',
  type: 'div',
  content: '<strong>LIVE</strong>',  // XSS risk
  position: 'right',
});

// v3 — real DOM element
const badge = document.createElement('div');
badge.textContent = 'LIVE'; // no XSS risk
player.controls.addElement(badge, { v: 'top', h: 'right' });
```

---

## Migration paths

### Path A — UMD / CDN users

If your current code looks like this:

```html
<script src=".../openplayer.min.js"></script>
<script>
  const p = new OpenPlayerJS('player', options);
  p.init();
</script>
```

Then v3 keeps that workflow. The main differences are:

1. Update CDN URLs to the v3 bundles
2. Remove any removed options from the config object
3. Move ad configuration into the `ads.breaks` array format
4. Load the HLS and Ads bundles separately if you need them
5. Do not call `addElement` / `addControl` before `init()`

**Updated CDN template:**

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/openplayerjs/dist/openplayer.css" />

<video id="player" class="op-player__media" controls playsinline>
  <source src="/video.mp4" type="video/mp4" />
</video>

<script src="https://cdn.jsdelivr.net/npm/openplayerjs/dist/openplayer.umd.js"></script>
<!-- Optional add-ons: load before player.init() -->
<script src="https://cdn.jsdelivr.net/npm/openplayerjs/dist/openplayer-hls.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/openplayerjs/dist/openplayer-ads.umd.js"></script>

<script>
  const player = new OpenPlayerJS('player', {
    startTime: 0,
    startVolume: 1,
    startPlaybackRate: 1,
    duration: Infinity, // live stream
    ads: {
      breaks: [
        { at: 'preroll', url: 'https://example.com/vast.xml', once: true },
      ],
    },
  });

  player.init();
</script>
```

---

### Path B — ESM / bundler users

**v2:**

```ts
import OpenPlayerJS from 'openplayerjs';

const player = new OpenPlayerJS('player', {
  controls: {
    layers: {
      left: ['play', 'time', 'volume'],
      middle: ['progress'],
      right: ['captions', 'settings', 'fullscreen'],
    },
  },
  hls: { maxBufferLength: 60 },
  ads: {
    src: 'https://example.com/vast.xml',
  },
});
player.init();
```

**v3:**

```ts
import { Player } from '@openplayer/core';
import { createUI, buildControls } from '@openplayer/ui';
import { HlsMediaEngine } from '@openplayer/hls';
import { AdsPlugin } from '@openplayer/ads';
import '@openplayer/ui/style.css';

const media = document.querySelector<HTMLVideoElement>('#player')!;

const player = new Player(media, {
  plugins: [
    new HlsMediaEngine({ maxBufferLength: 60 }),
    new AdsPlugin({
      breaks: [
        { at: 'preroll', url: 'https://example.com/vast.xml', once: true },
      ],
    }),
  ],
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

## Migration recipes

### 1. Basic MP4 with UI

```ts
import { Player } from '@openplayer/core';
import { createUI, buildControls } from '@openplayer/ui';
import '@openplayer/ui/style.css';

const player = new Player(media, { plugins: [] });

createUI(player, media, buildControls({
  bottom: { left: ['play', 'time', 'volume'], right: ['captions', 'settings', 'fullscreen'] },
  main:   ['progress'],
}));
```

### 2. HLS live stream

```ts
import { HlsMediaEngine } from '@openplayer/hls';

const player = new Player(media, {
  plugins: [new HlsMediaEngine({ lowLatencyMode: true })],
  duration: Infinity,
});
```

### 3. Pre-roll + mid-roll + post-roll ads

```ts
import { AdsPlugin } from '@openplayer/ads';

new AdsPlugin({
  breaks: [
    { at: 'preroll',  url: 'https://example.com/pre.xml',  once: true },
    { at: 30,         url: 'https://example.com/mid.xml',  once: true },
    { at: 'postroll', url: 'https://example.com/post.xml', once: true },
  ],
});
```

### 4. Dynamic captions (SPA)

```ts
player.addCaptions({ src: '/en.vtt', srclang: 'en', label: 'English', default: true });
player.addCaptions({ src: '/es.vtt', srclang: 'es', label: 'Español' });
```

### 5. Watermark / custom badge

```ts
import { extendControls } from '@openplayer/ui';

extendControls(player); // call after createUI(...)

const badge = document.createElement('div');
badge.textContent = 'LIVE';
badge.className = 'my-live-badge';
player.controls.addElement(badge, { v: 'top', h: 'right' });
```

### 6. Skip-intro button

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

### 7. Change source at runtime

```ts
player.src = 'https://example.com/new-stream.m3u8';
player.load(); // re-detects the engine and begins loading
```

### 8. Error handling

```ts
// v2
const player = new OpenPlayerJS('player', {
  onError: (e) => console.error(e),
});

// v3
player.on('error', (err) => console.error('media error', err));
player.on('ads:error', ({ reason, error }) => console.warn('ad error:', reason, error));
```

---

## Final checklist

- [ ] Update CDN URLs or npm package names to v3
- [ ] Remove `OpenPlayer` alias — use `OpenPlayerJS` (UMD) or `Player` (ESM)
- [ ] Remove DASH / FLV sources (or implement a custom engine plugin)
- [ ] Remove any usage of `levels` / `level` from the core API
- [ ] Replace old `ads.*` config with `new AdsPlugin({ breaks: [...] })`
- [ ] Replace `onError` callback with `player.on('error', handler)`
- [ ] Remove removed options: `mode`, `detachMenus`, `forceNative`, `hidePlayBtnTimer`, `defaultLevel`, `allowSkip`, `allowRewind`, `live.showProgress`, `live.showLive`
- [ ] Set `duration: Infinity` for live streams
- [ ] If you use `addElement` / `addControl`: update to the new DOM-element API
- [ ] If you use captions dynamically: verify Safari placeholder `<track>` is present
- [ ] For ESM users: replace `player.init()` with `createUI(player, media, controls)`

---

## Legacy references

- Full changelog for v2 and earlier: [CHANGELOG.old.md](./CHANGELOG.old.md)
- Legacy v2 docs (for reference only): [docs/](./docs/)
