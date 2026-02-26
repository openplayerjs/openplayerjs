# @openplayer/hls

> HLS streaming engine for [OpenPlayerJS](https://github.com/openplayerjs/openplayerjs), powered by [hls.js](https://github.com/video-dev/hls.js).

## Installation

```bash
npm install @openplayer/hls @openplayer/core hls.js
```

## How it works

`HlsMediaEngine` implements the `MediaEnginePlugin` interface.  The `Player`
asks each registered engine whether it `canPlay` the current source.
`HlsMediaEngine` returns `true` for `.m3u8` URLs and MIME type
`application/vnd.apple.mpegurl` / `application/x-mpegURL` on browsers that
do not support HLS natively (e.g. Chrome/Firefox).  Native Safari handles HLS
through the default `DefaultMediaEngine`.

## ESM usage

```ts
import { Player } from '@openplayer/core';
import { HlsMediaEngine } from '@openplayer/hls';

const player = new Player(video, {
  plugins: [new HlsMediaEngine({ /* hls.js config */ })],
});
```

## UMD / CDN usage

Load the bundles in order — core first, then the HLS add-on:

```html
<script src="https://cdn.jsdelivr.net/npm/openplayerjs/dist/openplayer.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/openplayerjs/dist/openplayer-hls.umd.js"></script>
<script>
  const player = new OpenPlayer('#video');
  player.init();
</script>
```

The HLS bundle self-registers as `window.OpenPlayerPlugins.hls`.  The main
`OpenPlayer` UMD discovers it automatically on `init()`.

## hls.js configuration

Pass any [hls.js configuration](https://github.com/video-dev/hls.js/blob/master/docs/API.md#fine-tuning)
directly to the engine constructor:

```ts
new HlsMediaEngine({
  maxBufferLength: 60,
  enableWorker: true,
})
```

## Peer dependencies

| Package | Required version |
|---------|-----------------|
| `@openplayer/core` | `>=3.0.0` |
| `hls.js` | `>=1.0.0` |

## License

MIT — see [LICENSE](../../LICENSE).
