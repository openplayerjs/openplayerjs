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
      const core = typeof this.getCore === 'function' ? this.getCore() : null;
      if (!core) throw new Error('Call player.init() before player.playAds()');
      const plugin = typeof core.getPlugin === 'function' ? core.getPlugin('ads') : null;
      if (!plugin) throw new Error('Ads plugin not installed');
      const s = String(input ?? '').trim();
      if (!s) throw new Error('playAds(input) requires a non-empty URL or VAST XML string');
      if (s.startsWith('<')) return plugin.playAdsFromXml(s);
      return plugin.playAds(s);
    };
  }

  extendOpenPlayerJS(global.OpenPlayerJS);
})(window);
