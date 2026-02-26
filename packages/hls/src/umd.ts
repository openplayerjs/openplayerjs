import { HlsMediaEngine } from './hls';

(function (global: any) {
  global.OpenPlayerPlugins = global.OpenPlayerPlugins || {};
  global.OpenPlayerPlugins.hls = {
    name: 'hls',
    factory: (config?: any) => new HlsMediaEngine(config || {}),
  };
})(window);
