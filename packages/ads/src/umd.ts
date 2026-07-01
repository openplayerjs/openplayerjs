import { AdsPlugin, extendAds, installAds } from './ads';

type UMDGlobal = {
  OpenPlayerPlugins?: Record<string, unknown>;
  OpenPlayerJS?: { prototype: Record<string, unknown> };
};

type PlayerInstance = { getCore?: () => { getPlugin?: (name: string) => AdsPlugin | null } | null };

(function (global: UMDGlobal) {
  global.OpenPlayerPlugins = global.OpenPlayerPlugins || {};
  global.OpenPlayerPlugins.ads = {
    name: 'ads',
    kind: 'plugin',
    factory: (config?: ConstructorParameters<typeof AdsPlugin>[0]) =>
      new AdsPlugin({ ...(config || {}), allowNativeControls: false }),
    install: (PlayerCtor: Parameters<typeof installAds>[0]) => installAds(PlayerCtor),
    extend: (player: Parameters<typeof extendAds>[0], plugin: AdsPlugin) => extendAds(player, plugin),
  };
})(window as unknown as UMDGlobal);

// ---- UMD helper: OpenPlayerJS.playAds(...) ---------------------------------
// The core Ads plugin installs `player.playAds(input)` via installAds(Player).
// So in UMD we only need a thin wrapper that delegates to the underlying Player.
(function (global: UMDGlobal) {
  function extendOpenPlayerJS(OpenPlayerJS: UMDGlobal['OpenPlayerJS']) {
    if (!OpenPlayerJS || OpenPlayerJS.prototype.playAds) return;

    OpenPlayerJS.prototype.playAds = function (this: PlayerInstance, input: string) {
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
})(window as unknown as UMDGlobal);
