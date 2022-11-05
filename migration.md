# Migration

## From v2.x.x to v3.x.x

### No further support for IE11.

Bundles for both CSS and JS will not support IE11 anymore to reduce the footprint of supporting Promises and other ES6 native functions by using polyfills. This is a big consideration to have before migrating to version 3 of this player.

### DASH and FLV media removed

In an effort to have a true **native** player, we removed the non-native media, such as DASH and FLV. They will be included in a separate repository, same as the YouTube plugin for this player.

### Dist files completely removed from repository

The dist folders will be released on NPM, but they won't be part of the repositry anymore, to follow some of the modern guidelines about projects.

### Other changes to consider:

-   The video player used to pause media when clicking on the main area, but now it has been disabled by default. To activate that behavior back, et the `media.pauseOnClick` property as `true`.
-   Replaced Karma with Jest to use more modern approaches for unit tests; current status of unit tests is at 8%, but we will continue aming for 70%
-   Refactor code for IMA SDK integration to make it easier to understand and adapt to latest changed; also, `loop` feature has been removed from Ads.
-   Upgraded packages all packages used in the project to keep it up-to-date
-   Refactor constants in favor of methods to facilitate unit tests on them
-   Simplified structure of project

## From v2.6.1 to v2.7.0

After updating Typescript to a newer version, all "private" variables are now truly not accessible at runtime. For more information, check the [Javascript section](./docs/usage.md#javascript).

## From v1.x.x to v2.x.x

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
        },
    },
    live: {
        showLabel: true,
        showProgress: false, // equivalent of `showLiveProgress` in v1.x.x
    },
    // ...other player options
});
player.init();
```
