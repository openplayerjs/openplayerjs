import type { Core } from '@openplayerjs/core';
import { DisposableStore, getOverlayManager, type OverlayState } from '@openplayerjs/core';
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

  protected core!: Core;

  protected overlayMgr!: ReturnType<typeof getOverlayManager>;
  protected activeOverlay: OverlayState | null = null;

  protected dispose = new DisposableStore();

  protected abstract build(): HTMLElement;

  protected onOverlayChanged(_ov: OverlayState | null): void {
    // ignore
  }

  create(core: Core): HTMLElement {
    this.core = core;
    this.overlayMgr = getOverlayManager(core);
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
    return this.dispose.add(this.core.events.on(event, cb as any));
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
    const media = this.core.media as unknown as HTMLElement | null;
    if (!media) return document.body;

    return media.closest('.op-player') || media.parentElement || document.body;
  }

  protected resolveFullscreenContainer(): HTMLElement {
    return (this.activeOverlay?.fullscreenEl as HTMLElement | undefined) || this.resolvePlayerRoot();
  }

  protected resolveFullscreenVideoEl(): HTMLElement | null {
    return (
      (this.activeOverlay?.fullscreenVideoEl as HTMLElement | undefined) ||
      ((this.core.media as unknown as HTMLElement) ?? null)
    );
  }
}
