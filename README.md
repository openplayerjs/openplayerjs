# [OpenPlayer.js](https://openplayerjs.com)

![openplayerjs](https://user-images.githubusercontent.com/910829/46182430-d4c0f380-c299-11e8-89a8-c7554a70b66c.png)

[![npm](https://img.shields.io/npm/v/@openplayerjs/player?color=blue&logo=npm&label=npm)](https://www.npmjs.com/package/@openplayerjs/player)
[![jsDelivr hits](https://img.shields.io/jsdelivr/npm/hm/%40openplayerjs%2Fplayer?logo=jsdelivr&logoColor=white&label=CDN%20hits)](https://www.jsdelivr.com/package/npm/@openplayerjs/player)
[![License](https://img.shields.io/npm/l/@openplayerjs/player)](LICENSE)
[![Build](https://github.com/openplayerjs/openplayerjs/actions/workflows/build.yml/badge.svg)](https://github.com/openplayerjs/openplayerjs/actions/workflows/build.yml)
[![Lint](https://github.com/openplayerjs/openplayerjs/actions/workflows/linter.yml/badge.svg)](https://github.com/openplayerjs/openplayerjs/actions/workflows/linter.yml)
[![Coverage Status](https://coveralls.io/repos/github/openplayerjs/openplayerjs/badge.svg)](https://coveralls.io/github/openplayerjs/openplayerjs?branch=master)
[![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg?logo=renovate&logoColor=white)](https://renovateapp.com/)
[![Donate](https://img.shields.io/badge/Donate-PayPal-blue.svg?logo=paypal)](https://www.paypal.com/donate?business=rafa8626%40gmail.com&currency_code=USD)

# OpenPlayerJS — modular, plugin-first, easier to extend

This is a media player that uses all the goods of HTML5 video/audio elements to play the most popular media in MP4/MP3, HLS and also has the ability to play VMAP / VAST / non linear / companion ads

> **🎉🎉🎉 OpenPlayerJS v3 is finally here!! 🎉🎉🎉**
>
> `v3` is a radical internal rebuild that keeps most of the player familiar to use, but makes it **much easier to extend** (controls, plugins, engines) and **much easier to maintain**.
>
> ✅ If you use **UMD/CDN** today, you can keep the classic `new OpenPlayerJS('id', options); player.init();` flow with some minor changes — see [**UMD compatibility** section](#-umd-compatibility-the-v2-way-still-works) below.

---

## ✨ What’s new in v3

- 🧩 **Modular packages** (install only what you need)
- 🔌 **Plugin-first architecture** (UI, Ads, Engines are plugins)
- 🎛️ **Imperative UI extensions** (`addElement`, `addControl` via `extendControls`)
- 🧱 Cleaner separation of concerns (core vs UI vs engines/plugins)
- 🔥 Ads are **no longer using Google IMA SDK**: we have built our own with the support using Dailymotion's open source libraries. This was to support ads all around the world and avoid geoblocking

---

## ❌ Breaking Changes

- ❌ **M(PEG)-DASH / FLV support dropped** in favor of just supporting what browsers natively supports; if there is a need for them in the future, they can be added as separate bundles (like the [hls one](./packages/hls/README.md)).
- ❌ Core **quality/levels support dropped**: API (`levels`, `level`) — quality is now engine-specific, and will require to be built inside each one of them.
- ❌ Several v2 "mega-config" options (moved to the right package: UI vs engine vs plugin); this approach can work when using UMD files, depending on what plugins are enabled.

> To learn more about these changes, read **[MIGRATION.v3.md](./MIGRATION.v3.md)**

---

## 📦 Packages

| Package                         | Purpose                                                                                                                              | Docs                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| `@openplayerjs/core`            | Player lifecycle, plugin system, engines, events                                                                                     | [packages/core/README.md](./packages/core/README.md)       |
| `@openplayerjs/player`          | Default UI + built-in controls + UI extension APIs                                                                                   | [packages/player/README.md](./packages/player/README.md)   |
| `@openplayerjs/hls`             | HLS engine (powered by [`hls.js`](https://github.com/video-dev/hls.js))                                                              | [packages/hls/README.md](./packages/hls/README.md)         |
| `@openplayerjs/ads`             | VAST/VMAP/non-linear/companion ads plugin + extension APIs                                                                           | [packages/ads/README.md](./packages/ads/README.md)         |
| `@openplayerjs/youtube` _(new)_ | YouTube media engine plugin using [YouTube player API for iframe embeds](https://developers.google.com/youtube/iframe_api_reference) | [packages/youtube/README.md](./packages/youtube/README.md) |

---

## How to use it?

### Verify Cross-Origin Resource Sharing (CORS)

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

### HTML setup

All you need in your markup is a standard `<video>` or `<audio>` element with a `src` attached to it. Add the `controls` and `playsinline` attributes for cross-browser compatibility, and optionally include `<source>` and `<track>` children:

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
  </body>
</html>
```

> The `op-player__media` class applies the base player styles. The player's wrapper and controls are injected into the DOM automatically when `init()` is called.

#### Bandwidth optimization

To avoid downloading media before the user presses play, set `preload="none"` on the media element:

```html
<video id="player" class="op-player__media" controls playsinline preload="none">
  <source src="/video.mp4" type="video/mp4" />
</video>
```

> **Side effect:** With `preload="none"` the player cannot read the media's duration until playback starts. Provide the `duration` option if you want the UI to show the correct total time before the user presses play:
>
> ```ts
> new Core(media, { duration: 315 }); // 5 min 15 s or Infinity for live streamings
> ```

---

### JavaScript / TypeScript (ESM — recommended)

Install the packages you need:

```bash
# Core + UI (covers MP4, MP3, OGG, and any other natively-supported format)
npm install @openplayerjs/core @openplayerjs/player

# Add HLS support (powered by hls.js)
npm install @openplayerjs/hls hls.js

# Add ads support (VAST / VMAP)
npm install @openplayerjs/ads
```

Then wire everything up:

```ts
import { Core } from '@openplayerjs/core';
import { createUI, buildControls } from '@openplayerjs/player';
import '@openplayerjs/player/style.css';

const media = document.querySelector<HTMLVideoElement>('#player')!;

const player = new Core(media, {
  startTime: 0,
  startVolume: 1,
  startPlaybackRate: 1,
});

const controls = buildControls({
  controls: {
    top: ['progress'],
    'center-left': ['play', 'duration', 'volume'],
    'center-right': ['captions', 'fullscreen', 'settings'],
  },
});

createUI(player, media, controls);
```

---

### 🌍 UMD compatibility (the “v2 way” still works)

If you prefer loading scripts from a CDN without a build step:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/openplayerjs/dist/openplayer.css" />

<video id="player" class="op-player__media" controls playsinline>
  <source src="/path/to/video.mp4" type="video/mp4" />
</video>

<!-- Core + UI -->
<script src="https://cdn.jsdelivr.net/npm/openplayerjs/dist/openplayer.js"></script>
<!-- Optional: HLS support -->
<script src="https://cdn.jsdelivr.net/npm/openplayerjs/dist/openplayer-hls.js"></script>
<!-- Optional: Ads support -->
<script src="https://cdn.jsdelivr.net/npm/openplayerjs/dist/openplayer-ads.js"></script>

<script>
  const player = new OpenPlayerJS('player', {
    startTime: 0,
    startVolume: 1,
    controls: {
      top: ['progress'],
      'center-left': ['play', 'duration', 'volume'],
      'center-right': ['captions', 'fullscreen', 'settings'],
    },
  });

  player.init();
</script>
```

---

## 📚 Legacy docs & changelog

- Old changelog: **[CHANGELOG.old.md](./CHANGELOG.old.md)**
- Legacy docs folder (v2 style): **[docs](https://github.com/openplayerjs/openplayerjs/tree/v2.14.12/docs)**

---

## Built With

- [Typescript](https://www.typescriptlang.org/docs/home.html) - The Javascript for Pros.

## Authors

- **Rafael Miranda** - [rafa8626](https://github.com/rafa8626)

See also the list of [contributors](https://github.com/openplayerjs/openplayerjs/contributors) who participated in this project.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.
