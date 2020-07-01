# [OpenPlayer.js](https://www.openplayerjs.com)

![openplayerjs](https://user-images.githubusercontent.com/910829/46182430-d4c0f380-c299-11e8-89a8-c7554a70b66c.png)

[![NPM](https://nodei.co/npm/openplayerjs.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/openplayerjs/)

[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=Support%20OpenPlayerJS%20by%20giving%20the%20project%20a%20start%20at%20&url=https://www.openplayerjs.com&hashtags=openplayerjs,mediaplayer,vpaid,opensourcerocks,streaming)
[![JSDelivr](https://data.jsdelivr.com/v1/package/npm/openplayerjs/badge)](https://www.jsdelivr.com/package/npm/openplayerjs)
   [![Build Status](https://travis-ci.org/openplayerjs/openplayerjs.svg?branch=master)](https://travis-ci.org/openplayerjs/openplayerjs) [![Size](https://img.shields.io/bundlephobia/minzip/openplayerjs/latest?style=flat-square)](https://nodei.co/npm/openplayerjs) [![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://paypal.me/rafa8626?locale.x=en_US)

Media player that uses HTML5 video/audio elements to play the most popular media in MP4/MP3, HLS and M(PEG)-DASH, among others, and also has the ability to play VMAP, VAST and VPAID Ads.

* Support for **IE11+ (Win8) and all modern browsers**.
* No dependencies
* Runs a simple but yet powerful algorithm to check the browser's autoplay capabilities across browsers.
* Support for **local and remote captions** for **both video and audio**, even without including the `crossorigin` attribute.
* **Enhance player** adding your own buttons.
* **Multi Ads**: OpenPlayerJS is **one of the few players that provides the ability to use a single VAST/VPAID source or a VAST/VPAID playlist from several different sources (including URLs and valid XML strings)**. Usually, advertisers take only part of the total traffic of a website. As a result, users view only 10% of the total advertising per day (besides, once the user has seen the Ad, the advertiser's cookie is set, so it will not perform a new request through the server. Therefore, a website benefits when connecting multiple Ads streams.
* **Play Ads indefinitely**: OpenPlayerJS has the ability to set an ad and play it in an infinite loop; this is desired for ads that are in a heavy text page.
* **Responsive**: Always adapts to the screen size (and resize) by default, for both video/audio tags; a new **`fill`** mode is also included to scale and crop media relative to its parent container.

To see the unleashed power of OpenPlayerJS, **check our [Demo folder](https://github.com/openplayerjs/openplayerjs/tree/master/demo) and our [Code Samples](#code-samples)**.

**We are constantly looking to see if OpenPlayerJS meets your needs; if it does not, please submit an issue indicating what scenarios OpenPlayerJS it's lacking and we will add a sample to demonstrate the solution(s). Your feedback is always extremely valuable!**

## Installation

```node
npm install openplayerjs
```

CDN is also available for better performance. See next section for more details.

## How to use it

### HTML

The only 3 requirements to invoke the player are:

* A valid media source, such as MP4, MP3, HLS or M(PEG)-DASH.
* The `controls` and `playsinline` attributes to provide cross-browser support.
* The `op-player__media` class name to invoke the player. You can add `op-player` class as well, if you don't require any Javascript configuration.

Optionally, if you want to use VTT closed captions, need to add the `track` tag as indicated in the  snippet above; you can also use the `default` attribute in the tag, but as a rule of thumb, all the attributes displayed below in the `track` tag **MUST** be there; otherwise, closed captions won't be displayed.

```html
<html>
    <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/openplayerjs@latest/dist/openplayer.min.css">
    </head>
    <body>
        <video class="op-player op-player__media" controls playsinline>
            <source src="/path/to/video.mp4" type="video/mp4">
            <track kind="subtitles" src="/path/to/video.vtt" srclang="en" label="English">
        </video>
        <script src="https://cdn.jsdelivr.net/npm/openplayerjs@latest/dist/openplayer.min.js"></script>
    </body>
</html>
```

If you are planning to use OpenPlayer in a Node project, you can:

```javascript
// Using as module
var openplayer = require('/path/to/openplayerjs');

// or importing the library (ES6)
import OpenPlayer from 'openplayerjs';
```

## Usage with Javascript

Sometimes you need more flexibility instantiating the player; for example, adding cache busting to the VAST/VPAID URL, having a list of Ads URLs, adding new controls, etc. So, for that case, remove the `op-player` class from the video/audio tag (leaving `op-player__media` to preserve styles), and, with Javascript, use the following setup:

```javascript
var player = new OpenPlayer('[player ID]', {
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
    // Player stretching mode: `responsive` (default) or `fullscreen`
    mode,
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
    // Allow `Live Broadcast` label to be displayed in live streamings (by default, `false`)
    showLiveLabel,
    // Allow loader to be displayed when loading video (by default, `false`)
    showLoaderOnInit,
    // Callback to be executed once an error is found (default, `console.error`)
    // Params passed: Custom event with `detail: { type: 'HTML5|Ads|M(PEG)-DASH|HLS', message, data },`
    onError,
    ads: {
        // The Ad(s) URLs to be processed
        src,
        // If set to `false`, allows the user to overwrite the default mechanism to skip Ads
        autoPlayAdBreaks,
        // If set to `true`, load `ima3_debug.js` file for debugging purposes
        debug,
        // If set to `true`, play infintely an Ad
        loop,
        // Maximum number of redirects before the subsequent redirects will be denied (by default, `4`)
        numRedirects,
        // Custom path/URL to IMA SDK
        url,
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

**NOTE**: In order to use this setup, the video/audio tag(s) need a unique ID.

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

If you need more control over the player, OpenPlayerJS stores an instance of each player in the document. To have access to a specific instance, use the media `id` and use `OpenPlayer.instances` element.

**NOTE**: if an `id` attribute is not detected, OpenPlayerJS will autogenerate one for you.

```javascript
// Selects the first video/audio that uses OpenPlayer
var id = document.querySelector('.op-player').id;
var player = OpenPlayerJS.instances[id];
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

Using the code below, you can attach/dispatch any valid event, using [`CustomEvent`](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent), like this:

```javascript
player.getElement().addEventListener('ended', function() {
    console.log('Your code when media ends playing');
});

var event = new CustomEvent('ended');
player.getElement().dispatchEvent(event);
```

All [HTML5 media events](https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events) are supported by OpenPlayerJS, and it incorporates some custom ones, mostly related to Ads:

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

In addition to the list above, all [HLS events](https://github.com/video-dev/hls.js/blob/master/docs/API.md#runtime-events) and [HLS error events](https://github.com/video-dev/hls.js/blob/master/docs/API.md#errors) are supported using the same approach described above, including all their details. For the error ones, they are classified as `networkError`, `mediaError`, `muxError` and `otherError`.

## Code Samples

1. [No configuration (only DOM classes)](https://codepen.io/rafa8626/pen/WaNxNB)
2. [Minimal configuration](https://codepen.io/rafa8626/pen/BqazxX)
3. [Using `fill` mode](https://codepen.io/rafa8626/pen/xxZXQoO)
4. [Using Ads](https://codepen.io/rafa8626/pen/vVYKav)
5. [Removing controls and using `preload="none"`](https://codepen.io/rafa8626/pen/OJyMwxX)
6. [Add source after initialization (useful for AJAX)](https://codepen.io/rafa8626/pen/YzzgJrK)
7. [Using `Levels`](https://codepen.io/rafa8626/pen/ExxXvZx)
8. [Playing HLS streaming with DRM (Encryption)](https://codepen.io/rafa8626/pen/QZWEVy)
9. [M(PEG)-DASH with Ads](https://codepen.io/rafa8626/pen/Xxjmra)
10. [Basic playlist (video and audio)](https://codepen.io/rafa8626/pen/GRREQpX)
11. [Ads playlist (multiple URLs)](https://codepen.io/rafa8626/pen/wvvxbMN)
12. [Retrieve data from audio streaming (HLS)](https://codepen.io/rafa8626/pen/abbjrBW)
13. [YouTube video (using plugin)](https://codepen.io/rafa8626/pen/wvvOYpg)
14. [Addition of a custom control](https://codepen.io/rafa8626/pen/oNXmEza)
15. [OpenPlayerJS with Next.js](https://codesandbox.io/s/vigorous-almeida-71gln)
16. [Using hls.js p2p plugin](https://codepen.io/rafa8626/pen/PoPLMxo)

## Built With

* [Typescript](https://www.typescriptlang.org/docs/home.html) - The Javascript for Pros.

## Authors

* **Rafael Miranda** - [rafa8626](https://github.com/rafa8626)

See also the list of [contributors](https://github.com/openplayerjs/openplayerjs/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
