import {loadScript} from '../utils/dom';

/**
 * Class that creates the setup to play HLS using hls.js library
 *
 * @class Ads
 */
class Ads {
    /**
     * Creates an instance of Ads.
     * @memberof Ads
     * @param {HTMLElement} media
     * @return {Ads}
     */
    constructor(media, url) {
        this.promise = null;
        this.media = media;
        this.adsURL = url;

        // Create the Ads container
        const adsContainer = document.createElement('div');
        adsContainer.id = 'om-ads';
        this.media.closest('.om-player').appendChild(adsContainer);

        this.adsContainer = adsContainer;

        function createPlayer() {
            this._createPlayer();
        }

        this.promise = (typeof google === 'undefined' || typeof google.ima === 'undefined') ?
            loadScript('https://imasdk.googleapis.com/js/sdkloader/ima3.js') :
            new Promise(resolve => {
                resolve();
            });

        this.promise.then(createPlayer);
        return this;
    }

    _createPlayer() {
        const adDisplayContainer = new google.ima.AdDisplayContainer(this.adsContainer, this.media);
        // Request video ads.
        const adsRequest = new google.ima.AdsRequest();

        // Must be done as the result of a user action on mobile
        adDisplayContainer.initialize();

        // Re-use this AdsLoader instance for the entire lifecycle of your page.
        const adsLoader = new google.ima.AdsLoader(adDisplayContainer);

        // Add event listeners
        adsLoader.addEventListener(
            google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
            onAdsManagerLoaded
        );
        adsLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, adErrorEvent => {
            console.log(adErrorEvent.getError());
            adsManager.destroy();
        });

        // An event listener to tell the SDK that our content video
        // is completed so the SDK can play any post-roll ads.
        const contentEndedListener = () => adsLoader.contentComplete();
        this.media.onended = contentEndedListener;
        adsRequest.adTagUrl = this.adsURL;

        // Specify the linear and nonlinear slot sizes. This helps the SDK to
        // select the correct creative if multiple are returned.
        adsRequest.linearAdSlotWidth = this.media.width();
        adsRequest.linearAdSlotHeight = this.media.height();
        adsRequest.nonLinearAdSlotWidth = this.media.width();
        adsRequest.nonLinearAdSlotHeight = 150;
    }
}

export default Ads;
