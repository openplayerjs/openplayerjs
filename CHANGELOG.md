# 1.15.0 (2020-03-04)


### Bug Fixes

* **ads:** Added `waiting` event to be dispatched while loading Ads; fixed conditionals to show/hide loader ([f26c25f](https://github.com/openplayerjs/openplayerjs/commit/f26c25f))
* **ads:** Added conditional to avoid autoplay when an error occurs attempting to play Ads ([3a61f62](https://github.com/openplayerjs/openplayerjs/commit/3a61f62))
* **ads:** Added missing call to initialize() method after an error occurred and having multiple Ads to play; added new event listener to resize Ads when media has been loaded ([74039e9](https://github.com/openplayerjs/openplayerjs/commit/74039e9))
* **ads:** Added missing callback on mobile devices to load Ads correctly ([39bae5b](https://github.com/openplayerjs/openplayerjs/commit/39bae5b))
* **ads:** Added missing conditional to destroy correctly Ads when single URL is being passed via an array ([a2e840a](https://github.com/openplayerjs/openplayerjs/commit/a2e840a))
* **ads:** Added missing workflow for mobile Ads to resume correctly media and display middle and postroll Ads correctly ([ea61843](https://github.com/openplayerjs/openplayerjs/commit/ea61843))
* **ads:** Added more conditionals to check errors from trying to determine if a string is a valid XML or not ([728290e](https://github.com/openplayerjs/openplayerjs/commit/728290e))
* **ads:** Added new conditional to play media if error was detected on Ads; added missing docs ([a7c97c7](https://github.com/openplayerjs/openplayerjs/commit/a7c97c7))
* **ads:** Added workflow to prevent video to starts playing before the Ad ([5cde1a4](https://github.com/openplayerjs/openplayerjs/commit/5cde1a4))
* **ads:** Addressed first issues with iOS when playing Ads inline ([2051df6](https://github.com/openplayerjs/openplayerjs/commit/2051df6))
* **ads:** Cleaned up styles for Ads, simplified method to resize Ads and added missing conditional to indicate their view mode ([618dfd2](https://github.com/openplayerjs/openplayerjs/commit/618dfd2))
* **ads:** Dispatched new event to show loading state on ads; fixed dimensions on Ad when starting to play; fixed typo in waiting event ([e16c6a1](https://github.com/openplayerjs/openplayerjs/commit/e16c6a1))
* **ads:** Expanded conditional to start media after Ad has been played if there is no `seekable` info; added missing event for HLS media ([918aaa8](https://github.com/openplayerjs/openplayerjs/commit/918aaa8))
* **ads:** Fixed Ads workflow when playing midroll Ads not updating properly Play button ([2d1bbc8](https://github.com/openplayerjs/openplayerjs/commit/2d1bbc8))
* **ads:** Fixed issue when player is not recovering after Ads error ([4b8a0d3](https://github.com/openplayerjs/openplayerjs/commit/4b8a0d3))
* **ads:** Fixed issue where double requests to media were made non-mobile devices after Ads ended ([d791f54](https://github.com/openplayerjs/openplayerjs/commit/d791f54))
* **ads:** Fixed issue with DASH not setting sources properly when interacting with Ads; fixed autoplay workflow with Ads ([482771e](https://github.com/openplayerjs/openplayerjs/commit/482771e))
* **ads:** Fixed workflow to autoplay Ads in iOS by playing them muted initially ([5fca8f9](https://github.com/openplayerjs/openplayerjs/commit/5fca8f9))
* **ads:** Fixed workflow when dealing with a list of Ads URLs; removed unnecessary workflow to end media when Ad is completed ([66dddea](https://github.com/openplayerjs/openplayerjs/commit/66dddea))
* **ads:** Modified error conditional and displaying of error; added missing workflow on `loadedmetadata` event to check if more Ad URLs need to be loaded ([72caef6](https://github.com/openplayerjs/openplayerjs/commit/72caef6))
* **ads:** Refactor workflow on Ads to ensure they will play in mobile devices correctly; fixed styles for Ads and removed tooltip from mobile devices ([f0ae7ec](https://github.com/openplayerjs/openplayerjs/commit/f0ae7ec))
* **ads:** Removed event listener once Ad has been destroyed ([c5f645f](https://github.com/openplayerjs/openplayerjs/commit/c5f645f))
* **ads:** Removed event that caused only one Ad to be played in iOS; hid captions when Ads are playing in mobile devices and improved loading of sources in demo ([6cbbaa1](https://github.com/openplayerjs/openplayerjs/commit/6cbbaa1))
* **ads:** Removed event that caused only one Ad to be played in iOS; hid captions when Ads are playing in mobile devices and improved loading of sources in demo ([eb0e8e9](https://github.com/openplayerjs/openplayerjs/commit/eb0e8e9))
* **ads:** Test autoplay capabilities inside Ads only if `autoStart` is set to `true` ([7e15a84](https://github.com/openplayerjs/openplayerjs/commit/7e15a84))
* **ads:** Updated documentation for Ads ([b4ca1fc](https://github.com/openplayerjs/openplayerjs/commit/b4ca1fc))
* **captions:** Added missing conditional to avoid issues if caption layer is not ready to show captions ([10e5bba](https://github.com/openplayerjs/openplayerjs/commit/10e5bba))
* **captions:** Added missing workflow to check if hours were present in closed captions time codes; updated README file to indicate how to integrate closed captioning ([ddb621b](https://github.com/openplayerjs/openplayerjs/commit/ddb621b))
* **captions:** Added missing workflow to set the proper caption language as data-* attribute when clicking on Caption toggle button; fixed package import ([76f1ec6](https://github.com/openplayerjs/openplayerjs/commit/76f1ec6))
* **captions:** Added new styles to deal with iOS native captions when using fullscreen and removed unnecessary ones ([044c5f0](https://github.com/openplayerjs/openplayerjs/commit/044c5f0))
* **captions:** Added workflow to only include tracks with captions and subitems in the Settings element if there are more than 2 captions available ([b97c0dc](https://github.com/openplayerjs/openplayerjs/commit/b97c0dc))
* **captions:** Added workflow to verify that tracks match the `track` tag(s) (if any) to avoid extra TextTracks to be included ([f424dbd](https://github.com/openplayerjs/openplayerjs/commit/f424dbd))
* **captions:** Changed way to generate menu caption items when `detachMenu` is true due to issues with nodes being removed asyncronously ([026ae98](https://github.com/openplayerjs/openplayerjs/commit/026ae98))
* **captions:** Fixed workflow to prepare captions correctly by removing assignment of current caption to the first one ([a6aa9bf](https://github.com/openplayerjs/openplayerjs/commit/a6aa9bf))
* **config:** modified config elements to create bundles correctly ([81941cb](https://github.com/openplayerjs/openplayerjs/commit/81941cb))
* **controls:** Added missing workflow for mobile devices to avoid hiding controls ([8689291](https://github.com/openplayerjs/openplayerjs/commit/8689291))
* **controls:** Added new class to indicate position of the custom controls; ensured that all items in right position are prepended rather than appended ([c3066ab](https://github.com/openplayerjs/openplayerjs/commit/c3066ab))
* **controls:** Ensured that fullscreen is the last icon on the control bar; added missing documentation ([70e19c1](https://github.com/openplayerjs/openplayerjs/commit/70e19c1))
* **controls:** Synced play event with timeout option to hide at the same time controls and play button ([4073e4f](https://github.com/openplayerjs/openplayerjs/commit/4073e4f))
* **css:** Added new styles to fix issues in IE11 and display captions on iOS properly when not using `playsinline` attribute ([b48baba](https://github.com/openplayerjs/openplayerjs/commit/b48baba))
* **css:** Adjusted styles to remove ticks in IE11 and added missing CSS property on volume bar ([f659903](https://github.com/openplayerjs/openplayerjs/commit/f659903))
* **css:** Fixed minor style for time rail to get correct focus on audio player ([5bdae42](https://github.com/openplayerjs/openplayerjs/commit/5bdae42))
* **Definitions:** Removed `export` keywords and fixed header to pass tests ([c1616c0](https://github.com/openplayerjs/openplayerjs/commit/c1616c0))
* **demo:** Removed ES6 arrow function for better compatibility ([98a8530](https://github.com/openplayerjs/openplayerjs/commit/98a8530))
* **demo:** Reverted demo to original state ([57f341c](https://github.com/openplayerjs/openplayerjs/commit/57f341c))
* **docs:** Added CSS rule for text ([a74b0cb](https://github.com/openplayerjs/openplayerjs/commit/a74b0cb))
* **docs:** Added missing form element and integrated workflow to consider audio in embed iframe ([8193786](https://github.com/openplayerjs/openplayerjs/commit/8193786))
* **docs:** Added missing URL element to obtain proper permalink ([d230422](https://github.com/openplayerjs/openplayerjs/commit/d230422))
* **docs:** Fixed style for iframe ([f9781be](https://github.com/openplayerjs/openplayerjs/commit/f9781be))
* **docs:** Re-added old folder for player docs and fixed NPM commands ([b580a05](https://github.com/openplayerjs/openplayerjs/commit/b580a05))
* **documentation:** Fixed documentation and changed order of certain methods for consistency, and refactor type definition ([b5258b3](https://github.com/openplayerjs/openplayerjs/commit/b5258b3))
* **documentation:** Fixed typos ([66f2aed](https://github.com/openplayerjs/openplayerjs/commit/66f2aed))
* **documentation:** More verbosity in JS snippet to clarify possible values ([68e7bd7](https://github.com/openplayerjs/openplayerjs/commit/68e7bd7))
* **events:** Fixed Ads error event due to typo; removed default `onError` content ([d6312db](https://github.com/openplayerjs/openplayerjs/commit/d6312db))
* **fullscreen:** Fixed issues related to non-standard methods for fullscreen ([2a95d4c](https://github.com/openplayerjs/openplayerjs/commit/2a95d4c))
* **hls:** Use long URL to avoid 404 in source map for HLS.js ([f0685c8](https://github.com/openplayerjs/openplayerjs/commit/f0685c8))
* **media:** Fixed workflow to enhance custom media to a more reduced approach ([c3f2c9e](https://github.com/openplayerjs/openplayerjs/commit/c3f2c9e))
* **media:** Improved the workflow to start and stop loading of HLS sources depending of autoplay/preload attributes ([dfda5cd](https://github.com/openplayerjs/openplayerjs/commit/dfda5cd))
* **package:** Downgrade cssnano version ([1bdd562](https://github.com/openplayerjs/openplayerjs/commit/1bdd562))
* **package:** Fixed README URL ([bf02e0b](https://github.com/openplayerjs/openplayerjs/commit/bf02e0b))
* **package:** update deepmerge to version 3.0.0 ([50c148a](https://github.com/openplayerjs/openplayerjs/commit/50c148a))
* **package:** Updated packages and fixed names for `main`, `style` and `types` elements ([2c2c97a](https://github.com/openplayerjs/openplayerjs/commit/2c2c97a))
* **player:** Added `requestAnimationFrame` and `cancelAnimationFrame` for resize events ([87ec25c](https://github.com/openplayerjs/openplayerjs/commit/87ec25c))
* **player:** Added conditional to test if container of player exists to remove callback effectively ([e78c1ef](https://github.com/openplayerjs/openplayerjs/commit/e78c1ef))
* **player:** Added control position as part of each one of the controls class names to allow more advanced styling ([82a0634](https://github.com/openplayerjs/openplayerjs/commit/82a0634))
* **player:** Added default value when no options are passed to the player ([aed189f](https://github.com/openplayerjs/openplayerjs/commit/aed189f))
* **player:** Added missing action to remove class from Captions button when hiding captions ([56dbe99](https://github.com/openplayerjs/openplayerjs/commit/56dbe99))
* **player:** Added missing condition to captions button to remove class; fixed issues with WebPack and unit tests ([5c01eb2](https://github.com/openplayerjs/openplayerjs/commit/5c01eb2))
* **player:** Added missing conditional to avoid attempting to build player when element does not exist ([da497eb](https://github.com/openplayerjs/openplayerjs/commit/da497eb))
* **player:** Added missing conditional to avoid issues when clicking multiple times on Settings; changed browser to test locally ([c3cc4b5](https://github.com/openplayerjs/openplayerjs/commit/c3cc4b5))
* **player:** Added missing conditional to remove event correctly ([6bb7c71](https://github.com/openplayerjs/openplayerjs/commit/6bb7c71))
* **player:** Added missing conditional to set an empty source when none is present ([3bd81b1](https://github.com/openplayerjs/openplayerjs/commit/3bd81b1))
* **player:** Added missing conditionals to allow big pause button to play video ([f59c144](https://github.com/openplayerjs/openplayerjs/commit/f59c144))
* **player:** Added missing conditionals to avoid hiding controls when paused and on regular media; fixed typo on stylesheet ([3e68e7c](https://github.com/openplayerjs/openplayerjs/commit/3e68e7c))
* **player:** Added missing conditionals to set proper config on HLS and Dash players; changed test source to use HTTPS ([874f932](https://github.com/openplayerjs/openplayerjs/commit/874f932))
* **player:** Added missing event and avoid default behavior on play button ([2cc1d93](https://github.com/openplayerjs/openplayerjs/commit/2cc1d93))
* **player:** Added missing events to display/hide loader image ([c2e8d0a](https://github.com/openplayerjs/openplayerjs/commit/c2e8d0a))
* **player:** Added missing tabindex for Mute button ([feb3b35](https://github.com/openplayerjs/openplayerjs/commit/feb3b35))
* **player:** Added missing try/catch blocks to execute exceptions properly ([0762c3d](https://github.com/openplayerjs/openplayerjs/commit/0762c3d))
* **player:** Added missing workflow to allow player to toggle fullscreen if user is in fullscreen mode and controls are recreated ([2b48fe9](https://github.com/openplayerjs/openplayerjs/commit/2b48fe9))
* **player:** Added missing workflow to check if media has finished playing when Ad stopped playing on post roll to destroy Ads completely ([0716b52](https://github.com/openplayerjs/openplayerjs/commit/0716b52))
* **player:** Added missing workflow to hide other menus when selecting another ([fa01773](https://github.com/openplayerjs/openplayerjs/commit/fa01773))
* **player:** Added play event to hide control bar ([e1884bb](https://github.com/openplayerjs/openplayerjs/commit/e1884bb))
* **player:** Added proper tooltip on play button when it is paused ([051e23c](https://github.com/openplayerjs/openplayerjs/commit/051e23c))
* **player:** Borrowed snippet to test if HLS.js is truly supported on browser ([a8090e1](https://github.com/openplayerjs/openplayerjs/commit/a8090e1))
* **player:** Changed `hidden` to `disabled` mode to avoid displaying native captions on MS Edge ([9dac443](https://github.com/openplayerjs/openplayerjs/commit/9dac443))
* **player:** Changed default setting for speed to current media one to allow user to use a different one ([34bb41a](https://github.com/openplayerjs/openplayerjs/commit/34bb41a))
* **player:** Changed paths for packages to give proper support to IE11 ([b926dc6](https://github.com/openplayerjs/openplayerjs/commit/b926dc6))
* **player:** Changed target to execute keydown event to main wrapper to use keyboard successfully ([b2b2893](https://github.com/openplayerjs/openplayerjs/commit/b2b2893))
* **player:** Deactivated `Levels` by default; added new source for playlist ([b7de69c](https://github.com/openplayerjs/openplayerjs/commit/b7de69c))
* **player:** Enhanced events for iPhone to support fullscreen ([88a5624](https://github.com/openplayerjs/openplayerjs/commit/88a5624))
* **player:** Expanded conditional to allow rendering settings speed by default ([fe5a271](https://github.com/openplayerjs/openplayerjs/commit/fe5a271))
* **player:** Expanded conditionals to test if media is HLS or Dash using also MIME types ([cd3c72c](https://github.com/openplayerjs/openplayerjs/commit/cd3c72c))
* **player:** Favored native captions in inline mode after the user has enabled fullscreen in iOS ([fca7fa1](https://github.com/openplayerjs/openplayerjs/commit/fca7fa1))
* **player:** Fix data-* attribute to indicate active caption language ([49a24b2](https://github.com/openplayerjs/openplayerjs/commit/49a24b2))
* **player:** Fixed `fill` effect by using more CSS properties to enable proper resizing using that effect ([8112984](https://github.com/openplayerjs/openplayerjs/commit/8112984))
* **player:** Fixed Accessibility issues found in the player via Wave ([f1200ea](https://github.com/openplayerjs/openplayerjs/commit/f1200ea))
* **player:** Fixed callback to autoplay workflow based on iOS and Safari policies to autoplay on mute ([abae7bd](https://github.com/openplayerjs/openplayerjs/commit/abae7bd))
* **player:** Fixed duration issues when duration is Infinity ([057a6cb](https://github.com/openplayerjs/openplayerjs/commit/057a6cb))
* **player:** Fixed error when running tests on Travis ([aaee1ea](https://github.com/openplayerjs/openplayerjs/commit/aaee1ea))
* **player:** Fixed issue with non-existing Ads options ([e15cf09](https://github.com/openplayerjs/openplayerjs/commit/e15cf09))
* **player:** Fixed issue with not being able to pause video by touching screen on iPad and fixed fullscreen presentation ([1166bef](https://github.com/openplayerjs/openplayerjs/commit/1166bef))
* **player:** Fixed position of tooltip and fixed issue related to promise not being executed correctly ([#120](https://github.com/openplayerjs/openplayerjs/issues/120)) ([3a0dd5c](https://github.com/openplayerjs/openplayerjs/commit/3a0dd5c))
* **player:** Fixed typo and added workflow to just update captions when track with same srclang and kind existed previously ([0bab31e](https://github.com/openplayerjs/openplayerjs/commit/0bab31e))
* **player:** Fixed typo when checking for captions detected and added assignment of default caption at higher level ([41f7875](https://github.com/openplayerjs/openplayerjs/commit/41f7875))
* **player:** Fixed typos when creating event and added documentation about it ([e180e46](https://github.com/openplayerjs/openplayerjs/commit/e180e46))
* **player:** Fixed way to attach/dispatch HLS events for hls.js ([129b68f](https://github.com/openplayerjs/openplayerjs/commit/129b68f))
* **player:** Fixed way to create events to pass data from media types correctly ([8549577](https://github.com/openplayerjs/openplayerjs/commit/8549577))
* **player:** Formatted time when media has ended and added missing validation for it to avoid displaying NaN values ([c4c591e](https://github.com/openplayerjs/openplayerjs/commit/c4c591e))
* **player:** Hid buttons not needed for Ads ([b3bb99a](https://github.com/openplayerjs/openplayerjs/commit/b3bb99a))
* **player:** Hid default captions layer to favor player's captions layer ([c06adcf](https://github.com/openplayerjs/openplayerjs/commit/c06adcf))
* **player:** Modified autoplay workflow to verify current media content instead of video placeholder; removed unnecessary code in Ads to verify autoplay capabilities ([59848dd](https://github.com/openplayerjs/openplayerjs/commit/59848dd))
* **player:** Moved event dispatcher outside of conditional to ensure volume icon is updated accordingly ([5bbf745](https://github.com/openplayerjs/openplayerjs/commit/5bbf745))
* **player:** Moved loader hiding outside of timer on `play` event ([1f081ae](https://github.com/openplayerjs/openplayerjs/commit/1f081ae))
* **player:** Refactor workflow to add captions based on validation and existance of cues ahead of time to avoid rendering languages with no valid captions ([d3c53d6](https://github.com/openplayerjs/openplayerjs/commit/d3c53d6))
* **player:** Refined support for HLS.js by not including Safari as part of the supported browsers ([9df28f7](https://github.com/openplayerjs/openplayerjs/commit/9df28f7))
* **player:** Refined touch event on time rail to prevent default behavior; fixed issue with Ads not playing correctly on iOS ([42bfd46](https://github.com/openplayerjs/openplayerjs/commit/42bfd46))
* **player:** Refined workflow to update captions ([37a3e09](https://github.com/openplayerjs/openplayerjs/commit/37a3e09))
* **player:** Removed conditional to create controls on iPhone as well, and added negative `z-index` in Ads container when inactive ([1aca10e](https://github.com/openplayerjs/openplayerjs/commit/1aca10e))
* **player:** Removed duplicate controls due to deep merge ([98218f8](https://github.com/openplayerjs/openplayerjs/commit/98218f8))
* **player:** Removed missing window event listener once player is destroyed ([a3f596b](https://github.com/openplayerjs/openplayerjs/commit/a3f596b))
* **player:** Removed reset of playback when destroying settings ([a0acf28](https://github.com/openplayerjs/openplayerjs/commit/a0acf28))
* **player:** Removed resetting of `autoplay` and expand conditional to test if HLS.js needs to be loaded ([09c3124](https://github.com/openplayerjs/openplayerjs/commit/09c3124))
* **player:** Removed unnecessary attributes; expanded conditional on `loadedmetadata` to not consider mobile devices; added missing workflow to show/hide progress bar per tests on Android devices ([06281c7](https://github.com/openplayerjs/openplayerjs/commit/06281c7))
* **player:** Removed unnecessary event workflow and added loader state in `loadedmetadata` event ([2f6c03c](https://github.com/openplayerjs/openplayerjs/commit/2f6c03c))
* **player:** Reordered operation to ensure proper creation of markup when `controlschanged` event is dispatched ([9feff69](https://github.com/openplayerjs/openplayerjs/commit/9feff69))
* **player:** Restructured way to build captions menu to avoid issues on IE11 when `detachMenus` is `true` ([9d0d2a7](https://github.com/openplayerjs/openplayerjs/commit/9d0d2a7))
* **player:** Set play request for Ads when clicking on media; fixed workflow to check if player can play media; removed setting controls when requesting Ads ([fd53ee2](https://github.com/openplayerjs/openplayerjs/commit/fd53ee2))
* **player:** Simplified workflow to generate fullscreen video by relying only in CSS ([e6f435f](https://github.com/openplayerjs/openplayerjs/commit/e6f435f))
* **player:** Updated import references due `core-js` latest update ([40f9475](https://github.com/openplayerjs/openplayerjs/commit/40f9475))
* **player:** Updated method in Dash.js after upgrade ([71c4a93](https://github.com/openplayerjs/openplayerjs/commit/71c4a93))
* **progress:** Removed tooltip completely from mobile devices ([591d2f9](https://github.com/openplayerjs/openplayerjs/commit/591d2f9))
* **readme:** Added correct way to install package via NPM ([8f449ac](https://github.com/openplayerjs/openplayerjs/commit/8f449ac))
* **readme:** Added correct way to use package for Node projects ([c7582ee](https://github.com/openplayerjs/openplayerjs/commit/c7582ee))
* **readme:** Updated logo ([ef21fb1](https://github.com/openplayerjs/openplayerjs/commit/ef21fb1))
* **README:** Added updated examples and fixed minor issues detected in structure ([5da9545](https://github.com/openplayerjs/openplayerjs/commit/5da9545))
* **release:** Removed unnecessary commands ([14a8927](https://github.com/openplayerjs/openplayerjs/commit/14a8927))
* **settings:** Added new event to remove items from settings; implemented event in captions when no cues are detected ([bc6c1e0](https://github.com/openplayerjs/openplayerjs/commit/bc6c1e0))
* **settings:** Fixed issue with Settings not retrieving the proper submenu after selecting an option from it ([643b82f](https://github.com/openplayerjs/openplayerjs/commit/643b82f))
* **styles:** Added missing `z-index` in buttons to override progress bar index in IE11 ([ee57974](https://github.com/openplayerjs/openplayerjs/commit/ee57974))
* **styles:** Added missing CSS rule for input range ([640a5c2](https://github.com/openplayerjs/openplayerjs/commit/640a5c2))
* **test:** Changed version of NodeJS ([83fb6c1](https://github.com/openplayerjs/openplayerjs/commit/83fb6c1))
* **test:** Fixed bundle path in Karma config ([8a94d98](https://github.com/openplayerjs/openplayerjs/commit/8a94d98))
* **test:** Fixed path for bundles in test file ([682d589](https://github.com/openplayerjs/openplayerjs/commit/682d589))
* **tests:** Added missing elements to Travis config file ([a5fc0c5](https://github.com/openplayerjs/openplayerjs/commit/a5fc0c5))
* **tests:** Changed sources to a valid one ([a57817c](https://github.com/openplayerjs/openplayerjs/commit/a57817c))
* **tests:** Changed sources to a valid one ([4fde589](https://github.com/openplayerjs/openplayerjs/commit/4fde589))
* **tests:** Fixed unit tests due changes on event ([4e0ddb9](https://github.com/openplayerjs/openplayerjs/commit/4e0ddb9))
* **tests:** Removed elements from Travis CI config to allow Greenkeeper to work ([3d8bb78](https://github.com/openplayerjs/openplayerjs/commit/3d8bb78))
* **tests:** Removed unnecessary task from Travis CI ([919fdd7](https://github.com/openplayerjs/openplayerjs/commit/919fdd7))
* **tests:** Reverted settings to allow Travis to continue testing properly ([57ad7cc](https://github.com/openplayerjs/openplayerjs/commit/57ad7cc))
* **tests:** Updated MP4 source to match the current source in the video tag ([5f2cccd](https://github.com/openplayerjs/openplayerjs/commit/5f2cccd))
* **webpack:** Added `global` package ([e4a9399](https://github.com/openplayerjs/openplayerjs/commit/e4a9399))
* **webpack:** Added new option to bundle package with global object to avoid calling `window` ([afdd2c7](https://github.com/openplayerjs/openplayerjs/commit/afdd2c7))
* **webpack:** Fixed webpack and babelrc config after babel-loader upgrade ([1b80c33](https://github.com/openplayerjs/openplayerjs/commit/1b80c33))
* **webpack:** Removed configuration for `cssnano` configuration and updated package ([91cb87e](https://github.com/openplayerjs/openplayerjs/commit/91cb87e))


### Features

* **controls:** Moved keyboard events to each of the control elements; refactor way to add/remove default controls via settings ([089942b](https://github.com/openplayerjs/openplayerjs/commit/089942b))
* **demo:** Added updated stream and updated documentation ([a5afabe](https://github.com/openplayerjs/openplayerjs/commit/a5afabe))
* **levels:** Added documentation about new way to config controls ([58814f3](https://github.com/openplayerjs/openplayerjs/commit/58814f3))
* **levels:** Added missing label for button accessibility ([f2efc7d](https://github.com/openplayerjs/openplayerjs/commit/f2efc7d))
* **levels:** Added missing workflow to manipulate detached menu; fixed several issues with Dash.js due to upgrades and added HTML5 workflow for levels ([dd2eb33](https://github.com/openplayerjs/openplayerjs/commit/dd2eb33))
* **levels:** Added new levels retrieval for HLS and M-DASH, and started control element by setting default level in its button ([087feac](https://github.com/openplayerjs/openplayerjs/commit/087feac))
* **levels:** Added setters/getters for levels ([20c18e3](https://github.com/openplayerjs/openplayerjs/commit/20c18e3))
* **levels:** Added workflow to render levels, removing duplicated labels and setting submenu to switch them ([4a5cb9b](https://github.com/openplayerjs/openplayerjs/commit/4a5cb9b))
* **levels:** Changed name of label and added missing one for `Auto` level ([daff328](https://github.com/openplayerjs/openplayerjs/commit/daff328))
* **payer:** Added new `playererror` event to expose any errors in an OpenPlayer instance ([b42cc3b](https://github.com/openplayerjs/openplayerjs/commit/b42cc3b))
* **player:** Added ability to change labels as an effort to support localization ([fb1f50e](https://github.com/openplayerjs/openplayerjs/commit/fb1f50e))
* **player:** Added global library to add window object ([30190de](https://github.com/openplayerjs/openplayerjs/commit/30190de))
* **player:** Added new `addControl` callback to append new control items, and modified class to auto generate custom control items based on the properties passed; updated demo file to show new capability ([e793062](https://github.com/openplayerjs/openplayerjs/commit/e793062))
* **player:** Added new `playerdestroyed` event; added  workflow to detect live HLS streaming and display a `Live Broadcast` legend ([5bc4d53](https://github.com/openplayerjs/openplayerjs/commit/5bc4d53))
* **player:** Added new config element to show loader properly and fixed events to show/hide big play/loader elements ([451e1e8](https://github.com/openplayerjs/openplayerjs/commit/451e1e8))
* **player:** Added new config element to start media at a certain second; included documentation of it ([ba84633](https://github.com/openplayerjs/openplayerjs/commit/ba84633))
* **player:** Added new configuration element to set initial volume on media ([a3334e2](https://github.com/openplayerjs/openplayerjs/commit/a3334e2))
* **player:** Added new configuration to show progress bar when using live streamings, per [#117](https://github.com/openplayerjs/openplayerjs/issues/117) ([271a2ad](https://github.com/openplayerjs/openplayerjs/commit/271a2ad))
* **player:** Added new option to enable buttons to contain submenus, instead of putting all of them inside the `Settings` control ([5f40716](https://github.com/openplayerjs/openplayerjs/commit/5f40716))
* **player:** Added new wrappers for default method to get/set defaultPlaybackRate, part of the HTML5 specs ([723d481](https://github.com/openplayerjs/openplayerjs/commit/723d481))
* **player:** Allowed displaying the Pause button correctly and added new flag to control the time it will take to disappear once video starts playing ([1b37a5f](https://github.com/openplayerjs/openplayerjs/commit/1b37a5f))
* **player:** Introduced new workflow to consider `preload` attribute to avoid loading media when no Ads are present ([fe34917](https://github.com/openplayerjs/openplayerjs/commit/fe34917))
* **player:** Renamed classes for entire project; fixed Type Definition file ([6ca9285](https://github.com/openplayerjs/openplayerjs/commit/6ca9285))
* **release:** Added `release-it` package to simplify release tasks ([35c5cc0](https://github.com/openplayerjs/openplayerjs/commit/35c5cc0))
* **tests:** Added browser tests with Mocha/Chai and support for Travis CI ([b63fcda](https://github.com/openplayerjs/openplayerjs/commit/b63fcda))

<a name="1.15.0"></a>
# 1.15.0 (2020-03-04)


### Bug Fixes

* **ads:** Added `waiting` event to be dispatched while loading Ads; fixed conditionals to show/hide loader ([f26c25f](https://github.com/openplayerjs/openplayerjs/commit/f26c25f))
* **ads:** Added conditional to avoid autoplay when an error occurs attempting to play Ads ([3a61f62](https://github.com/openplayerjs/openplayerjs/commit/3a61f62))
* **ads:** Added missing call to initialize() method after an error occurred and having multiple Ads to play; added new event listener to resize Ads when media has been loaded ([74039e9](https://github.com/openplayerjs/openplayerjs/commit/74039e9))
* **ads:** Added missing callback on mobile devices to load Ads correctly ([39bae5b](https://github.com/openplayerjs/openplayerjs/commit/39bae5b))
* **ads:** Added missing conditional to destroy correctly Ads when single URL is being passed via an array ([a2e840a](https://github.com/openplayerjs/openplayerjs/commit/a2e840a))
* **ads:** Added missing workflow for mobile Ads to resume correctly media and display middle and postroll Ads correctly ([ea61843](https://github.com/openplayerjs/openplayerjs/commit/ea61843))
* **ads:** Added more conditionals to check errors from trying to determine if a string is a valid XML or not ([728290e](https://github.com/openplayerjs/openplayerjs/commit/728290e))
* **ads:** Added new conditional to play media if error was detected on Ads; added missing docs ([a7c97c7](https://github.com/openplayerjs/openplayerjs/commit/a7c97c7))
* **ads:** Added workflow to prevent video to starts playing before the Ad ([5cde1a4](https://github.com/openplayerjs/openplayerjs/commit/5cde1a4))
* **ads:** Addressed first issues with iOS when playing Ads inline ([2051df6](https://github.com/openplayerjs/openplayerjs/commit/2051df6))
* **ads:** Cleaned up styles for Ads, simplified method to resize Ads and added missing conditional to indicate their view mode ([618dfd2](https://github.com/openplayerjs/openplayerjs/commit/618dfd2))
* **ads:** Dispatched new event to show loading state on ads; fixed dimensions on Ad when starting to play; fixed typo in waiting event ([e16c6a1](https://github.com/openplayerjs/openplayerjs/commit/e16c6a1))
* **ads:** Expanded conditional to start media after Ad has been played if there is no `seekable` info; added missing event for HLS media ([918aaa8](https://github.com/openplayerjs/openplayerjs/commit/918aaa8))
* **ads:** Fixed Ads workflow when playing midroll Ads not updating properly Play button ([2d1bbc8](https://github.com/openplayerjs/openplayerjs/commit/2d1bbc8))
* **ads:** Fixed issue when player is not recovering after Ads error ([4b8a0d3](https://github.com/openplayerjs/openplayerjs/commit/4b8a0d3))
* **ads:** Fixed issue where double requests to media were made non-mobile devices after Ads ended ([d791f54](https://github.com/openplayerjs/openplayerjs/commit/d791f54))
* **ads:** Fixed issue with DASH not setting sources properly when interacting with Ads; fixed autoplay workflow with Ads ([482771e](https://github.com/openplayerjs/openplayerjs/commit/482771e))
* **ads:** Fixed workflow to autoplay Ads in iOS by playing them muted initially ([5fca8f9](https://github.com/openplayerjs/openplayerjs/commit/5fca8f9))
* **ads:** Fixed workflow when dealing with a list of Ads URLs; removed unnecessary workflow to end media when Ad is completed ([66dddea](https://github.com/openplayerjs/openplayerjs/commit/66dddea))
* **ads:** Modified error conditional and displaying of error; added missing workflow on `loadedmetadata` event to check if more Ad URLs need to be loaded ([72caef6](https://github.com/openplayerjs/openplayerjs/commit/72caef6))
* **ads:** Refactor workflow on Ads to ensure they will play in mobile devices correctly; fixed styles for Ads and removed tooltip from mobile devices ([f0ae7ec](https://github.com/openplayerjs/openplayerjs/commit/f0ae7ec))
* **ads:** Removed event listener once Ad has been destroyed ([c5f645f](https://github.com/openplayerjs/openplayerjs/commit/c5f645f))
* **ads:** Removed event that caused only one Ad to be played in iOS; hid captions when Ads are playing in mobile devices and improved loading of sources in demo ([6cbbaa1](https://github.com/openplayerjs/openplayerjs/commit/6cbbaa1))
* **ads:** Removed event that caused only one Ad to be played in iOS; hid captions when Ads are playing in mobile devices and improved loading of sources in demo ([eb0e8e9](https://github.com/openplayerjs/openplayerjs/commit/eb0e8e9))
* **ads:** Test autoplay capabilities inside Ads only if `autoStart` is set to `true` ([7e15a84](https://github.com/openplayerjs/openplayerjs/commit/7e15a84))
* **ads:** Updated documentation for Ads ([b4ca1fc](https://github.com/openplayerjs/openplayerjs/commit/b4ca1fc))
* **captions:** Added missing conditional to avoid issues if caption layer is not ready to show captions ([10e5bba](https://github.com/openplayerjs/openplayerjs/commit/10e5bba))
* **captions:** Added missing workflow to check if hours were present in closed captions time codes; updated README file to indicate how to integrate closed captioning ([ddb621b](https://github.com/openplayerjs/openplayerjs/commit/ddb621b))
* **captions:** Added missing workflow to set the proper caption language as data-* attribute when clicking on Caption toggle button; fixed package import ([76f1ec6](https://github.com/openplayerjs/openplayerjs/commit/76f1ec6))
* **captions:** Added new styles to deal with iOS native captions when using fullscreen and removed unnecessary ones ([044c5f0](https://github.com/openplayerjs/openplayerjs/commit/044c5f0))
* **captions:** Added workflow to only include tracks with captions and subitems in the Settings element if there are more than 2 captions available ([b97c0dc](https://github.com/openplayerjs/openplayerjs/commit/b97c0dc))
* **captions:** Added workflow to verify that tracks match the `track` tag(s) (if any) to avoid extra TextTracks to be included ([f424dbd](https://github.com/openplayerjs/openplayerjs/commit/f424dbd))
* **captions:** Changed way to generate menu caption items when `detachMenu` is true due to issues with nodes being removed asyncronously ([026ae98](https://github.com/openplayerjs/openplayerjs/commit/026ae98))
* **captions:** Fixed workflow to prepare captions correctly by removing assignment of current caption to the first one ([a6aa9bf](https://github.com/openplayerjs/openplayerjs/commit/a6aa9bf))
* **config:** modified config elements to create bundles correctly ([81941cb](https://github.com/openplayerjs/openplayerjs/commit/81941cb))
* **controls:** Added missing workflow for mobile devices to avoid hiding controls ([8689291](https://github.com/openplayerjs/openplayerjs/commit/8689291))
* **controls:** Added new class to indicate position of the custom controls; ensured that all items in right position are prepended rather than appended ([c3066ab](https://github.com/openplayerjs/openplayerjs/commit/c3066ab))
* **controls:** Ensured that fullscreen is the last icon on the control bar; added missing documentation ([70e19c1](https://github.com/openplayerjs/openplayerjs/commit/70e19c1))
* **controls:** Synced play event with timeout option to hide at the same time controls and play button ([4073e4f](https://github.com/openplayerjs/openplayerjs/commit/4073e4f))
* **css:** Added new styles to fix issues in IE11 and display captions on iOS properly when not using `playsinline` attribute ([b48baba](https://github.com/openplayerjs/openplayerjs/commit/b48baba))
* **css:** Adjusted styles to remove ticks in IE11 and added missing CSS property on volume bar ([f659903](https://github.com/openplayerjs/openplayerjs/commit/f659903))
* **css:** Fixed minor style for time rail to get correct focus on audio player ([5bdae42](https://github.com/openplayerjs/openplayerjs/commit/5bdae42))
* **Definitions:** Removed `export` keywords and fixed header to pass tests ([c1616c0](https://github.com/openplayerjs/openplayerjs/commit/c1616c0))
* **demo:** Removed ES6 arrow function for better compatibility ([98a8530](https://github.com/openplayerjs/openplayerjs/commit/98a8530))
* **demo:** Reverted demo to original state ([57f341c](https://github.com/openplayerjs/openplayerjs/commit/57f341c))
* **docs:** Added CSS rule for text ([a74b0cb](https://github.com/openplayerjs/openplayerjs/commit/a74b0cb))
* **docs:** Added missing form element and integrated workflow to consider audio in embed iframe ([8193786](https://github.com/openplayerjs/openplayerjs/commit/8193786))
* **docs:** Added missing URL element to obtain proper permalink ([d230422](https://github.com/openplayerjs/openplayerjs/commit/d230422))
* **docs:** Fixed style for iframe ([f9781be](https://github.com/openplayerjs/openplayerjs/commit/f9781be))
* **docs:** Re-added old folder for player docs and fixed NPM commands ([b580a05](https://github.com/openplayerjs/openplayerjs/commit/b580a05))
* **documentation:** Fixed documentation and changed order of certain methods for consistency, and refactor type definition ([b5258b3](https://github.com/openplayerjs/openplayerjs/commit/b5258b3))
* **documentation:** Fixed typos ([66f2aed](https://github.com/openplayerjs/openplayerjs/commit/66f2aed))
* **documentation:** More verbosity in JS snippet to clarify possible values ([68e7bd7](https://github.com/openplayerjs/openplayerjs/commit/68e7bd7))
* **events:** Fixed Ads error event due to typo; removed default `onError` content ([d6312db](https://github.com/openplayerjs/openplayerjs/commit/d6312db))
* **fullscreen:** Fixed issues related to non-standard methods for fullscreen ([2a95d4c](https://github.com/openplayerjs/openplayerjs/commit/2a95d4c))
* **hls:** Use long URL to avoid 404 in source map for HLS.js ([f0685c8](https://github.com/openplayerjs/openplayerjs/commit/f0685c8))
* **media:** Fixed workflow to enhance custom media to a more reduced approach ([c3f2c9e](https://github.com/openplayerjs/openplayerjs/commit/c3f2c9e))
* **media:** Improved the workflow to start and stop loading of HLS sources depending of autoplay/preload attributes ([dfda5cd](https://github.com/openplayerjs/openplayerjs/commit/dfda5cd))
* **package:** Downgrade cssnano version ([1bdd562](https://github.com/openplayerjs/openplayerjs/commit/1bdd562))
* **package:** Fixed README URL ([bf02e0b](https://github.com/openplayerjs/openplayerjs/commit/bf02e0b))
* **package:** update deepmerge to version 3.0.0 ([50c148a](https://github.com/openplayerjs/openplayerjs/commit/50c148a))
* **package:** Updated packages and fixed names for `main`, `style` and `types` elements ([2c2c97a](https://github.com/openplayerjs/openplayerjs/commit/2c2c97a))
* **player:** Added `requestAnimationFrame` and `cancelAnimationFrame` for resize events ([87ec25c](https://github.com/openplayerjs/openplayerjs/commit/87ec25c))
* **player:** Added conditional to test if container of player exists to remove callback effectively ([e78c1ef](https://github.com/openplayerjs/openplayerjs/commit/e78c1ef))
* **player:** Added control position as part of each one of the controls class names to allow more advanced styling ([82a0634](https://github.com/openplayerjs/openplayerjs/commit/82a0634))
* **player:** Added default value when no options are passed to the player ([aed189f](https://github.com/openplayerjs/openplayerjs/commit/aed189f))
* **player:** Added missing action to remove class from Captions button when hiding captions ([56dbe99](https://github.com/openplayerjs/openplayerjs/commit/56dbe99))
* **player:** Added missing condition to captions button to remove class; fixed issues with WebPack and unit tests ([5c01eb2](https://github.com/openplayerjs/openplayerjs/commit/5c01eb2))
* **player:** Added missing conditional to avoid attempting to build player when element does not exist ([da497eb](https://github.com/openplayerjs/openplayerjs/commit/da497eb))
* **player:** Added missing conditional to avoid issues when clicking multiple times on Settings; changed browser to test locally ([c3cc4b5](https://github.com/openplayerjs/openplayerjs/commit/c3cc4b5))
* **player:** Added missing conditional to remove event correctly ([6bb7c71](https://github.com/openplayerjs/openplayerjs/commit/6bb7c71))
* **player:** Added missing conditional to set an empty source when none is present ([3bd81b1](https://github.com/openplayerjs/openplayerjs/commit/3bd81b1))
* **player:** Added missing conditionals to allow big pause button to play video ([f59c144](https://github.com/openplayerjs/openplayerjs/commit/f59c144))
* **player:** Added missing conditionals to avoid hiding controls when paused and on regular media; fixed typo on stylesheet ([3e68e7c](https://github.com/openplayerjs/openplayerjs/commit/3e68e7c))
* **player:** Added missing conditionals to set proper config on HLS and Dash players; changed test source to use HTTPS ([874f932](https://github.com/openplayerjs/openplayerjs/commit/874f932))
* **player:** Added missing event and avoid default behavior on play button ([2cc1d93](https://github.com/openplayerjs/openplayerjs/commit/2cc1d93))
* **player:** Added missing events to display/hide loader image ([c2e8d0a](https://github.com/openplayerjs/openplayerjs/commit/c2e8d0a))
* **player:** Added missing tabindex for Mute button ([feb3b35](https://github.com/openplayerjs/openplayerjs/commit/feb3b35))
* **player:** Added missing try/catch blocks to execute exceptions properly ([0762c3d](https://github.com/openplayerjs/openplayerjs/commit/0762c3d))
* **player:** Added missing workflow to allow player to toggle fullscreen if user is in fullscreen mode and controls are recreated ([2b48fe9](https://github.com/openplayerjs/openplayerjs/commit/2b48fe9))
* **player:** Added missing workflow to check if media has finished playing when Ad stopped playing on post roll to destroy Ads completely ([0716b52](https://github.com/openplayerjs/openplayerjs/commit/0716b52))
* **player:** Added missing workflow to hide other menus when selecting another ([fa01773](https://github.com/openplayerjs/openplayerjs/commit/fa01773))
* **player:** Added play event to hide control bar ([e1884bb](https://github.com/openplayerjs/openplayerjs/commit/e1884bb))
* **player:** Added proper tooltip on play button when it is paused ([051e23c](https://github.com/openplayerjs/openplayerjs/commit/051e23c))
* **player:** Borrowed snippet to test if HLS.js is truly supported on browser ([a8090e1](https://github.com/openplayerjs/openplayerjs/commit/a8090e1))
* **player:** Changed `hidden` to `disabled` mode to avoid displaying native captions on MS Edge ([9dac443](https://github.com/openplayerjs/openplayerjs/commit/9dac443))
* **player:** Changed default setting for speed to current media one to allow user to use a different one ([34bb41a](https://github.com/openplayerjs/openplayerjs/commit/34bb41a))
* **player:** Changed paths for packages to give proper support to IE11 ([b926dc6](https://github.com/openplayerjs/openplayerjs/commit/b926dc6))
* **player:** Changed target to execute keydown event to main wrapper to use keyboard successfully ([b2b2893](https://github.com/openplayerjs/openplayerjs/commit/b2b2893))
* **player:** Deactivated `Levels` by default; added new source for playlist ([b7de69c](https://github.com/openplayerjs/openplayerjs/commit/b7de69c))
* **player:** Enhanced events for iPhone to support fullscreen ([88a5624](https://github.com/openplayerjs/openplayerjs/commit/88a5624))
* **player:** Expanded conditional to allow rendering settings speed by default ([fe5a271](https://github.com/openplayerjs/openplayerjs/commit/fe5a271))
* **player:** Expanded conditionals to test if media is HLS or Dash using also MIME types ([cd3c72c](https://github.com/openplayerjs/openplayerjs/commit/cd3c72c))
* **player:** Favored native captions in inline mode after the user has enabled fullscreen in iOS ([fca7fa1](https://github.com/openplayerjs/openplayerjs/commit/fca7fa1))
* **player:** Fix data-* attribute to indicate active caption language ([49a24b2](https://github.com/openplayerjs/openplayerjs/commit/49a24b2))
* **player:** Fixed `fill` effect by using more CSS properties to enable proper resizing using that effect ([8112984](https://github.com/openplayerjs/openplayerjs/commit/8112984))
* **player:** Fixed Accessibility issues found in the player via Wave ([f1200ea](https://github.com/openplayerjs/openplayerjs/commit/f1200ea))
* **player:** Fixed callback to autoplay workflow based on iOS and Safari policies to autoplay on mute ([abae7bd](https://github.com/openplayerjs/openplayerjs/commit/abae7bd))
* **player:** Fixed duration issues when duration is Infinity ([057a6cb](https://github.com/openplayerjs/openplayerjs/commit/057a6cb))
* **player:** Fixed error when running tests on Travis ([aaee1ea](https://github.com/openplayerjs/openplayerjs/commit/aaee1ea))
* **player:** Fixed issue with non-existing Ads options ([e15cf09](https://github.com/openplayerjs/openplayerjs/commit/e15cf09))
* **player:** Fixed issue with not being able to pause video by touching screen on iPad and fixed fullscreen presentation ([1166bef](https://github.com/openplayerjs/openplayerjs/commit/1166bef))
* **player:** Fixed position of tooltip and fixed issue related to promise not being executed correctly ([#120](https://github.com/openplayerjs/openplayerjs/issues/120)) ([3a0dd5c](https://github.com/openplayerjs/openplayerjs/commit/3a0dd5c))
* **player:** Fixed typo and added workflow to just update captions when track with same srclang and kind existed previously ([0bab31e](https://github.com/openplayerjs/openplayerjs/commit/0bab31e))
* **player:** Fixed typo when checking for captions detected and added assignment of default caption at higher level ([41f7875](https://github.com/openplayerjs/openplayerjs/commit/41f7875))
* **player:** Fixed typos when creating event and added documentation about it ([e180e46](https://github.com/openplayerjs/openplayerjs/commit/e180e46))
* **player:** Fixed way to attach/dispatch HLS events for hls.js ([129b68f](https://github.com/openplayerjs/openplayerjs/commit/129b68f))
* **player:** Fixed way to create events to pass data from media types correctly ([8549577](https://github.com/openplayerjs/openplayerjs/commit/8549577))
* **player:** Formatted time when media has ended and added missing validation for it to avoid displaying NaN values ([c4c591e](https://github.com/openplayerjs/openplayerjs/commit/c4c591e))
* **player:** Hid buttons not needed for Ads ([b3bb99a](https://github.com/openplayerjs/openplayerjs/commit/b3bb99a))
* **player:** Hid default captions layer to favor player's captions layer ([c06adcf](https://github.com/openplayerjs/openplayerjs/commit/c06adcf))
* **player:** Modified autoplay workflow to verify current media content instead of video placeholder; removed unnecessary code in Ads to verify autoplay capabilities ([59848dd](https://github.com/openplayerjs/openplayerjs/commit/59848dd))
* **player:** Moved event dispatcher outside of conditional to ensure volume icon is updated accordingly ([5bbf745](https://github.com/openplayerjs/openplayerjs/commit/5bbf745))
* **player:** Moved loader hiding outside of timer on `play` event ([1f081ae](https://github.com/openplayerjs/openplayerjs/commit/1f081ae))
* **player:** Refactor workflow to add captions based on validation and existance of cues ahead of time to avoid rendering languages with no valid captions ([d3c53d6](https://github.com/openplayerjs/openplayerjs/commit/d3c53d6))
* **player:** Refined support for HLS.js by not including Safari as part of the supported browsers ([9df28f7](https://github.com/openplayerjs/openplayerjs/commit/9df28f7))
* **player:** Refined touch event on time rail to prevent default behavior; fixed issue with Ads not playing correctly on iOS ([42bfd46](https://github.com/openplayerjs/openplayerjs/commit/42bfd46))
* **player:** Refined workflow to update captions ([37a3e09](https://github.com/openplayerjs/openplayerjs/commit/37a3e09))
* **player:** Removed conditional to create controls on iPhone as well, and added negative `z-index` in Ads container when inactive ([1aca10e](https://github.com/openplayerjs/openplayerjs/commit/1aca10e))
* **player:** Removed duplicate controls due to deep merge ([98218f8](https://github.com/openplayerjs/openplayerjs/commit/98218f8))
* **player:** Removed missing window event listener once player is destroyed ([a3f596b](https://github.com/openplayerjs/openplayerjs/commit/a3f596b))
* **player:** Removed reset of playback when destroying settings ([a0acf28](https://github.com/openplayerjs/openplayerjs/commit/a0acf28))
* **player:** Removed resetting of `autoplay` and expand conditional to test if HLS.js needs to be loaded ([09c3124](https://github.com/openplayerjs/openplayerjs/commit/09c3124))
* **player:** Removed unnecessary attributes; expanded conditional on `loadedmetadata` to not consider mobile devices; added missing workflow to show/hide progress bar per tests on Android devices ([06281c7](https://github.com/openplayerjs/openplayerjs/commit/06281c7))
* **player:** Removed unnecessary event workflow and added loader state in `loadedmetadata` event ([2f6c03c](https://github.com/openplayerjs/openplayerjs/commit/2f6c03c))
* **player:** Reordered operation to ensure proper creation of markup when `controlschanged` event is dispatched ([9feff69](https://github.com/openplayerjs/openplayerjs/commit/9feff69))
* **player:** Restructured way to build captions menu to avoid issues on IE11 when `detachMenus` is `true` ([9d0d2a7](https://github.com/openplayerjs/openplayerjs/commit/9d0d2a7))
* **player:** Set play request for Ads when clicking on media; fixed workflow to check if player can play media; removed setting controls when requesting Ads ([fd53ee2](https://github.com/openplayerjs/openplayerjs/commit/fd53ee2))
* **player:** Simplified workflow to generate fullscreen video by relying only in CSS ([e6f435f](https://github.com/openplayerjs/openplayerjs/commit/e6f435f))
* **player:** Updated import references due `core-js` latest update ([40f9475](https://github.com/openplayerjs/openplayerjs/commit/40f9475))
* **player:** Updated method in Dash.js after upgrade ([71c4a93](https://github.com/openplayerjs/openplayerjs/commit/71c4a93))
* **progress:** Removed tooltip completely from mobile devices ([591d2f9](https://github.com/openplayerjs/openplayerjs/commit/591d2f9))
* **readme:** Added correct way to install package via NPM ([8f449ac](https://github.com/openplayerjs/openplayerjs/commit/8f449ac))
* **readme:** Added correct way to use package for Node projects ([c7582ee](https://github.com/openplayerjs/openplayerjs/commit/c7582ee))
* **readme:** Updated logo ([ef21fb1](https://github.com/openplayerjs/openplayerjs/commit/ef21fb1))
* **README:** Added updated examples and fixed minor issues detected in structure ([5da9545](https://github.com/openplayerjs/openplayerjs/commit/5da9545))
* **release:** Removed unnecessary commands ([14a8927](https://github.com/openplayerjs/openplayerjs/commit/14a8927))
* **settings:** Added new event to remove items from settings; implemented event in captions when no cues are detected ([bc6c1e0](https://github.com/openplayerjs/openplayerjs/commit/bc6c1e0))
* **settings:** Fixed issue with Settings not retrieving the proper submenu after selecting an option from it ([643b82f](https://github.com/openplayerjs/openplayerjs/commit/643b82f))
* **styles:** Added missing `z-index` in buttons to override progress bar index in IE11 ([ee57974](https://github.com/openplayerjs/openplayerjs/commit/ee57974))
* **styles:** Added missing CSS rule for input range ([640a5c2](https://github.com/openplayerjs/openplayerjs/commit/640a5c2))
* **test:** Changed version of NodeJS ([83fb6c1](https://github.com/openplayerjs/openplayerjs/commit/83fb6c1))
* **test:** Fixed bundle path in Karma config ([8a94d98](https://github.com/openplayerjs/openplayerjs/commit/8a94d98))
* **test:** Fixed path for bundles in test file ([682d589](https://github.com/openplayerjs/openplayerjs/commit/682d589))
* **tests:** Added missing elements to Travis config file ([a5fc0c5](https://github.com/openplayerjs/openplayerjs/commit/a5fc0c5))
* **tests:** Changed sources to a valid one ([a57817c](https://github.com/openplayerjs/openplayerjs/commit/a57817c))
* **tests:** Changed sources to a valid one ([4fde589](https://github.com/openplayerjs/openplayerjs/commit/4fde589))
* **tests:** Fixed unit tests due changes on event ([4e0ddb9](https://github.com/openplayerjs/openplayerjs/commit/4e0ddb9))
* **tests:** Removed elements from Travis CI config to allow Greenkeeper to work ([3d8bb78](https://github.com/openplayerjs/openplayerjs/commit/3d8bb78))
* **tests:** Removed unnecessary task from Travis CI ([919fdd7](https://github.com/openplayerjs/openplayerjs/commit/919fdd7))
* **tests:** Reverted settings to allow Travis to continue testing properly ([57ad7cc](https://github.com/openplayerjs/openplayerjs/commit/57ad7cc))
* **tests:** Updated MP4 source to match the current source in the video tag ([5f2cccd](https://github.com/openplayerjs/openplayerjs/commit/5f2cccd))
* **webpack:** Added `global` package ([e4a9399](https://github.com/openplayerjs/openplayerjs/commit/e4a9399))
* **webpack:** Added new option to bundle package with global object to avoid calling `window` ([afdd2c7](https://github.com/openplayerjs/openplayerjs/commit/afdd2c7))
* **webpack:** Fixed webpack and babelrc config after babel-loader upgrade ([1b80c33](https://github.com/openplayerjs/openplayerjs/commit/1b80c33))
* **webpack:** Removed configuration for `cssnano` configuration and updated package ([91cb87e](https://github.com/openplayerjs/openplayerjs/commit/91cb87e))


### Features

* **controls:** Moved keyboard events to each of the control elements; refactor way to add/remove default controls via settings ([089942b](https://github.com/openplayerjs/openplayerjs/commit/089942b))
* **demo:** Added updated stream and updated documentation ([a5afabe](https://github.com/openplayerjs/openplayerjs/commit/a5afabe))
* **levels:** Added documentation about new way to config controls ([58814f3](https://github.com/openplayerjs/openplayerjs/commit/58814f3))
* **levels:** Added missing label for button accessibility ([f2efc7d](https://github.com/openplayerjs/openplayerjs/commit/f2efc7d))
* **levels:** Added missing workflow to manipulate detached menu; fixed several issues with Dash.js due to upgrades and added HTML5 workflow for levels ([dd2eb33](https://github.com/openplayerjs/openplayerjs/commit/dd2eb33))
* **levels:** Added new levels retrieval for HLS and M-DASH, and started control element by setting default level in its button ([087feac](https://github.com/openplayerjs/openplayerjs/commit/087feac))
* **levels:** Added setters/getters for levels ([20c18e3](https://github.com/openplayerjs/openplayerjs/commit/20c18e3))
* **levels:** Added workflow to render levels, removing duplicated labels and setting submenu to switch them ([4a5cb9b](https://github.com/openplayerjs/openplayerjs/commit/4a5cb9b))
* **levels:** Changed name of label and added missing one for `Auto` level ([daff328](https://github.com/openplayerjs/openplayerjs/commit/daff328))
* **payer:** Added new `playererror` event to expose any errors in an OpenPlayer instance ([b42cc3b](https://github.com/openplayerjs/openplayerjs/commit/b42cc3b))
* **player:** Added ability to change labels as an effort to support localization ([fb1f50e](https://github.com/openplayerjs/openplayerjs/commit/fb1f50e))
* **player:** Added global library to add window object ([30190de](https://github.com/openplayerjs/openplayerjs/commit/30190de))
* **player:** Added new `addControl` callback to append new control items, and modified class to auto generate custom control items based on the properties passed; updated demo file to show new capability ([e793062](https://github.com/openplayerjs/openplayerjs/commit/e793062))
* **player:** Added new `playerdestroyed` event; added  workflow to detect live HLS streaming and display a `Live Broadcast` legend ([5bc4d53](https://github.com/openplayerjs/openplayerjs/commit/5bc4d53))
* **player:** Added new config element to show loader properly and fixed events to show/hide big play/loader elements ([451e1e8](https://github.com/openplayerjs/openplayerjs/commit/451e1e8))
* **player:** Added new config element to start media at a certain second; included documentation of it ([ba84633](https://github.com/openplayerjs/openplayerjs/commit/ba84633))
* **player:** Added new configuration element to set initial volume on media ([a3334e2](https://github.com/openplayerjs/openplayerjs/commit/a3334e2))
* **player:** Added new configuration to show progress bar when using live streamings, per [#117](https://github.com/openplayerjs/openplayerjs/issues/117) ([271a2ad](https://github.com/openplayerjs/openplayerjs/commit/271a2ad))
* **player:** Added new option to enable buttons to contain submenus, instead of putting all of them inside the `Settings` control ([5f40716](https://github.com/openplayerjs/openplayerjs/commit/5f40716))
* **player:** Added new wrappers for default method to get/set defaultPlaybackRate, part of the HTML5 specs ([723d481](https://github.com/openplayerjs/openplayerjs/commit/723d481))
* **player:** Allowed displaying the Pause button correctly and added new flag to control the time it will take to disappear once video starts playing ([1b37a5f](https://github.com/openplayerjs/openplayerjs/commit/1b37a5f))
* **player:** Introduced new workflow to consider `preload` attribute to avoid loading media when no Ads are present ([fe34917](https://github.com/openplayerjs/openplayerjs/commit/fe34917))
* **player:** Renamed classes for entire project; fixed Type Definition file ([6ca9285](https://github.com/openplayerjs/openplayerjs/commit/6ca9285))
* **release:** Added `release-it` package to simplify release tasks ([35c5cc0](https://github.com/openplayerjs/openplayerjs/commit/35c5cc0))
* **tests:** Added browser tests with Mocha/Chai and support for Travis CI ([b63fcda](https://github.com/openplayerjs/openplayerjs/commit/b63fcda))



## [1.14.5](https://github.com/openplayerjs/openplayerjs/compare/v1.14.4...v1.14.5) (2019-12-31)


### Bug Fixes

* **captions:** Added missing workflow to check if hours were present in closed captions time codes; updated README file to indicate how to integrate closed captioning ([66553ea](https://github.com/openplayerjs/openplayerjs/commit/66553ea))

<a name="1.14.5"></a>
## [1.14.5](https://github.com/openplayerjs/openplayerjs/compare/v1.14.4...v1.14.5) (2019-12-31)


### Bug Fixes

* **captions:** Added missing workflow to check if hours were present in closed captions time codes; updated README file to indicate how to integrate closed captioning ([66553ea](https://github.com/openplayerjs/openplayerjs/commit/66553ea))



## [1.14.4](https://github.com/openplayerjs/openplayerjs/compare/v1.14.3...v1.14.4) (2019-12-29)


### Bug Fixes

* **player:** Added missing try/catch blocks to execute exceptions properly ([ecbb9fd](https://github.com/openplayerjs/openplayerjs/commit/ecbb9fd))
* **player:** Fixed callback to autoplay workflow based on iOS and Safari policies to autoplay on mute ([07ca4bf](https://github.com/openplayerjs/openplayerjs/commit/07ca4bf))
* **player:** Removed resetting of `autoplay` and expand conditional to test if HLS.js needs to be loaded ([2cda30d](https://github.com/openplayerjs/openplayerjs/commit/2cda30d))

<a name="1.14.4"></a>
## [1.14.4](https://github.com/openplayerjs/openplayerjs/compare/v1.14.3...v1.14.4) (2019-12-29)


### Bug Fixes

* **player:** Added missing try/catch blocks to execute exceptions properly ([ecbb9fd](https://github.com/openplayerjs/openplayerjs/commit/ecbb9fd))
* **player:** Fixed callback to autoplay workflow based on iOS and Safari policies to autoplay on mute ([07ca4bf](https://github.com/openplayerjs/openplayerjs/commit/07ca4bf))
* **player:** Removed resetting of `autoplay` and expand conditional to test if HLS.js needs to be loaded ([2cda30d](https://github.com/openplayerjs/openplayerjs/commit/2cda30d))



## [1.14.3](https://github.com/openplayerjs/openplayerjs/compare/v1.14.2...v1.14.3) (2019-12-18)


### Bug Fixes

* **captions:** Fixed workflow to prepare captions correctly by removing assignment of current caption to the first one ([0161c0e](https://github.com/openplayerjs/openplayerjs/commit/0161c0e))
* **player:** Fixed way to create events to pass data from media types correctly ([6a5d20d](https://github.com/openplayerjs/openplayerjs/commit/6a5d20d))

<a name="1.14.3"></a>
## [1.14.3](https://github.com/openplayerjs/openplayerjs/compare/v1.14.2...v1.14.3) (2019-12-18)


### Bug Fixes

* **captions:** Fixed workflow to prepare captions correctly by removing assignment of current caption to the first one ([0161c0e](https://github.com/openplayerjs/openplayerjs/commit/0161c0e))
* **player:** Fixed way to create events to pass data from media types correctly ([6a5d20d](https://github.com/openplayerjs/openplayerjs/commit/6a5d20d))



## [1.14.2](https://github.com/openplayerjs/openplayerjs/compare/v1.14.1...v1.14.2) (2019-11-27)


### Bug Fixes

* **captions:** Changed way to generate menu caption items when `detachMenu` is true due to issues with nodes being removed asyncronously ([a37869c](https://github.com/openplayerjs/openplayerjs/commit/a37869c))

<a name="1.14.2"></a>
## [1.14.2](https://github.com/openplayerjs/openplayerjs/compare/v1.14.1...v1.14.2) (2019-11-27)


### Bug Fixes

* **captions:** Changed way to generate menu caption items when `detachMenu` is true due to issues with nodes being removed asyncronously ([a37869c](https://github.com/openplayerjs/openplayerjs/commit/a37869c))



## [1.14.1](https://github.com/openplayerjs/openplayerjs/compare/v1.14.0...v1.14.1) (2019-11-21)


### Bug Fixes

* **player:** Added control position as part of each one of the controls class names to allow more advanced styling ([1fb55c1](https://github.com/openplayerjs/openplayerjs/commit/1fb55c1))

<a name="1.14.1"></a>
## [1.14.1](https://github.com/openplayerjs/openplayerjs/compare/v1.14.0...v1.14.1) (2019-11-21)


### Bug Fixes

* **player:** Added control position as part of each one of the controls class names to allow more advanced styling ([1fb55c1](https://github.com/openplayerjs/openplayerjs/commit/1fb55c1))



# [1.14.0](https://github.com/openplayerjs/openplayerjs/compare/v1.13.1...v1.14.0) (2019-11-21)


### Bug Fixes

* **ads:** Modified error conditional and displaying of error; added missing workflow on `loadedmetadata` event to check if more Ad URLs need to be loaded ([da25ced](https://github.com/openplayerjs/openplayerjs/commit/da25ced))
* **events:** Fixed Ads error event due to typo; removed default `onError` content ([a42a5a2](https://github.com/openplayerjs/openplayerjs/commit/a42a5a2))
* **player:** Fixed typos when creating event and added documentation about it ([8d306b2](https://github.com/openplayerjs/openplayerjs/commit/8d306b2))
* **README:** Added updated examples and fixed minor issues detected in structure ([37fd312](https://github.com/openplayerjs/openplayerjs/commit/37fd312))


### Features

* **payer:** Added new `playererror` event to expose any errors in an OpenPlayer instance ([c587662](https://github.com/openplayerjs/openplayerjs/commit/c587662))

<a name="1.14.0"></a>
# [1.14.0](https://github.com/openplayerjs/openplayerjs/compare/v1.13.1...v1.14.0) (2019-11-21)


### Bug Fixes

* **ads:** Modified error conditional and displaying of error; added missing workflow on `loadedmetadata` event to check if more Ad URLs need to be loaded ([da25ced](https://github.com/openplayerjs/openplayerjs/commit/da25ced))
* **events:** Fixed Ads error event due to typo; removed default `onError` content ([a42a5a2](https://github.com/openplayerjs/openplayerjs/commit/a42a5a2))
* **player:** Fixed typos when creating event and added documentation about it ([8d306b2](https://github.com/openplayerjs/openplayerjs/commit/8d306b2))
* **README:** Added updated examples and fixed minor issues detected in structure ([37fd312](https://github.com/openplayerjs/openplayerjs/commit/37fd312))


### Features

* **payer:** Added new `playererror` event to expose any errors in an OpenPlayer instance ([c587662](https://github.com/openplayerjs/openplayerjs/commit/c587662))



# [1.14.0](https://github.com/openplayerjs/openplayerjs/compare/v1.13.1...v1.14.0) (2019-11-21)

<a name="1.14.0"></a>
# [1.14.0](https://github.com/openplayerjs/openplayerjs/compare/v1.13.1...v1.14.0) (2019-11-21)

### Bug Fixes

* **ads:** Modified error conditional and displaying of error; added missing workflow on `loadedmetadata` event to check if more Ad URLs need to be loaded ([da25ced](https://github.com/openplayerjs/openplayerjs/commit/da25ced))
+* **events:** Fixed Ads error event due to typo; removed default `onError` content ([a42a5a2](https://github.com/openplayerjs/openplayerjs/commit/a42a5a2))
+* **player:** Fixed typos when creating event and added documentation about it ([8d306b2](https://github.com/openplayerjs/openplayerjs/commit/8d306b2))
* **README:** Added updated examples and fixed minor issues detected in structure ([37fd312](https://github.com/openplayerjs/openplayerjs/commit/37fd312))

### Features

* **player:** Added new `playererror` event to expose any errors in an OpenPlayer instance ([c587662](https://github.com/openplayerjs/openplayerjs/commit/c587662))

<a name="1.13.1"></a>
## [1.13.1](https://github.com/openplayerjs/openplayerjs/compare/v1.13.0...v1.13.1) (2019-10-27)

### Bug Fixes

* **player:** Deactivated `Levels` by default; added new source for playlist ([90ec134](https://github.com/openplayerjs/openplayerjs/commit/90ec134))
* **player:** Removed duplicate controls due to deep merge ([8a01d58](https://github.com/openplayerjs/openplayerjs/commit/8a01d58))

<a name="1.13.0"></a>
# [1.13.0](https://github.com/openplayerjs/openplayerjs/compare/v1.12.1...v1.13.0) (2019-10-26)

### Bug Fixes

* **player:** Updated method in Dash.js after upgrade ([fef5e1c](https://github.com/openplayerjs/openplayerjs/commit/fef5e1c))

### Features

* **controls:** Moved keyboard events to each of the control elements; refactor way to add/remove default controls via settings ([4e1f23f](https://github.com/openplayerjs/openplayerjs/commit/4e1f23f))
* **demo:** Added updated stream and updated documentation ([5150142](https://github.com/openplayerjs/openplayerjs/commit/5150142))
* **levels:** Added documentation about new way to config controls ([bf455a6](https://github.com/openplayerjs/openplayerjs/commit/bf455a6))
* **levels:** Added missing label for button accessibility ([f8db386](https://github.com/openplayerjs/openplayerjs/commit/f8db386))
* **levels:** Added missing workflow to manipulate detached menu; fixed several issues with Dash.js due to upgrades and added HTML5 workflow for levels ([01bf900](https://github.com/openplayerjs/openplayerjs/commit/01bf900))
* **levels:** Added new levels retrieval for HLS and M-DASH, and started control element by setting default level in its button ([3c2b908](https://github.com/openplayerjs/openplayerjs/commit/3c2b908))
* **levels:** Added setters/getters for levels ([5bba79b](https://github.com/openplayerjs/openplayerjs/commit/5bba79b))
* **levels:** Added workflow to render levels, removing duplicated labels and setting submenu to switch them ([df8683a](https://github.com/openplayerjs/openplayerjs/commit/df8683a))
* **levels:** Changed name of label and added missing one for `Auto` level ([309ffd9](https://github.com/openplayerjs/openplayerjs/commit/309ffd9))

<a name="1.12.1"></a>
## [1.12.1](https://github.com/openplayerjs/openplayerjs/compare/v1.12.0...v1.12.1) (2019-08-10)

### Bug Fixes

* **player:** Added missing action to remove class from Captions button when hiding captions ([e429a5f](https://github.com/openplayerjs/openplayerjs/commit/e429a5f))
* **player:** Added missing condition to captions button to remove class; fixed issues with WebPack and unit tests ([abd2045](https://github.com/openplayerjs/openplayerjs/commit/abd2045))
* **player:** Added missing conditional to set an empty source when none is present ([e53d639](https://github.com/openplayerjs/openplayerjs/commit/e53d639))
* **tests:** Updated MP4 source to match the current source in the video tag ([903bbb0](https://github.com/openplayerjs/openplayerjs/commit/903bbb0))

<a name="1.12.0"></a>
# [1.12.0](https://github.com/openplayerjs/openplayerjs/compare/v1.11.1...v1.12.0) (2019-06-08)

### Bug Fixes

* **player:** Added missing conditional to avoid issues when clicking multiple times on Settings; changed browser to test locally ([a1753f1](https://github.com/openplayerjs/openplayerjs/commit/a1753f1))
* **player:** Added missing workflow to check if media has finished playing when Ad stopped playing on post roll to destroy Ads completely ([d640861](https://github.com/openplayerjs/openplayerjs/commit/d640861))
* **player:** Added missing workflow to hide other menus when selecting another ([9d068e8](https://github.com/openplayerjs/openplayerjs/commit/9d068e8))
* **player:** Changed default setting for speed to current media one to allow user to use a different one ([1647e29](https://github.com/openplayerjs/openplayerjs/commit/1647e29))
* **player:** Enhanced events for iPhone to support fullscreen ([e4425f0](https://github.com/openplayerjs/openplayerjs/commit/e4425f0))
* **player:** Removed reset of playback when destroying settings ([be62f05](https://github.com/openplayerjs/openplayerjs/commit/be62f05))
* **tests:** Reverted settings to allow Travis to continue testing properly ([194999c](https://github.com/openplayerjs/openplayerjs/commit/194999c))

### Features

* **player:** Added new wrappers for default method to get/set defaultPlaybackRate, part of the HTML5 specs ([3b8ba5a](https://github.com/openplayerjs/openplayerjs/commit/3b8ba5a))

## [1.11.1](https://github.com/openplayerjs/openplayerjs/compare/v1.11.0...v1.11.1) (2019-06-03)

### Bug Fixes

* **ads:** Added more conditionals to check errors from trying to determine if a string is a valid XML or not ([a52c945](https://github.com/openplayerjs/openplayerjs/commit/a52c945))
* **player:** Expanded conditional to allow rendering settings speed by default ([74ae9f0](https://github.com/openplayerjs/openplayerjs/commit/74ae9f0))
* **player:** Formatted time when media has ended and added missing validation for it to avoid displaying NaN values ([22fb1c2](https://github.com/openplayerjs/openplayerjs/commit/22fb1c2))

<a name="1.11.0"></a>
# [1.11.0](https://github.com/openplayerjs/openplayerjs/compare/v1.10.0...v1.11.0) (2019-05-16)


### Bug Fixes

* **captions:** Added workflow to verify that tracks match the `track` tag(s) (if any) to avoid extra TextTracks to be included ([68b02d6](https://github.com/openplayerjs/openplayerjs/commit/68b02d6))



<a name="1.10.0"></a>
# [1.10.0](https://github.com/openplayerjs/openplayerjs/compare/v1.9.0...v1.10.0) (2019-04-28)

### Bug Fixes

* **player:** Added missing conditionals to avoid hiding controls when paused and on regular media; fixed typo on stylesheet ([a33dbe1](https://github.com/openplayerjs/openplayerjs/commit/a33dbe1))
* **player:** Removed unnecessary attributes; expanded conditional on `loadedmetadata` to not consider mobile devices; added missing workflow to show/hide progress bar per tests on Android devices ([5fb7dc8](https://github.com/openplayerjs/openplayerjs/commit/5fb7dc8))
* **player:** Restructured way to build captions menu to avoid issues on IE11 when `detachMenus` is `true` ([12e2905](https://github.com/openplayerjs/openplayerjs/commit/12e2905))

### Features

* **player:** Added new config element to show loader properly and fixed events to show/hide big play/loader elements ([bde589b](https://github.com/openplayerjs/openplayerjs/commit/bde589b))
* **player:** Added new option to enable buttons to contain submenus, instead of putting all of them inside the `Settings` control ([820a9c8](https://github.com/openplayerjs/openplayerjs/commit/820a9c8))

<a name="1.9.0"></a>
# [1.9.0](https://github.com/openplayerjs/openplayerjs/compare/v1.8.1...v1.9.0) (2019-04-01)

### Bug Fixes

* **player:** Changed paths for packages to give proper support to IE11 ([fa4fd5a](https://github.com/openplayerjs/openplayerjs/commit/fa4fd5a))
* **player:** Updated import references due `core-js` latest update ([fb7835c](https://github.com/openplayerjs/openplayerjs/commit/fb7835c))

### Features

* **player:** Introduced new workflow to consider `preload` attribute to avoid loading media when no Ads are present ([bb7f3ef](https://github.com/openplayerjs/openplayerjs/commit/bb7f3ef))

<a name="1.8.1"></a>
## [1.8.1](https://github.com/openplayerjs/openplayerjs/compare/v1.8.0...v1.8.1) (2019-02-05)

### Bug Fixes

* **player:** Fixed error when running tests on Travis ([51a968f](https://github.com/openplayerjs/openplayerjs/commit/51a968f))

<a name="1.8.0"></a>
# [1.8.0](https://github.com/openplayerjs/openplayerjs/compare/v1.7.0...v1.8.0) (2019-02-04)

### Bug Fixes

* **player:** Added missing workflow to allow player to toggle fullscreen if user is in fullscreen mode and controls are recreated ([e95db57](https://github.com/openplayerjs/openplayerjs/commit/e95db57))
* **player:** Expanded conditionals to test if media is HLS or Dash using also MIME types ([d9c489e](https://github.com/openplayerjs/openplayerjs/commit/d9c489e))
* **player:** Moved event dispatcher outside of conditional to ensure volume icon is updated accordingly ([5cc813e](https://github.com/openplayerjs/openplayerjs/commit/5cc813e))

### Features

* **player:** Added new config element to start media at a certain second; included documentation of it ([2d98ac2](https://github.com/openplayerjs/openplayerjs/commit/2d98ac2))

<a name="1.7.0"></a>
# [1.7.0](https://github.com/openplayerjs/openplayerjs/compare/v1.6.0...v1.7.0) (2019-01-10)

### Bug Fixes

* **controls:** Added new class to indicate position of the custom controls; ensured that all items in right position are prepended rather than appended ([1c6d9c9](https://github.com/openplayerjs/openplayerjs/commit/1c6d9c9))
* **controls:** Ensured that fullscreen is the last icon on the control bar; added missing documentation ([0c02477](https://github.com/openplayerjs/openplayerjs/commit/0c02477))
* **css:** Added new styles to fix issues in IE11 and display captions on iOS properly when not using `playsinline` attribute ([5412b7e](https://github.com/openplayerjs/openplayerjs/commit/5412b7e))
* **css:** Adjusted styles to remove ticks in IE11 and added missing CSS property on volume bar ([2e00891](https://github.com/openplayerjs/openplayerjs/commit/2e00891))

### Features

* **player:** Added new `addControl` callback to append new control items, and modified class to auto generate custom control items based on the properties passed; updated demo file to show new capability ([2234f4d](https://github.com/openplayerjs/openplayerjs/commit/2234f4d))

<a name="1.6.0"></a>
# [1.6.0](https://github.com/openplayerjs/openplayerjs/compare/v1.5.0...v1.6.0) (2018-12-20)

### Bug Fixes

* **ads:** Added `waiting` event to be dispatched while loading Ads; fixed conditionals to show/hide loader ([38fbe24](https://github.com/openplayerjs/openplayerjs/commit/38fbe24))
* **ads:** Added missing call to initialize() method after an error occurred and having multiple Ads to play; added new event listener to resize Ads when media has been loaded ([cdef255](https://github.com/openplayerjs/openplayerjs/commit/cdef255))
* **ads:** Added missing callback on mobile devices to load Ads correctly ([469559e](https://github.com/openplayerjs/openplayerjs/commit/469559e))
* **ads:** Added missing workflow for mobile Ads to resume correctly media and display middle and postroll Ads correctly ([24ef925](https://github.com/openplayerjs/openplayerjs/commit/24ef925))
* **ads:** Removed event listener once Ad has been destroyed ([89c982a](https://github.com/openplayerjs/openplayerjs/commit/89c982a))
* **captions:** Added missing workflow to set the proper caption language as data-* attribute when clicking on Caption toggle button; fixed package import ([b4e7168](https://github.com/openplayerjs/openplayerjs/commit/b4e7168))
* **controls:** Synced play event with timeout option to hide at the same time controls and play button ([31ed45b](https://github.com/openplayerjs/openplayerjs/commit/31ed45b))
* **package:** update deepmerge to version 3.0.0 ([2f0eccf](https://github.com/openplayerjs/openplayerjs/commit/2f0eccf))
* **player:** Added missing conditionals to allow big pause button to play video ([97ff19f](https://github.com/openplayerjs/openplayerjs/commit/97ff19f))
* **player:** Added play event to hide control bar ([f7278f6](https://github.com/openplayerjs/openplayerjs/commit/f7278f6))
* **player:** Added proper tooltip on play button when it is paused ([695c66c](https://github.com/openplayerjs/openplayerjs/commit/695c66c))
* **player:** Changed `hidden` to `disabled` mode to avoid displaying native captions on MS Edge ([18de141](https://github.com/openplayerjs/openplayerjs/commit/18de141))
* **player:** Fixed typo and added workflow to just update captions when track with same srclang and kind existed previously ([62e26fe](https://github.com/openplayerjs/openplayerjs/commit/62e26fe))
* **player:** Refined workflow to update captions ([aa205a5](https://github.com/openplayerjs/openplayerjs/commit/aa205a5))
* **player:** Removed unnecessary event workflow and added loader state in `loadedmetadata` event ([bd1c971](https://github.com/openplayerjs/openplayerjs/commit/bd1c971))

### Features

* **player:** Added new configuration element to set initial volume on media ([b349c5e](https://github.com/openplayerjs/openplayerjs/commit/b349c5e))



<a name="1.5.0"></a>
# [1.5.0](https://github.com/openplayerjs/openplayerjs/compare/v1.4.1...v1.5.0) (2018-11-20)


### Bug Fixes

* **ads:** Dispatched new event to show loading state on ads; fixed dimensions on Ad when starting to play; fixed typo in waiting event ([e87466a](https://github.com/openplayerjs/openplayerjs/commit/e87466a))
* **ads:** Fixed issue when player is not recovering after Ads error ([d6b83b0](https://github.com/openplayerjs/openplayerjs/commit/d6b83b0))
* **ads:** Fixed issue where double requests to media were made non-mobile devices after Ads ended ([c63dc94](https://github.com/openplayerjs/openplayerjs/commit/c63dc94))
* **demo:** Reverted demo to original state ([74a4b0b](https://github.com/openplayerjs/openplayerjs/commit/74a4b0b))
* **player:** Added missing events to display/hide loader image ([d7808f0](https://github.com/openplayerjs/openplayerjs/commit/d7808f0))
* **player:** Hid default captions layer to favor player's captions layer ([ecdb4b5](https://github.com/openplayerjs/openplayerjs/commit/ecdb4b5))
* **player:** Modified autoplay workflow to verify current media content instead of video placeholder; removed unnecessary code in Ads to verify autoplay capabilities ([ddb08e1](https://github.com/openplayerjs/openplayerjs/commit/ddb08e1))
* **player:** Moved loader hiding outside of timer on `play` event ([9503041](https://github.com/openplayerjs/openplayerjs/commit/9503041))

### Features

* **player:** Allowed displaying the Pause button correctly and added new flag to control the time it will take to disappear once video starts playing ([d02afa2](https://github.com/openplayerjs/openplayerjs/commit/d02afa2))

<a name="1.4.1"></a>
## [1.4.1](https://github.com/openplayerjs/openplayerjs/compare/v1.4.0...v1.4.1) (2018-11-01)

### Bug Fixes

* **tests:** Changed sources to a valid one ([bb09e16](https://github.com/openplayerjs/openplayerjs/commit/bb09e16))
* **tests:** Changed sources to a valid one ([91fd44d](https://github.com/openplayerjs/openplayerjs/commit/91fd44d))

<a name="1.4.0"></a>
# [1.4.0](https://github.com/openplayerjs/openplayerjs/compare/v1.3.4...v1.4.0) (2018-10-16)

### Bug Fixes

* **fullscreen:** Fixed issues related to non-standard methods for fullscreen ([6ee6bc5](https://github.com/openplayerjs/openplayerjs/commit/6ee6bc5))
* **player:** Added default value when no options are passed to the player ([118bc63](https://github.com/openplayerjs/openplayerjs/commit/118bc63))


### Features

* **player:** Added ability to change labels as an effort to support localization ([ec60010](https://github.com/openplayerjs/openplayerjs/commit/ec60010))
* **player:** Added new `playerdestroyed` event; added  workflow to detect live HLS streaming and display a `Live Broadcast` legend ([4e28dcd](https://github.com/openplayerjs/openplayerjs/commit/4e28dcd))



<a name="1.3.4"></a>
## [1.3.4](https://github.com/openplayerjs/openplayerjs/compare/v1.3.3...v1.3.4) (2018-10-06)


### Bug Fixes

* **ads:** Expanded conditional to start media after Ad has been played if there is no `seekable` info; added missing event for HLS media ([e1d31ba](https://github.com/openplayerjs/openplayerjs/commit/e1d31ba))
* **player:** Set play request for Ads when clicking on media; fixed workflow to check if player can play media; removed setting controls when requesting Ads ([ff748bd](https://github.com/openplayerjs/openplayerjs/commit/ff748bd))

<a name="1.3.3"></a>
## [1.3.3](https://github.com/openplayerjs/openplayerjs/compare/v1.3.2...v1.3.3) (2018-09-28)

### Bug Fixes

* **readme:** Added correct way to use package for Node projects ([671f179](https://github.com/openplayerjs/openplayerjs/commit/671f179))

<a name="1.3.2"></a>
## [1.3.2](https://github.com/openplayerjs/openplayerjs/compare/v1.3.1...v1.3.2) (2018-09-28)

### Bug Fixes

* **readme:** Added correct way to install package via NPM ([bc48d1f](https://github.com/openplayerjs/openplayerjs/commit/bc48d1f))

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