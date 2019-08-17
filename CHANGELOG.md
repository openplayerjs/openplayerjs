## [1.12.1](https://github.com/openplayerjs/openplayerjs/compare/v1.12.0...v1.12.1) (2019-08-10)


### Bug Fixes

* **player:** Added missing action to remove class from Captions button when hiding captions ([e429a5f](https://github.com/openplayerjs/openplayerjs/commit/e429a5f))
* **player:** Added missing condition to captions button to remove class; fixed issues with WebPack and unit tests ([abd2045](https://github.com/openplayerjs/openplayerjs/commit/abd2045))
* **player:** Added missing conditional to set an empty source when none is present ([e53d639](https://github.com/openplayerjs/openplayerjs/commit/e53d639))
* **tests:** Updated MP4 source to match the current source in the video tag ([903bbb0](https://github.com/openplayerjs/openplayerjs/commit/903bbb0))

<a name="1.12.1"></a>
## [1.12.1](https://github.com/openplayerjs/openplayerjs/compare/v1.12.0...v1.12.1) (2019-08-10)


### Bug Fixes

* **player:** Added missing action to remove class from Captions button when hiding captions ([e429a5f](https://github.com/openplayerjs/openplayerjs/commit/e429a5f))
* **player:** Added missing condition to captions button to remove class; fixed issues with WebPack and unit tests ([abd2045](https://github.com/openplayerjs/openplayerjs/commit/abd2045))
* **player:** Added missing conditional to set an empty source when none is present ([e53d639](https://github.com/openplayerjs/openplayerjs/commit/e53d639))
* **tests:** Updated MP4 source to match the current source in the video tag ([903bbb0](https://github.com/openplayerjs/openplayerjs/commit/903bbb0))



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



# [1.11.0](https://github.com/openplayerjs/openplayerjs/compare/v1.10.0...v1.11.0) (2019-05-16)


### Bug Fixes

* **captions:** Added workflow to verify that tracks match the `track` tag(s) (if any) to avoid extra TextTracks to be included ([68b02d6](https://github.com/openplayerjs/openplayerjs/commit/68b02d6))

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