/**
 * OmidSession — Full IAB OMID (Open Measurement Interface Definition) integration.
 *
 * Integrates with the IAB OMID Session Client SDK, which must be loaded by the page
 * before ads play (e.g. <script src="omweb-v1.js"></script>).
 *
 * The SDK exposes:
 *   window.OmidSessionClient  — namespace containing AdSession, Context, Partner,
 *                               VideoEvents, AdEvents, etc.
 *
 * Spec: https://iabtechlab.com/standards/open-measurement-sdk/
 *
 * Usage:
 *   if (OmidSession.isAvailable()) {
 *     const omid = new OmidSession(adVideo, verifications, 'limited');
 *     omid.impression();
 *     omid.start(duration, volume);
 *     // … quartile calls …
 *     omid.destroy();
 *   }
 */

import type { AdVerification } from './types';

// ─── Loose typing for the OMID SDK (loaded at runtime) ───────────────────────

type OmidPlayerState = 'normal' | 'minimized' | 'collapsed' | 'expanded' | 'fullscreen' | 'background';
type OmidInteractionType = 'click' | 'invocationCountExceeded' | 'acceptedLinearInvitation' | 'other';

type OmidContext = {
  new (partner: any, verificationScriptResources: any[]): any;
  setVideoElement?(el: HTMLVideoElement): void;
};

type OmidAdSession = {
  new (context: any): any;
  start(): void;
  finish(): void;
  triggerSessionStart(): void;
  error(errorType: string, message: string): void;
};

type OmidVideoEvents = {
  new (adSession: any): any;
  impressionOccurred(): void;
  loaded(vastProperties: any): void;
  start(duration: number, videoPlayerVolume: number): void;
  firstQuartile(): void;
  midpoint(): void;
  thirdQuartile(): void;
  complete(): void;
  pause(): void;
  resume(): void;
  bufferStart(): void;
  bufferFinish(): void;
  skipped(): void;
  volumeChange(videoPlayerVolume: number): void;
  playerStateChange(playerState: OmidPlayerState): void;
  adUserInteraction(interactionType: OmidInteractionType): void;
};

type OmidSessionClientNamespace = {
  AdSession: OmidAdSession;
  Context: OmidContext;
  Partner: new (name: string, version: string) => any;
  VerificationScriptResource: new (scriptUrl: string, vendorKey?: string, params?: string) => any;
  VideoEvents: OmidVideoEvents;
  AdEvents: new (adSession: any) => { impressionOccurred(): void };
  VastProperties: new (isSkippable: boolean, skipOffset: number, isAutoPlay: boolean, position: string) => any;
  AccessMode: { FULL: string; DOMAIN: string; LIMITED: string };
};

function getOmidClient(): OmidSessionClientNamespace | null {
  return (window as any).OmidSessionClient ?? null;
}

// ─── OmidSession ──────────────────────────────────────────────────────────────

export class OmidSession {
  private adSession: any = null;
  private videoEvents: any = null;
  private adEvents: any = null;
  private destroyed = false;

  /**
   * Returns true if the IAB OMID Session Client SDK is present on the page.
   * Call this before constructing OmidSession to avoid unnecessary errors.
   */
  static isAvailable(): boolean {
    return getOmidClient() !== null;
  }

  /**
   * Injects a verification script into the page as a <script> element.
   * The `params` string is passed via `omidVerificationParameters` on the script element
   * so the verification provider can read it from its own initialization logic.
   */
  static injectVerificationScript(scriptUrl: string, params: string): HTMLScriptElement {
    const s = document.createElement('script');
    s.src = scriptUrl;
    s.async = true;
    if (params) s.setAttribute('data-omid-verification-parameters', params);
    document.head.appendChild(s);
    return s;
  }

  constructor(
    adVideo: HTMLVideoElement,
    verifications: AdVerification[],
    accessMode: 'domain' | 'limited' = 'limited'
  ) {
    const omid = getOmidClient();
    if (!omid) return; // SDK not loaded — session is a no-op

    try {
      const partner = new omid.Partner('OpenPlayerJS', '3.0.0');

      const verificationResources = verifications.map((v) => {
        const res = new omid.VerificationScriptResource(v.scriptUrl, v.vendor || undefined, v.params || undefined);
        return res;
      });

      const sdkAccessMode =
        accessMode === 'domain' ? (omid.AccessMode?.DOMAIN ?? 'domain') : (omid.AccessMode?.LIMITED ?? 'limited');

      const context: any = new omid.Context(partner, verificationResources);
      if (typeof context.setVideoElement === 'function') context.setVideoElement(adVideo);
      if (typeof context.setAccessMode === 'function') context.setAccessMode(sdkAccessMode);

      this.adSession = new omid.AdSession(context);
      this.videoEvents = new omid.VideoEvents(this.adSession);
      this.adEvents = new omid.AdEvents(this.adSession);
      this.adSession.start();
    } catch (_) {
      // OMID setup failure must not break ad playback.
      this.adSession = null;
      this.videoEvents = null;
      this.adEvents = null;
    }
  }

  // ─── Session events ──────────────────────────────────────────────────────────

  /**
   * Must be called once before any tracking events.
   * Triggers the OMID session start and fires an impression.
   */
  impression(): void {
    if (!this.adSession || this.destroyed) return;
    try {
      if (typeof this.adSession.triggerSessionStart === 'function') this.adSession.triggerSessionStart?.();
      else this.adSession.start?.();
      this.adEvents?.impressionOccurred?.();
    } catch {
      /* ignore */
    }
  }

  loaded(isSkippable = false, skipOffset = 0, isAutoPlay = false, position = 'preroll'): void {
    if (!this.videoEvents || this.destroyed) return;
    try {
      const omid = getOmidClient();
      if (!omid) return;
      const vastProps = new omid.VastProperties(isSkippable, skipOffset, isAutoPlay, position);
      this.videoEvents.loaded(vastProps);
    } catch {
      /* ignore */
    }
  }

  start(duration: number, volume: number): void {
    if (!this.videoEvents || this.destroyed) return;
    try {
      this.videoEvents.start(duration, volume);
    } catch {
      /* ignore */
    }
  }

  firstQuartile(): void {
    if (!this.videoEvents || this.destroyed) return;
    try {
      this.videoEvents.firstQuartile();
    } catch {
      /* ignore */
    }
  }

  midpoint(): void {
    if (!this.videoEvents || this.destroyed) return;
    try {
      this.videoEvents.midpoint();
    } catch {
      /* ignore */
    }
  }

  thirdQuartile(): void {
    if (!this.videoEvents || this.destroyed) return;
    try {
      this.videoEvents.thirdQuartile();
    } catch {
      /* ignore */
    }
  }

  complete(): void {
    if (!this.videoEvents || this.destroyed) return;
    try {
      this.videoEvents.complete();
    } catch {
      /* ignore */
    }
  }

  pause(): void {
    if (!this.videoEvents || this.destroyed) return;
    try {
      this.videoEvents.pause();
    } catch {
      /* ignore */
    }
  }

  resume(): void {
    if (!this.videoEvents || this.destroyed) return;
    try {
      this.videoEvents.resume();
    } catch {
      /* ignore */
    }
  }

  skipped(): void {
    if (!this.videoEvents || this.destroyed) return;
    try {
      this.videoEvents.skipped();
    } catch {
      /* ignore */
    }
  }

  volumeChange(volume: number): void {
    if (!this.videoEvents || this.destroyed) return;
    try {
      this.videoEvents.volumeChange(volume);
    } catch {
      /* ignore */
    }
  }

  playerStateChange(state: OmidPlayerState): void {
    if (!this.videoEvents || this.destroyed) return;
    try {
      this.videoEvents.playerStateChange(state);
    } catch {
      /* ignore */
    }
  }

  adUserInteraction(interactionType: OmidInteractionType): void {
    if (!this.videoEvents || this.destroyed) return;
    try {
      this.videoEvents.adUserInteraction(interactionType);
    } catch {
      /* ignore */
    }
  }

  bufferStart(): void {
    if (!this.videoEvents || this.destroyed) return;
    try {
      this.videoEvents.bufferStart();
    } catch {
      /* ignore */
    }
  }

  bufferFinish(): void {
    if (!this.videoEvents || this.destroyed) return;
    try {
      this.videoEvents.bufferFinish();
    } catch {
      /* ignore */
    }
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    try {
      this.adSession?.finish?.();
    } catch {
      /* ignore */
    }
    this.adSession = null;
    this.videoEvents = null;
    this.adEvents = null;
  }
}
