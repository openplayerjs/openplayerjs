# NEW! Player Customizations

## Modify Look

OpenPlayerJS now offers the ability to move elements into new DOM layers, in an attempt to achieve more flexibility for you.

The default controls configuration does NOT encapsulate the elements in layers, but it assigns them a class indicating each control item's position (`left`, `middle` and `center`).

The only way the player generates new layers within the controls' container is when the `top` or `bottom` layers are set in the player's configuration, since the assumption is that the markup will be drastically complex as opposed to the default one, and it will need more than the `middle` layer, as described in the following layout's diagram (**main** is only for video, though).
![Layers' diagram](https://user-images.githubusercontent.com/910829/96354476-24eb9800-10a5-11eb-9ebf-90abc16d6c0d.png)

### ❗❗❗ CSS Matters... a lot ❗❗❗

Before OpenPlayerJS supported layers, the only way to achieve the layout that the player currently has was through pure CSS, giving it the illusion of the progress bar to be above the rest of the elements.

To illustrate this point, if you compare the current layout's configuration of the player

```javascript
new OpenPlayerJS('id', {
    controls: {
        left: ['play', 'time', 'volume'],
        middle: ['progress'], // Semantically speaking, progress bar is in the middle
        right: ['levels', 'captions', 'settings', 'fullscreen'],
    },
});
```

![Progress bar in the middle](https://user-images.githubusercontent.com/40804543/187544433-863fc7a0-cce8-4b51-bbd1-4c71b2efb6e1.png)

against

```javascript
new OpenPlayerJS('id', {
    controls: {
        left: ['play', 'volume'],
        middle: ['time'],
        right: ['levels', 'captions', 'settings', 'fullscreen'],
    },
});
```

![Time in the middle](https://user-images.githubusercontent.com/40804543/187544517-db57f84a-9a66-49b9-bf90-70bed348e210.png)

you will see why CSS created this UI for the progress bar. If we removed the unique styles that made the progress bar to be on top of all the controls, we would get a faithful representation of the real configuration for the player currently (and in turn, of the layers the player is using by default):

![Progress bar without unique styles](https://user-images.githubusercontent.com/910829/187761436-40a49d25-3778-455f-8034-7ece7b621551.png)

**In the oncoming 3.x.x version, progress bar will be placed in the `top-middle` layer and some of the CSS rules will be deleted/adjusted** to match semantically and visually the player's UI.

But this is important to highlight how CSS can override the semantic correctness of the player in favor of the desired UI. That's why is important to use layers properly to achieve the desired results in terms of positioning, rather than relying on CSS for it (unless you are using a version **older than 2.7.1**).

## Add Control

Do you need to add a new control (or multiple ones) to your player and you are concerned about the complexity of it? This snippet can help you with your endeavor.

```javascript
const player = new OpenPlayerJS('[PLAYER ID]');
player.addElement({
    id: '[MY ELEMENT ID]',
    title: '[TOOLTIP LABEL]',
    type: '[button, div, span, p, etc.]',
    styles: {}, // Can add custom styles to element using camelCase styles (marginTop, boxShadow, etc.)
    content: '', // Can override the content generated inside the control, but it won't accept images under the <img> tag for security purposes
    position: 'right', // Any of the possible positions for a control (top, top-left, middle, bottom-right, etc.)
    showInAds: false, // or true
    init: (player) => {}, // Pass an instance of the player for advanced operations
    click: () => {},
    mouseenter: () => {},
    mouseleave: () => {},
    keydown: () => {},
    blur: () => {},
    focus: () => {},
    destroy: (player) => {}, // Pass an instance of the player for advanced operations
});
player.init();
```

If you pass a different type in the configuration and you set a click callback, the player will add a `button` ARIA role to the element for good accessibility practices.

There's also an `addControl` method that accepts the configuration indicated above, but forces the type `button` to generate clickable controls. The configuration for `addControls` is as follows:

```javascript
const player = new OpenPlayerJS('[PLAYER ID]');
player.addControl({
    icon: '/path/to/image',
    id: '[MY CONTROL ID]',
    title: '[TOOLTIP LABEL]',
    styles: {},
    content: '', // Can override the content generated inside the control
    // Possible values: 'bottom-left', 'bottom-middle', 'bottom-right',
    // 'left', 'middle', 'right', 'top-left', 'top-middle', 'top-right',
    // or `main` to add it in the video area
    position: 'right',
    showInAds: false, // or true
    subitems: [
        {
            // optional list of items to render a menu
            id: '[ITEM ID]',
            label: '[ITEM LABEL]',
            title: '[TOOLTIP ITEM]', // optional
            icon: '/path/to/item-image', // optional
            click: () => {},
        },
    ],
    init: (player) => {}, // Pass an instance of the player for advanced operations
    click: () => {},
    mouseenter: () => {},
    mouseleave: () => {},
    keydown: () => {},
    blur: () => {},
    focus: () => {},
    destroy: (player) => {}, // Pass an instance of the player for advanced operations
});
player.init();
```

## Add External Player API

One of the most attractive parts of OpenPlayerJS is the ability to adapt other players API into its own.

In order to do that, the object must have the following template:

````javascript
/**
 * @param element The HTML5 media tag (video/audio)
 * @param media An object that contains { src: URL, type: MIME TYPE } to match structures
 *              used for OpenPlayerJS when loading new media
 * @param autoplay Whether we allow the custom player to autoplay
 * @param options Custom options for this player
 */
const CustomPlayer = (element, media, autoplay = false, options = {}) => {
  return Object.freeze({
      // A Promise is needed since OpenPlayerJS expected to load media in an async way,
      // so by only doing ```const promise = new Promise(resolve => resolve);``` is enough
      promise,
      // Set all events linked to default HTML5 events in order to interact with custom // player; also, many of the custom players need an iframe to work, so this
      // method allows us to do that
      create,
      // Unset all events for this custom player and destroy iframe if needed
      destroy,
      // The following methods are set to mimic the default HTML5 media ones
      load,
      canPlayType,
      play,
      pause,
      // The following getters/setters are set to mimic the default HTML5 media ones
      set src(source),
      get src(),
      set volume(value),
      get volume(),
      set muted(value),
      get muted(),
      set playbackRate(value),
      get playbackRate(),
      set defaultPlaybackRate(value),
      get defaultPlaybackRate(),
      set currentTime(value),
      get currentTime(),
      get duration(),
      get paused(),
      get ended(),
  });
};

// We need to make sure OpenPlayerJS exists to add this new custom player
if (OpenPlayerJS) {
    OpenPlayerJS.addMedia(
        '[PLAYER ID]', // This is also the keyword to use when setting new options for the custom payer
        '[PSEUDO MIME TYPE (video/x-[PLAYER ID])]',
        url => true, // Rules to validate media URL in order to match pseudo MIME type
        CustomPlayer
    );
}
````

Once the file is ready, we can do something like this (`[PLAYER ID]` is the name we assigned for the custom player):

```html
<!DOCTYPE html>
<html lang="en">
    <body>
        <video class="op-player__media" id="video" controls playsinline>
            <source src="https://example-url" type="video/x-[PLAYER ID]" />
        </video>
        <script src="https://cdn.jsdelivr.net/npm/openplayerjs@latest/dist/openplayer.min.js"></script>
        <script src="/path/to/custom-player.js"></script>
        <script>
            var player = new OpenPlayer('video', {
                [PLAYER ID]: {
                    // config
                }
            });
            player.init();
        </script>
    </body>
</html>
```

For a more robust example, check the [YouTube plugin](https://github.com/openplayerjs/openplayerjs-youtube) created for OpenPlayerJS.
