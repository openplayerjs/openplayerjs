import type { Player as CorePlayer } from '@openplayer/core';
import { DisposableStore, getOverlayManager, type OverlayState } from '@openplayer/core';
import type { Control } from '../control';

export type ControlPlacementV = 'top' | 'center' | 'bottom';
export type ControlPlacementH = 'left' | 'center' | 'right';

export type ControlPlacement = {
  v: ControlPlacementV;
  h: ControlPlacementH;
};

export abstract class BaseControl implements Control {
  abstract id: string;
  abstract placement: Control['placement'];

  protected player!: CorePlayer;

  protected overlayMgr!: ReturnType<typeof getOverlayManager>;
  protected activeOverlay: OverlayState | null = null;

  protected dispose = new DisposableStore();

  protected abstract build(): HTMLElement;

  protected onOverlayChanged(_ov: OverlayState | null): void {
    // ignore
  }

  create(player: CorePlayer): HTMLElement {
    this.player = player;
    this.overlayMgr = getOverlayManager(player);
    this.activeOverlay = this.overlayMgr.active ?? null;

    this.dispose.add(
      this.overlayMgr.bus.on('overlay:changed', (ov: OverlayState | null) => {
        this.activeOverlay = ov;
        this.onOverlayChanged(ov);
      })
    );

    return this.build();
  }

  destroy(): void {
    this.dispose.dispose();
  }

  protected onPlayer(event: any, cb: (...args: any[]) => void) {
    return this.dispose.add(this.player.events.on(event, cb as any));
  }

  protected listen(
    target: EventTarget,
    type: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) {
    return this.dispose.addEventListener(target, type, handler, options);
  }

  protected resolvePlayerRoot(): HTMLElement {
    const media = this.player.media as unknown as HTMLElement | null;
    if (!media) return document.body;

    return media.closest('.op-player') || media.parentElement || document.body;
  }

  protected resolveFullscreenContainer(): HTMLElement {
    return (this.activeOverlay?.fullscreenEl as HTMLElement | undefined) || this.resolvePlayerRoot();
  }

  protected resolveFullscreenVideoEl(): HTMLElement | null {
    return (
      (this.activeOverlay?.fullscreenVideoEl as HTMLElement | undefined) ||
      ((this.player.media as unknown as HTMLElement) ?? null)
    );
  }
}
