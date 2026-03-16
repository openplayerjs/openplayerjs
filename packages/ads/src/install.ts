import type { AdsPlugin } from './ads';

export function installAds(PlayerCtor: any) {
  if (!PlayerCtor || !PlayerCtor.prototype) return;

  const adsDesc = Object.getOwnPropertyDescriptor(PlayerCtor.prototype, 'ads');
  if (!adsDesc) {
    Object.defineProperty(PlayerCtor.prototype, 'ads', {
      configurable: true,
      enumerable: false,
      get() {
        return this.getPlugin?.('ads');
      },
    });
  }

  if (typeof PlayerCtor.prototype.playAds !== 'function') {
    Object.defineProperty(PlayerCtor.prototype, 'playAds', {
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

export function extendAds(player: any, plugin: AdsPlugin) {
  if (!player) return;
  if (typeof player.extend === 'function') {
    player.extend({ ads: plugin });
  } else if (player.ads === undefined) {
    player.ads = plugin;
  }
}
