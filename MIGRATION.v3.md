# Migration Guide: OpenPlayerJS v2 → v3

The `v3` of OpenPlayerJS is a full internal rebuild. The player's purpose and its HTML markup stay the same, but the architecture changed from one big "mega-player" to a small, composable core with optional packages layered on top.

The good news: if you use the **UMD bundles** (the classic "load a script tag" approach), most of your code keeps working. The bigger changes apply to ESM / bundler users and to advanced customisations.

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
- Ads, HLS and other supported format engines were built into the core; you couldn't use one without the other
- `init()` method had control even over media, making a "super" async method

### v3

- Separation of concerns in different packages:
  - `@openplayer/core` — contains only player lifecycle, event bus, plugin system, state machine
  - `@openplayer/player` — everything related to the visual layer (controls, overlays, keyboard handling, styles, UI behaviors)
  - `@openplayer/hls` — HLS streaming enhancements via [hls.js](https://github.com/video-dev/hls.js)
  - `@openplayer/ads` — VAST / VMAP / non-linear / companions ad breaks
- Everything is a **plugin**. Ads, HLS, and even the default UI are plugins registered on the core `Core`
- `init()` method (only in UMD file) is now a sync method that only sets the UI, and registers plugins and listeners for future use; media setup is delegated to `load` / `play` methods

---

## Package changes

### v2 (no modularity)

Install the whole library:

```bash
npm install openplayerjs
```

and use it:

```ts
import OpenPlayerJS from 'openplayerjs';
```

### v3 (available packages)

Install only the packages you need:

```bash
# Core + UI (MP4, MP3, WebM, OGG)
npm install @openplayer/core @openplayer/player

# Add HLS
npm install @openplayer/hls hls.js

# Add Ads
npm install @openplayer/ads
```

so you can import each one as desired:

```ts
import { Core } from '@openplayer/core';
import { createUI, buildControls } from '@openplayer/player';
import { HlsMediaEngine } from '@openplayer/hls';
import { AdsPlugin } from '@openplayer/ads';
```

**🚨 IMPORTANT 🚨: The name `OpenPlayer` is no longer supported.**

Only `OpenPlayerJS` is supported from v3 onwards (both in ESM as `Core` and in UMD as `OpenPlayerJS`). Remove any references to the old `OpenPlayerJS` alias.

---

## Configuration changes

### Options that still exist (same key, same behaviour)

| Option             | Notes                                   |
| ------------------ | --------------------------------------- |
| `startTime`        | Unchanged                               |
| `startVolume`      | Unchanged                               |
| `duration`         | Unchanged (`Infinity` for live streams) |
| `step`             | Unchanged                               |
| `allowSkip`        | Unchanged                               |
| `allowRewind`      | Unchanged                               |
| `width` / `height` | Unchanged                               |

### New options in v3

| Option                                                 | Package            | Description                                                                                   |
| ------------------------------------------------------ | ------------------ | --------------------------------------------------------------------------------------------- |
| `startPlaybackRate`                                    | `@openplayer/core` | Sets the initial playback speed (default: `1`). Previously you had to set this after `init()` |
| `labels.loading` / `labels.media` / `labels.container` | `@openplayer/core` | Added new labels on top of the ones already supported. Whole list of labels is [here]()       |
| `plugins`                                              | `@openplayer/core` | Pass an array of plugins (engines, UI, ads) to the constructor; see [here]() for more details |

### Removed options

These options **no longer exist** in v3. The table below explains what to use instead:

| Removed option                                     | Reason / alternative                                                                                                                                                                                                                              |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `labels.auto` / `labels.lang.en` / `labels.levels` | These labels belonged to `Levels`                                                                                                                                                                                                                 |
| `mode`                                             | Sizing mode (`responsive`, `fit`, `fill`) should be handled through CSS classes on the wrapper element entirely                                                                                                                                   |
| `detachMenus`                                      | Menu layout is determined by the UI package internally, and as a default, everything is set inside the `Settings` control to reduce code footprint                                                                                                |
| `forceNative`                                      | this option was used only for the hls code; now `HlsMediaEngine` only activates on browsers without native HLS support and if included as part of the code (read [here](./packages/hls/README.md) for more information)                           |
| `hidePlayBtnTimer`                                 | The centre overlay hide timing is managed by the UI package entirely, and by default will be `350ms`                                                                                                                                              |
| `defaultLevel`                                     | Quality levels are engine-specific. Use `HlsMediaEngine.getAdapter().currentLevel` if you use the Hls engine                                                                                                                                      |
| `live.showProgress`                                | Progress bar visibility is now controlled via CSS                                                                                                                                                                                                 |
| `live.showLive`                                    | The live label is shown automatically when `duration: Infinity` is set                                                                                                                                                                            |
| `live.showLabel`                                   | Combined with `live.showLive` — use `duration: Infinity`                                                                                                                                                                                          |
| `ads` (top-level IMA config)                       | Ads are now a separate plugin: `new AdsPlugin({ breaks: [...] })`. Using UMD accepts this element, but the contents of it is very different to the one supported in v2. Read [here](./packages/ads/README.md#configuration) for more information. |
| `ads.src`                                          | Use `breaks: [{ at: 'preroll', url: '...' }]` instead                                                                                                                                                                                             |
| `ads.autoPlayAdBreaks`                             | Removed. Breaks play automatically by schedule                                                                                                                                                                                                    |
| `ads.enablePreloading`                             | Preloading is handled automatically based on `preload` attribute                                                                                                                                                                                  |
| `ads.language`                                     | No direct equivalent; localise your own skip/click labels via CSS or DOM                                                                                                                                                                          |
| `ads.loop`                                         | Removed                                                                                                                                                                                                                                           |
| `ads.numRedirects`                                 | Removed (handled by the VAST client library internally)                                                                                                                                                                                           |
| `ads.sdkPath`                                      | IMA SDK is no longer used in v3. Ads are powered by `@dailymotion/vast-client`                                                                                                                                                                    |
| `ads.customClick`                                  | Removed                                                                                                                                                                                                                                           |
| `ads.sessionId`                                    | Removed                                                                                                                                                                                                                                           |
| `ads.vpaidMode`                                    | Removed (IMA SDK removed)                                                                                                                                                                                                                         |
| `ads.publisherId`                                  | Removed                                                                                                                                                                                                                                           |
| `dash`                                             | DASH support was removed                                                                                                                                                                                                                          |
| `flv`                                              | FLV support was removed                                                                                                                                                                                                                           |
| `pauseOthers`                                      | Since the changed the overall structure of the package for a more modular one, this will have to be built manually if you wish to support it. See the [snippet below]() to achieve this                                                           |
| `progress.showCurrentTimeOnly`                     | Omit the `duration` control and use `currentTime` control from `buildControls` to achieve the same effect                                                                                                                                         |
| `progress.duration`                                | Use the top-level `duration` config option                                                                                                                                                                                                        |
| `showLoaderOnInit`                                 | Loader is shown automatically by the overlay system                                                                                                                                                                                               |
| `onError`                                          | Listen for the `'error'` event instead: `player.on('error', handler)`                                                                                                                                                                             |
| `useDeviceVolume`                                  | Removed                                                                                                                                                                                                                                           |
| `media.pauseOnClick`                               | Click-to-pause is always active in the UI package                                                                                                                                                                                                 |

### Re-introduced options

These options were temporarily removed in early v3 betas but are fully supported again:

| Option                  | Status      | Notes                                                                                                                                                                                                                             |
| ----------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `controls.layers`       | Supported   | The `{ layers: { left, middle, right } }` shape is accepted by `buildControls` and `normalizeControlsConfig`. `left` maps to `bottom-left`, `middle` maps to `top`, and `right` maps to `bottom-right` — identical to v2 behaviour. |
| `controls.alwaysVisible` | Supported  | Pass `alwaysVisible: true` inside the controls config object (UMD) or as `{ alwaysVisible: true }` to `createUI` options (ESM). The controls bar stays permanently visible instead of fading out during playback.                 |

---

## New additions

### Separate `currentTime` and `duration` controls

v3 introduces `currentTime` and `duration` as independent controls that can be placed in different positions. Previously only `time` existed (always combined):

```ts
buildControls({
  bottom: {
    left: ['play', 'currentTime'], // shows only the current position
    right: ['duration', 'fullscreen'], // shows only the total duration
  },
  main: ['progress'],
});
```

### Strict UI extension timing (UMD)

In v3, `addElement` and `addControl` can only be called **after** the player has been fully initialized. In UMD this means after `player.init()`:

```js
// ✅ Correct
const player = new OpenPlayerJS('player');
await player.init();
player.addElement(badge, { v: 'top', h: 'right' });

// ❌ Wrong — the UI DOM does not exist yet
const player = new OpenPlayerJS('player');
player.addElement(badge, { v: 'top', h: 'right' }); // throws
player.init();
```

### New plugin / engine model

The `v2` plugin model had a number of rough edges. The new `v3` introduces a clean `CorePlugin` interface with explicit lifecycle hooks:

```ts
import type { CorePlugin, PluginContext } from '@openplayer/core';

export class MyPlugin implements CorePlugin {
  name = 'my-plugin';
  version = '1.0.0';

  setup({ core, on, listen, add }: PluginContext) {
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
  priority = 20; // always aim to have a priority higher than 0, to avoid conflicts with the default engine

  canPlay(source: MediaSource): boolean {
    return source.src.endsWith('.myformat') || source.type === 'x-format/zyx';
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

### M(PEG)-DASH removed

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
  const levels = hls.levels; // available quality levels
  hls.currentLevel = 2; // switch to a specific level
}
```

Then build your own quality picker control using `extendControls` + `addControl` from `@openplayer/player`.

---

### IMA SDK (Google) removed

`v2` used the Google IMA SDK for ads, but in some instances, added a lot of complexity and geoblocked the scripts in some countries. `v3` replaces it with `@dailymotion/vast-client` and `@dailymotion/vmap`, which are bundled inside `@openplayer/ads` and require no additional CDN load.

**What breaks:** Any IMA-specific config (`sdkPath`, `vpaidMode`, `publisherId`, `sessionId`, `customClick`, `language`).

**Mitigation:** Use `@openplayer/ads` with VAST / VMAP ad tags. The new plugin supports linear, non-linear, and companion ads.

---

### `addElement` and `addControl` API redesigned

The `v2` `addElement` and `addControl` methods accepted a plain configuration object with optional HTML string properties (`content`, `icon`), which introduced XSS risks and made the API harder to use correctly.

In v3 these methods accept real DOM elements and typed `Control` objects that you create yourself. It may require a little bit of more work, but all is meant to use best practices in terms of security.

```ts
// v2 — configuration object (no longer supported)
player.addElement({
  id: 'my-badge',
  type: 'div',
  content: '<strong>LIVE</strong>', // XSS risk
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

1. Update CDN URLs to the v3 bundles (they all have now a `.umd` element in them)
2. Remove any [removed options](#removed-options) from the config object
3. Load the HLS and Ads bundles separately if you need them
4. Do not call `addElement` / `addControl` / `addCaptions` / `play` / `pause` / `destroy` / `src` setter before `init()`

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
    hls: {
      // configuration
    },
    ads: {
      // configuration
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
import { Core } from '@openplayer/core';
import { createUI, buildControls } from '@openplayer/player';
import { HlsMediaEngine } from '@openplayer/hls';
import { AdsPlugin } from '@openplayer/ads';
import '@openplayer/player/style.css';

const media = document.querySelector<HTMLVideoElement>('#player')!;

const core = new Core(media, {
  plugins: [
    new HlsMediaEngine({
      // configuration
    }),
    new AdsPlugin({
      // configuration
    }),
  ],
});

// Flat format (v3 slot names)
const controls = buildControls({
  top: ['progress'],
  'bottom-left': ['play', 'time', 'volume'],
  'bottom-right': ['captions', 'settings', 'fullscreen'],
});

// Or use the v2 layers format — both are equivalent
// const controls = buildControls({
//   layers: {
//     left: ['play', 'time', 'volume'],
//     middle: ['progress'],
//     right: ['captions', 'settings', 'fullscreen'],
//   },
// });

createUI(core, media, controls);
```

---

## Migration Checklist

- [ ] Update CDN URLs or npm package names to v3
- [ ] Remove `OpenPlayer` alias — use `OpenPlayerJS` (UMD) or `Core` (ESM)
- [ ] Remove DASH / FLV sources (or implement a custom engine plugin)
- [ ] Remove any usage of `levels` / `level` from the core API
- [ ] Replace old `ads.*` config with `new AdsPlugin({ breaks: [...] })`
- [ ] Replace `onError` callback with `player.on('error', handler)`
- [ ] Remove removed options (from [this list](#removed-options))
- [ ] If you use `addElement` / `addControl`: update to the new DOM-element API
- [ ] If you use captions dynamically: verify Safari placeholder `<track>` is present
- [ ] For ESM users: replace `player.init()` with `createUI(player, media, controls)`

---

## Legacy references

- Full changelog for v2 and earlier: [CHANGELOG.old.md](./CHANGELOG.old.md)
- Legacy v2 docs (for reference only): [docs/](./docs/)
