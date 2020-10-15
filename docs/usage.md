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
    controls: {
        // By default, the player will display the controls for a number of seconds before they are hidden; this option will allow the user to permanently show the controls if they need fully customize them.
        alwaysVisible: false,
        // Controls configuration by default; `levels` can be added as well since it's an optional feature;
        // Each one of the items will have in their class name the `op-control__[left|middle|right]` according
        // to the controls' structure listed below. Also available: `top-left`, `top-middle`,
        // `top-right`, `bottom-left`, `bottom-middle` and `bottom-right`.
        // If you use `main`, it will be appended to the media's container to create elements.
        layers: {
            left: ['play', 'time', 'volume'],
            middle: ['progress'],
            right: ['captions', 'settings', 'fullscreen'],
        }
    },
    // Allow items to be contained in a different space outside of `Settings`
    detachMenus,
    // Player stretching mode: `responsive` (default) or `fill`
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
    // Allow loader to be displayed when loading video (by default, `false`)
    showLoaderOnInit,
    // Callback to be executed once an error is found (default, `console.error`)
    // Params passed: Custom event with `detail: { type: 'HTML5|Ads|M(PEG)-DASH|HLS', message, data },`
    live: {
        // Allow `Live Broadcast` label to be displayed in live streamings (by default, `false`)
        showLabel: true,
        // Allow to show progress bar in live streamings without showing constant updates
        showProgress: false,
    }
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
        sdkPath,
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

**NOTE**: In order to use this setup, the video/audio tag(s) **must** have a unique ID.

## Next.js/React

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
