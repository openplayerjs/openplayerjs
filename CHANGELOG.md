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