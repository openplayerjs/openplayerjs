import { EVENT_OPTIONS } from '@openplayerjs/core';
import { getSharedAnnouncer, setA11yLabel } from '../a11y';
import { resolveUIConfig } from '../configuration';
import type { Control } from '../control';
import { BaseControl } from './base';

type VendorDocument = Document & {
  webkitFullscreenElement?: Element;
  mozFullScreenElement?: Element;
  msFullscreenElement?: Element;
  mozCancelFullScreen?: () => void;
  webkitCancelFullScreen?: () => void;
  msExitFullscreen?: () => void;
};

type VendorElement = HTMLElement & {
  mozRequestFullScreen?: () => void | Promise<void>;
  webkitRequestFullScreen?: () => void | Promise<void>;
  msRequestFullscreen?: () => void | Promise<void>;
  webkitEnterFullscreen?: () => void;
};

// `lock()` is an experimental API not yet in TypeScript's ScreenOrientation lib.
type LockableOrientation = ScreenOrientation & { lock?(orientation: string): Promise<void> };

function getFullscreenElement(): Element | null {
  const d = document as VendorDocument;
  return (
    document.fullscreenElement || d.webkitFullscreenElement || d.mozFullScreenElement || d.msFullscreenElement || null
  );
}

function requestFullscreen(el: HTMLElement | null) {
  if (!el) return;
  const ve = el as VendorElement;
  if (ve.requestFullscreen) return ve.requestFullscreen();
  if (ve.mozRequestFullScreen) return ve.mozRequestFullScreen();
  if (ve.webkitRequestFullScreen) return ve.webkitRequestFullScreen();
  if (ve.msRequestFullscreen) return ve.msRequestFullscreen();
  if (ve.webkitEnterFullscreen) return ve.webkitEnterFullscreen();
}

function exitFullscreen() {
  const d = document as VendorDocument;
  if (document.exitFullscreen) return document.exitFullscreen();
  if (d.mozCancelFullScreen) return d.mozCancelFullScreen();
  if (d.webkitCancelFullScreen) return d.webkitCancelFullScreen();
  if (d.msExitFullscreen) return d.msExitFullscreen();
}

export class FullscreenControl extends BaseControl {
  id = 'fullscreen';
  placement: Control['placement'] = { v: 'bottom', h: 'right' };
  private isFullscreen = false;
  private screenW = 0;
  private screenH = 0;

  protected build(): HTMLElement {
    const core = this.core;
    const labels = resolveUIConfig(core).labels;
    const btn = document.createElement('button');

    const { announce, destroy } = getSharedAnnouncer(this.resolvePlayerRoot());
    this.dispose.add(destroy);

    btn.tabIndex = 0;
    btn.type = 'button';
    btn.className = 'op-controls__fullscreen';
    btn.title = labels.fullscreen;
    setA11yLabel(btn, labels.fullscreen);
    btn.setAttribute('aria-pressed', 'false');

    const setFullscreenData = (on: boolean) => {
      if (on) btn.classList.add('op-controls__fullscreen--out');
      else btn.classList.remove('op-controls__fullscreen--out');
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.title = on ? labels.exitFullscreen : labels.fullscreen;
    };

    const resize = (width?: number, height?: number) => {
      const container = this.resolveFullscreenContainer();
      const video = this.resolveFullscreenVideoEl();
      // For iframe engines the video element is hidden; also resize its parent (.op-media)
      // so the iframe (position:absolute inside it) fills the fullscreen viewport.
      const mediaContainer = (video as HTMLElement | null)?.parentElement ?? null;

      if (width) {
        container.style.width = '100%';
        if (video) video.style.width = '100%';
        if (mediaContainer && mediaContainer !== container) mediaContainer.style.width = '100%';
      } else {
        container.style.removeProperty('width');
        if (video) video.style.removeProperty('width');
        if (mediaContainer && mediaContainer !== container) mediaContainer.style.removeProperty('width');
      }

      if (height) {
        container.style.height = '100%';
        if (video) video.style.height = '100%';
        if (mediaContainer && mediaContainer !== container) mediaContainer.style.height = '100%';
      } else {
        container.style.removeProperty('height');
        if (video) video.style.removeProperty('height');
        if (mediaContainer && mediaContainer !== container) mediaContainer.style.removeProperty('height');
      }
    };

    const sync = () => {
      const fsEl = getFullscreenElement();
      const container = this.resolveFullscreenContainer();
      const now = !!fsEl && (fsEl === container || fsEl.contains?.(container));

      setFullscreenData(now);
      if (now) document.body.classList.add('op-fullscreen__on');
      else document.body.classList.remove('op-fullscreen__on');

      resize(now ? this.screenW : undefined, now ? this.screenH : undefined);
      this.isFullscreen = now;
    };

    ['fullscreenchange', 'mozfullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange'].forEach((evt) => {
      this.listen(document, evt, sync, EVENT_OPTIONS);
    });

    this.listen(
      document,
      'keydown',
      (e: Event) => {
        const ke = e as KeyboardEvent;
        if (ke.key === 'Escape' && this.isFullscreen) exitFullscreen();
      },
      EVENT_OPTIONS
    );

    this.listen(
      btn,
      'click',
      async (e: Event) => {
        const me = e as MouseEvent;
        this.screenW = window.screen.width;
        this.screenH = window.screen.height;

        if (getFullscreenElement()) {
          exitFullscreen();
          return;
        }

        const container = this.resolveFullscreenContainer();
        requestFullscreen(container);

        try {
          await (window.screen.orientation as LockableOrientation)?.lock('landscape');
        } catch {
          // ignore
        }

        me.preventDefault();
        me.stopPropagation();
      },
      EVENT_OPTIONS
    );

    this.onPlayer('player:fullscreenchange', () => {
      const key = getFullscreenElement() ? 'enterFullscreen' : 'exitFullscreen';
      announce(labels[key] ?? key);
    });

    sync();
    return btn;
  }

  protected onOverlayChanged(): void {
    if (getFullscreenElement()) {
      const el = getFullscreenElement();
      if (el) {
        document.dispatchEvent(new Event('fullscreenchange'));
      }
    }
  }
}

export default function createFullscreenControl(placement?: Control['placement']): Control {
  const ctrl = new FullscreenControl();
  if (placement) ctrl.placement = placement;
  return ctrl;
}
