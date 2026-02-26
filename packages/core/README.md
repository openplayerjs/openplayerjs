# @openplayer/core

> Core player engine, plugin system, and public API for [OpenPlayerJS](https://github.com/openplayerjs/openplayerjs).

## Installation

```bash
npm install @openplayer/core
```

## What's inside

| Module | Purpose |
|--------|---------|
| `Player` | Main player class — manages engines, plugins, state, and events |
| `PluginRegistry` | Registers and coordinates `PlayerPlugin` instances |
| `EventBus` | Internal typed publish/subscribe system |
| `BaseMediaEngine` | Abstract base class for custom media engines |
| `DefaultMediaEngine` | Built-in HTML5 `<video>`/`<audio>` engine |
| `getOverlayManager` | Access the overlay priority queue (used by ad plugins) |

## Basic usage

```ts
import { Player } from '@openplayer/core';

const video = document.querySelector('video')!;
const player = new Player(video, { plugins: [] });

player.on('playing', () => console.log('playing'));
await player.play();
```

## Writing a custom plugin

```ts
import type { PlayerPlugin, PluginContext } from '@openplayer/core';

export class MyPlugin implements PlayerPlugin {
  name = 'my-plugin';
  version = '1.0.0';

  setup({ events, player }: PluginContext) {
    events.on('playing', () => {
      console.log('playback started at', player.media.currentTime);
    });
  }
}

const player = new Player(video, { plugins: [new MyPlugin()] });
```

## Writing a custom media engine

```ts
import { BaseMediaEngine, EVENT_OPTIONS } from '@openplayer/core';
import type { IEngine, MediaEngineContext, MediaSource } from '@openplayer/core';

export class MyEngine extends BaseMediaEngine implements IEngine {
  name = 'my-engine';
  version = '1.0.0';
  capabilities = ['media-engine'] as const;
  priority = 10;

  canPlay(source: MediaSource): boolean {
    return source.src.endsWith('.my-format');
  }

  attach(ctx: MediaEngineContext): void {
    // set up your engine against ctx.media
  }

  detach(ctx: MediaEngineContext): void {
    // clean up
  }
}
```

## License

MIT — see [LICENSE](../../LICENSE).
