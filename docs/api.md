# API/Events

## API

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
`addControl` | Append a new button to the video/audio tag with the possibility dispatch a custom callback so it gets registered/loaded in the player, via `controlschanged` event. It requires an object with `icon` URL/path, `id` for the button, the `position` of the button and a `click` callback to dispatch an action. For more details on how to create a custom control element, read [Add Control](customize.md#add-control).
`removeControl` | Remove a control from the control bar using the name indicated in the `layers` configuration (`play`, `progress`, `time`, etc.); it can be a default element or a custom control.
`destroy` | Destroy OpenMedia Player instance (including all events associated) and return the `video/audio` tag to its original state.
`getAd` | Retrieve an instance of the `Ads` object. More information at [Ad instance](api.md#ad-instance)
`getMedia` | Retrieve an instance of the `Media` object. More information at [Media instance](api.md#media-instance)
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

### `Media` instance

This object has the basic getters/setters that can be performed in regular video/audio tag:

- play
- pause
- canPlayType
- load
- volume
- muted
- ended
- paused
- currentTime
- duration
- defaultPlaybackRate
- playbackRate

On top of that, the Media object has the following methods:

Method | Description
--- | ---
`destroy` | Destroy the Media instance (including all events associated).
`src` | Set/get a list of media sources asociated with the player; each object must contain `src` and `type`.
`current` | Obtain the current media element being played: `getMedia().currentSrc`. It returns an object that contains `src` and `type`.
`mediaFiles` | Set/get the list of elements that are associated with the current media; the list of objects contains  `src` and `type`.
`level` | Set/get a level; it could set/return a number, string or an object.
`levels` | Return a list of levels (if any)

### `Ad` instance

This object has access to the entity that manages Ads in OpenPlayerJS. It also has access to the following standard setters/getters:

- play
- pause
- load (it accepts a boolean to force a reload to reinitialize the Ads container)
- volume
- muted
- ended
- paused
- currentTime
- duration

Method | Description
--- | ---
`destroy` | Destroy the Media instance (including all events associated).
`resizeAds` | Set the width/height of an Ad
`getAdsManager` | Obtain an instance of the IMA ads manager; all that you can have access to is documented [here](https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/reference/js/google.ima.AdsManager)
`started` | Flag to determine if Ad started or not

## Events

Using the code below, you can attach/dispatch any valid event, using [`CustomEvent`](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent), like this:

```javascript
player.getElement().addEventListener('ended', function() {
    console.log('Your code when media ends playing');
});

var event = new CustomEvent('ended');
player.getElement().dispatchEvent(event);
```

All [HTML5 media events](https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events) are supported by OpenPlayerJS, including:

Event | Description
--- | ---
`metadataready` | Event executed to grab the media's information, mostly represented in the form of [ID3 tags](https://id3.org/).
`controlshidden` | Event executed when controls timer stops and hides control bar (video only).
`controlschanged` | Event triggered when an element modified the state of the controls and they regenerate (i.e., adding new caption).
`captionschanged` | Event triggered when user changes the current caption by selecting a new one from the `Settings` menu.
`levelchanged` | Event triggered when user changes the current level (if actvated) by selecting a new one from the `Settings` menu.
`playererror` | Event executed when any error has occurred within the OpenPlayerJS instance; a response will be sent via `onError` config callback. See [Usage with Javascript](usage.md#javascript) for more details.
`playerdestroyed` | Event executed when an instance of OpenPlayerJS is destroyed (useful to remove extra elements created with the player's help).

In terms of Ads, the following table described the events associated and their equivalences in terms of VAST/VPAID, so you use a standardize set of events for all cases:

Event | Dispatched when... | VPAID equivalent
--- | --- | ---
`adsloaded` | Ads have been loaded successfully and can be played. | AdLoaded
`adsstart` | Ads start being played. | AdVideoStart/AdStarted/AdPlaying
`adsfirstQuartile` | Ad reached the first quarter of its length. | AdVideoFirstQuartile
`adsmidpoint` | Ad reached half of its length. | AdVideoMidpoint
`adsthirdQuartile` | Ad reached the third quarter of its length. | AdVideoThirdQuartile
`adscomplete` | Ad reached the end of its length. | AdVideoComplete
`adsskipped` | user skips the Ad. | AdSkipped
`adsvolumeChange` | user increases/decreases the volume of Ad. | AdVolumeChange
`adsallAdsCompleted` | all Ads have been played. | AdStopped
`adsmediaended` | Ad is going to be played after media has ended playing (currently used to change the Replay icon to Pause when playing a postroll Ad). |
`adsdurationChange` | Ad has all the necessary data to change the duration time; it is the equivalent of HTML5 media's `durationchange`. |
`adsimpression` | Ad reports an impression and it will be on;y executed once for a given playback event. | AdImpressin
`adsadProgress` | Ad plays; it is the equivalent of HTML5 media's `timeupdate`. |
`adsclick` | user clicks in the Ads area. | AdClickThru
`adspause` | user pauses the Ad. | AdPaused
`adsmute` | user mutes the Ad. | AdVolumeChange

In addition to the list above, all [HLS events](https://github.com/video-dev/hls.js/blob/master/docs/API.md#runtime-events) and [HLS error events](https://github.com/video-dev/hls.js/blob/master/docs/API.md#errors) are supported using the same approach described above, including all their details. For the error ones, they are classified as `networkError`, `mediaError`, `muxError` and `otherError`. The proper way to use them is by using the prefix `hls` and then in camel case notation the name of the event, since not always we will have the `Hls` object available right away. For the full list of events mapped as described, please check the [events.ts file](https://github.com/video-dev/hls.js/blob/master/src/events.ts#L56).

### Error Events

In order to determine if an error is being triggered with OpenPlayerJS, you can use the following snippet, since the `playererror` event contains the type of error (`Ads`, `Hls`, `Dash`, etc.), and all the information you will need to customize the error experience:

```javascript
player.getElement().addEventListener('playererror', function(e) {
    console.log(e); // { type, message, data }
});
```
