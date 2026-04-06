# @openplayerjs/youtube

YouTube IFrame Player engine for [OpenPlayerJS](https://openplayerjs.com).

> This is a direct replacement of the [deprecated OpenPlayer's YouTube plugin](https://github.com/openplayerjs/openplayerjs-youtube)

[![npm](https://img.shields.io/npm/v/@openplayerjs/youtube?color=blue&logo=npm&label=npm)](https://www.npmjs.com/package/@openplayerjs/youtube)
[![npm downloads](https://img.shields.io/npm/dm/@openplayerjs/youtube?logo=npm&label=downloads)](https://www.npmjs.com/package/@openplayerjs/youtube)
[![License](https://img.shields.io/npm/l/@openplayerjs/youtube)](../../LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![JSDelivr](https://data.jsdelivr.com/v1/package/npm/@openplayerjs/youtube/badge)](https://www.jsdelivr.com/package/npm/@openplayerjs/youtube)

Integrates the [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference) into the OpenPlayerJS engine system, so YouTube videos behave like any other media source — you get the same `play()`, `pause()`, `currentTime`, `volume`, and event API as native HTML5 media.

---

## Installation

```bash
npm install @openplayerjs/youtube @openplayerjs/core
```

> **Peer dependency:** `@openplayerjs/core` must be installed separately.

---

## Setting the source

There are three ways to tell the player which YouTube video to load. All of them work with both the UMD `<script>` build and the ESM package.

### 1. `<source>` element with explicit type (markup-first / UMD recommended)

Use `type="video/youtube"` so the engine claims the source without any URL pattern matching. This is the most reliable approach for UMD usage and the best match for semantic HTML:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@openplayerjs/player@latest/dist/openplayer.css" />
<script src="https://cdn.jsdelivr.net/npm/@openplayerjs/player@latest/dist/openplayer.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@openplayerjs/youtube@latest/dist/openplayer-youtube.js"></script>

<video id="my-video">
  <source src="https://www.youtube.com/embed/dQw4w9WgXcQ" type="video/youtube" />
</video>
<script>
  const player = new OpenPlayerJS('my-video');
  player.init();
</script>
```

Bare 11-character video IDs also work with the explicit type:

```html
<video id="my-video">
  <source src="dQw4w9WgXcQ" type="video/youtube" />
</video>
```

### 2. `<source>` element — URL autodetection (no type required)

When the `src` is a recognisable YouTube URL the engine detects it automatically — no `type` attribute needed:

```html
<video id="my-video">
  <source src="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
</video>
<script>
  const player = new OpenPlayerJS('my-video');
  player.init();
</script>
```

All supported URL formats are auto-detected (see [Supported source formats](#supported-source-formats)).

### 3. `player.src` / `core.src` — runtime / SPA

Set or change the source programmatically at any time after `init()`:

```ts
// ESM — with @openplayerjs/player
import { Core } from '@openplayerjs/core';
import { createUI, buildControls } from '@openplayerjs/player';
import { YouTubeMediaEngine } from '@openplayerjs/youtube';

const video = document.querySelector<HtmlVideoElement>('#video')!;
const core = new Core(video, {
  plugins: [new YouTubeMediaEngine()],
});

createUI(
  core,
  video,
  buildControls({
    top: ['progress'],
    'bottom-left': ['play', 'time', 'volume'],
    'bottom-right': ['captions', 'settings', 'fullscreen'],
  })
);

// Switch to any YouTube URL or bare ID at any time:
core.src = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
core.src = 'https://youtu.be/dQw4w9WgXcQ';
core.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
core.src = 'https://www.youtube.com/shorts/dQw4w9WgXcQ';
core.src = 'https://m.youtube.com/watch?v=dQw4w9WgXcQ'; // mobile domain
core.src = 'dQw4w9WgXcQ'; // bare 11-character video ID
```

```ts
// ESM — with @openplayerjs/core directly
import { Core } from '@openplayerjs/core';
import { YouTubeMediaEngine } from '@openplayerjs/youtube';

const video = document.querySelector('video')!;
const core = new Core(video, {
  plugins: [new YouTubeMediaEngine()],
});

core.src = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
await core.play();
```

```html
<!-- UMD — runtime source assignment -->
<script>
  const player = new OpenPlayerJS('my-video');
  player.init();
  player.src = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
</script>
```

---

## Configuration

Pass options to the `YouTubeMediaEngine` constructor (ESM) or via the `youtube` key in the player config (UMD):

```ts
// ESM
new YouTubeMediaEngine({ noCookie: true });

// UMD
new OpenPlayerJS('my-video', { youtube: { noCookie: true } });
```

| Option     | Type      | Default | Description                                                                                                                                                                             |
| ---------- | --------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `noCookie` | `boolean` | `false` | Serve the embed from `https://www.youtube-nocookie.com` instead of `https://www.youtube.com`. YouTube will not set cookies on the viewer's browser until they interact with the player. |

---

## How it works

1. `YouTubeMediaEngine.canPlay()` accepts:
   - An explicit `type="video/youtube"` attribute (highest priority)
   - YouTube domain URLs: `youtube.com`, `m.youtube.com`, `youtu.be`, `youtube-nocookie.com`
   - Bare 11-character video IDs (`dQw4w9WgXcQ`)
2. On `attach()` the engine:
   - Extracts the `videoId` from the source.
   - Creates a `YouTubeIframeAdapter` that lazily loads the YouTube IFrame API script (`https://www.youtube.com/iframe_api`) the first time it is needed (singleton load — the script tag is only inserted once).
   - Wraps the adapter in an `IframeMediaSurface`, which normalises adapter events into the standard `MediaSurface` contract (same events as `<video>`).
   - Hides the native `<video>` element and mounts the YouTube iframe inside the player container.
   - Subscribes to `ui:controls:show` / `ui:controls:hide` (emitted by `@openplayerjs/player`) to adjust the iframe height when the control bar appears or disappears. See [Caption-aware iframe height](#caption-aware-iframe-height) below.
3. The `IframeMediaSurface` polls `getCurrentTime()` / `getDuration()` every 250 ms (configurable) so that `timeupdate` and `durationchange` events fire even though the IFrame API does not push them.
4. On `detach()` the adapter is destroyed, the iframe is removed, the native element is restored, and all event subscriptions are cleaned up.

---

## Supported source formats

| Format              | Example                                       |
| ------------------- | --------------------------------------------- |
| Explicit MIME type  | `type="video/youtube"` (any src)              |
| Standard watch URL  | `https://www.youtube.com/watch?v=<id>`        |
| Mobile watch URL    | `https://m.youtube.com/watch?v=<id>`          |
| Short URL           | `https://youtu.be/<id>`                       |
| Embed URL           | `https://www.youtube.com/embed/<id>`          |
| Shorts URL          | `https://www.youtube.com/shorts/<id>`         |
| No-cookie embed URL | `https://www.youtube-nocookie.com/embed/<id>` |
| Bare video ID       | `dQw4w9WgXcQ` (11 characters)                 |

---

## API

`YouTubeMediaEngine` implements the standard `MediaEnginePlugin` interface from `@openplayerjs/core`. No YouTube-specific API is exposed — control the player through the standard `Core` / `Player` API.

### `YouTubeIframeAdapter`

The adapter class is exported for advanced use (e.g. building custom engines):

```ts
import { YouTubeIframeAdapter } from '@openplayerjs/youtube/src/youtubeAdapter';

const adapter = new YouTubeIframeAdapter({ videoId: 'dQw4w9WgXcQ', noCookie: true });
await adapter.mount(containerEl);
adapter.play();
```

---

## Caption-aware iframe height

YouTube renders its own caption overlay inside the iframe. When the OpenPlayerJS control bar is visible, that overlay can overlap or be hidden behind the bar.

To prevent this, the engine automatically shrinks the iframe height by the control bar's height (`--op-controls-height`, default `48px`) **only when both conditions are true simultaneously:**

| Condition                 | When true                                                    |
| ------------------------- | ------------------------------------------------------------ |
| Controls are visible      | `ui:controls:show` fired by `@openplayerjs/player`           |
| A caption track is active | `captionProvider.setTrack()` called with a non-null track ID |

When either condition is false (controls hidden, or captions off), the iframe is restored to `height: 100%`.

This means:

- **Captions off** — iframe always fills the full container regardless of controls visibility. No wasted space.
- **Captions on, controls visible** — iframe shrinks so YouTube's caption text appears above the controls bar.
- **Captions on, controls hidden** — iframe expands back to full height.

The height adjustment is driven entirely through `core.events` and JavaScript — no CSS rule is needed. If you use `@openplayerjs/player`, the `ui:controls:show` / `ui:controls:hide` events are emitted automatically. If you mount the YouTube engine without the player UI (e.g. with a custom control bar), emit those events yourself:

```ts
// Signal that your controls are now visible
core.events.emit('ui:controls:show');

// Signal that your controls are now hidden
core.events.emit('ui:controls:hide');
```

---

## Caption preference persistence

The YouTube IFrame API sets `cc_load_policy: 1`, which auto-enables captions every time the player loads. To respect the user's explicit choice across page refreshes, the player persists the on/off state in `localStorage`.

This is handled entirely by `@openplayerjs/player`'s `CaptionsControl` — **no extra configuration is needed** in the YouTube engine or your application.

### How it works

| User action                                    | What is stored                                          |
| ---------------------------------------------- | ------------------------------------------------------- |
| Clicks captions button to turn **off**         | `op:caption:track = ''` (empty string = explicitly off) |
| Selects a caption track from the settings menu | `op:caption:track = '<track-id>'` (e.g. `en`)           |
| Clicks captions button to turn **on**          | `op:caption:track = '<track-id>'`                       |

On the next page load, `CaptionsControl` reads the stored value and:

- **`''` (explicitly off)** — calls `setTrack(null)` immediately after the YouTube tracklist loads, overriding `cc_load_policy: 1`. Captions stay off.
- **`'<track-id>'`** — re-applies the saved track before `refresh()` fires so the captions button appears lit without any flash.
- **Key absent** — no preference stored (first visit); YouTube's own default applies (`cc_load_policy: 1` shows captions if available).

### Clearing the preference

```ts
// Programmatically reset to "no preference" (next load will use YouTube's default)
localStorage.removeItem('op:caption:track');
```

---

## Building an iframe engine for other providers

The `IframeMediaSurface`, `IframeMediaAdapter` contract, and the full engine authoring guide are documented in the `@openplayerjs/core` README under **Writing a custom media engine → Iframe engine**.

Key exports from `@openplayerjs/core`:

```ts
import {
  IframeMediaSurface,
  type IframeMediaAdapter,
  type IframeMediaAdapterEvents,
  type IframePlaybackState,
} from '@openplayerjs/core';
```

---

## Requirements

- `@openplayerjs/core` ≥ 3.0
- A browser environment (the YouTube IFrame API and DOM APIs are required)
- Network access to `https://www.youtube.com/iframe_api` at runtime

---

## Code samples

- https://codepen.io/rafa8626/pen/yyagYMq
- https://codepen.io/rafa8626/pen/xbEgwrv

---

## License

MIT — see [LICENSE](../../LICENSE).
