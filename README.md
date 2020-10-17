# [OpenPlayer.js](https://www.openplayerjs.com)

![openplayerjs](https://user-images.githubusercontent.com/910829/46182430-d4c0f380-c299-11e8-89a8-c7554a70b66c.png)

[![NPM](https://nodei.co/npm/openplayerjs.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/openplayerjs/)

[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=Support%20OpenPlayerJS%20by%20giving%20the%20project%20a%20start%20at%20&url=https://www.openplayerjs.com&hashtags=openplayerjs,mediaplayer,vpaid,opensourcerocks,streaming)
[![JSDelivr](https://data.jsdelivr.com/v1/package/npm/openplayerjs/badge)](https://www.jsdelivr.com/package/npm/openplayerjs)
   [![Build Status](https://travis-ci.org/openplayerjs/openplayerjs.svg?branch=master)](https://travis-ci.org/openplayerjs/openplayerjs) [![Size](https://img.shields.io/bundlephobia/minzip/openplayerjs/latest?style=flat-square)](https://nodei.co/npm/openplayerjs) [![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://paypal.me/rafa8626?locale.x=en_US)

This is a media player that uses all the goods of HTML5 video/audio elements to play the most popular media in MP4/MP3, HLS and M(PEG)-DASH, and also has the ability to play VMAP, VAST and VPAID ads.

## Advantages

* Supports **IE11+ (Win8) and all modern browsers**.
* **No dependencies**, since it is written in Typescript.
* Runs a simple but yet powerful algorithm to **check the browser's autoplay capabilities** across browsers.
* Supports for **local and remote captions** for **both video and audio**, even without including the `crossorigin` attribute.
* **Enhance your player** adding your own buttons. Check [here](./docs/customize.md) for more details.
* Provides the ability to use a single VAST/VPAID source or a VAST/VPAID playlist from several different sources (including URLs and valid XML strings).
* **Can play ads in infinite loop**, desired for ads that are in a heavy text page.
* Always **responsive** by default, for both video/audio tags; a new **`fill`** mode is also included to scale and crop media relative to its parent container.

## :warning: IMPORTANT: Migrating from v1.x.x to v2.x.x :warning:

In order to achieve a smooth upgrading between version `1.x.x` and `2.x.x`, there is a couple of things to keep in mind:

1. The player will only accept now 2 parameters instead of 4: the **player ID** and the **player options**.
2. `controls` and `showLiveProgress` properties are now complex object structures, where we can indicate visibility and a new set of extra layers/visibility.

To simplify this even more:

### v1.x.x

```javascript
const player = new OpenPlayerJS('player', 'https://ads.example.url/xml', true, {
    controls: {
        left: ['play', 'time', 'volume'],
        middle: ['progress'],
        right: ['captions', 'settings', 'fullscreen'],
    },
    showLiveProgress: false,
    // ...other player options
});
player.init();
```

### v2.x.x

```javascript
const player = new OpenPlayerJS('player', {
    ads: {
        src: 'https://ads.example.url/xml', // equivalent to the second argument in v1.x.x
        // ...other ads options
    },
    mode: 'fullscreen', // equivalent to `true` in third argument in v1.x.x
    controls: {
        alwaysVisible: false,
        // Also available: `top-left`, `top-middle`,
        // `top-right`, `bottom-left`, `bottom-middle` and `bottom-right` or `main`
        layers: {
            left: ['play', 'time', 'volume'],
            middle: ['progress'],
            right: ['captions', 'settings', 'fullscreen'],
        }
    },
    live: {
        showLabel: true,
        showProgress: false, // equivalent of `showLiveProgress` in v1.x.x
    },
    // ...other player options
});
player.init();
```

## Getting Started

The standard template to start using OpenPlayerJS is show in the following snippet.

```html
<html>
    <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/openplayerjs@latest/dist/openplayer.min.css">
    </head>
    <body>
        <video class="op-player__media" id="player" controls playsinline>
            <source src="/path/to/video.mp4" type="video/mp4">
            <track kind="subtitles" src="/path/to/video.vtt" srclang="en" label="English">
        </video>
        <script src="https://cdn.jsdelivr.net/npm/openplayerjs@latest/dist/openplayer.min.js"></script>
        <script>
            // Check the `API and events` link below for more options
            const player = new OpenPlayerJS('player');
            player.init();
        </script>
    </body>
</html>
```

## Usage and API Guides

If you want to unleash the power of OpenPlayerJS, learn more about OpenPlayerJS by checking the following links.

* [How to use OpenPlayerJS](./docs/usage.md)
  * [HTML](./docs/usage.md#html)
  * [Javascript](./docs/usage.md#javascript)
  * [React/Next.js](./docs/usage.md#javascript)
* [API and events](./docs/api.md)
  * [API](./docs/api.md#api)
  * [Events](./docs/api.md#events)
* [NEW! Player Customizations](./docs/customize.md)
  * [Modify Look](./docs/customize.md#modify-look)
  * [Add Control](./docs/customize.md#add-control)
  * [Add External Player API](./docs/customize.md#add-external-player-api)

## Code Samples

To get you started, check the following examples. We always welcome new samples.

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
17. [Trigger Ad manually](https://codepen.io/rafa8626/pen/abZNgoY)

## Built With

* [Typescript](https://www.typescriptlang.org/docs/home.html) - The Javascript for Pros.

## Authors

* **Rafael Miranda** - [rafa8626](https://github.com/rafa8626)

See also the list of [contributors](https://github.com/openplayerjs/openplayerjs/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
