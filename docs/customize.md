# Customizations

## Add Controls

Do you need to add a new control (or multiple ones) to your player and you are concerned about the complexity of it? This snippet can help you with your endeavor.

```javascript
const player = new OpenPlayerJS('[PLAYER ID]');
player.addControl({
  icon:'/path/to/image',
  title: '[TOOLTIP LABEL]',
  // Possible values: 'bottom-left', 'bottom-middle', 'bottom-right',
  // 'left', 'middle', 'right', 'top-left', 'top-middle', 'top-right'
  position: 'right',
  click: () => {}, // the operation it executes
});
player.init();
```

## Add Player

One of the most attractive parts of OpenPlayerJS is the ability to adapt other players API into its own.

In order to do that, the object must have the following template:

```javascript
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
```

Once the file is ready, we can do something like this (`[PLAYER ID]` is the name we assigned for the custom player):

```html
<!DOCTYPE html>
<html lang="en">
<body>
    <video class="op-player__media" id="video" controls playsinline>
        <source src="https://example-url" type="video/x-[PLAYER ID]">
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