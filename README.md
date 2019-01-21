![openplayer](https://user-images.githubusercontent.com/910829/46182430-d4c0f380-c299-11e8-89a8-c7554a70b66c.png)

# [OpenPlayer.js](https://www.openplayerjs.com)

[![NPM](https://nodei.co/npm/openplayerjs.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/openplayerjs/)
<br>
[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=Try%20the%20best%20open%20source%20player%20and%20give%20it%20a%20star&url=https://www.openplayerjs.com&hashtags=openplayerjs,vast,vpaid,rocks,streaming)
[![JSDelivr](https://data.jsdelivr.com/v1/package/npm/openplayerjs/badge)](https://www.jsdelivr.com/package/npm/openplayerjs)
[![Greenkeeper badge](https://badges.greenkeeper.io/openplayerjs/openplayerjs.svg)](https://greenkeeper.io/)   [![Build Status](https://travis-ci.org/openplayerjs/openplayerjs.svg?branch=master)](https://travis-ci.org/openplayerjs/openplayerjs)  [![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

This awesome player mimics the HTML5 video/audio methods/events/properties, and integrates the most popular libraries to play different types of native media, such as MP4/MP3, HLS and M(PEG)-DASH.

It also has the ability to play VMAP, VAST and VPAID Ads in an effortless way!

## Advantages of using OpenPlayerJS

* **Supports IE11+ (Win8) and all modern browsers**: its CSS and code is compatible with all modern browsers. IE11+ on Win7 requires an MP4/MP3 fallback to work correctly.
* **Lightweight library**: Less than `20kb` when gzipped.
* **Monetize video and audio content** with video advertising using VAST, VPAID or VMAP Ads, supported by the amazing [Interactive Media Ads SDK](https://developers.google.com/interactive-media-ads/) (IMA SDK) library.
* **Accessibility is a priority for OpenPlayerJS**: You can even create specific styling for high contrast mode, and support visually impaired people and improve accessibility. See https://developer.paciellogroup.com/blog/2010/01/high-contrast-proof-css-sprites/ for more details.
* **Always up-to-date**: Relying on services like Greenkeeper, OpenPlayer uses the latest and greatest versions of the packages to ensure it is always updated; also, IMA SDK, [hls.js](https://github.com/video-dev/hls.js/) and [dash.js](https://github.com/Dash-Industry-Forum/dash.js/) use **even-green paths** from their recommended CDN sources to they will be always providing the latest upgrades for OpenPlayerJS.
* **Smart `autoplay`**: Special algorithm to detect browser's autoplay capabilities.
* **Responsive**: Always adapts to the screen size (and resize) by default, for both video/audio tags; a new **`fill`** mode is also included to scale and crop media relative to its parent container.
* Support for **local and remote captions** for **both video and audio**, even without including the `crossorigin` attribute.
* **No dependencies**, since this player is written in Typescript.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

The `dist` folder contains the files you will need yo use this awesome library. To obtain it, you can download the repository from `https://github.com/openplayerjs/openplayerjs.git` or use NPM to get it:

```
npm install openplayerjs
```

CDN is also available for better performance. See next section for more details.

### Installation

Include OpenPlayer's stylesheet inside the `<head>` tag, and the script at the bottom of the `<body>` tag (both of them located in the `dist` folder). The bundles will contain both minified and uncompressed files, so use the one that fits the best your needs.

Since this player uses HTML5 markup, all the attributes for video/audio tags are available. The only 3 requirements to invoke the player are:

* A valid media source, such as MP4, MP3, HLS, M(PEG)-DASH.
* The `controls` and `playsinline` attributes to provide cross-browser support.
* The `op-player op-player__media` class names to invoke the player.

That's it!

```html
<html>
    <head>
        <link rel="stylesheet" href="/path/to/openplayer.css">
    </head>
    <body>
        <video class="op-player op-player__media" controls playsinline>
            <source src="/path/to/video.mp4" type="video/mp4">
        </video>
        <script src="/path/to/openplayer.js"></script>
    </body>
</html>
```

We encourage to use CDN for major performance. To do it, in the snippet above, replace `/path/to/openplayer.css` and `/path/to/openplayer.js` with `https://cdn.jsdelivr.net/npm/openplayerjs@[version]/dist/openplayer.min.css` and `https://cdn.jsdelivr.net/npm/openplayerjs@[version]/dist/openplayer.min.js`.

**NOTE**: As stated at [jsDeliver website](https://www.jsdelivr.com/), it is recommended to use a `[version]` number in the URL rather than `@latest` for production.

If you are planning to use OpenPlayer in a Node project, you can:

```javascript
// Using as module
var openplayer = require('/path/to/openplayerjs');

// or importing the library (ES6)
import OpenPlayer from 'openplayerjs';
```

## Usage with Javascript

Sometimes you need more flexibility instantiating the player (for example, adding cache busting to the VAST/VPAID URL, or even having a list of Ads URLs). So for that case, remove the `op-player` class from the video/audio tag (just leave `op-player__media` to preserve styles), and in Javascript use the following snippet:

```javascript
var player = new OpenPlayer('[player ID]', [valid VAST/VPAID URL|List of VAST/VPAID URLs], [`true|false` for fullscreen effect by default], {
    // Number of ms that takes the player to hide the Play button once it starts playing (video only)
    // (bt default, `350`)
    hidePlayBtnTimer,
    // Number of seconds to rewind/forward media
    // (by default, player will rewind/forward 5% of the total duration of media)
    step,
    // Initial volume of media in decimal numbers (by default, `1`)
    startVolume,
    // Initial play time of media in seconds (by default, `0`)
    startTime,
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
var id = document.querySelector('.op-player').id;
var player = OpenPlayer.instances[id];
```

The methods supported by the OpenPlayer instance are:

Method | Description
--- | ---
`play` | Play media. If Ads are detected, different methods than the native ones are triggered with this operation.
`pause` | Pause media. If Ads are detected, different methods than the native ones are triggered with this operation.
`load` | Load media. HLS and M(PEG)-DASH perform more operations during loading if browser does not support them natively.
`addCaptions` | Append a new `<track>` tag to the video/audio tag and dispatch event so it gets registered/loaded in the player, via `controlschanged` event.
`addControl` | Append a new button to the video/audio tag with the possibility dispatch a custom callback so it gets registered/loaded in the player, via `controlschanged` event. It requires an object with `icon` URL/path, `title` for the button, the `position` (`right` or `left`) of the button and a `click` callback to dispatch an action.
`destroy` | Destroy OpenMedia Player instance (including all events associated) and return the `video/audio` tag to its original state.
`getAd` | Retrieve an instance of the `Ads` object.
`getMedia` | Retrieve an instance of the `Media` object.
`activeElement` | Retrieve the current media object (could be `Ads` or any other media type).
`getContainer` | Retrieve the parent element (with `op-player` class) of the native video/audio tag.
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
`playerdestroyed` | Event executed when an instance of OpenPlayer is destroyed (useful to remove extra elements created with the player's help).
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

## Examples

1. [No configuration (only using classes)](https://codepen.io/rafa8626/pen/WaNxNB)
2. [Minimal configuration](https://codepen.io/rafa8626/pen/BqazxX)
4. [Using Ads](https://codepen.io/rafa8626/pen/vVYKav)
5. [Playing HLS streaming](https://codepen.io/rafa8626/pen/QZWEVy)
6. [M(PEG)-DASH with Ads](https://codepen.io/rafa8626/pen/Xxjmra)

## Built With

* [Typescript](https://www.typescriptlang.org/docs/home.html) - The Javascript for Pros.

## Contributing

Make sure you check [Conventional Commits Standards](https://conventionalcommits.org/) for commit guidelines.

## Authors

* **Rafael Miranda** - *Initial work* - [rafa8626](https://github.com/rafa8626)

See also the list of [contributors](https://github.com/openplayerjs/openplayerjs/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.