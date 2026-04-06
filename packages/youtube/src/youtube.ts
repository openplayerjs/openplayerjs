import type { MediaEngineContext, MediaSource } from '@openplayerjs/core';
import {
  BaseMediaEngine,
  type CaptionTrackProvider,
  IframeMediaSurface,
  setCaptionTrackProvider,
} from '@openplayerjs/core';
import { YouTubeIframeAdapter } from './youtubeAdapter';

export type YouTubeEngineConfig = {
  /**
   * When `true`, the YouTube IFrame player is served from
   * `https://www.youtube-nocookie.com` instead of `https://www.youtube.com`,
   * which prevents YouTube from setting cookies on the viewer's browser until
   * they interact with the player.
   *
   * @default false
   */
  noCookie?: boolean;
};

export class YouTubeMediaEngine extends BaseMediaEngine {
  public readonly name = 'youtube';
  public readonly version = '1.0.0';
  public readonly capabilities: string[] = ['media-engine'];
  public readonly priority = 50;

  private readonly noCookie: boolean;
  private ytSurface: IframeMediaSurface | null = null;
  private ytAdapter: YouTubeIframeAdapter | null = null;
  private ytCleanupControls: (() => void) | null = null;

  constructor(config: YouTubeEngineConfig = {}) {
    super();
    this.noCookie = config.noCookie ?? false;
  }

  canPlay(source: MediaSource): boolean {
    const url = source.src;
    if (!url) return false;
    // Explicit MIME type declared on a <source> element takes precedence.
    if (source.type === 'video/youtube') return true;
    return this.isYouTubeUrl(url) || this.looksLikeYouTubeId(url);
  }

  async attach(ctx: MediaEngineContext): Promise<void> {
    const urlOrId = ctx.activeSource?.src ?? '';
    if (!urlOrId) throw new Error('YouTubeMediaEngine: missing source URL');

    const videoId = this.extractVideoId(urlOrId, ctx.activeSource?.type);
    if (!videoId) throw new Error('YouTubeMediaEngine: cannot parse videoId from source');

    const adapter = new YouTubeIframeAdapter({ videoId, noCookie: this.noCookie });
    const surface = new IframeMediaSurface(adapter, { pollIntervalMs: 250 });

    ctx.setSurface(surface);
    this.bindSurfaceEvents(surface, ctx.events);
    this.bindCommands(ctx);

    // Use display:none to remove the native element from layout; give the container an
    // explicit aspect ratio so its height is determined by CSS inheritance, not the video.
    ctx.media.style.display = 'none';
    const containerWidth = ctx.container.offsetWidth;
    const containerHeight = ctx.container.offsetHeight;
    ctx.container.style.aspectRatio =
      containerWidth > 0 && containerHeight > 0 ? `${containerWidth} / ${containerHeight}` : '16 / 9';

    // Caption preference helpers — persisted under a YouTube-specific key so the
    // player package stays agnostic about storage.
    const CAPTION_PREFERENCE_KEY = 'op:yt:caption:track';
    const readCaptionPreference = (): string | null | undefined => {
      try {
        const v = localStorage.getItem(CAPTION_PREFERENCE_KEY);
        if (v === null) return undefined; // key absent = no preference
        if (v === '') return null; // '' = explicitly off
        return v; // non-empty string = track id
      } catch {
        return undefined;
      }
    };
    const saveCaptionPreference = (id: string | null): void => {
      try {
        localStorage.setItem(CAPTION_PREFERENCE_KEY, id ?? '');
      } catch {
        /* ignore */
      }
    };

    // Register the caption provider BEFORE mount() so it is available when
    // the IframeMediaSurface emits 'loadedmetadata' during onAdapterReady().
    // subscribe() lets the provider push a refresh notification to the UI once
    // the YouTube captions module has loaded its tracklist (lazy, post-onReady).
    // Local state — getOption('captions','track') doesn't reflect setOption() synchronously,
    // so we maintain the active track id ourselves. null = captions off.
    // Initialized to undefined until the subscribe poll confirms tracks are available;
    // at that point cc_load_policy:1 means captions are on, so we prime with the first track.
    // Possible values: undefined: not initialized, null: captions off, string: active track id
    let activeTrackId: string | null | undefined = undefined;
    let controlsVisible = false;

    const DEFAULT_CONTROLS_HEIGHT = '48px';

    // Shrinks the iframe so YouTube's caption overlay stays above the controls bar,
    // but only when both conditions are true: controls are currently visible AND
    // a caption track is active. Restores full height otherwise.
    const updateIframeHeight = (): void => {
      const iframe = this.ytAdapter?.getElement() as HTMLIFrameElement | null;
      if (!iframe) return;
      if (controlsVisible && activeTrackId != null) {
        const playerEl = ctx.container.closest('.op-player') as HTMLElement | null;
        const raw = playerEl ? getComputedStyle(playerEl).getPropertyValue('--op-controls-height').trim() : '';
        iframe.style.height = `calc(100% - ${raw || DEFAULT_CONTROLS_HEIGHT})`;
      } else {
        iframe.style.height = '100%';
      }
    };

    const captionProvider: CaptionTrackProvider = {
      getTracks: () => adapter.getAvailableCaptionTracks(),
      getActiveTrack: () => activeTrackId ?? null,
      setTrack: (id) => {
        activeTrackId = id;
        adapter.setCaptionTrack(id);
        saveCaptionPreference(id);
        // Re-evaluate height immediately when captions are toggled on/off.
        updateIframeHeight();
      },
      subscribe: (notify) => {
        let attempts = 0;
        const MAX_POLL_ATTEMPTS = 10;
        const POLL_INTERVAL_MS = 500;
        const poll = () => {
          const tracks = adapter.getAvailableCaptionTracks();
          if (tracks.length > 0) {
            if (activeTrackId === undefined) {
              // Apply persisted preference. Stored '' means user explicitly turned
              // captions off — override cc_load_policy:1 by calling setCaptionTrack(null).
              // Stored non-empty string = preferred track id. No key = honour YouTube default.
              const storedPref = readCaptionPreference();
              if (storedPref === null) {
                activeTrackId = null;
                adapter.setCaptionTrack(null);
              } else if (storedPref && tracks.some((t) => t.id === storedPref)) {
                activeTrackId = storedPref;
                // cc_load_policy:1 may already show it; ensure consistency.
                adapter.setCaptionTrack(storedPref);
              } else {
                // No stored preference — honour whatever YouTube is showing.
                activeTrackId = adapter.getActiveCaptionTrack() ?? tracks[0]?.id ?? null;
              }
            }
            notify();
            return;
          }
          if (++attempts < MAX_POLL_ATTEMPTS) timer = window.setTimeout(poll, POLL_INTERVAL_MS);
        };
        let timer = window.setTimeout(poll, POLL_INTERVAL_MS);
        return () => window.clearTimeout(timer);
      },
    };
    setCaptionTrackProvider(ctx.core, captionProvider);

    this.ytSurface = surface;
    this.ytAdapter = adapter;
    await surface.mount(ctx.container);

    const offShow = ctx.events.on('ui:controls:show', () => {
      controlsVisible = true;
      updateIframeHeight();
    });
    const offHide = ctx.events.on('ui:controls:hide', () => {
      controlsVisible = false;
      updateIframeHeight();
    });
    this.ytCleanupControls = () => {
      offShow();
      offHide();
    };
  }

  detach(ctx?: MediaEngineContext): void {
    this.ytCleanupControls?.();
    this.ytCleanupControls = null;
    this.ytAdapter = null;

    this.unbindCommands();
    this.unbindSurfaceEvents();

    try {
      this.ytSurface?.destroy();
    } finally {
      this.ytSurface = null;
    }

    if (ctx) {
      ctx.media.style.display = '';
      ctx.container.style.aspectRatio = '';
      setCaptionTrackProvider(ctx.core, null);
      ctx.resetSurface();
    }
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private isYouTubeUrl(url: string): boolean {
    try {
      const u = new URL(url, 'https://example.com');
      const host = u.hostname.toLowerCase();
      return (
        host === 'youtube.com' ||
        host.endsWith('.youtube.com') || // www., m., music., etc.
        host === 'youtu.be' ||
        host.endsWith('.youtu.be') ||
        host === 'youtube-nocookie.com' ||
        host.endsWith('.youtube-nocookie.com')
      );
    } catch {
      return false;
    }
  }

  private looksLikeYouTubeId(s: string): boolean {
    return /^[a-zA-Z0-9_-]{11}$/.test(s);
  }

  private extractVideoId(urlOrId: string, type?: string): string | null {
    if (this.looksLikeYouTubeId(urlOrId)) return urlOrId;

    try {
      const u = new URL(urlOrId, 'https://example.com');

      // youtu.be/<id>
      if (u.hostname.toLowerCase().includes('youtu.be')) {
        return u.pathname.split('/').filter(Boolean)[0] ?? null;
      }

      // ?v=<id>
      const v = u.searchParams.get('v');
      if (v) return v;

      // /embed/<id>  or  /shorts/<id>
      const parts = u.pathname.split('/').filter(Boolean);
      const pivotIdx = parts.findIndex((p) => p === 'embed' || p === 'shorts');
      if (pivotIdx >= 0 && parts[pivotIdx + 1]) return parts[pivotIdx + 1];

      // Last-resort: only when the source was explicitly declared as YouTube via
      // type="video/youtube". A bare ID used as <source src="<id>"> gets resolved
      // by the browser to an absolute URL whose last path segment is the raw ID value.
      // e.g. http://localhost/dQw4w9WgXcQ → last segment = 'dQw4w9WgXcQ'
      // We guard on the explicit type to avoid false positives from non-YouTube paths
      // whose last segment happens to match the 11-character pattern.
      if (type === 'video/youtube') {
        const lastSegment = parts[parts.length - 1] ?? '';
        if (this.looksLikeYouTubeId(lastSegment)) return lastSegment;
      }

      return null;
    } catch {
      return null;
    }
  }
}
