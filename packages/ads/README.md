# @openplayer/ads

> VAST / VMAP ad plugin for [OpenPlayerJS](https://openplayerjs.com).

[![npm](https://img.shields.io/npm/v/@openplayerjs/ads?color=blue&logo=npm&label=npm)](https://www.npmjs.com/package/@openplayerjs/ads)
[![npm downloads](https://img.shields.io/npm/dm/@openplayerjs/ads?logo=npm&label=downloads)](https://www.npmjs.com/package/@openplayerjs/ads)
[![License](https://img.shields.io/npm/l/@openplayerjs/ads)](../../LICENSE.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![JSDelivr](https://data.jsdelivr.com/v1/package/npm/@openplayerjs/ads/badge)](https://www.jsdelivr.com/package/npm/@openplayerjs/ads)

---

This package replaced the use of Google IMA SDK in OpenPlayerJS.

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
import { Core } from '@openplayer/core';
import { AdsPlugin } from '@openplayer/ads';

const core = new Core(video, {
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

---

## UMD / CDN usage

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@openplayerjs/player@latest/dist/openplayer.css" />
<script src="https://cdn.jsdelivr.net/npm/@openplayerjs/player@latest/dist/openplayer.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@openplayerjs/ads@latest/dist/openplayer-ads.js"></script>
<script>
  const player = new OpenPlayerJS('player', {
    ads: {
      breaks: [{ at: 'preroll', url: 'https://example.com/vast.xml', once: true }],
    },
  });
  player.init();
</script>
```

The ads bundle self-registers as `window.OpenPlayerPlugins.ads` and is discovered automatically on `init()`.

---

## Configuration

### `AdsPluginConfig`

| Option          | Type                        | Default       | Description                                                      |
| --------------- | --------------------------- | ------------- | ---------------------------------------------------------------- |
| `breaks`        | `AdsBreakConfig[]`          | `[]`          | The list of ad breaks to schedule                                |
| `adSourcesMode` | `'waterfall' \| 'playlist'` | `'waterfall'` | How multiple ad sources in a single break are handled. See below |
| `debug`         | `boolean`                   | `false`       | Enable verbose ads logging                                       |

### `AdsBreakConfig`

Each object in the `breaks` array describes one ad break:

| Field  | Type                                | Required | Description                                                                                                               |
| ------ | ----------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| `at`   | `'preroll' \| 'postroll' \| number` | Yes      | When to play the break. Use `'preroll'` to play before content, `'postroll'` after, or a number of seconds for a mid-roll |
| `url`  | `string`                            | Yes      | The VAST or VMAP tag URL to request                                                                                       |
| `once` | `boolean`                           | No       | When `true`, the break plays only once per page load even if the source changes                                           |
| `id`   | `string`                            | No       | Optional unique ID. Any break whose `id` or `url` contains `"bumper"` (case-insensitive) is treated as a bumper           |

### `adSourcesMode` explained

- **`'waterfall'`** (default): A single break can have a `sources` array. The plugin tries each source in order and stops as soon as one succeeds. Use this for ad tag fallbacks.
- **`'playlist'`**: Each source in a break is played as its own separate break in sequence. Use this for ad pods or sequential ad playlists.

---

## Public API

### `AdsPlugin` methods

These are available directly on the plugin instance (ESM):

| Method    | Signature                               | Description                                                       |
| --------- | --------------------------------------- | ----------------------------------------------------------------- |
| `playAds` | `playAds(url: string) => Promise<void>` | Trigger a one-off ad break from a VAST URL or raw VAST XML string |
| `skip`    | `skip() => void`                        | Skip the currently playing ad (if the skip button is active)      |
| `pause`   | `pause() => void`                       | Pause the current ad                                              |
| `resume`  | `resume() => void`                      | Resume a paused ad                                                |

### `installAds(Core)` and `extendAds(core, plugin)`

For UMD / imperative usage, two optional helpers expose `core.ads`:

```ts
import { installAds, extendAds } from '@openplayer/ads';
import { Core } from '@openplayer/core';

// Prototype-level: adds Core.prototype.ads
installAds(Core);

// Instance-level: wires core.ads to the given plugin instance
extendAds(core, adsPluginInstance);

// core.ads is now available:
core.ads.skip();
core.ads.pause();
core.ads.resume();
core.ads.playAds('https://example.com/vast.xml');
```

### Manual ad playback

```ts
// Trigger a one-off ad break from a URL:
core.ads.playAds('https://example.com/vast.xml');

// Or from a raw VAST XML string:
core.ads.playAds(`<VAST version="3.0">...</VAST>`);
```

---

## Events

All ads events are prefixed with `ads:`. Listen with `core.on(eventName, handler)`.

| Event                 | Payload                            | When it fires                                                                                                   |
| --------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `ads:requested`       | `{ url, at, id }`                  | An ad tag URL request has been sent to the server                                                               |
| `ads:loaded`          | `{ break, count }`                 | The VAST/VMAP response was parsed and ads are ready to play                                                     |
| `ads:break:start`     | `{ id, kind, at }`                 | An ad break is about to start; content playback pauses                                                          |
| `ads:break:end`       | `{ id, kind, at }`                 | An ad break finished; content playback resumes                                                                  |
| `ads:ad:start`        | `{ break, index }`                 | An individual ad within a break started playing                                                                 |
| `ads:ad:end`          | `{ break, index }`                 | An individual ad within a break finished                                                                        |
| `ads:impression`      | `{ break, index }`                 | The ad impression was recorded (fires once per ad)                                                              |
| `ads:quartile`        | `{ break, quartile }`              | Playback reached 0 %, 25 %, 50 %, 75 %, or 100 % of the ad's length. `quartile` is `0 \| 25 \| 50 \| 75 \| 100` |
| `ads:timeupdate`      | `{ break, currentTime, duration }` | The ad's current time updated (fires frequently, like `timeupdate`)                                             |
| `ads:duration`        | `{ break, duration }`              | The ad's total duration became known                                                                            |
| `ads:skip`            | `{ break, reason }`                | The current ad was skipped                                                                                      |
| `ads:clickthrough`    | `{ break, url }`                   | The user clicked the ad and a click-through URL was opened                                                      |
| `ads:pause`           | `{ break }`                        | The ad was paused                                                                                               |
| `ads:resume`          | `{ break }`                        | A paused ad was resumed                                                                                         |
| `ads:mute`            | `{ break }`                        | The ad was muted                                                                                                |
| `ads:unmute`          | `{ break }`                        | The ad was unmuted                                                                                              |
| `ads:volumeChange`    | `{ break, volume, muted }`         | Volume changed during an ad                                                                                     |
| `ads:allAdsCompleted` | `{ break }`                        | All scheduled ad breaks have finished playing                                                                   |
| `ads:error`           | `{ reason, error?, url? }`         | An error occurred during request, parsing, or playback                                                          |

### Example: listening to ads events

```ts
core.on('ads:break:start', ({ id, kind, at }) => {
  console.log(`Ad break "${kind}" starting at ${at}s`);
  // Hide any custom overlays or pause your UI here
});

core.on('ads:break:end', () => {
  console.log('Ad break finished, content resuming');
});

core.on('ads:quartile', ({ quartile }) => {
  if (quartile === 50) console.log('User reached the midpoint of the ad');
});

core.on('ads:error', ({ reason, error }) => {
  console.warn('Ad failed:', reason, error);
  // Content playback resumes automatically on error
});
```

---

## Dependencies

| Package                    | Type    | Required version |
| -------------------------- | ------- | ---------------- |
| `@openplayer/core`         | peer    | `>=3.0.0`        |
| `@dailymotion/vast-client` | bundled | `>=6.0.0`        |
| `@dailymotion/vmap`        | bundled | `>=3.0.0`        |

---

## Compatibility with iframe engines (YouTube, Vimeo, etc.)

`AdsPlugin` is designed for native `<video>`/`<audio>` content and currently has several integration gaps when used alongside iframe-based engines such as `@openplayerjs/youtube`. These are **known areas of concern** — ads + YouTube is not a supported combination yet:

### 1. `media.duration` read from the native element

`getDueMidrollBreaks()` and related percentage-based midroll logic read `this.ctx.core.media.duration` directly from the native `<video>` element. When a YouTube (or other iframe) engine is active, that element is hidden and has nothing loaded — `media.duration` will be `NaN`, so percentage-based midrolls will never trigger.

**Fix needed:** replace `this.ctx.core.media.duration` with `this.ctx.core.duration` (which is synced from the active surface via `bindSurfaceSync()`).

### 2. `media.currentTime` read from the native element

`shouldInterceptPreroll()` checks `media?.currentTime` to skip a preroll if playback has already advanced past 0.25 s. For iframe engines, `media.currentTime` is always `0` (the native element is unloaded), so this guard never fires correctly.

**Fix needed:** replace `media?.currentTime` with `this.ctx.core.currentTime`.

### 3. DOM `timeupdate` listener on the native element

`bindBreakScheduler()` listens to the native `'timeupdate'` DOM event on `core.media` to fire midroll checks. Iframe engines never trigger this event on the native element — they emit `timeupdate` through the player EventBus instead.

**Fix needed:** replace the native DOM listener with an EventBus listener (`ctx.events.on('timeupdate', ...)`) so it fires for all engine types.

### 4. Native `'play'` capture listener in preroll interceptors

`bindPrerollInterceptors()` attaches a capture-phase `'play'` listener to `core.media` to intercept prerolls before the browser starts rendering. For iframe engines the native `<video>` never emits `'play'` (it is hidden and unloaded), so the preroll interceptor is never triggered.

**Fix needed:** for iframe engines, hook the preroll interceptor to `cmd:play` on the EventBus instead of the native DOM event.

---

## Code samples

A wide collection of ready-to-run examples — covering preroll, midroll, and postroll VAST/VMAP setups, waterfall sources, and non-linear ads — is available as a living cookbook in the CodePen collection below.

CodePen Collection: [https://codepen.io/collection/kkwgWj](https://codepen.io/collection/kkwgWj)

---

## License

MIT — see [LICENSE](../../LICENSE).
