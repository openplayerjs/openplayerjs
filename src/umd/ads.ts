import { AdsPlugin } from '../plugins/ads';

(function (global: any) {
  global.OpenPlayerPlugins = global.OpenPlayerPlugins || {};
  global.OpenPlayerPlugins.ads = {
    name: 'ads',
    factory: (config?: any) => new AdsPlugin(config || {}),
  };
})(window);
