import { YouTubeMediaEngine } from './youtube';

type UMDGlobal = {
  OpenPlayerPlugins?: Record<string, unknown>;
  OpenPlayerYouTube?: unknown;
};

(function (global: UMDGlobal) {
  global.OpenPlayerPlugins = global.OpenPlayerPlugins || {};
  global.OpenPlayerPlugins.youtube = {
    name: 'youtube',
    factory: (config?: ConstructorParameters<typeof YouTubeMediaEngine>[0]) => new YouTubeMediaEngine(config || {}),
  };

  // Expose YouTubeMediaEngine for advanced UMD usage:
  //
  //   window.OpenPlayerPlugins.youtube = {
  //     name: 'youtube',
  //     factory: cfg => new OpenPlayerYouTube.YouTubeMediaEngine({ ...cfg, noCookie: true })
  //   };
  //
  // Or pass noCookie through the player config:
  //   new OpenPlayerJS('video', { youtube: { noCookie: true } });
  global.OpenPlayerYouTube = { YouTubeMediaEngine };
})(window as unknown as UMDGlobal);
