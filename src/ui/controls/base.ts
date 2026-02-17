// ui/controls/abstract-control.ts
import { getOverlayManager, type OverlayState } from '../../core/overlay';
import type { Player as CorePlayer } from '../../core/player';
import { Control } from '../control';

export type ControlPlacementV = 'top' | 'center' | 'bottom';
export type ControlPlacementH = 'left' | 'center' | 'right';

export interface ControlPlacement {
  v: ControlPlacementV;
  h: ControlPlacementH;
}

export abstract class BaseControl implements Control {
  abstract id: string;
  abstract placement: Control['placement'];

  protected player!: CorePlayer;

  protected overlayMgr!: ReturnType<typeof getOverlayManager>;
  protected activeOverlay: OverlayState | null = null;

  protected abstract build(): HTMLElement;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onOverlayChanged(_ov: OverlayState | null): void {
    // ignore
  }

  create(player: CorePlayer): HTMLElement {
    this.player = player;
    this.overlayMgr = getOverlayManager(player);
    this.activeOverlay = this.overlayMgr.active ?? null;

    this.overlayMgr.bus.on('overlay:changed', (ov: OverlayState | null) => {
      this.activeOverlay = ov;
      this.onOverlayChanged(ov);
    });

    return this.build();
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
