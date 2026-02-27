# @openplayer/ads

> VAST / VMAP / non-linear / companion ad plugin for [OpenPlayerJS](https://github.com/openplayerjs/openplayerjs).

---

## Installation

```bash
npm install @openplayer/ads @openplayer/core
```

`@dailymotion/vast-client` and `@dailymotion/vmap` are bundled automatically — you do not need to install them separately.

---

## Features

- VAST 2.0 / 3.0 / 4.x linear ads
- VMAP ad break scheduling (pre-roll, mid-roll, post-roll)
- Non-linear (overlay) ads
- Companion ads
- Skip countdown and customisable skip button
- Click-through tracking
- Waterfall and playlist ad source modes
- Preload-aware VMAP fetching (respects `preload="none"`)

---

## ESM usage

```ts
import { Player } from '@openplayer/core';
import { AdsPlugin } from '@openplayer/ads';

const player = new Player(video, {
  plugins: [
    new AdsPlugin({
      breaks: [
        { at: 'preroll',  url: 'https://example.com/vast-preroll.xml',  once: true },
        { at: 60,         url: 'https://example.com/vast-midroll.xml',  once: true },
        { at: 'postroll', url: 'https://example.com/vast-postroll.xml', once: true },
      ],
    }),
  ],
});
```

---

## UMD / CDN usage

```html
<script src="https://cdn.jsdelivr.net/npm/openplayerjs/dist/openplayer.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/openplayerjs/dist/openplayer-ads.umd.js"></script>
<script>
  const player = new OpenPlayerJS('player', {
    ads: {
      breaks: [
        { at: 'preroll', url: 'https://example.com/vast.xml', once: true },
      ],
    },
  });
  player.init();
</script>
```

The ads bundle self-registers as `window.OpenPlayerPlugins.ads` and is discovered automatically on `init()`.

---

## Configuration

### `AdsPluginConfig`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `breaks` | `AdsBreakConfig[]` | `[]` | The list of ad breaks to schedule |
| `adSourcesMode` | `'waterfall' \| 'playlist'` | `'waterfall'` | How multiple ad sources in a single break are handled. See below |
| `debug` | `boolean` | `false` | Enable verbose ads logging |

### `AdsBreakConfig`

Each object in the `breaks` array describes one ad break:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `at` | `'preroll' \| 'postroll' \| number` | Yes | When to play the break. Use `'preroll'` to play before content, `'postroll'` after, or a number of seconds for a mid-roll |
| `url` | `string` | Yes | The VAST or VMAP tag URL to request |
| `once` | `boolean` | No | When `true`, the break plays only once per page load even if the source changes |
| `id` | `string` | No | Optional unique ID. Any break whose `id` or `url` contains `"bumper"` (case-insensitive) is treated as a bumper |

### `adSourcesMode` explained

- **`'waterfall'`** (default): A single break can have a `sources` array. The plugin tries each source in order and stops as soon as one succeeds. Use this for ad tag fallbacks.
- **`'playlist'`**: Each source in a break is played as its own separate break in sequence. Use this for ad pods or sequential ad playlists.

---

## Public API

### `AdsPlugin` methods

These are available directly on the plugin instance (ESM):

| Method | Signature | Description |
|--------|-----------|-------------|
| `playAds` | `playAds(url: string) => Promise<void>` | Trigger a one-off ad break from a VAST URL or raw VAST XML string |
| `skip` | `skip() => void` | Skip the currently playing ad (if the skip button is active) |
| `pause` | `pause() => void` | Pause the current ad |
| `resume` | `resume() => void` | Resume a paused ad |

### `installAds(Player)` and `extendAds(player, plugin)`

For UMD / imperative usage, two optional helpers expose `player.ads`:

```ts
import { installAds, extendAds } from '@openplayer/ads';
import { Player } from '@openplayer/core';

// Prototype-level: adds Player.prototype.ads
installAds(Player);

// Instance-level: wires player.ads to the given plugin instance
extendAds(player, adsPluginInstance);

// player.ads is now available:
player.ads.skip();
player.ads.pause();
player.ads.resume();
player.ads.playAds('https://example.com/vast.xml');
```

### Manual ad playback

```ts
// Trigger a one-off ad break from a URL:
player.ads.playAds('https://example.com/vast.xml');

// Or from a raw VAST XML string:
player.ads.playAds(`<VAST version="3.0">...</VAST>`);
```

---

## Events

All ads events are prefixed with `ads:`. Listen with `player.on(eventName, handler)`.

| Event | Payload | When it fires |
|-------|---------|---------------|
| `ads:requested` | `{ url, at, id }` | An ad tag URL request has been sent to the server |
| `ads:loaded` | `{ break, count }` | The VAST/VMAP response was parsed and ads are ready to play |
| `ads:break:start` | `{ id, kind, at }` | An ad break is about to start; content playback pauses |
| `ads:break:end` | `{ id, kind, at }` | An ad break finished; content playback resumes |
| `ads:ad:start` | `{ break, index }` | An individual ad within a break started playing |
| `ads:ad:end` | `{ break, index }` | An individual ad within a break finished |
| `ads:impression` | `{ break, index }` | The ad impression was recorded (fires once per ad) |
| `ads:quartile` | `{ break, quartile }` | Playback reached 0 %, 25 %, 50 %, 75 %, or 100 % of the ad's length. `quartile` is `0 \| 25 \| 50 \| 75 \| 100` |
| `ads:timeupdate` | `{ break, currentTime, duration }` | The ad's current time updated (fires frequently, like `timeupdate`) |
| `ads:duration` | `{ break, duration }` | The ad's total duration became known |
| `ads:skip` | `{ break, reason }` | The current ad was skipped |
| `ads:clickthrough` | `{ break, url }` | The user clicked the ad and a click-through URL was opened |
| `ads:pause` | `{ break }` | The ad was paused |
| `ads:resume` | `{ break }` | A paused ad was resumed |
| `ads:mute` | `{ break }` | The ad was muted |
| `ads:unmute` | `{ break }` | The ad was unmuted |
| `ads:volumeChange` | `{ break, volume, muted }` | Volume changed during an ad |
| `ads:allAdsCompleted` | `{ break }` | All scheduled ad breaks have finished playing |
| `ads:error` | `{ reason, error?, url? }` | An error occurred during request, parsing, or playback |

### Example: listening to ads events

```ts
player.on('ads:break:start', ({ id, kind, at }) => {
  console.log(`Ad break "${kind}" starting at ${at}s`);
  // Hide any custom overlays or pause your UI here
});

player.on('ads:break:end', () => {
  console.log('Ad break finished, content resuming');
});

player.on('ads:quartile', ({ quartile }) => {
  if (quartile === 50) console.log('User reached the midpoint of the ad');
});

player.on('ads:error', ({ reason, error }) => {
  console.warn('Ad failed:', reason, error);
  // Content playback resumes automatically on error
});
```

---

## Dependencies

| Package | Type | Required version |
|---------|------|-----------------|
| `@openplayer/core` | peer | `>=3.0.0` |
| `@dailymotion/vast-client` | bundled | `>=6.0.0` |
| `@dailymotion/vmap` | bundled | `>=3.0.0` |

---

## Code samples

| Level | Description | Link |
|-------|-------------|------|
| 🟢 Beginner | Linear and non-linear ads | https://codepen.io/rafa8626/pen/vVYKav |
| 🟡 Intermediate | Ads playlist (multiple URLs) | https://codepen.io/rafa8626/pen/wvvxbMN |
| 🔴 Advanced | Updating source and ads dynamically | https://codepen.io/rafa8626/pen/gORJWVz |
| 🔴 Advanced | Updating ads and clickable ad element | https://codepen.io/rafa8626/pen/OJmEzXw |
| 🔴 Advanced | Trigger ad manually | https://codepen.io/rafa8626/pen/abZNgoY |

---

## License

MIT — see [LICENSE](../../LICENSE).
