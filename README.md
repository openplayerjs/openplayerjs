# [OpenPlayer.js](https://www.openplayerjs.com)

![openplayer](https://user-images.githubusercontent.com/910829/46182430-d4c0f380-c299-11e8-89a8-c7554a70b66c.png)

[![NPM](https://nodei.co/npm/openplayerjs.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/openplayerjs/)

[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=Try%20the%20best%20open%20source%20player%20and%20give%20it%20a%20star&url=https://www.openplayerjs.com&hashtags=openplayerjs,vast,vpaid,rocks,streaming)
[![JSDelivr](https://data.jsdelivr.com/v1/package/npm/openplayerjs/badge)](https://www.jsdelivr.com/package/npm/openplayerjs)
   [![Build Status](https://travis-ci.org/openplayerjs/openplayerjs.svg?branch=master)](https://travis-ci.org/openplayerjs/openplayerjs)  [![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

This awesome player mimics the HTML5 video/audio methods/events/properties, and integrates the most popular libraries to play different types of native media, such as MP4/MP3, HLS and M(PEG)-DASH.

It also has the ability to play VMAP, VAST and VPAID Ads in an effortless way!

## Advantages of using OpenPlayerJS

* **Supports IE11+ (Win8) and all modern browsers**: its CSS and code is compatible with all modern browsers. IE11+ on Win7 requires an MP4/MP3 fallback to work correctly.
* **Lightweight library**: Less than `20kb` when gzipped.
* **Monetize video and audio content** with video advertising using VAST, VPAID or VMAP Ads, supported by the amazing [Interactive Media Ads SDK](https://developers.google.com/interactive-media-ads/) (IMA SDK) library.
* **Multi Ads**: OpenPlayerJS is **one of the few players that provides the ability to use a single VAST/VPAID source or a VAST/VPAID playlist from several different sources (including URLs and valid XML strings)**. Usually, advertisers take only part of the total traffic of a website. As a result, users view only 10% of the total advertising per day (besides, once the user has seen the Ad, the advertiser's cookie is set, so it will not perform a new request through the server. Therefore, a website benefits when connecting multiple Ads streams.
* **Play Ads indefinitely**: OpenPlayerJS has the ability to set an ad and play it in an infinite loop; this is desired for ads that are in a heavy text page.
* **Enhance player controls**: You can add your own buttons (see example above).
* **Accessibility is a priority**: You can even create specific styling for high contrast mode, and support visually impaired people and improve accessibility. See [High Contrast Proof CSS Sprites](https://developer.paciellogroup.com/blog/2010/01/high-contrast-proof-css-sprites/) for more details.
* **Always up-to-date**: Relying on services like Greenkeeper, OpenPlayer uses the latest and greatest versions of the packages to ensure it is always updated; also, IMA SDK, [hls.js](https://github.com/video-dev/hls.js/) and [dash.js](https://github.com/Dash-Industry-Forum/dash.js/) use **even-green paths** from their recommended CDN sources to they will be always providing the latest upgrades for OpenPlayerJS.
* **Smart autoplay algorithm**: Have you ever worried to know if your browser will autoplay media correctly? Forget about it! With OpenPlayerJS, we run a simple but yet powerful algorithm to check your browser's `autoplay` capabilities.
* **Responsive**: Always adapts to the screen size (and resize) by default, for both video/audio tags; a new **`fill`** mode is also included to scale and crop media relative to its parent container.
* Support for **local and remote captions** for **both video and audio**, even without including the `crossorigin` attribute.
* **No dependencies**, since this player is written in Typescript.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

The `dist` folder contains the files you will need yo use this awesome library. To obtain it, you can download the repository from `https://github.com/openplayerjs/openplayerjs.git` or use NPM to get it:

```node
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

### Adding Closed Captions

OpenPlayer supports the use of VTT closed captions by adding the `track` tag as indicated in the following snippet; you can also use the `default` attribute in the tag, but as a rule of thumb, all the attributes displayed below in the `track` tag **MUST** be there; otherwise, closed captions won't be displayed:

```html
<html>
    <head>
        <link rel="stylesheet" href="/path/to/openplayer.css">
    </head>
    <body>
        <video class="op-player op-player__media" controls playsinline>
            <source src="/path/to/video.mp4" type="video/mp4">
            <track kind="subtitles" src="/path/to/video.vtt" srclang="en" label="English">
        </video>
        <script src="/path/to/openplayer.js"></script>
    </body>
</html>
```

## Usage with Javascript

Sometimes you need more flexibility instantiating the player (for example, adding cache busting to the VAST/VPAID URL, or even having a list of Ads URLs). So for that case, remove the `op-player` class from the video/audio tag (just leave `op-player__media` to preserve styles), and in Javascript use the following snippet:

```javascript
var player = new OpenPlayer('[player ID]', [valid VAST/VPAID URL|List of VAST/VPAID URLs], [`true|false` for fullscreen effect by default], {
    // Controls configuration by default; `levels` can be added as well since it's an optional feature;
    // Each one of the items will have in their class name the `op-control__[left|middle|right]` according
    // to the controls' structure listed below
    controls: {
        left: ['play', 'time', 'volume'],
        middle: ['progress'],
        right: ['captions', 'settings', 'fullscreen'],
    },
    // Allow items to be contained in a different space outside of `Settings`
    detachMenus,
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
    // Allow progress bar to be displayed when using live streamings (by default, `false`)
    showLiveProgress,
    // Allow loader to be displayed when loading video (by default, `false`)
    showLoaderOnInit,
    // Callback to be executed once an error is found (default, `console.error`)
    // Params passed: Custom event with `detail: { type: 'HTML5|Ads|M(PEG)-DASH|HLS', message, data },`
    onError,
    ads: {
        // Custom path/URL to IMA SDK
        url,
        // If set to `true`, load `ima3_debug.js` file for debugging purposes
        debug,
        // If set to `true`, play infintely an Ad
        loop,
        // If set to `false`, allows the user to overwrite the default mechanism to skip Ads
        autoPlayAdBreaks,
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
        drm,
    },
});
// Don't forget to start the player
player.init();
```

**NOTE**: Only caveat here is that the video/audio tags need an ID ahead of time.

## Usage with Next.js/React

Using OpenPlayerJS with React and Next.js is pretty straightforward, as you can see in the example below.

```javascript
import React, { useEffect } from 'react';
import OpenPlayer from 'openplayerjs';

export default function Sample() {
    useEffect(() => {
        const player = new OpenPlayer('player');
        player.init();
    }, []);

    return (
        <div>
            <video id='player' className='op-player__media' controls playsInline>
                <source src='https://my.test.com/video.mp4' type='video/mp4' />
            </video>
        </div>
    );
```

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
`playererror` | Event executed when any error has occurred within the OpenPlayer instance; a response will be sent via `onError` config callback. See [Usage with Javascript](#usage-with-javascript) for more details.
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

## Code Samples

Witness the power of this player by browsing our best samples!

If you want to see one added to this list, please submit an issue indicating what scenarios OpenPlayerJS could help you with.

1. [No configuration (only DOM classes)](https://codepen.io/rafa8626/pen/WaNxNB)
2. [Minimal configuration](https://codepen.io/rafa8626/pen/BqazxX)
3. [Using Ads](https://codepen.io/rafa8626/pen/vVYKav)
4. [Add source after initialization (useful for AJAX)](https://codepen.io/rafa8626/pen/YzzgJrK)
5. [Using `Levels`](https://codepen.io/rafa8626/pen/ExxXvZx)
6. [Playing HLS streaming with DRM (Encryption)](https://codepen.io/rafa8626/pen/QZWEVy)
7. [M(PEG)-DASH with Ads](https://codepen.io/rafa8626/pen/Xxjmra)
8. [Basic playlist (video and audio)](https://codepen.io/rafa8626/pen/GRREQpX)
9. [Ads playlist (multiple URLs)](https://codepen.io/rafa8626/pen/wvvxbMN)
10. [Retrieve data from audio streaming (HLS)](https://codepen.io/rafa8626/pen/abbjrBW)
11. [YouTube video (using plugin)](https://codepen.io/rafa8626/pen/wvvOYpg)
12. [Addition of a custom control](https://codepen.io/rafa8626/pen/oNXmEza)
13. [OpenPlayerJS with Next.js](https://codesandbox.io/s/vigorous-almeida-71gln)

## Built With

* [Typescript](https://www.typescriptlang.org/docs/home.html) - The Javascript for Pros.

## Contributing

Make sure you check [Conventional Commits Standards](https://conventionalcommits.org/) for commit guidelines.

## Authors

* **Rafael Miranda** - [rafa8626](https://github.com/rafa8626)

See also the list of [contributors](https://github.com/openplayerjs/openplayerjs/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
