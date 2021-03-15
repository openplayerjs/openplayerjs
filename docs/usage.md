# Usage

## HTML

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

If you are planning to use OpenPlayerJS in a Node project, you need to install the package via:

```node
npm install openplayerjs
```

and then:

```javascript
// Using as module
var OpenPlayerJS = require('/path/to/openplayerjs');

// or importing the library (ES6)
import OpenPlayerJS from 'openplayerjs';
```

## Javascript

Sometimes you need more flexibility instantiating the player; for example, adding cache busting to the VAST/VPAID URL, having a list of Ads URLs, adding new controls, etc. So, for that case, remove the `op-player` class from the video/audio tag (leaving `op-player__media` to preserve styles), and, with Javascript, use the following setup:

```javascript
var player = new OpenPlayerJS('[player ID]', {
    // The configuration related to the player's controls; by default, the available controls are: 'play', 
    // 'time', 'volume', 'progress', 'captions', 'settings' and 'fullscreen'. There's an optional 
    // 'levels' control to display different quality levels. More of this described below.
    controls: {
        // By default, the player will display the controls for a number of seconds before they are hidden; 
        // this option will allow the user to permanently show the controls if they need fully customize them. By default, `false`
        alwaysVisible,
        // Controls positioning in the player. Each one of the control items can be enclosed in a
        // specific layer, and it will have in its class name the `op-control__[left|middle|right]`
        // according to the controls' structure listed below. By default, the layers are 'left', 'middle'
        // and 'right'. Also available: 'main', 'top-left', 'top-middle', 'top-right', 'bottom-left', 
        // 'bottom-middle' and 'bottom-right'. 
        // If you use the layer 'main', whatever control is in it will be appended to the media's main 
        // container. This layer is ONLY available for video elements.
        layers: {
            left: ['play', 'time', 'volume'],
            middle: ['progress'],
            right: ['captions', 'settings', 'fullscreen'],
        }
    },
    // Allow items that have menu items inside `Settings` to be contained in their own separate menu; 
    // generally speaking, the menu will float above the control item it belongs to (by default, false)
    detachMenus,
    // Player will favor native capabilities rather than third-party plugins (HLS can play natively in Android and iOS, but setting this to `false`, will enable hls.js)
    forceNative,
    // Player stretching mode: `responsive` (default), `fit` (to obtain black bars) or `fill` (crop image)
    mode,
    // Number of ms that takes the player to hide the Play button once it starts playing (video only)
    // (by default, `350`)
    hidePlayBtnTimer,
    // Number of seconds to rewind/forward media
    // (by default, player will rewind/forward 5% of the total duration of media)
    step,
    // Initial volume of media in decimal numbers (by default, `1`)
    startVolume,
    // Initial play time of media in seconds (by default, `0`)
    startTime,
    // Allow loader to be displayed when loading video (by default, `false`)
    showLoaderOnInit,
    // Callback to be executed once an error is found (default, `console.error`)
    onError,
    // If `levels` configuration is added, set programatically the default level as a numeric ID of the level (-1 for auto, default: `null`)
    defaultLevel,
    // Params passed: Custom event with `detail: { type: 'HTML5|Ads|M(PEG)-DASH|HLS', message, data },`
    live: {
        // Allow `Live Broadcast` label to be displayed in live streamings (by default, `true`)
        showLabel,
        // Allow to show progress bar in live streamings without showing constant updates (by default, `false`)
        showProgress,
    }
    ads: {
        // The Ad(s) URLs to be processed
        src,
        // If set to `false`, allows the user to overwrite the default mechanism to skip Ads
        autoPlayAdBreaks,
        // If set to `true`, load `ima3_debug.js` file for debugging purposes
        debug,
        // If set to `true`, the Ads will preload so other actions can be executed with `adsloaded` event
        enablePreloading,
        // Language for ads (for more details, check: https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/localization)
        language,
        // If set to `true`, play infintely an Ad
        loop,
        // Maximum number of redirects before the subsequent redirects will be denied (by default, `4`)
        numRedirects,
        // Custom path/URL to IMA SDK
        sdkPath,
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
    flv: {
        // all FLV options available at https://github.com/bilibili/flv.js/blob/master/docs/api.md#mediadatasource
    },
    hls: {
        // all HLS options available at https://github.com/video-dev/hls.js/blob/master/docs/API.md#fine-tuning.
    },
    // Configuration related to the progres bar
    progress: {
        // The default duration in seconds to show while loading the media (default: 0).
        // This is to improve some of the UX when the player hasn't detected the metadata
        // of the media yet, but you don't want to show a 00:00 duration
        duration
        // Flag to show only current time, or show both time and duration (by default, `false`)
        showCurrentTimeOnly
    },
    // Force the player to have a specific width/height (default for both: 0)
    // They can accept a string with the number and unit (`100%`, `350px`)
    // or just a number of pixels
    width,
    height,
});
// Don't forget to start the player
player.init();
```

**NOTE**: In order to use this setup, the video/audio tag(s) **must** have a unique ID.

### About the `levels` control

The `levels` option is not a default one since it requires specific configuration to make it work with HTML5, or just works with streaming elements that have different resolutions.

To see a working example of it, using both scenarios, check [this sample](https://codepen.io/rafa8626/pen/ExxXvZx?editors=1000).

## React/Next.js

Using OpenPlayerJS with React and Next.js is pretty straightforward, as you can see in the example below.

```javascript
import React, { useEffect } from 'react';
import OpenPlayerJS from 'openplayerjs';

export default function Sample() {
    useEffect(() => {
        const player = new OpenPlayerJS('player');
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
