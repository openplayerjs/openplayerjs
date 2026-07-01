import type { AdsPlugin } from './ads';

type PlayerCtorLike = { prototype?: object };

export function installAds(PlayerCtor: PlayerCtorLike | null | undefined) {
  if (!PlayerCtor || !PlayerCtor.prototype) return;
  const proto = PlayerCtor.prototype as Record<string, unknown>;

  const adsDesc = Object.getOwnPropertyDescriptor(proto, 'ads');
  if (!adsDesc) {
    Object.defineProperty(proto, 'ads', {
      configurable: true,
      enumerable: false,
      get() {
        return this.getPlugin?.('ads');
      },
    });
  }

  if (typeof proto.playAds !== 'function') {
    Object.defineProperty(proto, 'playAds', {
      configurable: true,
      enumerable: false,
      value: function playAds(input: string) {
        const plugin = (this.getPlugin?.('ads') || this.ads) as AdsPlugin;
        if (!plugin) throw new Error('Ads plugin not installed; cannot playAds()');

        const s = String(input ?? '').trim();
        if (!s) throw new Error('playAds(input) requires a non-empty URL or VAST XML string');

        if (s.startsWith('<')) {
          if (typeof plugin.playAdsFromXml !== 'function') {
            throw new Error('Ads plugin does not support XML input (playAdsFromXml missing)');
          }
          return plugin.playAdsFromXml(s);
        }

        return plugin.playAds(s);
      },
    });
  }
}

type PlayerLike = { extend?: (ext: Record<string, unknown>) => void; ads?: unknown };

export function extendAds(player: PlayerLike | null | undefined, plugin: AdsPlugin) {
  if (!player) return;
  if (typeof player.extend === 'function') {
    player.extend({ ads: plugin });
  } else if (player.ads === undefined) {
    player.ads = plugin;
  }
}
