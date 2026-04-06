/**
 * examples/ad-tags.js
 *
 * Shared Google IMA / DoubleClick ad-tag builders for the OpenPlayerJS examples.
 * Each function generates a fresh correlator so the ad server treats every page
 * load as a new session.
 *
 * Usage (in any example's <script type="module">):
 *   import { vastSkippablePreroll, vmapPreMidPost, vastLinear } from './ad-tags.js';
 */

const BASE = 'https://pubads.g.doubleclick.net/gampad/ads';
const NET  = '/21775744923/external';

/** Single skippable VAST pre-roll — used in basic.html */
export function vastSkippablePreroll() {
  return `${BASE}?iu=${NET}/single_preroll_skippable&sz=640x480&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&correlator=${Date.now()}`;
}

/** VMAP pre/mid/post-roll schedule — used in ads.html */
export function vmapPreMidPost() {
  return `${BASE}?iu=${NET}/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpremidpost&ciu_szs=300x250&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&cmsid=496&vid=short_onecue&correlator=${Date.now()}`;
}

/** Single redirect-linear VAST ad — used in youtube.html */
export function vastLinear() {
  return `${BASE}?iu=${NET}/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dredirectlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&correlator=${Date.now()}`;
}
