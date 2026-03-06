import { HlsMediaEngine } from './hls';

(function (global: any) {
  global.OpenPlayerPlugins = global.OpenPlayerPlugins || {};
  global.OpenPlayerPlugins.hls = {
    name: 'hls',
    factory: (config?: any) => new HlsMediaEngine(config || {}),
  };

  // Expose HlsMediaEngine for advanced UMD usage — e.g. to swap in a
  // compatible Hls.js fork (SwarmCloud, etc.) by overriding the plugin entry:
  //
  //   window.OpenPlayerPlugins.hls = {
  //     name: 'hls',
  //     factory: cfg => new OpenPlayerHls.HlsMediaEngine({ ...cfg, hlsClass: MyHls })
  //   };
  //
  // Or simply pass hlsClass through the player config:
  //   new OpenPlayerJS('video', { hls: { hlsClass: MyHls } });
  global.OpenPlayerHls = { HlsMediaEngine };
})(window);
