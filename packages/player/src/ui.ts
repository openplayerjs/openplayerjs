import type { Core } from '@openplayerjs/core';
import { EVENT_OPTIONS, getOverlayManager, isAudio, isMobile } from '@openplayerjs/core';
import { resolveUIConfig } from './configuration';
import { createControlGrid, type Control } from './control';
import { bindCenterOverlay } from './events';
import { createCenterOverlayDom } from './overlay';

let srId = 0;

function labelElement(host: HTMLElement, text: string): void {
  const existing = host.querySelector(':scope > span.op-player__sr-only') as HTMLSpanElement | null;
  const span = existing ?? document.createElement('span');
  if (!existing) {
    srId += 1;
    span.className = 'op-player__sr-only';
    span.id = `op-player-sr-el-${srId}`;
    host.insertBefore(span, host.firstChild);
    host.setAttribute('aria-labelledby', span.id);
    host.removeAttribute('aria-label');
  }
  span.textContent = text;
}

function maybeAutoplayUnmute(core: Core, wrapper: HTMLDivElement) {
  const media = core.media;
  const wantsAutoplay = !!(media.autoplay || media.preload === 'auto');
  if (!wantsAutoplay && !core.canAutoplay && !core.canAutoplayMuted) return;
  if (core.canAutoplay && !core.canAutoplayMuted) return;

  queueMicrotask(async () => {
    try {
      const restoreVolume = core.volume > 0 ? core.volume : 1;

      core.muted = true;
      core.volume = 0;
      await core.play();

      const labels = resolveUIConfig(core).labels;
      const action = isMobile() ? labels.tap : labels.click;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'op-player__unmute';
      btn.textContent = action;
      btn.tabIndex = 0;

      const cleanup = () => {
        try {
          offMuted?.();
        } catch {
          // ignore
        }
        try {
          btn.remove();
        } catch {
          // ignore
        }
      };

      const offMuted = core.events.on('volumechange', () => {
        if (!core.muted) cleanup();
      });

      btn.addEventListener(
        'click',
        () => {
          // Treat explicit unmute as a user interaction so ad plugins can lift forced mute.
          if (!core.userInteracted) {
            core.userInteracted = true;
            core.emit('player:interacted');
          }
          core.muted = false;
          core.volume = restoreVolume;
          core.play().catch(() => undefined);
          cleanup();
        },
        EVENT_OPTIONS
      );

      wrapper.insertBefore(btn, wrapper.firstChild);
      core.events.on('player:destroy', cleanup);
    } catch {
      // ignore autoplay failures
    }
  });
}

export type PlayerUIContext = {
  wrapper: HTMLDivElement;
  mediaContainer: HTMLDivElement;
  controlsRoot: HTMLDivElement;
  placeholder: Comment;
  grid?: ReturnType<typeof createControlGrid>;
};

export function createUI(core: Core, media: HTMLMediaElement, controls: Control[]) {
  const ui = resolveUIConfig(core);
  media.tabIndex = -1;
  const tmpMedia = media;
  const isMediaAudio = isAudio(tmpMedia);

  const placeholder = document.createComment('op-player-placeholder');
  const parent = tmpMedia.parentNode;
  if (parent) parent.insertBefore(placeholder, tmpMedia);

  const wrapper = document.createElement('div');
  wrapper.className = `op-player op-player__keyboard--inactive ${isMediaAudio ? 'op-player__audio' : 'op-player__video'}`;
  wrapper.setAttribute('role', 'region');
  wrapper.tabIndex = 0;

  let style = '';
  if (ui.width) {
    const width = typeof ui.width === 'number' ? `${ui.width}px` : ui.width;
    style += `width: ${width} !important;`;
  }
  if (ui.height) {
    const height = typeof ui.height === 'number' ? `${ui.height}px` : ui.height;
    style += `height: ${height} !important;`;
  }

  if (style) {
    wrapper.setAttribute('style', style);
  }

  media.controls = false;

  media.replaceWith(wrapper);

  labelElement(wrapper, ui.labels.container);

  const mediaContainer = document.createElement('div');
  mediaContainer.className = 'op-media';
  mediaContainer.tabIndex = 0;
  mediaContainer.setAttribute('role', 'group');
  mediaContainer.appendChild(tmpMedia);

  labelElement(mediaContainer, ui.labels.media);

  const mainControls = document.createElement('div');
  mainControls.className = 'op-media__main';

  let overlay: ReturnType<typeof createCenterOverlayDom> | undefined;
  if (!isMediaAudio) {
    mediaContainer.appendChild(mainControls);

    overlay = createCenterOverlayDom(core);
    mediaContainer.appendChild(overlay.button);
    mediaContainer.appendChild(overlay.loader);
  }
  bindCenterOverlay(core, wrapper, overlay);
  const controlsRoot = document.createElement('div');
  controlsRoot.className = 'op-controls';
  controlsRoot.setAttribute('aria-hidden', 'false');

  if (isMediaAudio) {
    const grid = createControlGrid(controlsRoot);

    wrapper.appendChild(mediaContainer);
    wrapper.appendChild(controlsRoot);

    const createdControls: Control[] = [];

    controls.forEach((control) => {
      const el = control.create(core);
      el.dataset.controlId = control.id;
      grid.place(control.placement, el);
      createdControls.push(control);
    });

    const ctx: PlayerUIContext = { wrapper, mediaContainer, controlsRoot, placeholder, grid };

    const offDestroy = core.events.on('player:destroy', () => {
      try {
        createdControls.forEach((c) => c.destroy?.());
      } catch {
        // ignore
      }
      try {
        wrapper.replaceWith(media);
      } catch {
        // ignore
      }
      try {
        placeholder.remove();
      } catch {
        // ignore
      }
      try {
        offAddElement();
        offAddControl();
        offDestroy();
      } catch {
        // ignore
      }
    });

    const offAddElement = core.events.on('ui:addElement', (payload?: any) => {
      if (!payload?.el) return;
      const placement = payload.placement || { v: 'bottom', h: 'right' };
      ctx.grid?.place(placement, payload.el);
    });

    const offAddControl = core.events.on('ui:addControl', (payload?: any) => {
      const control = payload?.control as Control | undefined;
      if (!control) return;
      const el = control.create(core);
      el.dataset.controlId = control.id;
      ctx.grid?.place(control.placement, el);
      payload.el = el;

      createdControls.push(control);
    });

    maybeAutoplayUnmute(core, wrapper);
    return ctx;
  }

  const mobile = isMobile();
  const POINTER_SHOW_MS = 3000;
  const KEYBOARD_SHOW_MS = 6500;
  let hideTimer: number | undefined;
  let lastInteraction: 'pointer' | 'keyboard' = 'pointer';

  const controlsHaveFocus = (): boolean => controlsRoot.contains(document.activeElement);

  const showControls = (): void => {
    wrapper.classList.remove('op-controls--hidden');
    mediaContainer.classList.remove('op-media--controls-hidden');
    if (hideTimer) window.clearTimeout(hideTimer);
    controlsRoot.setAttribute('aria-hidden', 'false');
  };

  const hideControls = (): void => {
    if (controlsHaveFocus()) {
      if (lastInteraction === 'keyboard') {
        wrapper.focus();
      } else {
        return;
      }
    }
    wrapper.classList.add('op-controls--hidden');
    mediaContainer.classList.add('op-media--controls-hidden');
    controlsRoot.setAttribute('aria-hidden', 'true');
  };

  const scheduleHide = (ms?: number): void => {
    if (core.media.paused || core.media.ended) return;
    if (hideTimer) window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => hideControls(), ms ?? POINTER_SHOW_MS);
  };

  const onControlsHover = (): void => {
    lastInteraction = 'pointer';
    showControls();
    scheduleHide(POINTER_SHOW_MS);
  };

  controlsRoot.addEventListener('focusin', () => {
    lastInteraction = 'keyboard';
    showControls();
    scheduleHide(KEYBOARD_SHOW_MS);
  });
  controlsRoot.addEventListener('focusout', () => {
    window.setTimeout(() => {
      if (!controlsHaveFocus()) scheduleHide(lastInteraction === 'keyboard' ? KEYBOARD_SHOW_MS : POINTER_SHOW_MS);
    }, 0);
  });

  const isFocusInMediaArea = (): boolean => {
    const active = document.activeElement;
    if (!active) return false;
    return wrapper.contains(active) && !controlsRoot.contains(active);
  };

  wrapper.addEventListener(
    'focusin',
    () => {
      if (isFocusInMediaArea()) {
        showControls();
        if (hideTimer) window.clearTimeout(hideTimer);
      }
    },
    EVENT_OPTIONS
  );

  wrapper.addEventListener(
    'focusout',
    () => {
      window.setTimeout(() => {
        if (!wrapper.contains(document.activeElement) && !controlsHaveFocus()) scheduleHide();
      }, 0);
    },
    EVENT_OPTIONS
  );

  wrapper.addEventListener(
    'keydown',
    () => {
      lastInteraction = 'keyboard';
      if (isFocusInMediaArea()) {
        showControls();
        if (hideTimer) window.clearTimeout(hideTimer);
      } else if (controlsHaveFocus()) {
        showControls();
        scheduleHide(KEYBOARD_SHOW_MS);
      }
    },
    EVENT_OPTIONS
  );

  if (mobile) {
    wrapper.addEventListener(
      'pointerdown',
      () => {
        lastInteraction = 'pointer';
        showControls();
        scheduleHide(POINTER_SHOW_MS);
      },
      EVENT_OPTIONS
    );
  } else {
    wrapper.addEventListener('pointermove', onControlsHover, EVENT_OPTIONS);
    wrapper.addEventListener('pointerenter', onControlsHover, EVENT_OPTIONS);
    controlsRoot.addEventListener('pointerenter', onControlsHover, EVENT_OPTIONS);
    controlsRoot.addEventListener('pointermove', onControlsHover, EVENT_OPTIONS);
    controlsRoot.addEventListener('pointerleave', () => scheduleHide(POINTER_SHOW_MS), EVENT_OPTIONS);
  }

  const grid = createControlGrid(controlsRoot, mainControls);

  wrapper.appendChild(mediaContainer);
  wrapper.appendChild(controlsRoot);

  const createdControls: Control[] = [];

  controls.forEach((control) => {
    const el = control.create(core);
    el.dataset.controlId = control.id;
    grid.place(control.placement, el);
    createdControls.push(control);
  });

  const ctx: PlayerUIContext = { wrapper, mediaContainer, controlsRoot, placeholder, grid };

  maybeAutoplayUnmute(core, wrapper);

  wrapper.addEventListener(
    'click',
    async (e) => {
      // Linear overlays (e.g. full-screen ads with their own video) own click handling.
      // Non-linear ads (no fullscreenVideoEl) run alongside the content, so we allow pause.
      if (getOverlayManager(core).active?.fullscreenVideoEl) return;

      const target = e.target as Element | null;
      // Clicks inside the controls bar must not toggle playback.
      if (target && controlsRoot.contains(target)) return;
      // Clicks on interactive elements (buttons, links) are handled by those elements.
      if (target && target !== wrapper && target.closest('button, [role="button"], a')) return;

      const isPlaying = !core.media.paused && !core.media.ended;
      if (isPlaying) {
        overlay?.flashPause(350);
        core.pause();
      } else {
        await core.play().catch(() => undefined);
      }
    },
    EVENT_OPTIONS
  );

  const offPlaying = core.events.on('playing', () => scheduleHide(POINTER_SHOW_MS));
  const offPause = core.events.on('pause', () => showControls());
  const offEnded = core.events.on('ended', () => showControls());

  const offDestroy = core.events.on('player:destroy', () => {
    try {
      createdControls.forEach((c) => c.destroy?.());
    } catch {
      // ignore
    }
    try {
      wrapper.replaceWith(media);
    } catch {
      // ignore
    }
    try {
      placeholder.remove();
    } catch {
      // ignore
    }
    try {
      offPlaying?.();
      offPause?.();
      offEnded?.();
      offAddElement();
      offAddControl();
      offDestroy();
    } catch {
      // ignore
    }
  });

  const offAddElement = core.events.on('ui:addElement', (payload?: any) => {
    if (!payload?.el) return;
    const placement = payload.placement || { v: 'bottom', h: 'right' };
    ctx.grid?.place(placement, payload.el);
  });

  const offAddControl = core.events.on('ui:addControl', (payload?: any) => {
    const control = payload?.control as Control | undefined;
    if (!control) return;
    const el = control.create(core);
    el.dataset.controlId = control.id;
    ctx.grid?.place(control.placement, el);
    payload.el = el;

    createdControls.push(control);
  });

  return ctx;
}
