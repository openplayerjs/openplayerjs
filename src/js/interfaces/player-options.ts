import AdsOptions from './ads-options';
import DashOptions from './dash-options';

/**
 * Player options
 *
 * @description An object that stores potential configuration for HLS and M(PEG)-DASH players
 * @interface PlayerOptions
 * @export
 */
export default interface PlayerOptions {
    /**
     * @type DashOptions
     */
    dash?: DashOptions;
    /**
     * @type object
     */
    hls?: object;

    ads?: AdsOptions;
    /**
     * @type object
     */
    [key: string]: any;
}
