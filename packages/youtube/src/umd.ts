import { YouTubeMediaEngine } from './youtube';

(function (global: any) {
  global.OpenPlayerPlugins = global.OpenPlayerPlugins || {};
  global.OpenPlayerPlugins.youtube = {
    name: 'youtube',
    factory: (config?: any) => new YouTubeMediaEngine(config || {}),
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
})(window);
