import { AdsPlugin, extendAds, installAds } from './ads';

(function (global: any) {
  global.OpenPlayerPlugins = global.OpenPlayerPlugins || {};
  global.OpenPlayerPlugins.ads = {
    name: 'ads',
    kind: 'plugin',
    factory: (config?: any) => new AdsPlugin(config || {}),
    install: (PlayerCtor: any) => installAds(PlayerCtor),
    extend: (player: any, plugin: any) => extendAds(player, plugin),
  };
})(window);
