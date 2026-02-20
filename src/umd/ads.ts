import { AdsPlugin, extendAds, installAds } from '../plugins/ads';

function normalizeAdsConfig(cfg: any = {}) {
  const out = { ...(cfg || {}) };

  // Preferred config name in app configs
  if (out.allowNativeControls != null && out.useWithNativePlayer == null) {
    out.useWithNativePlayer = out.allowNativeControls;
  }

  // Convenience: if sources are provided but no breaks are defined, default to a preroll using the first VAST source.
  const sources = out.sources ? (Array.isArray(out.sources) ? out.sources : [out.sources]) : [];
  const hasBreaks = Array.isArray(out.breaks) && out.breaks.length > 0;

  if (!hasBreaks) {
    const firstVast = sources.find((s: any) => s && s.type === 'VAST' && typeof s.src === 'string' && s.src.trim());
    if (firstVast) {
      out.breaks = [{ at: 'preroll', url: firstVast.src, once: true }];
    }
  }

  return out;
}

(function (global: any) {
  global.OpenPlayerPlugins = global.OpenPlayerPlugins || {};
  global.OpenPlayerConfig = global.OpenPlayerConfig || {};

  global.OpenPlayerPlugins.ads = {
    name: 'ads',
    kind: 'plugin',
    factory: (config?: any) => new AdsPlugin(normalizeAdsConfig(config || {})),
    install: (PlayerCtor: any) => installAds(PlayerCtor),
    extend: (player: any, plugin: any) => extendAds(player, plugin),
  };
})(window);
