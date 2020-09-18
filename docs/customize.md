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

In order to do that, the

```javascript
const CustomPlayer = (element, media, autoplay = false, options = {}) => {
  return Object.freeze({
        promise,
        create,
        load,
        canPlayType,
        play,
        pause,
        destroy,
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

if (OpenPlayerJS) {
    OpenPlayerJS.addMedia(
        '[PLAYER ID]',
        '[PSEUDO MIME TYPE (video/x-[PLAYER ID])]',
        url => true, // Rules to validate media URL in order to match pseudo MIME type
        CustomPlayer
    );
}

```
