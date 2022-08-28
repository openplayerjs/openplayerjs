# [OpenPlayer.js](https://www.openplayerjs.com)

![openplayerjs](https://user-images.githubusercontent.com/910829/46182430-d4c0f380-c299-11e8-89a8-c7554a70b66c.png)

[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=Support%20OpenPlayerJS%20by%20giving%20the%20project%20a%20start%20at%20&url=https://www.openplayerjs.com&hashtags=openplayerjs,mediaplayer,vpaid,opensourcerocks,streaming)
[![Coverage Status](https://coveralls.io/repos/github/openplayerjs/openplayerjs/badge.svg)](https://coveralls.io/github/openplayerjs/openplayerjs?branch=master)
[![JSDelivr](https://data.jsdelivr.com/v1/package/npm/openplayerjs/badge)](https://www.jsdelivr.com/package/npm/openplayerjs)
[![CircleCI](https://circleci.com/gh/openplayerjs/openplayerjs/tree/master.svg?style=svg)](https://circleci.com/gh/openplayerjs/openplayerjs/tree/master)

This is a media player that uses all the goods of HTML5 video/audio elements to play the most popular media in MP4/MP3, HLS and M(PEG)-DASH, and also has the ability to play VMAP, VAST and VPAID ads.

## 🚨 IMPORTANT 🚨

**Version 3.0** of this player just started to being worked on.

As part of a continuous effort to improve the player, this new version will include, among others:

-   An increased unit test coverage (aiming to have at least `70%`), including unit tests for all the demos.
-   Refactor of areas of code where creation of buttons for controls occurs, into a consolidated method to generate them.
-   Refactor of the main operations (`load`, `loadAd`, `play`, `pause`) to use Promises in a more clear fashion, and with that, execute more complex operations consistently, specially when dealing with loading dynamic content.
-   Better snippets/documentation to help users to configure OpenPlayerJS for their needs.
-   And more...

Because of the refactor that will be performed in that version, **support for IE11 will be dropped completely**. Also, to support the effort of [ending the IE11 life cycle, scheduled on **June 15, 2022**](https://docs.microsoft.com/en-us/lifecycle/faq/internet-explorer-microsoft-edge#:~:text=Internet%20Explorer%2011-,Is%20Internet%20Explorer%2011%20the%20last%20version%20of%20Internet%20Explorer,systems%20starting%20June%2015%2C%202022.).

So, please consider this before upgrading to any of the 3.x.x version going forward.

## Advantages

-   Supports **IE11+ (Win8) and all modern browsers**.
-   **No dependencies**, since it is written in Typescript.
-   Runs a simple but yet powerful algorithm to **check the browser's autoplay capabilities** across browsers.
-   Supports for **local and remote captions** for **both video and audio**, even without including the `crossorigin` attribute.
-   **Enhance your player** adding your own buttons. Check [here](./docs/customize.md) for more details.
-   Provides the ability to use a **single VAST/VPAID** source or a **VAST/VPAID playlist** from several different sources (including URLs and valid XML strings).
-   **Can play ads in infinite loop**, desired for ads that are in a heavy text page.
-   Always **responsive** by default, for both video/audio tags; for video, **`fill`** and **`fit`** modes are available to either scale and crop media relative to its parent container, or to attempt to make the media fit its parent container (including black bars), respectively.

## Projects using OpenPlayerJS

|                                                                                                                                                  |                                                                                                                                                                               |                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| [![MedSims](https://img.medscapestatic.com/pi/global/icons/icon-medsims-logo@2x.png)](https://www.medscape.org/simulation)                       | [![Arrow Classic Rock](https://player.arrow.nl/tmp/images/logo.1507670326.jpg)](https://player.arrow.nl/ad.html)                                                              | [![Geração Rádios](https://user-images.githubusercontent.com/910829/168053773-8871dcf9-1f3a-4487-9f6d-95d4d461d945.png)](https://geracaoradios.com)  |
| [![LectureTube](https://live.video.tuwien.ac.at/room/assets/lecturetube_landscape.svg)](https://live.video.tuwien.ac.at/room/heart0/player.html) | [Servicio Online](https://40152354.servicio-online.net//INDEX.html)                                                                                                           | [![HitRadio Center](https://user-images.githubusercontent.com/910829/155380459-76856a41-5a19-4831-8ef8-6d0ae8d471f0.svg)](https://radiocenter.si)    |
| [![Rock Radio](https://user-images.githubusercontent.com/910829/155380461-9c74ff57-50a2-419c-b85a-dad8810b42c6.svg)](https://rockradio.si)       | [![Chichester District Council](https://www.chichester.gov.uk/chichesterdotnet/images/cdclogo.jpg)](https://chichester.moderngov.co.uk/ieListDocuments.aspx?CId=134&MId=1620) | [![Clippa](https://user-images.githubusercontent.com/910829/181409803-c9f25333-7c40-48fb-b54f-42f7e6f6537a.svg)](https://www.clippa.tv/bigKnightOut) |

## Migrating from older version to new ones

To learn more details about how to migrate from 1.x.x version to 2.x.x, or any breaking changes in newer versions, visit the [Migration document](./migration.md).

## Getting Started

The standard template to start using OpenPlayerJS is show in the following snippet.

```html
<html>
    <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/openplayerjs@latest/dist/openplayer.min.css" />
    </head>
    <body>
        <video class="op-player__media" id="player" controls playsinline>
            <source src="/path/to/video.mp4" type="video/mp4" />
            <track kind="subtitles" src="/path/to/video.vtt" srclang="en" label="English" />
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

-   [How to use OpenPlayerJS](./docs/usage.md)
-   [HTML](./docs/usage.md#html)
-   [Javascript](./docs/usage.md#javascript)
    -   [About the `levels` control](./docs/usage.md#about-the-levels-control)
        -   [About the usage of third-party libraries](./docs/usage.md#about-the-usage-of-third-party-libraries)
-   [React/Next.js](./docs/usage.md#reactnextjs)
-   [API and events](./docs/api.md)
    -   [API](./docs/api.md#api)
    -   [Events](./docs/api.md#events)
    -   [Keyboard Shortcuts](./docs/api.md#keyboard-shortcuts)
-   [NEW! Player Customizations](./docs/customize.md)
    -   [Modify Look](./docs/customize.md#modify-look)
    -   [Add Control](./docs/customize.md#add-control)
    -   [Add External Player API](./docs/customize.md#add-external-player-api)

## Code Samples

If you need a reference on how to use OpenPlayerJS in some of the most common scenarios, check the following links:

### Beginners

-   [No configuration (only DOM classes)](https://codepen.io/rafa8626/pen/WaNxNB)
-   [Minimal configuration](https://codepen.io/rafa8626/pen/BqazxX)
-   [Using `fill` mode](https://codepen.io/rafa8626/pen/xxZXQoO)
-   [Using `fit` mode](https://codepen.io/rafa8626/pen/abmboKV)
-   [Using Ads (linear and non-linear samples)](https://codepen.io/rafa8626/pen/vVYKav)
-   [Removing controls and using `preload="none"`](https://codepen.io/rafa8626/pen/OJyMwxX)
-   [Using `Levels` and setting width/height](https://codepen.io/rafa8626/pen/ExxXvZx)
-   [Use FLV source (only modern browsers and Android, not iOS)](https://codepen.io/rafa8626/pen/QWEZPaZ)
-   [OpenPlayerJS with React](https://codepen.io/rafa8626/pen/GRrVLMB)
-   [OpenPlayerJS with Next.js](https://codesandbox.io/s/vigorous-almeida-71gln)
-   [OpenPlayerJS with Vue.js](https://codepen.io/rafa8626/pen/JjWPLeo)
-   [YouTube video (using plugin)](https://codepen.io/rafa8626/pen/wvvOYpg)
-   [Using hls.js p2p plugin](https://codepen.io/rafa8626/pen/PoPLMxo)

### Intermediate

-   [Add source after initialization](https://codepen.io/rafa8626/pen/YzzgJrK)
-   [Playing HLS streaming with DRM (Encryption)](https://codepen.io/rafa8626/pen/QZWEVy)
-   [M(PEG)-DASH with Ads](https://codepen.io/rafa8626/pen/Xxjmra)
-   [Ads playlist (multiple URLs)](https://codepen.io/rafa8626/pen/wvvxbMN)
-   [🆕 - Add a custom element (watermark)](https://codepen.io/rafa8626/pen/JjLQNjo)

### Advanced

-   [Updating source and Ads for dynamic content loading](https://codepen.io/rafa8626/pen/gORJWVz)
-   [Updating Ads and clickable Ad element](https://codepen.io/rafa8626/pen/OJmEzXw)
-   [Trigger Ad manually](https://codepen.io/rafa8626/pen/abZNgoY)
-   [Fully customized audio player](https://codepen.io/rafa8626/pen/ExPLVRE)
-   [Basic playlist (video and audio)](https://codepen.io/rafa8626/pen/GRREQpX)
-   [Retrieve data from audio streaming (HLS)](https://codepen.io/rafa8626/pen/abbjrBW)
-   [Seamless transitions between media using custom control](https://codepen.io/rafa8626/pen/oNXmEza)

## Built With

-   [Typescript](https://www.typescriptlang.org/docs/home.html) - The Javascript for Pros.

## Authors

-   **Rafael Miranda** - [rafa8626](https://github.com/rafa8626)

See also the list of [contributors](https://github.com/openplayerjs/openplayerjs/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
