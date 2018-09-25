# OpenPlayer.js
[![Greenkeeper badge](https://badges.greenkeeper.io/openplayerjs/openplayerjs.svg)](https://greenkeeper.io/)   [![Build Status](https://travis-ci.org/openplayerjs/openplayerjs.svg?branch=master)](https://travis-ci.org/openplayerjs/openplayerjs)  [![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

**********************************************************************************
 **Help OpenPlayer to reach the first thousand stars to be hosted in a CDN!**
 
 *Help us staring the project and help the project to reach more and more people.*
**********************************************************************************

## What is it?

This awesome player mimics the HTML5 video/audio methods/events/properties, and integrates the most popular libraries to play different types of native media, such as MP4/MP3, HLS and M(PEG)-DASH.

It also has the ability to play VMAP, VAST and VPAID Ads in an effortless way!

## Why OpenPlayer?

* **Less than `20KB`** when gzipped.
* **Monetize video and audio content** with video advertising (VAST/VPAID/VMAP) using [Interactive Media Ads SDK](https://developers.google.com/interactive-media-ads/) (IMA SDK) library.
* **Simplified markup** and **highly customizable CSS** (even specific styling for high contrast mode). See https://developer.paciellogroup.com/blog/2010/01/high-contrast-proof-css-sprites/ for more details.
* IMA SDK, [hls.js](https://github.com/video-dev/hls.js/) and [dash.js](https://github.com/Dash-Industry-Forum/dash.js/) use **ever-green scripts** from their recommended CDN sources to always obtain the latest upgrades.
* **Smart `autoplay`** by detecting browser's capabilities.
* **Responsive** by default, for both video/audio tags.
* A new **`fill`** mode to scale and crop media relative to its parent container.
* Support for **local and remote captions** for **both video and audio**, even without including the `crossorigin` attribute.
* **No dependencies**, since this player is written in Typescript.
* **Supports IE11+ and all modern browsers**.

## How to use it?

### Obtain the files

The `dist` folder contains the files you will need yo use this awesome library. To obtain it, you can use one of the following methods:

#### Direct download
Download the repository from `https://github.com/openplayerjs/openplayerjs.git`

#### NPM
```
npm install openplayer
```

### HTML

Include the OpenPlayer stylesheet inside the `<head>` tag, and the script at the bottom of the `<body>` tag (both of them located in the `dist` folder). The bundles will contain both minified and uncompressed files, so use the one that fits the best your needs.

#### Stylesheet

```html
<link rel="stylesheet" href="/path/to/openplayer.css">
```

#### Script

```html
<script src="/path/to/openplayer.js"></script>
```

If you plan to use the library in a Node project:

```javascript
// Using as module
var openplayer = require('/path/to/openplayer');

// Importing library
import OpenPlayer from 'openplayer';
```

### Minimal example

Since this player uses HTML5 markup, all the attributes for video/audio tags are available. The only 3 requirements to invoke the player are:

* A valid media source (such as MP4, MP3, HLS, M(PEG)-DASH).
* `controls` and `playsinline` properties (to give cross-browser support).
* The `om-player om-player__media` class names to invoke the player.

That's it!

```html
<video class="om-player om-player__media" controls playsinline>
    <source src="/path/to/video.mp4" type="video/mp4">
</video>
```

### A more complex example

There are other elements that can be included, such as Captions and multiple sources. Also, the `data-om-*` attributes can be used to enhance Ads or the `fill` mode.

```html
<video class="om-player om-player__media" poster="/path/to/poster.jpg" controls playsinline
    autoplay muted data-om-ads="[valid VAST/VPAID URL]" data-om-fill="[true|false]">
    <source src="/path/to/video.m3u8" type="application/x-mpegURL">
    <source src="/path/to/video.mp4" type="video/mp4">
    <track label="English" kind="subtitles" srclang="en" src="/path/to/captions.vtt" default>
</video>
```

In the example above, the player will:

1. Play muted Ads, followed by the first playable media source, depending of browser's capabilities.
2. Make media item fit its parent container.
3. Display Captions during media playback (it will hide them when Ads are played).

### Using Javascript

Sometimes you need more flexibility instantiating the player (for example, adding cache busting to the VAST/VPAID URL, or even having a list of Ads URLs). So for that case, remove the `om-player` class from the video/audio tag (just leave `om-player__media` to preserve styles), and in Javascript use the following snippet:

```javascript
var player = new OpenPlayer('[player ID]', [valid VAST/VPAID URL|List of VAST/VPAID URLs], [`true|false` for fullscreen effect by default], {
    ads: {
        // Custom path/URL to IMA SDK
        url,
        // If set to `true`, load `ima3_debug.js` file for debugging purposes
        debug
    },
    hls: {
        // all HLS options available at https://github.com/video-dev/hls.js/blob/master/docs/API.md#fine-tuning.
    },
    dash: {
        // Possible values are SW_SECURE_CRYPTO, SW_SECURE_DECODE, HW_SECURE_CRYPTO, HW_SECURE_CRYPTO,
        // HW_SECURE_DECODE, HW_SECURE_ALL
        robustnessLevel,
        // object containing property names corresponding to key system name strings (e.g. "org.w3.clearkey") and
        // associated values being instances of ProtectionData
        // (http://vm2.dashif.org/dash.js/docs/jsdocs/MediaPlayer.vo.protection.ProtectionData.html)
        drm
    },
});
// Don't forget to start the player
player.init();
```

**NOTE**: Only caveat here is that the video/audio tags need an ID ahead of time.

## API

If you need more control over the player, OpenPlayer stores instances of each player in the document. To have access to a specific instance, use video/audio's `id` and use `OpenPlayer.instances` element.

**NOTE**: if an `id` attribute is not detected, OpenPlayer will autogenerate one.

```javascript
// Selects the first video/audio that uses OpenPlayer
var id = document.querySelector('.om-player').id;
var player = OpenPlayer.instances[id];
```

The methods supported by the OpenPlayer instance are:

Method | Description
--- | ---
`play` | Play media. If Ads are detected, different methods than the native ones are triggered with this operation.
`pause` | Pause media. If Ads are detected, different methods than the native ones are triggered with this operation.
`load` | Load media. HLS and M(PEG)-DASH perform more operations during loading if browser does not support them natively.
`addCaptions` | Append a new `<track>` tag to the video/audio tag and dispatch event so it gets registered/loaded in the player, via `controlschanged` event.
`destroy` | Destroy OpenMedia Player instance (including all events associated) and return the `video/audio` tag to its original state.
`getAd` | Retrieve an instance of the `Ads` object.
`getMedia` | Retrieve an instance of the `Media` object.
`activeElement` | Retrieve the current media object (could be `Ads` or any other media type).
`getContainer` | Retrieve the parent element (with `om-player` class) of the native video/audio tag.
`getControls` | Retrieve an instance of the controls object used in the player instance.
`getElement` | Retrieve the original video/audio tag.
`getEvents` | Retrieve the events attached to the player.
`init` | Create all the markup and events needed for the player.
`isAd` | Check if current media is an instance of an `Ad`.
`isMedia` | Check if current media is an instance of a native media type.
`id` | Retrieve current player's unique identifier.
`src` | Retrieve/set the current Source list associated with the player.

### Events

Since OpenPlayer is based on HTML5 media, the way to trigger events is using the video/audio tag. 

Using the code above, you can attach/dispatch any valid event, using [`CustomEvent`](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent), like this:

```javascript
player.getElement().addEventListener('ended', function() {
    console.log('Your code when media ends playing');
});

var event = new CustomEvent('ended');
player.getElement().dispatchEvent(event);
```

All [HTML5 media events](https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events) are supported by OpenPlayer, and it incorporates some custom ones, mostly related to Ads:

Event | Description
--- | ---
`controlshidden` | Event executed when controls timer stops and hides control bar (video only).
`controlschanged` | Event triggered when an element modified the state of the controls and they regenerate (i.e., adding new caption).
`captionschanged` | Event triggered when user changes the current caption by selecting a new one from the `Settings` menu.
`adsloaded` | Event when Ads have been loaded successfully and can be played.
`adsstart` | Event when Ads start being played.
`adsfirstquartile` | Event triggered when Ad reached the first quarter of its length.
`adsmidpoint` | Event triggered when Ad reached half of its length.
`adsthirdquartile` | Event triggered when Ad reached the third quarter of its length.
`adscomplete` | Event triggered when Ad reached the end of its length.
`adsskipped` | Event triggered when user skips the Ad.
`adsvolumeChange` | Event triggered when user increases/decreases the volume of Ad.
`adsallAdsCompleted` | Event triggered when all Ads have been played.
`adsmediaended` | Event executed when an Ad is going to be played after media has ended playing (currently used to change the Replay icon to Pause when playing a postroll Ad).

In addition to the list above, [HLS events](https://github.com/video-dev/hls.js/blob/master/docs/API.md#runtime-events) and [HLS error events](https://github.com/video-dev/hls.js/blob/master/docs/API.md#errors) are being supported by OpenPlayer, including all their details. For the error ones, they are classified as `networkError`, `mediaError`, `muxError` and `otherError`.

## Contributions

Make sure you check [Conventional Commits Standards](https://conventionalcommits.org/) for commit guidelines.
