# [OpenPlayer.js](https://www.openplayerjs.com)

![openplayerjs](https://user-images.githubusercontent.com/910829/46182430-d4c0f380-c299-11e8-89a8-c7554a70b66c.png)

[![Coverage Status](https://coveralls.io/repos/github/openplayerjs/openplayerjs/badge.svg)](https://coveralls.io/github/openplayerjs/openplayerjs?branch=master)
[![JSDelivr](https://data.jsdelivr.com/v1/package/npm/openplayerjs/badge)](https://www.jsdelivr.com/package/npm/openplayerjs)

# 🎬 OpenPlayerJS — modular, plugin-first, easier to extend

This is a media player that uses all the goods of HTML5 video/audio elements to play the most popular media in MP4/MP3, HLS and also has the ability to play VMAP / VAST / non linear / companion ads

> **🎉🎉🎉 OpenPlayerJS v3 is finally here!! 🎉🎉🎉**
>
> `v3` is a radical internal rebuild that keeps the player familiar to use, but makes it **much easier to extend** (controls, plugins, engines) and **much easier to maintain**.
>
> ✅ If you use **UMD/CDN** today, you can keep the classic `new OpenPlayerJS('id', options); player.init();` flow — see **UMD compatibility** below.

---

## ✨ What’s new in v3

- 🧩 **Modular packages** (install only what you need)
- 🔌 **Plugin-first architecture** (UI, Ads, Engines are plugins)
- 🎛️ **Imperative UI extensions** (`addElement`, `addControl` via `extendControls`)
- 📝 **Programmatic captions** (`player.addCaptions(...)`)
- 🧱 Cleaner separation of concerns (core vs UI vs engines)

---

## ❌ Breaking Changes

- ❌ **M(PEG)-DASH / FLV support** in favor of just what the browser natively supports; if they are needed in the future, they can be added as separate bundles.
- ❌ Core **quality/levels** API (`levels`, `level`) — quality is now engine-specific.
- ❌ Several v2 “mega-config” options (moved to the right package: UI vs engine vs plugin); this approach can work when using UMD files, depending on what plugins are enabled.

> 🧭 Migration guide: **[MIGRATION.v3.md](./MIGRATION.v3.md)**

---

## 📦 Packages

| Package            | Purpose                                            | Docs                                                 |
| ------------------ | -------------------------------------------------- | ---------------------------------------------------- |
| `@openplayer/core` | Player lifecycle, plugin system, engines, events   | [packages/core/README.md](./packages/core/README.md) |
| `@openplayer/ui`   | Default UI + built-in controls + UI extension APIs | [packages/ui/README.md](./packages/ui/README.md)     |
| `@openplayer/hls`  | HLS engine (powered by `hls.js`)                   | [packages/hls/README.md](./packages/hls/README.md)   |
| `@openplayer/ads`  | VAST/VMAP/non-linear/companion ads plugin          | [packages/ads/README.md](./packages/ads/README.md)   |

---

## 🚀 Quick start (ESM / bundlers)

```bash
npm install @openplayer/core @openplayer/ui
```

```ts
import { Player } from '@openplayer/core';
import { createUI, buildControls } from '@openplayer/ui';
import '@openplayer/ui/style.css';

const media = document.querySelector('video')!;
const player = new Player(media, {
  plugins: [],
});

const controls = buildControls({
  bottom: { left: ['play', 'volume'], right: ['fullscreen'] },
  main: ['progress'],
});

createUI(player, media, controls);
```

### 📡 Add HLS

```bash
npm install @openplayer/hls hls.js
```

```ts
import { HlsMediaEngine } from '@openplayer/hls';
player.registerPlugin(new HlsMediaEngine());
```

### 💰 Add Ads

```bash
npm install @openplayer/ads
```

```ts
import { AdsPlugin } from '@openplayer/ads';
player.registerPlugin(
  new AdsPlugin({
    breaks: [{ at: 'preroll', url: 'https://example.com/vast.xml', once: true }],
  })
);
```

---

## 🌍 UMD compatibility (the “v2 way” still works)

If you load the UMD bundle from a CDN, you can keep the classic API shape:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/openplayerjs/dist/openplayer.css" />

<video class="op-player__media" id="player" controls playsinline>
  <source src="/video.mp4" type="video/mp4" />
</video>

<script src="https://cdn.jsdelivr.net/npm/openplayerjs/dist/openplayer.umd.js"></script>
<script>
  const player = new OpenPlayerJS('player', {
    startTime: 0,
    startVolume: 1,

    // ✅ Live streams: set Infinity when you know it’s live
    duration: Infinity,
  });

  player.init();
</script>
```

### Optional UMD add-ons

```html
<script src="https://cdn.jsdelivr.net/npm/openplayerjs/dist/openplayer-hls.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/openplayerjs/dist/openplayer-ads.umd.js"></script>
```

The add-ons self-register under `window.OpenPlayerPlugins`, and `init()` discovers them automatically.

> ✅ Most UMD users only need to adjust for removals (DASH/FLV/levels). See **[MIGRATION.v3.md](./MIGRATION.v3.md)**.

---

## 🎯 Live streams tip (important)

If you know ahead of time you will play a live stream, the best choice is:

```js
duration: Infinity;
```

This allows the UI and seeking logic to behave consistently.

---

## 📚 Legacy docs & changelog

- Old changelog: **[CHANGELOG.old.md](./CHANGELOG.old.md)**
- Legacy docs folder (v2 style): **[docs/](./docs/)**

---

## Built With

- [Typescript](https://www.typescriptlang.org/docs/home.html) - The Javascript for Pros.

## Authors

- **Rafael Miranda** - [rafa8626](https://github.com/rafa8626)

See also the list of [contributors](https://github.com/openplayerjs/openplayerjs/contributors) who participated in this project.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

This project is licensed under the MIT License - see [LICENSE.md](LICENSE.md) for details.
