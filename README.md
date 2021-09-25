# [OpenPlayer.js](https://www.openplayerjs.com)

![openplayerjs](https://user-images.githubusercontent.com/910829/46182430-d4c0f380-c299-11e8-89a8-c7554a70b66c.png)

[![NPM](https://nodei.co/npm/openplayerjs.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/openplayerjs/)

[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=Support%20OpenPlayerJS%20by%20giving%20the%20project%20a%20start%20at%20&url=https://www.openplayerjs.com&hashtags=openplayerjs,mediaplayer,vpaid,opensourcerocks,streaming)
[![Coverage Status](https://coveralls.io/repos/github/openplayerjs/openplayerjs/badge.svg?branch=master)](https://coveralls.io/github/openplayerjs/openplayerjs?branch=master)
[![JSDelivr](https://data.jsdelivr.com/v1/package/npm/openplayerjs/badge)](https://www.jsdelivr.com/package/npm/openplayerjs)
   [![Build Status](https://travis-ci.org/openplayerjs/openplayerjs.svg?branch=master)](https://travis-ci.org/openplayerjs/openplayerjs) [![Size](https://img.shields.io/bundlephobia/minzip/openplayerjs/latest?style=flat-square)](https://nodei.co/npm/openplayerjs) [![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://paypal.me/rafa8626?locale.x=en_US)

This is a media player that uses all the goods of HTML5 video/audio elements to play the most popular media in MP4/MP3, HLS and M(PEG)-DASH, and also has the ability to play VMAP, VAST and VPAID ads.

## Advantages

* Supports **IE11+ (Win8) and all modern browsers**.
* **No dependencies**, since it is written in Typescript.
* Runs a simple but yet powerful algorithm to **check the browser's autoplay capabilities** across browsers.
* Supports for **local and remote captions** for **both video and audio**, even without including the `crossorigin` attribute.
* **Enhance your player** adding your own buttons. Check [here](./docs/customize.md) for more details.
* Provides the ability to use a **single VAST/VPAID** source or a **VAST/VPAID playlist** from several different sources (including URLs and valid XML strings).
* **Can play ads in infinite loop**, desired for ads that are in a heavy text page.
* Always **responsive** by default, for both video/audio tags; for video, **`fill`** and **`fit`** modes are available to either scale and crop media relative to its parent container, or to attempt to make the media fit its parent container (including black bars), respectively.

## Migrating from older version to new ones

To learn more details about how to migrate from 1.x.x version to 2.x.x, or any breaking changes in newer versions, visit the [Migration document](./migration.md).

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
    * [About the `levels` control](./docs/usage.md#about-the-levels-control)
    * [About the usage of third-party libraries](./docs/usage.md#about-the-usage-of-third-party-libraries)
  * [React/Next.js](./docs/usage.md#reactnextjs)
* [API and events](./docs/api.md)
  * [API](./docs/api.md#api)
  * [Events](./docs/api.md#events)
  * [Keyboard Shortcuts](./docs/api.md#keyboard-shortcuts)
* [NEW! Player Customizations](./docs/customize.md)
  * [Modify Look](./docs/customize.md#modify-look)
  * [Add Control](./docs/customize.md#add-control)
  * [Add External Player API](./docs/customize.md#add-external-player-api)

## Code Samples

**In 2.x.x, the `demo` folder is now removed in favor of code samples.**

If you need a reference on how to use OpenPlayerJS in some of the most common scenarios, check the following links:

1. [No configuration (only DOM classes)](https://codepen.io/rafa8626/pen/WaNxNB)
2. [Minimal configuration](https://codepen.io/rafa8626/pen/BqazxX)
3. [Using `fill` mode](https://codepen.io/rafa8626/pen/xxZXQoO)
4. [Using `fit` mode](https://codepen.io/rafa8626/pen/abmboKV)
5. [Using Ads (linear and non-linear samples)](https://codepen.io/rafa8626/pen/vVYKav)
6. [🆕 - Updating Ads and clickable Ad element](https://codepen.io/rafa8626/pen/OJmEzXw)
7. [Removing controls and using `preload="none"`](https://codepen.io/rafa8626/pen/OJyMwxX)
8. [Add source after initialization (useful for AJAX)](https://codepen.io/rafa8626/pen/YzzgJrK)
9. [Fully customized audio player](https://codepen.io/rafa8626/pen/ExPLVRE)
10. [Playing HLS streaming with DRM (Encryption)](https://codepen.io/rafa8626/pen/QZWEVy)
11. [M(PEG)-DASH with Ads](https://codepen.io/rafa8626/pen/Xxjmra)
12. [Basic playlist (video and audio)](https://codepen.io/rafa8626/pen/GRREQpX)
13. [Ads playlist (multiple URLs)](https://codepen.io/rafa8626/pen/wvvxbMN)
14. [Retrieve data from audio streaming (HLS)](https://codepen.io/rafa8626/pen/abbjrBW)
15. [YouTube video (using plugin)](https://codepen.io/rafa8626/pen/wvvOYpg)
16. [Seamless transitions using custom control](https://codepen.io/rafa8626/pen/oNXmEza)
17. [OpenPlayerJS with React](https://codepen.io/rafa8626/pen/GRrVLMB)
18. [OpenPlayerJS with Next.js](https://codesandbox.io/s/vigorous-almeida-71gln)
19. [OpenPlayerJS with Vue.js](https://codepen.io/rafa8626/pen/JjWPLeo)
20. [Using `Levels` and setting width/height](https://codepen.io/rafa8626/pen/ExxXvZx)
21. [Trigger Ad manually](https://codepen.io/rafa8626/pen/abZNgoY)
22. [Use FLV source (only modern browsers and Android, not iOS)](https://codepen.io/rafa8626/pen/QWEZPaZ)
23. [Using hls.js p2p plugin](https://codepen.io/rafa8626/pen/PoPLMxo)

## Built With

* [Typescript](https://www.typescriptlang.org/docs/home.html) - The Javascript for Pros.

## Authors

* **Rafael Miranda** - [rafa8626](https://github.com/rafa8626)

See also the list of [contributors](https://github.com/openplayerjs/openplayerjs/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
