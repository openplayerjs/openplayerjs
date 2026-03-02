import { AdsPlugin, extendAds, installAds } from './ads';

(function (global: any) {
  global.OpenPlayerPlugins = global.OpenPlayerPlugins || {};
  global.OpenPlayerPlugins.ads = {
    name: 'ads',
    kind: 'plugin',
    factory: (config?: any) => new AdsPlugin({ ...(config || {}), allowNativeControls: false }),
    install: (PlayerCtor: any) => installAds(PlayerCtor),
    extend: (player: any, plugin: any) => extendAds(player, plugin),
  };
})(window);

// ---- UMD helper: OpenPlayerJS.playAds(...) ---------------------------------
// The core Ads plugin installs `player.playAds(input)` via installAds(Player).
// So in UMD we only need a thin wrapper that delegates to the underlying Player.
(function (global: any) {
  function extendOpenPlayerJS(OpenPlayerJS: any) {
    if (!OpenPlayerJS || OpenPlayerJS.prototype.playAds) return;

    OpenPlayerJS.prototype.playAds = function (input: string) {
      const core = typeof this.getPlayer === 'function' ? this.getPlayer() : this.player;
      return core.playAds(input);
    };
  }

  extendOpenPlayerJS(global.OpenPlayerJS);
})(window);
