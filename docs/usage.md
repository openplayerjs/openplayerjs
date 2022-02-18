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

Sometimes you need more flexibility instantiating the player; for example, adding cache busting to the VAST/VPAID URL, having a list of Ads URLs, adding new controls, etc. So, for that case, remove the `op-player` class from the video/audio tag (leaving `op-player__media` to preserve styles), and, with Javascript, use the following options (the ones presented are the default values):

```javascript
const player = new OpenPlayerJS('[player ID]', {
    controls: {
        alwaysVisible: false,
        layers: {
            left: ['play', 'time', 'volume'],
            middle: ['progress'],
            right: ['captions', 'settings', 'fullscreen'],
        }
    },
    detachMenus: false,
    forceNative: true,
    mode: 'responsive',
    hidePlayBtnTimer: 350,
    step: 0,
    startVolume: 1,
    startTime: 0,
    showLoaderOnInit: false,
    onError: (e) => console.error(e),
    defaultLevel: null,
    live: {
        showLabel: true,
        showProgress: false,
    }
    dash: {
        // Possible values are SW_SECURE_CRYPTO, SW_SECURE_DECODE, HW_SECURE_CRYPTO, HW_SECURE_CRYPTO,
        // HW_SECURE_DECODE, HW_SECURE_ALL
        robustnessLevel: null,
        // object containing property names corresponding to key system name strings (e.g. "org.w3.clearkey") and
        // associated values being instances of ProtectionData
        // (http://vm2.dashif.org/dash.js/docs/jsdocs/MediaPlayer.vo.protection.ProtectionData.html)
        drm: null,
    },
    flv: {
        // all FLV options available at https://github.com/bilibili/flv.js/blob/master/docs/api.md#mediadatasource
    },
    hls: {
        // all HLS options available at https://github.com/video-dev/hls.js/blob/master/docs/API.md#fine-tuning.
    },
    progress: {
        duration: 0,
        showCurrentTimeOnly: false
    },
    width: 0,
    height: 0,
    pauseOthers: true,
    // If you need Ads support use the following
    ads: {
        src,
        autoPlayAdBreaks: false,
        debug: false,
        enablePreloading: false,
        language: 'en,
        loop: false,
        numRedirects: 4,
        sdkPath: 'https://imasdk.googleapis.com/js/sdkloader/ima3.js',
        customClick: {
            enabled: false,
            label: '',
        },
        sessionId: null,
        vpaidMode" 'enabled',
        publisherId: null,
    }
});
// Don't forget to start the player
player.init();
```

### Configuration options

| `Element` | Description |
|---------|-------------|
| `detachMenus` | Allow items that have menu items inside `Settings` to be contained in their own separate menu; generally speaking, the menu will float above the control item it belongs to (by default, false). |
| `forceNative` | Player will favor native capabilities rather than third-party plugins (HLS can play natively in Android and iOS, but setting this to `false`, will enable hls.js) |
| `mode` | Player stretching mode: `responsive` (default), `fit` (to obtain black bars) or `fill` (crop image) |
| `hidePlayBtnTimer` | Number of ms that takes the player to hide the Play button once it starts playing (video only). By default, `350`. |
| `step` | Number of seconds to rewind/forward media. By default, player will rewind/forward 5% of the total duration of media. |
| `startVolume` | Initial volume of media in decimal numbers. By default, `1`. |
| `startTime` | Initial play time of media in seconds. By default, `0`. |
| `showLoaderOnInit` | Allow loader to be displayed when loading video. By default, `false`. |
| `onError` | Callback to be executed once an error is found. By default, `console.error`. |
| `defaultLevel` | If `levels` configuration is added, set programmatically the default level as a numeric ID of the level (`-1` for auto, default: `null`). |
| `width/height` | Force the player to have a specific width/height (default for both: 0). They can accept a string with the number and unit (`100%`, `350px`) or just a number of pixels. |
| `pauseOthers` | Flag to allow multiple instances of the player to play at the same time. By default, `true`. |
| `controls` | The configuration related to the player's controls; by default, the available controls are: 'play',  'time', 'volume', 'progress', 'captions', 'settings' and 'fullscreen'. There's an optional 'levels' control to display different quality levels. More of this described in the next section. |
| `controls.alwaysVisible` | By default, the player will display the controls for a number of seconds before they are hidden; this option will allow the user to permanently show the controls if they need fully customize them. By default, `false`. |
| `controls.layers` | Controls positioning in the player. Each one of the control items can be enclosed in a specific layer, and it will have in its class name the `op-control__[left| middle| right]` according to the controls' structure listed below. By default, the layers are 'left', 'middle' and 'right'. Also available: 'main', 'top-left', 'top-middle', 'top-right', 'bottom-left', 'bottom-middle' and 'bottom-right'. If you use the layer 'main' (**ONLY available for video elements**), whatever control is in it will be appended to the media's main container. |
| `live` | Configuration related to the live streams and what to show in the controls. |
| `live.showLabel` | Allow `Live Broadcast` label to be displayed in live streamings. By default, `true`. |
| `live.showProgress` | Allow to show progress bar in live streamings without showing constant updates. By default, `false`. |
| `media.pauseOnClick` | Allow the user to pause media (video) when clicking on the video area. By default, `false`. |
| `ads` | Configuration related to Ads. |
| `ads.src` | The Ad URL(s) to be processed. It accepts also a valid XML string or a list of them. |
| `ads.autoPlayAdBreaks` | If set to `false`, allows the user to overwrite the default mechanism to skip Ads. |
| `ads.debug` | If set to `true`, load `ima3_debug.js` file for debugging purposes. |
| `ads.enablePreloading` | If set to `true`, the Ads will preload so other actions can be executed with `adsloaded` event. |
| `ads.language` | Language to localize ads (for more details, check: <https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/localization>). |
| `ads.loop` | If set to `true`, it will play infinitely an Ad. |
| `ads.numRedirects` | Maximum number of redirects before the subsequent redirects will be denied. By default, `4`. |
| `ads.sdkPath` | Custom path/URL to IMA SDK. By default, `https://imasdk.googleapis.com/js/sdkloader/ima3.js`. |
| `ads.customClick` | Options to allow IMA SDK to use a custom clickable element for mobile devices; otherwise, IMA SDK will show a `Learn more` layer. |
| `ads.customClick.enabled` | By default, `false`. |
| `ads.customClick.label` | The message to display in the custom click element. |
| `ads.sessionId` | A temporary UUID used for frequency capping. |
| `ads.vpaidMode` | Enable/disable VPAID capabilities (default: 'enabled'). Possible values: 'enabled', 'disabled' and 'insecure'. |
| `ads.publisherId` | The Publisher provider ID |
| `progress` | Configuration related to the progress bar. |
| `progress.duration` | The default duration in seconds to show while loading the media (default: `0`). This is to improve some of the UX when the player hasn't detected the metadata of the media yet, but you don't want to show a 00:00 duration. |
| `progress.showCurrentTimeOnly` | Flag to show only current time, or show both time and duration. By default, `false`. |
| `useDeviceVolume` | When this option is `false`, the Volume/Mute elements will be displayed in mobile devices  |

**NOTE**: In order to use this setup, the video/audio tag(s) **must** have a unique ID.

### About the `levels` control

The `levels` option is not a default one since it requires specific configuration to make it work with HTML5, or just works with streaming elements that have different resolutions.

To see a working example of it, using both scenarios, check [this sample](https://codepen.io/rafa8626/pen/ExxXvZx?editors=1000).

### About the usage of third-party libraries

OpenPlayerJS loads automatically the latest version of [hls.js](https://github.com/video-dev/hls.js), [dash.js](https://github.com/Dash-Industry-Forum/dash.js) and [flv.js](https://github.com/Bilibili/flv.js/) from [jsDelivr CDN service](https://www.jsdelivr.com/); however, if for any reason you need to use a local version (or using a different URL) of any of these third-party libraries, you can **load them before you load OpenPlayerJS**. For example:

```html
<script src="/path/to/hls.min.js"></script>
<script src="/path/to/dash.min.js"></script>
<script src="/path/to/flv.min.js"></script>
<script src="/path/to/openplayer.min.js"></script>
```

Or if you are using them in a separate file:

```javascript
import Hls from 'hls.js';
import dashjs from 'dashjs';
import flvJs from 'flv.js';

import OpenPlayerJS from 'openplayerjs';
```

If you need to use any custom methods that any of these libraries offer, you can invoke `getMedia().instance` to do so.

**IMPORTANT**: Just make sure these libraries are fully loaded, so either **use this within an event, after waiting for `init()`, or after waiting for `load()`**

```javascript
const player = new OpenPlayerJS('[player ID]', {
    hls: {
        // all configuration for HLS.js
    }
});
await player.init();

player.getElement().addEventListener('hlsManifestParsed', () => {
    player.getMedia().instance.startLoad(3);
});

player.getElement().addEventListener('ended', async () => {
    player.src = 'https://example.com/test.mpd';
    await player.load();
    player.getMedia().instance.attachTTMLRenderingDiv(document.querySelector("#ttml-rendering-div"));
});

```

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

Check the [OpenPlayerJS with React](https://codepen.io/rafa8626/pen/GRrVLMB) and [OpenPlayerJS with Next.js](https://codesandbox.io/s/vigorous-almeida-71gln) samples for more information. **You can use all the configuration elements listed in the [Configuration options](#configuration-options) listed above**.

## Vue.js

Using OpenPlayerJS with Vue.js is not as different as the example above; however, since Vue 3.x allows the user to use variables with reactivity, the variable that OpenPlayerJS must be assigned to **MUST NOT be reactive**; otherwise, due the changes introduced in 2.7.2 version, the main methods such as `play()`, `pause()`, `init()`, etc., will be attempted to be called via a Vue observer proxy variable, instead of an OpenPlayerJS instance.

A valid example of how to use OpenPlayerJS with Vue is as follows:

```javascript
const app = Vue.createApp({
  data() {
    return {
      // This is key: a variable preceded by `$` is a non-reactive variable, and this is what we need to make it work with OpenPlayerJS
      $player: null,
    }
  },
  mounted() {
    this.$player = new OpenPlayerJS('player', {
        showLoaderOnInit: false,
        pauseOthers: false,
    });
    this.$player.init();
},
});
app.mount('#app');
```

Check the [OpenPlayerJS with Vue.js](https://codepen.io/rafa8626/pen/JjWPLeo) sample for more information. **You can use all the configuration elements listed in the [Configuration options](#configuration-options) listed above**.

## Special user-case scenarios

Since OpenPlayerJS uses the native Media API, there are certain considerations to be taken when configuring the HTML tag with the player's configuration.

### Save bandwidth

OpenPlayerJS has configured the third-party libraries within the code to be as optimized in its use as possible, but when using HTML5 sources (MP3, MP4, OGG, etc.), the best way to save bandwidth is to
set the `preload` attribute as `none` in the video/audio tag.

The only side-effect of using this, is that the duration reflected in the control bar will always be zero until the user starts playing the media.

If you want to set the duration to improve the UI experience (knowing it ahead of time, in seconds), you can use the `duration` configuration under the `progress` element.

```javascript
const player = new OpenPlayerJS('video', {
    progress: {
        duration: 315 // Around 12:14 minutes of duration
    },
});
player.init();
```

### CORS (Cross-Origin Resource Sharing)

Specially when using Ads and closed captioning, this is a common issue that has a very easy solution.

Generally speaking, the error will look like this:

`Access to XMLHttpRequest at '[WEBSITE DOMAIN]' from origin '[OTHER DOMAIN]' has been blocked by CORS policy`

And this can be solved by setting in the server side the proper permission headers (specially if you are using `localhost` for it):

```text
Access-Control-Allow-Origin: [origin header value, or * to allow all sites]
Access-Control-Allow-Credentials: true
```

### Ads: a "complex" setup

Given that Ads can vary from VAST, VPAID and VMAP, each one has its own unique requirements.

For this sake, OpenPlayerJS integrated IMA SDK to help with this titanic task, but this means that you need to know how to configure IMA for your own scenario. Below are some of the most complex scenarios that we have encountered using Ads (aside from the known CORS issue described above).

#### Translate the UI

Given that the IMA SDK library does not allow for a lot of UI customizations, the only way to translate the UI elements within the Ad (Skip button, custom click button, counters, etc.), is to setting up the language of the Ads being played.

This is achieved by using the `language` configuration, setting the desired country code. The available country codes are listed [here](https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/localization?hl=en).

```javascript
const player = new OpenPlayerJS('video', {
    ads: {
        src: [YOUR AD SOURCE(S)]
        language: 'en-US
    }
});
player.init();
```

#### Personalize the Custom Click button

When personalizing the custom click button, this is sometimes desired since, by default, it has a Learn More legend and a specific color. When its needed a different label, we can leverage the `customClick` configuration set:

```javascript
const player = new OpenPlayerJS('video', {
    ads: {
        src: [YOUR AD SOURCE(S)]
        customClick: {
            enabled: true,
            label: [YOUR LABEL],
        }
    }
});
player.init();
```

Just keep in mind that, whatever label you set there, it will be used as is with no possibility of translation.

#### VPAID not playing due to 901 error

VPAID Ads are known for using iframes that sometimes represent a security concern. IMA SDK has 2 different modes to deal with them. OpenPlayerJS always enables them in a secure way, but that
sometimes lead to 901 errors. The way to solve this is by using the `vpaidMode` configuration and setting it as `insecure`.

```javascript
const player = new OpenPlayerJS('video', {
    ads: {
        src: [YOUR AD SOURCE(S)]
        vpaidMode: 'insecure',
    }
});
player.init();
```

For more information about this topic, read [here](https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/vpaid2js).
