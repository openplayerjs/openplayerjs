import { EVENT_OPTIONS } from '@openplayerjs/core';
import { NON_LINEAR_DEFAULT_DURATION_S, SEEK_NEAR_END_DELTA_S, SKIP_NEAR_END_THRESHOLD_S } from './constants';
import type { AdsPluginConfig } from './types';
import { computeSkipAtSeconds, extractSkipOffsetFromCreative } from './vast-parser';

// ─── Standalone export (no class state needed) ────────────────────────────────

export function setSafeHTMLFn(el: HTMLElement, html: string) {
  const tpl = document.createElement('template');
  tpl.innerHTML = String(html || '');

  const blockedTags = new Set([
    'SCRIPT',
    'IFRAME',
    'OBJECT',
    'EMBED',
    'LINK',
    'STYLE',
    'SVG',
    'MATH',
    'FORM',
    'INPUT',
    'TEXTAREA',
    'SELECT',
    'OPTION',
    'META',
    'BASE',
  ]);
  const walker = document.createTreeWalker(tpl.content, NodeFilter.SHOW_ELEMENT);
  const toRemove: Element[] = [];

  while (walker.nextNode()) {
    const node = walker.currentNode as Element;
    if (blockedTags.has(node.tagName)) {
      toRemove.push(node);
      continue;
    }
    Array.from(node.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = (attr.value || '').trim();
      if (name.startsWith('on')) {
        node.removeAttribute(attr.name);
      }
      if (name === 'href' || name === 'src' || name === 'xlink:href') {
        const v = value.toLowerCase();
        const isJs = v.startsWith('javascript:');
        const isVbscript = v.startsWith('vbscript:');
        const isData = v.startsWith('data:');
        const isHttp = v.startsWith('http://') || v.startsWith('https://') || v.startsWith('/') || v.startsWith('./');
        const isSafeDataImage = isData && /^data:image\/(png|gif|jpe?g|webp|svg\+xml);/i.test(value);
        if (isJs || isVbscript || (!isHttp && !isSafeDataImage)) node.removeAttribute(attr.name);
      }
      if (name === 'srcdoc') node.removeAttribute(attr.name);
    });
  }
  toRemove.forEach((n) => n.remove());
  el.replaceChildren(tpl.content.cloneNode(true));
}

type SkipCallback = () => void;

export class AdDomManager {
  private skipWrap?: HTMLDivElement;
  private skipBtn?: HTMLButtonElement;
  skipOffsetRaw?: string;
  skipAtSeconds?: number;

  companionWrap?: HTMLDivElement;
  nonLinearWrap?: HTMLDivElement;

  private resolvedNonLinearContainer?: HTMLElement;
  private resolvedCompanionContainer?: HTMLElement;

  private sessionUnsubs: (() => void)[] = [];

  constructor(
    private overlay: HTMLDivElement,
    private cfg: Pick<
      AdsPluginConfig,
      | 'nonLinearContainer'
      | 'nonLinearSelector'
      | 'companionContainer'
      | 'companionSelector'
      | 'mountEl'
      | 'mountSelector'
      | 'labels'
    >,
    private getAdVideo: () => HTMLVideoElement | undefined,
    private getTracker: () => any,
    private onSkipCallback: SkipCallback
  ) {}

  // ─── Session lifecycle ──────────────────────────────────────────────────────

  addSessionUnsub(fn: () => void) {
    this.sessionUnsubs.push(fn);
  }

  clearSession() {
    for (const off of this.sessionUnsubs) off();
    this.sessionUnsubs = [];
    this.clearAdOverlays();
  }

  // ─── Container resolution ────────────────────────────────────────────────────

  resolveContainer(el?: HTMLElement, selector?: string): HTMLElement | undefined {
    if (el && el.nodeType === 1) return el;
    if (selector) {
      const found = document.querySelector(selector);
      if (found instanceof HTMLElement) return found;
    }
    return undefined;
  }

  getNonLinearContainer(): HTMLElement | undefined {
    if (this.resolvedNonLinearContainer) return this.resolvedNonLinearContainer;
    this.resolvedNonLinearContainer = this.resolveContainer(this.cfg.nonLinearContainer, this.cfg.nonLinearSelector);
    return this.resolvedNonLinearContainer;
  }

  getCompanionContainer(): HTMLElement | undefined {
    if (this.resolvedCompanionContainer) return this.resolvedCompanionContainer;
    this.resolvedCompanionContainer = this.resolveContainer(this.cfg.companionContainer, this.cfg.companionSelector);
    return this.resolvedCompanionContainer;
  }

  resolveMount(media: HTMLMediaElement): HTMLElement {
    if (this.cfg.mountEl) return this.cfg.mountEl as HTMLElement;
    if (this.cfg.mountSelector) {
      const el = document.querySelector(this.cfg.mountSelector) as HTMLElement | null;
      if (el) return el;
    }
    return media.closest('.op-player') || media.parentElement || document.body;
  }

  ensureOverlayMounted(media: HTMLMediaElement) {
    const mount = this.resolveMount(media);
    if (mount instanceof HTMLElement) {
      const cs = window.getComputedStyle(mount);
      if (!cs.position || cs.position === 'static') mount.style.position = 'relative';
    }
    this.overlay.style.position = 'absolute';
    this.overlay.style.inset = '0';
    this.overlay.style.width = '100%';
    this.overlay.style.height = '100%';
    this.overlay.style.zIndex = this.overlay.style.zIndex || '3';
    this.overlay.style.pointerEvents = 'auto';
    if (this.overlay.parentElement !== mount) mount.appendChild(this.overlay);
  }

  // ─── Safety ──────────────────────────────────────────────────────────────────

  setSafeHTML(el: HTMLElement, html: string) {
    setSafeHTMLFn(el, html);
  }

  safeWindowOpen(rawUrl: string) {
    try {
      const url = new URL(rawUrl, window.location.href);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
      window.open(url.toString(), '_blank', 'noopener,noreferrer');
    } catch {
      /* ignore */
    }
  }

  // ─── Skip UI ─────────────────────────────────────────────────────────────────

  private ensureSkipDom() {
    if (this.skipWrap && this.skipBtn) return;
    const wrap = document.createElement('div');
    wrap.className = 'op-ads__skip';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'op-ads__skip-btn';
    btn.textContent = this.cfg.labels?.skip || 'Skip Ad';
    wrap.appendChild(btn);
    this.overlay.appendChild(wrap);

    const onClick = (e: PointerEvent) => {
      this.onSkipCallback();
      e.preventDefault();
      e.stopPropagation();
    };
    btn.addEventListener('click', onClick, EVENT_OPTIONS);
    this.skipWrap = wrap;
    this.skipBtn = btn;
    this.sessionUnsubs.push(() => btn.removeEventListener('click', onClick));
    this.sessionUnsubs.push(() => wrap.remove());
  }

  hideSkipUi() {
    if (this.skipWrap) this.skipWrap.style.display = 'none';
    this.skipOffsetRaw = undefined;
    this.skipAtSeconds = undefined;
  }

  setupSkipUIForPodItem(item: { skipOffset?: string; creative: any; sequence?: number }, log: (...a: any[]) => void) {
    this.hideSkipUi();
    const v = this.getAdVideo();
    if (!v) return;

    const skipOffset = item.skipOffset ?? extractSkipOffsetFromCreative(item.creative);
    if (!skipOffset) {
      log('creative not skippable (no skipOffset/skipDelay)', { sequence: item.sequence });
      return;
    }
    log('creative skippable', skipOffset);
    this.skipOffsetRaw = skipOffset;
    this.ensureSkipDom();

    const update = () => {
      const dur = v.duration;
      const skipAt = computeSkipAtSeconds(skipOffset, dur);
      if (skipAt == null) return;
      this.skipAtSeconds = skipAt;
      const cur = v.currentTime || 0;
      const remaining = Math.max(0, skipAt - cur);
      if (this.skipWrap) this.skipWrap.style.display = 'block';
      if (this.skipBtn) {
        this.skipBtn.textContent =
          remaining <= SKIP_NEAR_END_THRESHOLD_S ? this.cfg.labels?.skip || 'Skip Ad' : Math.ceil(remaining).toString();
        this.skipBtn.style.pointerEvents = remaining <= SKIP_NEAR_END_THRESHOLD_S ? 'auto' : 'none';
      }
    };

    v.addEventListener('timeupdate', update);
    v.addEventListener('loadedmetadata', update);
    update();
    this.sessionUnsubs.push(() => v.removeEventListener('timeupdate', update));
    this.sessionUnsubs.push(() => v.removeEventListener('loadedmetadata', update));
  }

  requestSkip(
    reason: 'button' | 'close' | 'api',
    adVideo: HTMLVideoElement | undefined,
    currentBreakMeta: { kind: string; breakId: string } | undefined,
    emitSkip: (meta: any) => void,
    log: (...a: any[]) => void
  ) {
    if (this.skipOffsetRaw && this.skipAtSeconds != null && adVideo) {
      const cur = adVideo.currentTime || 0;
      if (cur + 0.01 < this.skipAtSeconds) {
        log('skip requested too early', { cur, skipAt: this.skipAtSeconds, reason });
        return;
      }
    }

    try {
      this.getTracker()?.trackSkip?.();
    } catch {
      /* ignore */
    }

    const brk = currentBreakMeta ? { kind: currentBreakMeta.kind, id: currentBreakMeta.breakId } : null;
    emitSkip({ break: brk, reason });

    const v = adVideo;
    if (v) {
      try {
        if (Number.isFinite(v.duration) && v.duration > 0)
          v.currentTime = Math.max(0, v.duration - SEEK_NEAR_END_DELTA_S);
        v.dispatchEvent(new Event('ended'));
      } catch {
        /* ignore */
      }
    }
  }

  // ─── Overlay cleanup ──────────────────────────────────────────────────────────

  clearAdOverlays() {
    this.hideSkipUi();
    this.skipWrap?.remove();
    this.skipWrap = undefined;
    this.skipBtn = undefined;
    this.companionWrap?.remove();
    this.nonLinearWrap?.remove();
    this.companionWrap = undefined;
    this.nonLinearWrap = undefined;
  }

  // ─── Companions ───────────────────────────────────────────────────────────────

  mountCompanions(creative: any) {
    const container = this.getCompanionContainer();
    if (!container) return;

    const companions =
      (creative?.type === 'companion' ? creative?.variations : undefined) ||
      creative?.companionAds?.companions ||
      creative?.companions;
    if (!Array.isArray(companions) || companions.length === 0) return;

    const wrap = document.createElement('div');
    wrap.className = 'op-ads__companions';
    wrap.style.zIndex = '2';
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.gap = '8px';
    wrap.style.maxWidth = '40%';
    wrap.style.pointerEvents = 'auto';

    for (const c of companions) {
      const el = this.renderCompanion(c);
      if (el) wrap.appendChild(el);
    }

    if (!wrap.childElementCount) return;
    container.appendChild(wrap);
    this.companionWrap = wrap;
    this.sessionUnsubs.push(() => wrap.remove());
  }

  renderCompanion(companion: any): HTMLElement | null {
    const click =
      companion?.companionClickThroughURLTemplate ||
      companion?.clickThroughURLTemplate ||
      companion?.companionClickThrough ||
      companion?.clickThrough;

    const wrap = document.createElement('div');
    wrap.className = 'op-ads__companion';
    wrap.style.position = 'relative';
    wrap.style.cursor = click ? 'pointer' : 'default';

    const staticRes =
      companion?.staticResource ||
      companion?.StaticResource ||
      companion?.staticResources?.[0] ||
      companion?.StaticResources?.[0];
    const iframeRes =
      companion?.iFrameResource ||
      companion?.IFrameResource ||
      companion?.iFrameResources?.[0] ||
      companion?.IFrameResources?.[0];
    const htmlRes =
      companion?.htmlResource ||
      companion?.HTMLResource ||
      companion?.htmlResources?.[0] ||
      companion?.HTMLResources?.[0];

    let node: HTMLElement | null = null;
    if (staticRes) {
      const img = document.createElement('img');
      img.src = String(staticRes?.url || staticRes?.uri || staticRes?.value || staticRes);
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      node = img;
    } else if (iframeRes) {
      const ifr = document.createElement('iframe');
      ifr.src = String(iframeRes?.url || iframeRes?.uri || iframeRes?.value || iframeRes);
      ifr.style.border = '0';
      ifr.style.width = '100%';
      ifr.style.height = '100%';
      node = ifr;
    } else if (htmlRes) {
      const div = document.createElement('div');
      this.setSafeHTML(div, String(htmlRes?.value || htmlRes));
      node = div;
    }

    if (!node) return null;
    wrap.appendChild(node);

    if (click) {
      const onClick = (e: PointerEvent) => {
        const url = typeof click === 'string' ? click : click.url;
        this.safeWindowOpen(url);
        try {
          this.getTracker()?.trackClick?.();
          this.getTracker()?.trackClickThrough?.();
        } catch {
          /* ignore */
        }
        e.preventDefault();
        e.stopPropagation();
      };
      wrap.addEventListener('click', onClick);
      this.sessionUnsubs.push(() => wrap.removeEventListener('click', onClick));
    }
    return wrap;
  }

  // ─── Non-linear ───────────────────────────────────────────────────────────────

  nonLinearSuggestedDurationSeconds(nl: any): number {
    const raw =
      nl?.minSuggestedDuration ?? nl?.minSuggestedDurationSeconds ?? nl?.attributes?.minSuggestedDuration ?? undefined;
    if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) return raw;
    if (typeof raw === 'string') {
      const timecodeMatch = /^(\d+):(\d+):(\d+(?:\.\d+)?)$/.exec(raw.trim());
      if (timecodeMatch) {
        const durationSecs = Number(timecodeMatch[1]) * 3600 + Number(timecodeMatch[2]) * 60 + Number(timecodeMatch[3]);
        if (Number.isFinite(durationSecs) && durationSecs > 0) return durationSecs;
      }
      const n = Number(raw);
      if (Number.isFinite(n) && n > 0) return n;
    }
    return NON_LINEAR_DEFAULT_DURATION_S;
  }

  ensureNonLinearDom() {
    if (this.nonLinearWrap) return;
    const wrap = document.createElement('div');
    wrap.className = 'op-ads__nonlinear';
    wrap.style.position = 'absolute';
    wrap.style.left = '12px';
    wrap.style.right = '12px';
    wrap.style.bottom = '12px';
    wrap.style.zIndex = '2';
    wrap.style.display = 'flex';
    wrap.style.justifyContent = 'center';
    wrap.style.pointerEvents = 'auto';

    const parent = this.getNonLinearContainer() || this.getAdVideo()?.parentElement || this.overlay;
    parent.appendChild(wrap);
    this.nonLinearWrap = wrap;
    this.sessionUnsubs.push(() => wrap.remove());
  }

  renderNonLinear(nl: any): HTMLElement | null {
    const click =
      nl?.nonlinearClickThroughURLTemplate ||
      nl?.nonLinearClickThroughURLTemplate ||
      nl?.clickThroughURLTemplate ||
      nl?.nonLinearClickThrough ||
      nl?.clickThrough;

    const container = document.createElement('div');
    container.className = 'op-ads__nonlinear-item';
    container.style.position = 'relative';
    container.style.maxWidth = '100%';
    container.style.cursor = click ? 'pointer' : 'default';

    const pickFirst = (v: any) => (Array.isArray(v) ? v[0] : v);
    const staticRes = pickFirst(nl?.staticResource ?? nl?.StaticResource ?? nl?.staticResources ?? nl?.StaticResources);
    const iframeRes = pickFirst(nl?.iFrameResource ?? nl?.IFrameResource ?? nl?.iFrameResources ?? nl?.IFrameResources);
    const htmlRes = pickFirst(nl?.htmlResource ?? nl?.HTMLResource ?? nl?.htmlResources ?? nl?.HTMLResources);

    let node: HTMLElement | null = null;
    if (staticRes) {
      const img = document.createElement('img');
      img.src = String(staticRes?.url || staticRes?.uri || staticRes?.value || staticRes);
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      node = img;
    } else if (iframeRes) {
      const ifr = document.createElement('iframe');
      ifr.src = String(iframeRes?.url || iframeRes?.uri || iframeRes?.value || iframeRes);
      ifr.style.border = '0';
      ifr.style.width = '100%';
      ifr.style.height = '100%';
      node = ifr;
    } else if (htmlRes) {
      const div = document.createElement('div');
      this.setSafeHTML(div, String(htmlRes?.value || htmlRes));
      node = div;
    }

    if (!node) return null;
    container.appendChild(node);

    if (click) {
      const onClick = (e: PointerEvent) => {
        if ((e.target as HTMLElement)?.tagName === 'BUTTON') return;
        const url = typeof click === 'string' ? click : click.url;
        this.safeWindowOpen(url);
        try {
          this.getTracker()?.trackClick?.();
          this.getTracker()?.trackClickThrough?.();
        } catch {
          /* ignore */
        }
        e.preventDefault();
        e.stopPropagation();
      };
      container.addEventListener('click', onClick);
      this.sessionUnsubs.push(() => container.removeEventListener('click', onClick));
    }
    return container;
  }

  mountNonLinear(creative: any) {
    const raw =
      (creative?.type === 'nonlinear' ? creative?.variations : undefined) ??
      creative?.nonLinearAds?.nonLinears ??
      creative?.nonLinearAds?.nonLinear ??
      creative?.NonLinearAds?.NonLinear ??
      creative?.nonLinears ??
      creative?.NonLinears ??
      undefined;
    const nonLinears = Array.isArray(raw) ? raw : raw ? [raw] : [];
    if (nonLinears.length === 0) return;
    this.ensureNonLinearDom();
    for (const nl of nonLinears) {
      const el = this.renderNonLinear(nl);
      if (el) this.nonLinearWrap!.appendChild(el);
    }
  }

  // ─── SIMID layer ──────────────────────────────────────────────────────────────

  mountSimidIframe(url: string): HTMLIFrameElement {
    let wrap = this.overlay.querySelector('.op-ads__simid') as HTMLDivElement | null;
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'op-ads__simid';
      wrap.style.position = 'absolute';
      wrap.style.inset = '0';
      wrap.style.pointerEvents = 'auto';
      this.overlay.appendChild(wrap);
    } else {
      wrap.innerHTML = '';
    }

    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.setAttribute('title', 'SIMID');
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('referrerpolicy', 'no-referrer');
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = '0';
    wrap.appendChild(iframe);
    return iframe;
  }
}
