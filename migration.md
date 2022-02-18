# Migration

## Starting in v3.x.x

No longer support for IE11.

Bundles will not support IE11 going forward to reduce the footprint of supporting Promises and other ES6 native functions.

Also, video player used to pause media when clicking on the main area; it has been disabled by default, and to activate that behavior back, you need to set the `media.pauseOnClick` property as `true`.

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
