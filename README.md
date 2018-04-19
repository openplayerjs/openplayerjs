# OpenPlayer.js

[![Greenkeeper badge](https://badges.greenkeeper.io/rafa8626/openplayer.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/rafa8626/openplayer.svg?branch=master)](https://travis-ci.org/rafa8626/openplayer)

## What is it?

Inspired by [MediaElementJS](http://mediaelementjs.com) and [Plyr](https://plyr.io/), this player mimics the HTML5 video/audio methods/events/properties, and integrates the most popular libraries to play different types of native media, such as MP4/MP3, HLS and M(PEG)-DASH.

## Why OpenPlayer?

* **Less than `20KB`** using gzip compression and minification.
* **Monetize video and audio content** with video advertising using [Interactive Media Ads SDK](https://developers.google.com/interactive-media-ads/) (IMA) library.
* **Simplified markup** and **highly customizable CSS** (even specific styling for high contrast mode). See https://developer.paciellogroup.com/blog/2010/01/high-contrast-proof-css-sprites/ for more details.
* IMA SDK, [hls.js](https://github.com/video-dev/hls.js/) and [dash.js](https://github.com/Dash-Industry-Forum/dash.js/) use **ever-green scripts** from their recommended CDN sources to always obtain the latest upgrades.
* **Smart `autoplay`** by detecting browser's capabilities.
* **Responsive** by default, for both video/audio tags.
* A new **`fill`** mode to scale and crop media relative to its parent container.
* Support for **local and remote captions**, even without including the `crossorigin` attribute. 
* Captions **in audio tag**!.
* **No dependencies**, since this player is written in Typescript.
* **Auto injects polyfills** using [Polyfill.io library](https://polyfill.io/v2/docs/examples).
* **Supports IE11+ and all modern browsers**.

## How to use it?

### Obtain the files

Currently, no `dist` folder or CDN reference is available. With the following steps, the `dist` folder and the bundles will be generated:

```
git clone https://github.com/rafa8626/openplayer.git
cd openplayer
npm install
npm run build
```

### HTML

Include the OpenPlayer stylesheet inside the `<head>` tag, and the script at the bottom of the `<body>` tag. The bundles will contain both minified and uncompressed files, so use the one that fits the best your needs.

#### Stylesheet

```html
<link rel="stylesheet" href="/path/to/om_player.css">
```

#### Script

```html
<script src="/path/to/om_player.js"></script>
```

### Minimal example

Since this player uses HTML5 markup, all the attributes for video/audio tags are available. The only 3 requirements to invoke the player are:

* A valid media source (such as MP4, MP3, HLS, M(PEG)-DASH).
* `controls` and `playsinline` properties (to use the player in iPhone).
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

## API

If you need more control over the player, OpenPlayer stores instances of each player in the document. To have access to a specific instance, use video/audio's `id` and use `OpenPlayer.instances` element.

**NOTE**: if an `id` attribute is not detected, OpenPlayer will autogenerate one.

```javascript
// Selects the first video/audio that uses OpenPlayer
// The above code works for video/audio tags with no `ID` attribute.
var id = document.querySelector('.om-player').id;
var player = OpenPlayer.instances[id];
```

The methods supported by the OpenPlayer instance are:

--- | ---
play | xx

### Events

Since OpenPlayer is based on HTML5 media, the way to trigger events is using the video/audio tag. Using the code above, you can attach/dispatch any valid event, using [`CustomEvent`](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent), like this:

```javascript
player.element.addEventListener('ended', function() {
    console.log('Your code when media ends playing');
});

var event = new CustomEvent('ended');
player.element.dispatchEvent(event);
```

The custom events supported by the OpenPlayer instance are:

--- | ---
controlshidden | xx
controlschanged | xx
adsended | xx