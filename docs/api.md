# API

If you need more control over the player, OpenPlayerJS stores an instance of each player in the document. To have access to a specific instance, use the media `id` and use `OpenPlayerJS.instances` element.

**NOTE**: if an `id` attribute is not detected, OpenPlayerJS will autogenerate one for you.

```javascript
// Selects the first video/audio that uses OpenPlayer
var id = document.querySelector('.op-player').id;
var player = OpenPlayerJS.instances[id];
```

The methods supported by the OpenPlayerJS instance are:

Method | Description
--- | ---
`play` | Play media. If Ads are detected, different methods than the native ones are triggered with this operation.
`pause` | Pause media. If Ads are detected, different methods than the native ones are triggered with this operation.
`load` | Load media. HLS and M(PEG)-DASH perform more operations during loading if browser does not support them natively.
`addCaptions` | Append a new `<track>` tag to the video/audio tag and dispatch event so it gets registered/loaded in the player, via `controlschanged` event.
`addControl` | Append a new button to the video/audio tag with the possibility dispatch a custom callback so it gets registered/loaded in the player, via `controlschanged` event. It requires an object with `icon` URL/path, `title` for the button, the `position` (`right` or `left`) of the button and a `click` callback to dispatch an action.
`destroy` | Destroy OpenMedia Player instance (including all events associated) and return the `video/audio` tag to its original state.
`getAd` | Retrieve an instance of the `Ads` object.
`getMedia` | Retrieve an instance of the `Media` object.
`activeElement` | Retrieve the current media object (could be `Ads` or any other media type).
`getContainer` | Retrieve the parent element (with `op-player` class) of the native video/audio tag.
`getControls` | Retrieve an instance of the controls object used in the player instance.
`getElement` | Retrieve the original video/audio tag.
`getEvents` | Retrieve the events attached to the player.
`init` | Create all the markup and events needed for the player.
`isAd` | Check if current media is an instance of an `Ad`.
`isMedia` | Check if current media is an instance of a native media type.
`id` | Retrieve current player's unique identifier.
`src` | Retrieve/set the current Source list associated with the player.

# Events

Using the code below, you can attach/dispatch any valid event, using [`CustomEvent`](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent), like this:

```javascript
player.getElement().addEventListener('ended', function() {
    console.log('Your code when media ends playing');
});

var event = new CustomEvent('ended');
player.getElement().dispatchEvent(event);
```

All [HTML5 media events](https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events) are supported by OpenPlayerJS, and it incorporates some custom ones, mostly related to Ads:

Event | Description
--- | ---
`metadataready` | Event executed to grab the media's information, mostly represented in the form of [ID3 tags](https://id3.org/).
`controlshidden` | Event executed when controls timer stops and hides control bar (video only).
`controlschanged` | Event triggered when an element modified the state of the controls and they regenerate (i.e., adding new caption).
`captionschanged` | Event triggered when user changes the current caption by selecting a new one from the `Settings` menu.
`playererror` | Event executed when any error has occurred within the OpenPlayerJS instance; a response will be sent via `onError` config callback. See [Usage with Javascript](#usage-with-javascript) for more details.
`playerdestroyed` | Event executed when an instance of OpenPlayerJS is destroyed (useful to remove extra elements created with the player's help).
`adsloaded` | Event when Ads have been loaded successfully and can be played.
`adsstart` | Event when Ads start being played.
`adsfirstquartile` | Event triggered when Ad reached the first quarter of its length.
`adsmidpoint` | Event triggered when Ad reached half of its length.
`adsthirdquartile` | Event triggered when Ad reached the third quarter of its length.
`adscomplete` | Event triggered when Ad reached the end of its length.
`adsskipped` | Event triggered when user skips the Ad.
`adsvolumeChange` | Event triggered when user increases/decreases the volume of Ad.
`adsallAdsCompleted` | Event triggered when all Ads have been played.
`adsmediaended` | Event executed when an Ad is going to be played after media has ended playing (currently used to change the Replay icon to Pause when playing a postroll Ad).

In addition to the list above, all [HLS events](https://github.com/video-dev/hls.js/blob/master/docs/API.md#runtime-events) and [HLS error events](https://github.com/video-dev/hls.js/blob/master/docs/API.md#errors) are supported using the same approach described above, including all their details. For the error ones, they are classified as `networkError`, `mediaError`, `muxError` and `otherError`.
