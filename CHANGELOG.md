<a name="1.3.1"></a>
## [1.3.1](https://github.com/openplayerjs/openplayerjs/compare/v1.3.0...v1.3.1) (2018-09-28)


### Bug Fixes

* **ads:** Added missing conditional to destroy correctly Ads when single URL is being passed via an array ([b3c6a6f](https://github.com/openplayerjs/openplayerjs/commit/b3c6a6f))
* **ads:** Addressed first issues with iOS when playing Ads inline ([cebd42e](https://github.com/openplayerjs/openplayerjs/commit/cebd42e))
* **ads:** Fixed issue with DASH not setting sources properly when interacting with Ads; fixed autoplay workflow with Ads ([9fee3b9](https://github.com/openplayerjs/openplayerjs/commit/9fee3b9))
* **ads:** Refactor workflow on Ads to ensure they will play in mobile devices correctly; fixed styles for Ads and removed tooltip from mobile devices ([2f1ab57](https://github.com/openplayerjs/openplayerjs/commit/2f1ab57))
* **ads:** Removed event that caused only one Ad to be played in iOS; hid captions when Ads are playing in mobile devices and improved loading of sources in demo ([334c650](https://github.com/openplayerjs/openplayerjs/commit/334c650))
* **ads:** Removed event that caused only one Ad to be played in iOS; hid captions when Ads are playing in mobile devices and improved loading of sources in demo ([47f8b79](https://github.com/openplayerjs/openplayerjs/commit/47f8b79))
* **demo:** Removed ES6 arrow function for better compatibility ([c02b303](https://github.com/openplayerjs/openplayerjs/commit/c02b303))
* **hls:** Use long URL to avoid 404 in source map for HLS.js ([e18fefe](https://github.com/openplayerjs/openplayerjs/commit/e18fefe))
* **player:** Hid buttons not needed for Ads ([7761ef0](https://github.com/openplayerjs/openplayerjs/commit/7761ef0))
* **progress:** Removed tooltip completely from mobile devices ([ad63445](https://github.com/openplayerjs/openplayerjs/commit/ad63445))
* **readme:** Updated logo ([aeb7a31](https://github.com/openplayerjs/openplayerjs/commit/aeb7a31))


### Features

* **player:** Renamed classes for entire project; fixed Type Definition file ([f646d69](https://github.com/openplayerjs/openplayerjs/commit/f646d69))



<a name="1.4.0"></a>
# [1.4.0](https://github.com/openplayerjs/openplayerjs/compare/v1.3.0...v1.4.0) (2018-09-28)


### Bug Fixes

* **ads:** Added missing conditional to destroy correctly Ads when single URL is being passed via an array ([b3c6a6f](https://github.com/openplayerjs/openplayerjs/commit/b3c6a6f))
* **ads:** Addressed first issues with iOS when playing Ads inline ([cebd42e](https://github.com/openplayerjs/openplayerjs/commit/cebd42e))
* **ads:** Fixed issue with DASH not setting sources properly when interacting with Ads; fixed autoplay workflow with Ads ([9fee3b9](https://github.com/openplayerjs/openplayerjs/commit/9fee3b9))
* **ads:** Refactor workflow on Ads to ensure they will play in mobile devices correctly; fixed styles for Ads and removed tooltip from mobile devices ([2f1ab57](https://github.com/openplayerjs/openplayerjs/commit/2f1ab57))
* **ads:** Removed event that caused only one Ad to be played in iOS; hid captions when Ads are playing in mobile devices and improved loading of sources in demo ([334c650](https://github.com/openplayerjs/openplayerjs/commit/334c650))
* **ads:** Removed event that caused only one Ad to be played in iOS; hid captions when Ads are playing in mobile devices and improved loading of sources in demo ([47f8b79](https://github.com/openplayerjs/openplayerjs/commit/47f8b79))
* **demo:** Removed ES6 arrow function for better compatibility ([c02b303](https://github.com/openplayerjs/openplayerjs/commit/c02b303))
* **hls:** Use long URL to avoid 404 in source map for HLS.js ([e18fefe](https://github.com/openplayerjs/openplayerjs/commit/e18fefe))
* **player:** Hid buttons not needed for Ads ([7761ef0](https://github.com/openplayerjs/openplayerjs/commit/7761ef0))
* **progress:** Removed tooltip completely from mobile devices ([ad63445](https://github.com/openplayerjs/openplayerjs/commit/ad63445))
* **readme:** Updated logo ([aeb7a31](https://github.com/openplayerjs/openplayerjs/commit/aeb7a31))


### Features

* **player:** Renamed classes for entire project; fixed Type Definition file ([f646d69](https://github.com/openplayerjs/openplayerjs/commit/f646d69))



<a name="1.3.0"></a>
# [1.3.0](https://github.com/openplayerjs/openplayerjs/compare/v1.2.3...v1.3.0) (2018-09-19)


### Bug Fixes

* **ads:** Added workflow to prevent video to starts playing before the Ad ([548dc96](https://github.com/openplayerjs/openplayerjs/commit/548dc96))
* **ads:** Cleaned up styles for Ads, simplified method to resize Ads and added missing conditional to indicate their view mode ([f9046b0](https://github.com/openplayerjs/openplayerjs/commit/f9046b0))
* **ads:** Updated documentation for Ads ([d924611](https://github.com/openplayerjs/openplayerjs/commit/d924611))
* **captions:** Added missing conditional to avoid issues if caption layer is not ready to show captions ([192a33f](https://github.com/openplayerjs/openplayerjs/commit/192a33f))
* **captions:** Added workflow to only include tracks with captions and subitems in the Settings element if there are more than 2 captions available ([febb456](https://github.com/openplayerjs/openplayerjs/commit/febb456))
* **css:** Fixed minor style for time rail to get correct focus on audio player ([9a2aff5](https://github.com/openplayerjs/openplayerjs/commit/9a2aff5))
* **media:** Fixed workflow to enhance custom media to a more reduced approach ([c63d85e](https://github.com/openplayerjs/openplayerjs/commit/c63d85e))
* **media:** Improved the workflow to start and stop loading of HLS sources depending of autoplay/preload attributes ([a1fa8eb](https://github.com/openplayerjs/openplayerjs/commit/a1fa8eb))
* **package:** Fixed README URL ([40060fe](https://github.com/openplayerjs/openplayerjs/commit/40060fe))
* **player:** Borrowed snippet to test if HLS.js is truly supported on browser ([f34938b](https://github.com/openplayerjs/openplayerjs/commit/f34938b))
* **player:** Fix data-* attribute to indicate active caption language ([f68c43c](https://github.com/openplayerjs/openplayerjs/commit/f68c43c))
* **player:** Fixed Accessibility issues found in the player via Wave ([ce4306c](https://github.com/openplayerjs/openplayerjs/commit/ce4306c))
* **player:** Fixed duration issues when duration is Infinity ([81941fc](https://github.com/openplayerjs/openplayerjs/commit/81941fc))
* **player:** Fixed issue with non-existing Ads options ([98f6f9d](https://github.com/openplayerjs/openplayerjs/commit/98f6f9d))
* **player:** Fixed issue with not being able to pause video by touching screen on iPad and fixed fullscreen presentation ([df2f3d8](https://github.com/openplayerjs/openplayerjs/commit/df2f3d8))
* **player:** Fixed typo when checking for captions detected and added assignment of default caption at higher level ([e8da4c7](https://github.com/openplayerjs/openplayerjs/commit/e8da4c7))
* **player:** Fixed way to attach/dispatch HLS events for hls.js ([4b3747c](https://github.com/openplayerjs/openplayerjs/commit/4b3747c))
* **player:** Refactor workflow to add captions based on validation and existance of cues ahead of time to avoid rendering languages with no valid captions ([f602d1b](https://github.com/openplayerjs/openplayerjs/commit/f602d1b))
* **player:** Refined support for HLS.js by not including Safari as part of the supported browsers ([aefb6a8](https://github.com/openplayerjs/openplayerjs/commit/aefb6a8))
* **player:** Refined touch event on time rail to prevent default behavior; fixed issue with Ads not playing correctly on iOS ([47cbd88](https://github.com/openplayerjs/openplayerjs/commit/47cbd88))
* **player:** Reordered operation to ensure proper creation of markup when `controlschanged` event is dispatched ([3dde2ab](https://github.com/openplayerjs/openplayerjs/commit/3dde2ab))
* **settings:** Added new event to remove items from settings; implemented event in captions when no cues are detected ([cd045a5](https://github.com/openplayerjs/openplayerjs/commit/cd045a5))
* **settings:** Fixed issue with Settings not retrieving the proper submenu after selecting an option from it ([3afe609](https://github.com/openplayerjs/openplayerjs/commit/3afe609))
* **styles:** Added missing CSS rule for input range ([2676fe1](https://github.com/openplayerjs/openplayerjs/commit/2676fe1))



<a name="1.2.3"></a>
## [1.2.3](https://github.com/openplayerjs/openplayerjs/compare/v1.2.2...v1.2.3) (2018-09-06)


### Bug Fixes

* **player:** Simplified workflow to generate fullscreen video by relying only in CSS ([8e9d3a6](https://github.com/openplayerjs/openplayerjs/commit/8e9d3a6))



<a name="1.2.2"></a>
## [1.2.2](https://github.com/openplayerjs/openplayerjs/compare/v1.2.1...v1.2.2) (2018-09-04)


### Bug Fixes

* **docs:** Added CSS rule for text ([1836685](https://github.com/openplayerjs/openplayerjs/commit/1836685))
* **docs:** Added missing form element and integrated workflow to consider audio in embed iframe ([900b5fe](https://github.com/openplayerjs/openplayerjs/commit/900b5fe))
* **docs:** Added missing URL element to obtain proper permalink ([faf3a98](https://github.com/openplayerjs/openplayerjs/commit/faf3a98))
* **docs:** Fixed style for iframe ([578ca79](https://github.com/openplayerjs/openplayerjs/commit/578ca79))
* **docs:** Re-added old folder for player docs and fixed NPM commands ([25f3f89](https://github.com/openplayerjs/openplayerjs/commit/25f3f89))
* **player:** Added conditional to test if container of player exists to remove callback effectively ([2b96bd4](https://github.com/openplayerjs/openplayerjs/commit/2b96bd4))
* **webpack:** Fixed webpack and babelrc config after babel-loader upgrade ([c896c75](https://github.com/openplayerjs/openplayerjs/commit/c896c75))



<a name="1.2.1"></a>
## [1.2.1](https://github.com/rafa8626/openplayer/compare/v1.2.0...v1.2.1) (2018-08-27)


### Bug Fixes

* **ads:** Added conditional to avoid autoplay when an error occurs attempting to play Ads ([0d67fe5](https://github.com/rafa8626/openplayer/commit/0d67fe5))
* **ads:** Added new conditional to play media if error was detected on Ads; added missing docs ([786a104](https://github.com/rafa8626/openplayer/commit/786a104))
* **ads:** Test autoplay capabilities inside Ads only if `autoStart` is set to `true` ([694544d](https://github.com/rafa8626/openplayer/commit/694544d))
* **documentation:** More verbosity in JS snippet to clarify possible values ([9c709d4](https://github.com/rafa8626/openplayer/commit/9c709d4))
* **player:** Added missing event and avoid default behavior on play button ([eafc260](https://github.com/rafa8626/openplayer/commit/eafc260))
* **player:** Changed target to execute keydown event to main wrapper to use keyboard successfully ([c67c595](https://github.com/rafa8626/openplayer/commit/c67c595))
* **tests:** Fixed unit tests due changes on event ([f48c0a7](https://github.com/rafa8626/openplayer/commit/f48c0a7))



<a name="1.2.0"></a>
# [1.2.0](https://github.com/rafa8626/openplayer/compare/v1.1.4...v1.2.0) (2018-08-22)


### Bug Fixes

* **package:** Downgrade cssnano version ([93acdaa](https://github.com/rafa8626/openplayer/commit/93acdaa))
* **player:** Added `requestAnimationFrame` and `cancelAnimationFrame` for resize events ([01da7f7](https://github.com/rafa8626/openplayer/commit/01da7f7))
* **player:** Added missing conditionals to set proper config on HLS and Dash players; changed test source to use HTTPS ([46a02f9](https://github.com/rafa8626/openplayer/commit/46a02f9))
* **player:** Fixed `fill` effect by using more CSS properties to enable proper resizing using that effect ([9547a11](https://github.com/rafa8626/openplayer/commit/9547a11))
* **webpack:** Removed configuration for `cssnano` configuration and updated package ([aa12ccc](https://github.com/rafa8626/openplayer/commit/aa12ccc))



<a name="1.1.5"></a>
## [1.1.5](https://github.com/rafa8626/openplayer/compare/v1.1.4...v1.1.5) (2018-08-22)


### Bug Fixes

* **package:** Downgrade cssnano version ([93acdaa](https://github.com/rafa8626/openplayer/commit/93acdaa))
* **player:** Added `requestAnimationFrame` and `cancelAnimationFrame` for resize events ([01da7f7](https://github.com/rafa8626/openplayer/commit/01da7f7))
* **player:** Added missing conditionals to set proper config on HLS and Dash players; changed test source to use HTTPS ([46a02f9](https://github.com/rafa8626/openplayer/commit/46a02f9))
* **player:** Fixed `fill` effect by using more CSS properties to enable proper resizing using that effect ([9547a11](https://github.com/rafa8626/openplayer/commit/9547a11))
* **webpack:** Removed configuration for `cssnano` configuration and updated package ([aa12ccc](https://github.com/rafa8626/openplayer/commit/aa12ccc))



<a name="1.1.5"></a>
## [1.1.5](https://github.com/rafa8626/openplayer/compare/v1.1.4...v1.1.5) (2018-08-22)


### Bug Fixes

* **package:** Downgrade cssnano version ([93acdaa](https://github.com/rafa8626/openplayer/commit/93acdaa))
* **player:** Added `requestAnimationFrame` and `cancelAnimationFrame` for resize events ([01da7f7](https://github.com/rafa8626/openplayer/commit/01da7f7))
* **player:** Added missing conditionals to set proper config on HLS and Dash players; changed test source to use HTTPS ([46a02f9](https://github.com/rafa8626/openplayer/commit/46a02f9))
* **player:** Fixed `fill` effect by using more CSS properties to enable proper resizing using that effect ([9547a11](https://github.com/rafa8626/openplayer/commit/9547a11))
* **webpack:** Removed configuration for `cssnano` configuration and updated package ([aa12ccc](https://github.com/rafa8626/openplayer/commit/aa12ccc))



<a name="1.2.0"></a>
## [1.2.0](https://github.com/rafa8626/openplayer/compare/v1.1.5...v1.2.0) (2018-08-22)


### Bug Fixes

* **package:** Downgrade cssnano version ([93acdaa](https://github.com/rafa8626/openplayer/commit/93acdaa))
* **player:** Added `requestAnimationFrame` and `cancelAnimationFrame` for resize events ([01da7f7](https://github.com/rafa8626/openplayer/commit/01da7f7))
* **player:** Added missing conditionals to set proper config on HLS and Dash players; changed test source to use HTTPS ([46a02f9](https://github.com/rafa8626/openplayer/commit/46a02f9))
* **player:** Fixed `fill` effect by using more CSS properties to enable proper resizing using that effect ([9547a11](https://github.com/rafa8626/openplayer/commit/9547a11))
* **webpack:** Removed configuration for `cssnano` configuration and updated package ([aa12ccc](https://github.com/rafa8626/openplayer/commit/aa12ccc))



<a name="1.1.5"></a>
## [1.1.5](https://github.com/rafa8626/openplayer/compare/v1.1.4...v1.1.5) (2018-07-23)

### Bug Fixes

* **package:** Downgrade cssnano version ([93acdaa](https://github.com/rafa8626/openplayer/commit/93acdaa))
* **release:** Removed unnecessary commands ([c521bca](https://github.com/rafa8626/openplayer/commit/c521bca))

<a name="1.1.4"></a>
## [1.1.4](https://github.com/rafa8626/openplayer/compare/v1.1.3...v1.1.4) (2018-06-18)

### Bug Fixes

* **documentation:** Fixed typos ([122742d](https://github.com/rafa8626/openplayer/commit/122742d))
* **player:** Added missing conditional to remove event correctly ([11fb824](https://github.com/rafa8626/openplayer/commit/11fb824))
* **release:** Removed unnecessary commands ([c521bca](https://github.com/rafa8626/openplayer/commit/c521bca))

<a name="1.1.3"></a>
## [1.1.3](https://github.com/rafa8626/openplayer/compare/v1.1.2...v1.1.3) (2018-05-31)

### Bug Fixes

* **player:** Removed missing window event listener once player is destroyed ([7dbcf84](https://github.com/rafa8626/openplayer/commit/7dbcf84))

<a name="1.1.2"></a>
## [1.1.2](https://github.com/rafa8626/openplayer/compare/v1.1.1...v1.1.2) (2018-05-18)

### Bug Fixes

* **player:** Added missing conditional to avoid attempting to build player when element does not exist ([20c65cb](https://github.com/rafa8626/openplayer/commit/20c65cb))

<a name="1.1.1"></a>
## [1.1.1](https://github.com/rafa8626/openplayer/compare/v1.1.0...v1.1.1) (2018-05-17)

### Bug Fixes

* **package:** Updated packages and fixed names for `main`, `style` and `types` elements ([d73aa68](https://github.com/rafa8626/openplayer/commit/d73aa68))
* **test:** Fixed bundle path in Karma config ([7e16e0c](https://github.com/rafa8626/openplayer/commit/7e16e0c))
* **test:** Fixed path for bundles in test file ([9b5f0e5](https://github.com/rafa8626/openplayer/commit/9b5f0e5))

<a name="1.1.0"></a>
# [1.1.0](https://github.com/rafa8626/openplayer/compare/v1.0.2...v1.1.0) (2018-05-17)

### Bug Fixes

* **config:** modified config elements to create bundles correctly ([03e23c2](https://github.com/rafa8626/openplayer/commit/03e23c2))

<a name="1.0.2"></a>
## [1.0.2](https://github.com/rafa8626/openplayer/compare/v1.0.1...v1.0.2) (2018-05-09)

### Bug Fixes

* **ads:** Fixed workflow to autoplay Ads in iOS by playing them muted initially ([45e00aa](https://github.com/rafa8626/openplayer/commit/45e00aa))
* **controls:** Added missing workflow for mobile devices to avoid hiding controls ([32d8f36](https://github.com/rafa8626/openplayer/commit/32d8f36))

### Features

* **release:** Added `release-it` package to simplify release tasks ([7f7be84](https://github.com/rafa8626/openplayer/commit/7f7be84))

<a name="1.0.1"></a>
## [1.0.1](https://github.com/rafa8626/openplayer/compare/v1.0.0...v1.0.1) (2018-05-02)

### Bug Fixes

* **Definitions:** Removed `export` keywords and fixed header to pass tests ([166f16d](https://github.com/rafa8626/openplayer/commit/166f16d))


<a name="1.0.0"></a>
# [1.0.0](https://github.com/rafa8626/openplayer/compare/v0.2.0...v1.0.0) (2018-05-02)

### Bug Fixes

* **Ads:** Fixed Ads workflow when playing midroll Ads not updating properly Play button ([c0f8703](https://github.com/rafa8626/openplayer/commit/c0f8703))
* **Documentation:** Changed order of certain methods for consistency, and refactor type definition file ([8e58f83](https://github.com/rafa8626/openplayer/commit/8e58f83))
* **Player:** Removed conditional to create controls on iPhone as well, and added negative `z-index` in Ads container when inactive ([2c60e29](https://github.com/rafa8626/openplayer/commit/2c60e29))
* **Styles:** Added missing `z-index` in buttons to override progress bar index in IE11 ([ec8af9e](https://github.com/rafa8626/openplayer/commit/ec8af9e))


<a name="0.2.0"></a>
# [0.2.0](https://github.com/rafa8626/openplayer/compare/v0.2.0...v0.1.0) (2018-04-23)

* **Documentation**: Completed work on API and methods sections; added new NPM commands


<a name="0.1.0"></a>
# 0.1.0 (2018-04-18)

### Bug Fixes

* **Tests:** Changed version of NodeJS ([9877597](https://github.com/rafa8626/openplayer/commit/9877597))
* **Tests:** Added missing elements to Travis config file ([8c9ec21](https://github.com/rafa8626/openplayer/commit/8c9ec21))
* **Tests:** Removed elements from Travis CI config to allow Greenkeeper to work ([8ba5e73](https://github.com/rafa8626/openplayer/commit/8ba5e73))
* **Tests:** Removed unnecessary task from Travis CI ([b58b6db](https://github.com/rafa8626/openplayer/commit/b58b6db))

### Features

* **Tests:** Added browser tests with Mocha/Chai and support for Travis CI ([e43b197](https://github.com/rafa8626/openplayer/commit/e43b197))