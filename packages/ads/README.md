# @openplayer/ads

> VAST / VMAP / VPAID ad-serving plugin for [OpenPlayerJS](https://github.com/openplayerjs/openplayerjs).

## Installation

```bash
npm install @openplayer/ads @openplayer/core
```

## Features

- VAST 2.0 / 3.0 / 4.x linear and non-linear ads
- VMAP ad break scheduling (pre-roll, mid-roll, post-roll)
- Skip countdown and custom skip button
- Click-through tracking
- Companion ad support

## ESM usage

```ts
import { Player } from '@openplayer/core';
import { AdsPlugin } from '@openplayer/ads';

const player = new Player(video, {
  plugins: [
    new AdsPlugin({
      breaks: [
        { at: 'preroll', url: 'https://example.com/vast-preroll.xml', once: true },
        { at: 60, url: 'https://example.com/vast-midroll.xml', once: true },
        { at: 'postroll', url: 'https://example.com/vast-postroll.xml', once: true },
      ],
    }),
  ],
});
```

## UMD / CDN usage

```html
<script src="https://cdn.jsdelivr.net/npm/openplayerjs/dist/openplayer.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/openplayerjs/dist/openplayer-ads.umd.js"></script>
<script>
  const player = new OpenPlayer('#video', {
    ads: {
      breaks: [{ at: 'preroll', url: 'https://example.com/vast.xml', once: true }],
    },
  });
  player.init();
</script>
```

The ads bundle self-registers as `window.OpenPlayerPlugins.ads`.

## Ad break configuration

| Field  | Type                                | Description                                        |
| ------ | ----------------------------------- | -------------------------------------------------- |
| `at`   | `'preroll' \| 'postroll' \| number` | When to play the break (seconds for mid-roll)      |
| `url`  | `string`                            | VAST or VMAP tag URL                               |
| `once` | `boolean`                           | If `true`, the break plays only once per page load |

## Prototype and instance extensions

For UMD / imperative usage the ads plugin ships two optional helpers:

```ts
import { installAds, extendAds } from '@openplayer/ads';
import { Player } from '@openplayer/core';

// Prototype-level: adds Player.prototype.ads (requires opt-in)
installAds(Player);

// Instance-level: adds player.ads after the plugin is set up
extendAds(player, adsPluginInstance);

// player.ads.skip()  player.ads.pause()  player.ads.resume() …
```

## Dependencies

| Package                    | Type   | Required version |
| -------------------------- | ------ | ---------------- |
| `@openplayer/core`         | peer   | `>=3.0.0`        |
| `@dailymotion/vast-client` | direct | `>=6.0.0`        |
| `@dailymotion/vmap`        | direct | `>=3.0.0`        |

`@dailymotion/vast-client` and `@dailymotion/vmap` are bundled automatically — no manual install needed. The UMD build also inlines them.

## License

MIT — see [LICENSE](../../LICENSE).
