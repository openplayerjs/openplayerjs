# API Reference

> **v3 note:** This document reflects the OpenPlayerJS **v3** API. If you are upgrading from v2, see [MIGRATION.v3.md](../MIGRATION.v3.md) for a full breakdown of what changed, what was removed, and how to adapt your code.

---

## Table of contents

- [Player (core)](#player-core)
  - [Constructor](#constructor)
  - [Properties](#properties)
  - [Methods](#methods)
  - [Core events](#core-events)
- [AdsPlugin](#adsplugin)
  - [Ad break configuration](#ad-break-configuration)
  - [Ads events](#ads-events)
- [HlsMediaEngine](#hlsmediaengine)
  - [HLS events](#hls-events)
- [UI — extendControls](#ui--extendcontrols)
- [Keyboard shortcuts](#keyboard-shortcuts)

---

## Player (core)

Import from `@openplayer/core`:

```ts
import { Player } from '@openplayer/core';
```

### Constructor

```ts
new Player(media: HTMLMediaElement | string, config?: PlayerConfig)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `media` | `HTMLMediaElement \| string` | The `<video>` or `<audio>` element, or a CSS selector string that points to one |
| `config` | `PlayerConfig` | Optional configuration object (see below) |

#### PlayerConfig options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `plugins` | `PlayerPlugin[]` | `[]` | List of plugins to register at startup (engines, UI, ads, etc.) |
| `startTime` | `number` | `0` | Initial playback position in seconds |
| `startVolume` | `number` | `1` | Initial volume level, from `0` to `1` |
| `startPlaybackRate` | `number` | `1` | Initial playback rate (e.g. `0.5`, `1`, `1.5`, `2`) |
| `step` | `number` | `0` | Seconds to seek forward/backward when using keyboard shortcuts or the step API. When `0`, the player uses 5 s by default |
| `duration` | `number` | `0` | Override the detected duration in seconds. Set to `Infinity` for live streams to enable correct UI behaviour |
| `width` | `number \| string` | `0` | Force the player to a specific width (pixels as a number, or a CSS string like `"100%"`) |
| `height` | `number \| string` | `0` | Force the player to a specific height |
| `labels` | `Record<string, string>` | See below | Override any of the built-in UI label strings |
| `debug` | `boolean` | `false` | Enable verbose logging |

#### Default labels

These strings are used throughout the UI and can all be overridden via the `labels` config option:

| Key | Default value |
|-----|---------------|
| `auto` | `"Auto"` |
| `captions` | `"CC/Subtitles"` |
| `click` | `"Click to unmute"` |
| `container` | `"Media player"` |
| `fullscreen` | `"Fullscreen"` |
| `live` | `"Live"` |
| `loading` | `"Loading"` |
| `media` | `"Media"` |
| `mute` | `"Mute"` |
| `off` | `"Off"` |
| `pause` | `"Pause"` |
| `play` | `"Play"` |
| `progressRail` | `"Time Rail"` |
| `progressSlider` | `"Time Slider"` |
| `settings` | `"Player Settings"` |
| `speed` | `"Speed"` |
| `speedNormal` | `"Normal"` |
| `tap` | `"Tap to unmute"` |
| `toggleCaptions` | `"Toggle Captions"` |
| `unmute` | `"Unmute"` |
| `volume` | `"Volume"` |
| `volumeControl` | `"Volume Control"` |
| `volumeSlider` | `"Volume Slider"` |

---

### Properties

These are the **public** properties available on a `Player` instance:

| Property | Type | Description |
|----------|------|-------------|
| `media` | `HTMLMediaElement` | The underlying `<video>` or `<audio>` element |
| `config` | `PlayerConfig` | The resolved configuration object for this instance |
| `events` | `EventBus` | The internal event bus. Use `player.on(...)` instead for most cases |
| `state` | `StateManager` | Tracks the current playback state (`idle`, `loading`, `playing`, `paused`, etc.) |
| `isLive` | `boolean` | `true` when the player has detected or been told (`duration: Infinity`) that the source is a live stream |
| `src` | `string \| undefined` | Get or set the current media URL. Setting this resets the engine and begins loading |
| `volume` | `number` | Get or set the current volume (`0`–`1`) |
| `muted` | `boolean` | Get or set the muted state |
| `playbackRate` | `number` | Get or set the playback speed multiplier |
| `currentTime` | `number` | Get or set the current playback position in seconds |
| `duration` | `number` | Get the detected or configured duration in seconds (`Infinity` for live streams) |
| `userInteracted` | `boolean` | `true` after the first user gesture; useful for autoplay-policy checks |
| `canAutoplay` | `boolean` | `true` if the browser supports autoplay with sound |
| `canAutoplayMuted` | `boolean` | `true` if the browser supports autoplay when muted |

---

### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `on` | `on(event, callback)` | Subscribe to a player event. Returns an unsubscribe function |
| `emit` | `emit(event, payload?)` | Emit an event on the player bus (also forwards to all non-engine plugins) |
| `play` | `async play()` | Start or resume playback. Resolves when playback begins |
| `pause` | `pause()` | Pause playback |
| `load` | `load()` | Re-read `<source>` tags, resolve the correct engine, and begin loading media |
| `destroy` | `destroy()` | Tear down the player — removes all event listeners, destroys all plugins, and restores the original media element |
| `registerPlugin` | `registerPlugin(plugin)` | Register a plugin or engine after construction. Plugins registered this way must not depend on `setup()` being called before `play()` |
| `getPlugin` | `getPlugin<T>(name)` | Retrieve a registered plugin instance by name, cast to `T` |
| `addCaptions` | `addCaptions(args)` | Append a `<track>` element to the media tag at runtime — useful for single-page apps that load captions dynamically |
| `extend` | `extend(properties)` | Mix arbitrary properties into the player instance (used internally by `extendControls`, `extendAds`, etc.) |
| `whenReady` | `async whenReady()` | Returns a Promise that resolves when the engine has loaded enough metadata to begin playback |
| `determineAutoplaySupport` | `async determineAutoplaySupport()` | Detect browser autoplay capabilities and set `canAutoplay` / `canAutoplayMuted` |

#### `addCaptions` signature

```ts
player.addCaptions({
  src: string;       // URL to the caption/subtitle file (.vtt, .srt)
  srclang: string;   // BCP-47 language code, e.g. 'en', 'es', 'ja'
  label: string;     // Human-readable label shown in the Settings menu
  kind?: string;     // 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata'
  default?: boolean; // Set this track as the default/active track
});
```

> **Safari tip:** Safari requires at least one `<track>` element to exist in the markup before any caption APIs work. If you load all captions dynamically, add a blank placeholder track to your HTML first.

---

### Core events

Subscribe using `player.on(eventName, handler)`:

```ts
player.on('playing', () => console.log('playback started'));
player.on('pause', () => console.log('paused'));
player.on('ended', () => console.log('media ended'));
player.on('error', (err) => console.error('media error', err));
```

| Event | Payload | When it fires |
|-------|---------|---------------|
| `loadstart` | — | The browser begins loading the media source |
| `loadedmetadata` | — | Duration and dimensions are known; safe to call `play()` |
| `durationchange` | — | The reported duration changes (common during HLS live streams) |
| `play` | — | A play request was made (may fire before any frames are displayed) |
| `playing` | — | The first frame is rendered; playback is actually running |
| `pause` | — | Playback was paused |
| `timeupdate` | — | The current time updated during playback |
| `seeking` | — | The player is seeking to a new position |
| `seeked` | — | Seeking completed |
| `waiting` | — | Playback stalled while the buffer catches up |
| `ended` | — | The media finished playing |
| `volumechange` | — | Volume or mute state changed |
| `ratechange` | — | Playback rate changed |
| `error` | `MediaError \| null` | A media error occurred |
| `source:set` | `string` | A new source URL was set on the player |
| `player:interacted` | — | The user interacted with the page for the first time |
| `player:destroy` | — | The player is about to be destroyed |
| `texttrack:add` | `HTMLTrackElement` | A new caption/subtitle track was appended |
| `texttrack:remove` | `HTMLTrackElement` | A caption/subtitle track was removed |
| `texttrack:listchange` | — | The list of available tracks changed |
| `overlay:changed` | — | The overlay state changed (used by ads, loaders, etc.) |

> **HTML5 command events** (`cmd:play`, `cmd:pause`, `cmd:seek`, etc.) are lower-level bus messages intended for engines and plugins. In most cases you should use the higher-level `play` / `pause` / `timeupdate` / `ended` events instead.

---

## AdsPlugin

Import from `@openplayer/ads`:

```ts
import { AdsPlugin } from '@openplayer/ads';
```

Pass it as a plugin when constructing the player:

```ts
const player = new Player(video, {
  plugins: [
    new AdsPlugin({
      breaks: [
        { at: 'preroll', url: 'https://example.com/vast.xml', once: true },
        { at: 60,        url: 'https://example.com/midroll.xml', once: true },
        { at: 'postroll', url: 'https://example.com/postroll.xml', once: true },
      ],
    }),
  ],
});
```

### Ad break configuration

Each entry in the `breaks` array describes one ad break:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `at` | `'preroll' \| 'postroll' \| number` | Yes | When to play the break. Use `'preroll'` to play before content, `'postroll'` to play after, or a number of seconds for a mid-roll |
| `url` | `string` | Yes (if no `vmap`) | The VAST or VMAP tag URL to request |
| `once` | `boolean` | No | When `true`, the break will only play once per page load, even if the player is restarted |
| `id` | `string` | No | Optional unique identifier. Used for bumper detection (any break whose `id` or `url` contains `"bumper"` is treated as a bumper ad) |

### AdsPluginConfig options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `breaks` | `AdsBreakConfig[]` | `[]` | The list of ad breaks to schedule |
| `adSourcesMode` | `'waterfall' \| 'playlist'` | `'waterfall'` | How multiple ad sources are handled. `'waterfall'` tries each source in order and stops on the first success. `'playlist'` plays each source as a separate break |
| `debug` | `boolean` | `false` | Enable verbose ads logging |

### `player.ads` instance methods (after `installAds` / UMD)

When using `installAds(Player)` or loading the UMD bundle, `player.ads` is available with these methods:

| Method | Description |
|--------|-------------|
| `skip()` | Skip the currently playing ad (if the skip button is shown) |
| `pause()` | Pause the current ad |
| `resume()` | Resume a paused ad |
| `playAds(url)` | Trigger a one-off ad break from a VAST URL or raw XML string |

---

### Ads events

Listen using `player.on(eventName, handler)`. All ads events are prefixed with `ads:`.

| Event | Payload | When it fires |
|-------|---------|---------------|
| `ads:requested` | `{ url, at, id }` | An ad tag request has been sent to the server |
| `ads:loaded` | `{ break, count }` | The VAST/VMAP response was parsed and ads are ready to play |
| `ads:break:start` | `{ id, kind, at }` | An ad break is about to start (content playback is about to pause) |
| `ads:break:end` | `{ id, kind, at }` | An ad break finished; content playback is about to resume |
| `ads:ad:start` | `{ break, index }` | An individual ad within a break started playing |
| `ads:ad:end` | `{ break, index }` | An individual ad within a break finished |
| `ads:impression` | `{ break, index }` | The ad impression was recorded (fires once per ad) |
| `ads:quartile` | `{ break, quartile }` | Playback reached 0%, 25%, 50%, 75%, or 100% of the ad's duration. `quartile` is `0 \| 25 \| 50 \| 75 \| 100` |
| `ads:timeupdate` | `{ break, currentTime, duration }` | The ad's current time updated (fires frequently, similar to `timeupdate`) |
| `ads:duration` | `{ break, duration }` | The ad's total duration became known |
| `ads:skip` | `{ break, reason }` | The user (or the plugin) skipped the current ad |
| `ads:clickthrough` | `{ break, url }` | The user clicked the ad and a click-through URL was opened |
| `ads:pause` | `{ break }` | The ad was paused |
| `ads:resume` | `{ break }` | A paused ad was resumed |
| `ads:mute` | `{ break }` | The ad was muted |
| `ads:unmute` | `{ break }` | The ad was unmuted |
| `ads:volumeChange` | `{ break, volume, muted }` | Volume changed during an ad |
| `ads:allAdsCompleted` | `{ break }` | All scheduled ad breaks finished |
| `ads:error` | `{ reason, error?, url? }` | An error occurred (network, parse, or playback failure) |

#### Example

```ts
const ads = new AdsPlugin({ breaks: [{ at: 'preroll', url: '...', once: true }] });
const player = new Player(video, { plugins: [ads] });

player.on('ads:break:start', ({ id, kind, at }) => {
  console.log(`Ad break "${kind}" starting at ${at}s`);
});

player.on('ads:quartile', ({ quartile }) => {
  if (quartile === 50) console.log('Halfway through the ad');
});

player.on('ads:error', ({ reason, error }) => {
  console.error('Ad failed:', reason, error);
});
```

---

## HlsMediaEngine

Import from `@openplayer/hls`:

```ts
import { HlsMediaEngine } from '@openplayer/hls';
```

Pass any [hls.js configuration](https://github.com/video-dev/hls.js/blob/master/docs/API.md#fine-tuning) options directly to the constructor:

```ts
const player = new Player(video, {
  plugins: [
    new HlsMediaEngine({
      maxBufferLength: 60,
      lowLatencyMode: true,
    }),
  ],
});
```

### Accessing hls.js directly

```ts
import { HlsMediaEngine } from '@openplayer/hls';

const engine = player.getPlugin<HlsMediaEngine>('hls');
const hlsInstance = engine?.getAdapter(); // the raw hls.js instance (when hls.js is active)
```

### HLS events

You can listen to hls.js events through the standard `player.on(...)` API:

```ts
import Hls from 'hls.js';

player.on(Hls.Events.MANIFEST_PARSED, () => {
  console.log('HLS manifest parsed');
});

player.on(Hls.Events.ERROR, (data) => {
  if (data?.fatal) console.error('Fatal HLS error', data);
});
```

> **Note:** On Safari (and iOS), HLS playback is handled natively by `DefaultMediaEngine`. The `HlsMediaEngine` is only active on browsers that do not support HLS natively (Chrome, Firefox, etc.), so hls.js events will only fire on those browsers.

---

## UI — extendControls

Import from `@openplayer/ui`:

```ts
import { extendControls } from '@openplayer/ui';
```

After calling `extendControls(player)`, the player instance gains a `.controls` object with the following methods:

| Method | Signature | Description |
|--------|-----------|-------------|
| `addElement` | `addElement(el, placement)` | Append any HTML element to a specific position in the player. The placement is `{ v: 'top' \| 'bottom', h: 'left' \| 'right' }` |
| `addControl` | `addControl(control)` | Register and mount a typed `Control` object. The `Control` interface requires an `id`, `placement`, `create(player)` factory, and an optional `destroy()` callback |

```ts
import { extendControls } from '@openplayer/ui';

extendControls(player);

// Add a watermark
const watermark = document.createElement('div');
watermark.textContent = 'MyBrand™';
watermark.className = 'my-watermark';
player.controls.addElement(watermark, { v: 'top', h: 'right' });

// Add a typed custom control
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

> **Important:** `extendControls` must be called **after** `createUI` and only once the player has been fully initialized. Calling it before initialization will throw.

---

## Keyboard shortcuts

The built-in keyboard handling is active whenever the player wrapper has focus. You can override the `step` config option to change seek distances.

| Key | Action |
|-----|--------|
| `Space` / `Enter` | Play / Pause (when player has focus) |
| `K` | Play / Pause |
| `M` | Mute / Unmute |
| `F` | Toggle fullscreen |
| `←` (Left arrow) | Seek back 5 s (or the configured `step` value) |
| `→` (Right arrow) | Seek forward 5 s (or the configured `step` value) |
| `J` | Seek back 10 s (or double the configured `step` value) |
| `L` | Seek forward 10 s (or double the configured `step` value) |
| `↑` (Up arrow) | Volume up |
| `↓` (Down arrow) | Volume down |
| `Home` | Seek to the beginning |
| `End` | Seek to the end of the media (no-op for live streams) |
| `0`–`9` | While the progress bar has focus: seek to 0%–90% of total duration |
| `,` | While paused: step back one frame |
| `.` | While paused: step forward one frame |
| `<` | Slow down playback rate by `0.25` |
| `>` | Speed up playback rate by `0.25` |
