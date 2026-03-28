# @openplayerjs/ads

> VAST / VMAP / SSAI / Hybrid ad plugin for [OpenPlayerJS](https://openplayerjs.com).

[![npm](https://img.shields.io/npm/v/@openplayerjs/ads?color=blue&logo=npm&label=npm)](https://www.npmjs.com/package/@openplayerjs/ads)
[![npm downloads](https://img.shields.io/npm/dm/@openplayerjs/ads?logo=npm&label=downloads)](https://www.npmjs.com/package/@openplayerjs/ads)
[![License](https://img.shields.io/npm/l/@openplayerjs/ads)](../../LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![JSDelivr](https://data.jsdelivr.com/v1/package/npm/@openplayerjs/ads/badge)](https://www.jsdelivr.com/package/npm/@openplayerjs/ads)

---

This package provides ad insertion for OpenPlayerJS. It supports three delivery modes selectable via `adDelivery`:

| Mode               | Strategy class     | Description                                                                                                  |
| ------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------ |
| `'csai'` (default) | `CsaiAdStrategy`   | Client-side ad insertion — fetches VAST/VMAP, renders an ad `<video>`                                        |
| `'ssai'`           | `SsaiAdStrategy`   | Server-side ad stitching — ads are baked into the HLS stream; boundaries detected via SCTE-35 TextTrack cues |
| `'hybrid'`         | `HybridAdStrategy` | CSAI triggered by SCTE-35 OUT cues from the HLS engine                                                       |

---

## Installation

```bash
npm install @openplayerjs/ads @openplayerjs/core
```

`@dailymotion/vast-client` and `@dailymotion/vmap` are bundled automatically — no separate install needed.

---

## Features

- **VAST 2.0 / 3.0 / 4.x** linear ads
- **VMAP** ad break scheduling (pre-roll, mid-roll, post-roll)
- Non-linear (overlay) ads
- Companion ads
- Skip countdown and customisable skip button
- Click-through tracking
- Waterfall and playlist ad source modes
- Preload-aware VMAP fetching (respects `preload="none"`)
- **SSAI** — server-side ad stitching via SCTE-35 TextTrack cues
- **Hybrid** — CSAI triggered by SCTE-35 OUT cues from the HLS engine
- **SIMID 1.2** — Secure Interactive Media Interface Definition (interactive overlays)
- **OMID** — Open Measurement Interface Definition (third-party viewability / verification)

---

## Quick start

### CSAI — client-side ad insertion (default)

```ts
import { Core } from '@openplayerjs/core';
import { AdsPlugin } from '@openplayerjs/ads';

const core = new Core(video, {
  plugins: [
    new AdsPlugin({
      // adDelivery: 'csai' is the default — no need to set it explicitly
      breaks: [
        { at: 'preroll', source: { type: 'VAST', src: 'https://example.com/preroll.xml' } },
        { at: 30, source: { type: 'VAST', src: 'https://example.com/midroll.xml' } },
        { at: 'postroll', source: { type: 'VAST', src: 'https://example.com/postroll.xml' } },
      ],
    }),
  ],
});
```

### VMAP (break schedule from server)

```ts
new AdsPlugin({
  sources: [{ type: 'VMAP', src: 'https://example.com/vmap.xml' }],
});
```

### SSAI — server-side ad stitching

SSAI mode reads SCTE-35 splice commands directly from the HLS metadata TextTrack — no VAST requests are
made. Ads are baked into the stitched stream; the plugin tracks break boundaries and fires lifecycle
events. Both ID3/DataCue (`enableID3MetadataCues`) and EXT-X-DATERANGE/VTTCue (`enableDateRangeMetadataCues`)
formats are supported automatically.

#### Minimal setup

`eventSink` is optional — `ads:break:start`, `ads:break:end`, and `ads:quartile` still fire on the EventBus.

```ts
import { Core } from '@openplayerjs/core';
import { AdsPlugin } from '@openplayerjs/ads';

const core = new Core(video, {
  plugins: [new AdsPlugin({ adDelivery: 'ssai' })],
});
```

#### Full lifecycle tracking via `eventSink`

`eventSink` receives `impression` (break started), `quartile` (25/50/75/100%), and `complete` (break ended).

```ts
import { Core } from '@openplayerjs/core';
import { AdsPlugin, type AdLifecycleEvent } from '@openplayerjs/ads';

const core = new Core(video, {
  plugins: [
    new AdsPlugin({
      adDelivery: 'ssai',
      ssai: {
        eventSink: (event: AdLifecycleEvent) => {
          switch (event.type) {
            case 'impression':
              sendBeacon('/ads/impression', { breakId: event.breakId, src: event.contentSrc });
              break;
            case 'quartile':
              // event.metadata.quartile: 25 | 50 | 75 | 100
              sendBeacon('/ads/quartile', { breakId: event.breakId, q: event.metadata?.quartile });
              break;
            case 'complete':
              sendBeacon('/ads/complete', { breakId: event.breakId });
              break;
            case 'error':
              console.error('SSAI break error', event.breakId, event.metadata);
              break;
          }
        },
      },
    }),
  ],
});
```

#### Listening via EventBus

Use `core.on()` instead of (or alongside) `eventSink` — e.g. to show/hide an "Ad" badge in the UI:

```ts
core.on('ads:break:start', ({ id }) => showAdBadge());
core.on('ads:break:end', ({ id }) => hideAdBadge());
core.on('ads:quartile', ({ breakId, quartile }) => {
  if (quartile === 50) analytics.track('ssai_midpoint', { breakId });
});
```

#### Parsing raw SCTE-35 data

Use the exported `decodeSplice` helper to inspect splice commands directly in your own TextTrack listener
(e.g. to read custom descriptors or drive logic outside of SSAI mode):

```ts
import { decodeSplice, type SpliceCommand } from '@openplayerjs/ads';

video.textTracks.addEventListener('addtrack', (e) => {
  const track = e.track;
  if (track?.kind !== 'metadata') return;
  track.mode = 'hidden';
  track.addEventListener('cuechange', () => {
    for (const cue of track.activeCues ?? []) {
      const raw = cue as any;
      // ID3 / DataCue path (enableID3MetadataCues)
      if (raw.data instanceof ArrayBuffer) {
        const cmd: SpliceCommand | null = decodeSplice(raw.data);
        if (cmd?.type === 'splice_insert') {
          console.log('splice_insert out=%s dur=%ss', cmd.outOfNetwork, cmd.durationSecs);
        }
      }
      // EXT-X-DATERANGE base64 path (enableDateRangeMetadataCues)
      if (typeof raw.attr?.['X-SCTE35'] === 'string') {
        const cmd = decodeSplice(raw.attr['X-SCTE35']);
        console.log('daterange splice:', cmd);
      }
    }
  });
});
```

> **Note:** No CodePen is provided for SSAI — it requires an HLS stream with embedded SCTE-35 markers
> (e.g. from AWS MediaTailor or Mux). No stable public test stream is available.

### Hybrid — CSAI triggered by SCTE-35

Hybrid mode combines CSAI ad rendering with SCTE-35 cue detection. When the HLS engine fires a splice-out
cue, `resolveScteUrl` maps it to a VAST tag URL and the plugin runs a standard CSAI break inline.
`HybridAdStrategy` extends `CsaiAdStrategy`, so every CSAI option (`breaks`, `requestInterceptor`,
`labels`, `omid`, etc.) is available alongside the two required hybrid fields.

#### Minimal setup

```ts
import { Core } from '@openplayerjs/core';
import { HlsMediaEngine } from '@openplayerjs/hls';
import { AdsPlugin, type ScteOutCue } from '@openplayerjs/ads';

const hlsEngine = new HlsMediaEngine();

const core = new Core(video, {
  plugins: [
    hlsEngine,
    new AdsPlugin({
      adDelivery: 'hybrid',
      hybrid: {
        scteSource: hlsEngine,
        resolveScteUrl: ({ id, plannedDuration }: ScteOutCue) =>
          `https://ads.example.com/vast?id=${id}&dur=${plannedDuration ?? 30}`,
      },
    }),
  ],
});
```

#### Async URL resolution — call your ad decision server

`resolveScteUrl` may return a `Promise`. Return `null` or `undefined` to skip a cue entirely.

```ts
new AdsPlugin({
  adDelivery: 'hybrid',
  hybrid: {
    scteSource: hlsEngine,
    resolveScteUrl: async ({ id, plannedDuration }: ScteOutCue) => {
      // Skip bumpers shorter than 5 s
      if (plannedDuration != null && plannedDuration < 5) return null;

      const params = new URLSearchParams({ breakId: id, dur: String(plannedDuration ?? 30) });
      const { vastUrl } = await fetch(`/ads/decision?${params}`).then((r) => r.json());
      return vastUrl ?? null; // null → skip this break
    },
  },
});
```

#### Preroll + SCTE-triggered midrolls

Add static `breaks` to schedule a CSAI preroll before the stream starts, while SCTE-35 cues drive
midrolls during playback:

```ts
new AdsPlugin({
  adDelivery: 'hybrid',
  hybrid: {
    scteSource: hlsEngine,
    resolveScteUrl: ({ id, plannedDuration }: ScteOutCue) =>
      `https://ads.example.com/vast?id=${id}&dur=${plannedDuration ?? 30}`,
    breaks: [{ at: 'preroll', source: { type: 'VAST', src: 'https://ads.example.com/preroll.xml' } }],
  },
});
```

#### Full configuration — waterfall sources, request interceptor, OMID, UI labels, companions

```ts
import { Core } from '@openplayerjs/core';
import { HlsMediaEngine } from '@openplayerjs/hls';
import { AdsPlugin, type AdLifecycleEvent, type AdTagRequest, type ScteOutCue } from '@openplayerjs/ads';

const hlsEngine = new HlsMediaEngine();

const core = new Core(video, {
  plugins: [
    hlsEngine,
    new AdsPlugin({
      adDelivery: 'hybrid',
      debug: true, // verbose console output

      hybrid: {
        // ── Required ──────────────────────────────────────────────────────────
        scteSource: hlsEngine,
        resolveScteUrl: async ({ id, plannedDuration }: ScteOutCue) => {
          const params = new URLSearchParams({ breakId: id, dur: String(plannedDuration ?? 30) });
          const { vastUrl } = await fetch(`/ads/decision?${params}`).then((r) => r.json());
          return vastUrl ?? null;
        },

        // ── Static breaks (run alongside SCTE-triggered midrolls) ─────────────
        breaks: [
          {
            id: 'bumper-pre', // IDs containing "bumper" are treated as bumpers
            at: 'preroll',
            source: { type: 'VAST', src: 'https://ads.example.com/bumper.xml' },
            once: true, // play only once per page load
          },
          {
            at: 'preroll',
            // Waterfall: try primary ad server, fall back to house ad
            sources: [
              { type: 'VAST', src: 'https://primary-ads.example.com/preroll.xml' },
              { type: 'VAST', src: 'https://house-ads.example.com/preroll.xml' },
            ],
          },
        ],
        adSourcesMode: 'waterfall', // stop at first successful source per break

        // ── Network ───────────────────────────────────────────────────────────
        requestInterceptor: (req: AdTagRequest) => {
          const url = new URL(req.url);
          url.searchParams.set('cust_params', 'env=prod&uid=abc123');
          return { ...req, url: url.toString() };
        },

        // ── UI ────────────────────────────────────────────────────────────────
        mountSelector: '#ad-container',
        companionSelector: '#companion-banner',
        nonLinearSelector: '#nonlinear-overlay',
        labels: {
          skip: 'Skip ad',
          advertisement: 'Advertisement',
          adEnded: 'Ad finished',
        },
        resumeContent: true, // resume content after every non-postroll break (default)
        breakTolerance: 0.5, // seconds of tolerance for midroll cue matching

        // ── Measurement ───────────────────────────────────────────────────────
        omid: { accessMode: 'domain' }, // 'limited' (default) | 'domain'
        eventSink: (event: AdLifecycleEvent) => {
          fetch('/analytics/ads', { method: 'POST', body: JSON.stringify(event) });
        },
      },
    }),
  ],
});
```

> **Note:** No CodePen is provided for Hybrid — it requires an HLS stream carrying SCTE-35 OUT cues.
> Use the existing [CodePen collection](https://codepen.io/collection/kkwgWj) for CSAI examples.

---

## UMD / CDN usage

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@openplayerjs/player@latest/dist/openplayer.css" />
<script src="https://cdn.jsdelivr.net/npm/@openplayerjs/player@latest/dist/openplayer.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@openplayerjs/ads@latest/dist/openplayer-ads.js"></script>
<script>
  const player = new OpenPlayerJS('player', {
    ads: {
      breaks: [{ at: 'preroll', source: { type: 'VAST', src: 'https://example.com/vast.xml' } }],
    },
  });
  player.init();
</script>
```

The ads bundle self-registers as `window.OpenPlayerPlugins.ads` and is discovered automatically on `init()`.

---

## Configuration

### `AdsPluginConfig`

| Option       | Type                           | Default  | Description                                                        |
| ------------ | ------------------------------ | -------- | ------------------------------------------------------------------ |
| `adDelivery` | `'csai' \| 'ssai' \| 'hybrid'` | `'csai'` | Selects the delivery strategy                                      |
| `sources`    | `AdsSource \| AdsSource[]`     | —        | Top-level VAST/VMAP/NONLINEAR sources (shorthand for CSAI)         |
| `debug`      | `boolean`                      | `false`  | Enable verbose ads logging                                         |
| `csai`       | `CsaiAdConfig`                 | —        | CSAI-specific options (takes precedence over flat fields)          |
| `ssai`       | `SsaiAdConfig`                 | —        | SSAI-specific options                                              |
| `hybrid`     | `HybridAdConfig`               | —        | Hybrid-specific options (`scteSource` + `resolveScteUrl` required) |

> **Backward compatibility:** All flat CSAI fields (`breaks`, `interceptPlayForPreroll`, `mountEl`, etc.) are still accepted at the top level. The `csai` sub-object takes precedence when both are present.

### `CsaiAdConfig`

All fields are optional. When provided under `csai`, these override the flat equivalents.

| Option                    | Type                                                          | Default                            | Description                                                                                                              |
| ------------------------- | ------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `breaks`                  | `AdsBreakConfig[]`                                            | `[]`                               | Ad breaks to schedule                                                                                                    |
| `interceptPlayForPreroll` | `boolean`                                                     | auto                               | Intercept the first `play()` to run a preroll. Defaults to `true` when a preroll break or VAST/VMAP source is configured |
| `autoPlayOnReady`         | `boolean`                                                     | `false`                            | Play ads immediately when the plugin is ready, without waiting for a play gesture                                        |
| `mountEl`                 | `HTMLElement`                                                 | —                                  | Container element for the ad overlay                                                                                     |
| `mountSelector`           | `string`                                                      | —                                  | CSS selector for the ad overlay container (used when `mountEl` is not provided)                                          |
| `resumeContent`           | `boolean`                                                     | `true`                             | Resume content playback after a non-postroll break ends                                                                  |
| `preferredMediaTypes`     | `string[]`                                                    | `['video/mp4', 'video/webm', ...]` | Ordered list of media MIME types for selecting the best ad media file                                                    |
| `breakTolerance`          | `number`                                                      | `0.25`                             | Seconds of tolerance when matching a midroll cue point to the current time                                               |
| `adSourcesMode`           | `'waterfall' \| 'playlist'`                                   | `'waterfall'`                      | How multiple sources in a break are handled. See below                                                                   |
| `omid`                    | `OmidConfig`                                                  | `{}`                               | OMID access mode (`'limited'` or `'domain'`)                                                                             |
| `labels`                  | `{ skip?, advertisement?, adEnded? }`                         | —                                  | Custom text for the skip button and ad labels                                                                            |
| `requestInterceptor`      | `(req: AdTagRequest) => AdTagRequest \| null \| Promise<...>` | —                                  | Called before every ad tag fetch; return `null` to suppress the request                                                  |
| `eventSink`               | `(event: AdLifecycleEvent) => void`                           | —                                  | Receives structured lifecycle events (`request`, `impression`, `quartile`, `complete`, `skip`, `error`)                  |

### `SsaiAdConfig`

| Option      | Type                                | Description                          |
| ----------- | ----------------------------------- | ------------------------------------ |
| `eventSink` | `(event: AdLifecycleEvent) => void` | Receives SSAI break lifecycle events |

### `HybridAdConfig`

Extends `CsaiAdConfig` with two required fields:

| Option           | Type                                                               | Description                                                                                                                        |
| ---------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `scteSource`     | `ScteSource`                                                       | Duck-typed reference to an engine that fires SCTE-35 cues (e.g. `HlsMediaEngine`). Must expose `onCue?: (cue: ScteOutCue) => void` |
| `resolveScteUrl` | `(cue: ScteOutCue) => string \| null \| undefined \| Promise<...>` | Maps a SCTE-35 OUT cue to a VAST tag URL. Return `null` or `undefined` to skip the cue                                             |

### `AdsBreakConfig`

| Field     | Type                                | Description                                                                                        |
| --------- | ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| `at`      | `'preroll' \| 'postroll' \| number` | When to play the break. Numbers are seconds from content start                                     |
| `source`  | `AdsSource`                         | Single VAST/VMAP/NONLINEAR source                                                                  |
| `sources` | `AdsSource[]`                       | Multiple sources (used with `adSourcesMode`)                                                       |
| `id`      | `string`                            | Optional break ID. Breaks whose `id` contains `"bumper"` (case-insensitive) are treated as bumpers |
| `once`    | `boolean`                           | Play this break only once per page load                                                            |

### `AdsSource`

```ts
type AdsSource = {
  type: 'VAST' | 'VMAP' | 'NONLINEAR';
  src: string; // URL or inline XML
};
```

### `adSourcesMode` explained

- **`'waterfall'`** (default): A single `AdsBreakConfig` has a `sources` array. The plugin tries each source in order and stops at the first success. Use this for ad tag fallbacks.
- **`'playlist'`**: One `AdsBreakConfig` per source; each plays as a separate sequential break. Use this for pre-defined ad pods.

---

## Public API

### `AdsPlugin` methods

| Method                | Signature                                                    | Description                                                                          |
| --------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `setup`               | `setup(ctx: PluginContext): void`                            | Called by the plugin registry — not for direct use                                   |
| `playAds`             | `playAds(url: string): Promise<boolean>`                     | Trigger a one-off ad break from a VAST URL. Returns `true` if at least one ad played |
| `playAdsFromXml`      | `playAdsFromXml(xml: string): Promise<boolean>`              | Trigger a one-off break from inline VAST XML                                         |
| `requestSkip`         | `requestSkip(reason?: 'button' \| 'close' \| 'api'): void`   | Skip the currently playing ad                                                        |
| `getDueMidrollBreaks` | `getDueMidrollBreaks(t: number): AdsBreakConfig[]`           | Return all midroll breaks at or before `t` seconds                                   |
| `getDueMidrollBreak`  | `getDueMidrollBreak(t: number): AdsBreakConfig \| undefined` | Return the earliest unplayed midroll break at or before `t`                          |
| `destroy`             | `destroy(): void`                                            | Release all subscriptions and DOM state                                              |

### `installAds(Core)` and `extendAds(core, plugin)`

Two helpers expose `core.ads` and `core.playAds()` for UMD / imperative usage:

```ts
import { installAds, extendAds } from '@openplayerjs/ads';
import { Core } from '@openplayerjs/core';

// Adds Core.prototype.ads getter and Core.prototype.playAds() once.
installAds(Core);

// Wires a specific plugin instance to a player instance.
extendAds(core, adsPlugin);

// Now available on the instance:
core.playAds('https://example.com/vast.xml');
core.playAds('<VAST version="3.0">...</VAST>'); // XML is detected automatically
```

### Manual ad playback

```ts
// From a VAST URL:
const played = await adsPlugin.playAds('https://example.com/vast.xml');

// From inline VAST XML:
const played = await adsPlugin.playAdsFromXml('<VAST version="3.0">...</VAST>');

// Skip the current ad programmatically:
adsPlugin.requestSkip('api');
```

---

## Events

All events are prefixed with `ads:`. Listen with `ctx.events.on(...)` or via `core.on(...)`.

| Event                 | Payload                            | When it fires                            |
| --------------------- | ---------------------------------- | ---------------------------------------- |
| `ads:requested`       | `{ url, at, id }`                  | An ad tag request was sent               |
| `ads:loaded`          | `{ break, count }`                 | VAST/VMAP was parsed and ads are ready   |
| `ads:break:start`     | `{ id, kind, at }`                 | An ad break is starting; content pauses  |
| `ads:break:end`       | `{ id, kind, at }`                 | An ad break finished; content resumes    |
| `ads:ad:start`        | `{ break, index }`                 | An individual ad started                 |
| `ads:ad:end`          | `{ break, index }`                 | An individual ad finished                |
| `ads:impression`      | `{ break, index }`                 | Ad impression recorded (once per ad)     |
| `ads:quartile`        | `{ break, quartile }`              | Playback reached 25 / 50 / 75 / 100 %    |
| `ads:timeupdate`      | `{ break, currentTime, duration }` | Ad time updated                          |
| `ads:duration`        | `{ break, duration }`              | Ad total duration became known           |
| `ads:skip`            | `{ break, reason }`                | Ad was skipped                           |
| `ads:clickthrough`    | `{ break, url }`                   | User clicked the ad                      |
| `ads:pause`           | `{ break }`                        | Ad was paused                            |
| `ads:resume`          | `{ break }`                        | Paused ad was resumed                    |
| `ads:mute`            | `{ break }`                        | Ad was muted                             |
| `ads:unmute`          | `{ break }`                        | Ad was unmuted                           |
| `ads:volumeChange`    | `{ break, volume, muted }`         | Volume changed during ad                 |
| `ads:allAdsCompleted` | `{ break }`                        | All scheduled breaks have finished       |
| `ads:error`           | `{ reason, error?, url? }`         | Error during request, parse, or playback |

### Listening to events

```ts
core.on('ads:break:start', ({ kind, at }) => {
  console.log(`Ad break "${kind}" at ${at}s starting`);
});

core.on('ads:break:end', () => {
  console.log('Ad break finished, content resuming');
});

core.on('ads:quartile', ({ quartile }) => {
  if (quartile === 50) console.log('Reached ad midpoint');
});

core.on('ads:error', ({ reason, error }) => {
  console.warn('Ad error:', reason, error);
  // Content playback resumes automatically
});
```

### `AdLifecycleEvent` (structured sink)

For server-side or analytics use, provide `eventSink` in the config:

```ts
new AdsPlugin({
  csai: {
    eventSink: (event) => {
      // event.type: 'request' | 'impression' | 'quartile' | 'complete' | 'skip' | 'error'
      // event.adId, event.breakId, event.contentSrc, event.elapsedSec, event.metadata
      fetch('/analytics', { method: 'POST', body: JSON.stringify(event) });
    },
  },
});
```

---

## Ad source modes — waterfall vs playlist

### Waterfall (default)

Try sources in order, stop at the first success:

```ts
new AdsPlugin({
  adSourcesMode: 'waterfall',
  breaks: [
    {
      at: 'preroll',
      sources: [
        { type: 'VAST', src: 'https://primary-ad-server.com/vast.xml' },
        { type: 'VAST', src: 'https://backup-ad-server.com/vast.xml' },
        { type: 'VAST', src: 'https://house-ad.com/vast.xml' },
      ],
    },
  ],
});
```

### Playlist

Play each source as its own sequential break:

```ts
new AdsPlugin({
  adSourcesMode: 'playlist',
  breaks: [
    { at: 'preroll', source: { type: 'VAST', src: 'https://ads.example.com/ad1.xml' } },
    { at: 'preroll', source: { type: 'VAST', src: 'https://ads.example.com/ad2.xml' } },
  ],
});
```

---

## `requestInterceptor` — modify or suppress ad tag requests

```ts
new AdsPlugin({
  csai: {
    requestInterceptor: async (req) => {
      // Add targeting parameters to every ad request.
      const url = new URL(req.url);
      url.searchParams.set('cust_params', 'section=sports&user_id=abc123');
      return { ...req, url: url.toString() };
    },
  },
});

// Return null to suppress a specific request:
new AdsPlugin({
  csai: {
    requestInterceptor: (req) => {
      if (req.adType === 'vmap') return null; // Skip VMAP fetches
      return req;
    },
  },
});
```

---

## SIMID 1.2 — Interactive Ad Creatives

[SIMID](https://iabtechlab.com/standards/simid/) allows VAST creatives to render interactive overlays in an iframe alongside the ad video.

When a VAST response includes `<InteractiveCreativeFile apiFramework="SIMID">`, the plugin automatically:

1. Mounts the creative URL in a sandboxed `<iframe>` over the ad video.
2. Completes the SIMID 1.2 handshake (`createSession` → `SIMID:Player:init` → `SIMID:Player:startCreative`).
3. Keeps the creative in sync with playback (progress, pause, resume, volume, skip, stop).
4. Handles creative-initiated actions: skip, stop, click-through, fullscreen, tracking events.

No configuration is required — SIMID is detected and managed automatically.

The iframe is sandboxed with `allow-scripts allow-same-origin allow-forms allow-popups`.

### Testing SIMID ads

```ts
new AdsPlugin({
  sources: [
    {
      type: 'VAST',
      src: `https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/simid&sz=640x480&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&correlator=${Date.now()}`,
    },
  ],
});
```

---

## OMID — Open Measurement

[OMID](https://iabtechlab.com/standards/open-measurement-sdk/) enables third-party viewability and verification measurement.

### Setup

Load the IAB OMID Session Client SDK before the player:

```html
<script src="https://iab-mm-omid.com/omweb-v1.js"></script>
```

The plugin detects `window.OmidSessionClient` at runtime. If absent, OMID silently no-ops.

### How it works

When the VAST response contains `<AdVerifications>`, the plugin injects the verification scripts and fires the required OMID lifecycle events automatically (`impression`, `loaded`, `start`, `firstQuartile`, `midpoint`, `thirdQuartile`, `complete`, `pause`, `resume`, `skipped`, `volumeChange`, `playerStateChange`).

### Access mode

```ts
new AdsPlugin({
  csai: {
    omid: { accessMode: 'domain' }, // 'limited' (default) | 'domain'
  },
  sources: [{ type: 'VAST', src: '...' }],
});
```

---

## Architecture

`AdsPlugin` is a thin dispatcher. On `setup()` it selects the appropriate strategy:

```
AdsPlugin.setup()
  ├── adDelivery === 'ssai'   → new SsaiAdStrategy()
  ├── adDelivery === 'hybrid' → new HybridAdStrategy()   (extends CsaiAdStrategy)
  └── default ('csai')        → new CsaiAdStrategy()
```

Each strategy implements `AdSessionStrategy`:

```ts
type AdSessionStrategy = {
  readonly mode: AdDeliveryMode;
  init(ctx: PluginContext, config: AdsPluginConfig): void;
  destroy(): void;
  playAds?(url: string): Promise<boolean>;
  getDueMidrollBreaks?(t: number): AdsBreakConfig[];
  getDueMidrollBreak?(t: number): AdsBreakConfig | undefined;
  requestSkip?(reason?: 'button' | 'close' | 'api'): void;
};
```

All public methods on `AdsPlugin` delegate to the active strategy, so you can swap delivery modes without changing call sites.

---

## Dependencies

| Package                    | Type    | Required version |
| -------------------------- | ------- | ---------------- |
| `@openplayerjs/core`       | peer    | `>=3.0.0`        |
| `@dailymotion/vast-client` | bundled | `>=6.0.0`        |
| `@dailymotion/vmap`        | bundled | `>=3.0.0`        |

---

## Compatibility with iframe engines (YouTube, Vimeo, etc.)

`AdsPlugin` is designed for native `<video>`/`<audio>` content. Several gaps exist when used alongside iframe-based engines — ads + YouTube is not a supported combination yet:

- **`media.duration`**: midroll cue-point logic reads the native `<video>` duration directly, which is `NaN` for iframe engines.
- **`media.currentTime`**: preroll guards check native `currentTime`, which is always `0` for iframe engines.
- **`timeupdate` listener**: `bindBreakScheduler()` listens on the native DOM element, which never fires for iframe engines.
- **`play` capture listener**: `bindPrerollInterceptors()` uses a capture-phase listener on the native element that is never triggered for iframe engines.

---

## Code samples

Ready-to-run examples covering preroll, midroll, postroll, waterfall sources, VMAP, SSAI, and non-linear ads are available in the CodePen collection:

CodePen Collection: [https://codepen.io/collection/kkwgWj](https://codepen.io/collection/kkwgWj)

---

## License

MIT — see [LICENSE](../../LICENSE).
