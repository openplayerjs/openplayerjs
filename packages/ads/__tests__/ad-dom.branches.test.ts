/** @jest-environment jsdom */

import { AdDomManager, setSafeHTMLFn } from '../src/ad-dom';
import type { AdsPluginConfig } from '../src/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

type AdDomCfg = Pick<
  AdsPluginConfig,
  'nonLinearContainer' | 'nonLinearSelector' | 'companionContainer' | 'companionSelector' | 'mountEl' | 'mountSelector'
>;

function makeDom(
  opts: {
    cfg?: Partial<AdDomCfg>;
    adVideo?: HTMLVideoElement;
    tracker?: Record<string, jest.Mock>;
    onSkip?: jest.Mock;
  } = {}
): {
  overlay: HTMLDivElement;
  dom: AdDomManager;
  adVideo: HTMLVideoElement;
  tracker: Record<string, jest.Mock>;
  onSkip: jest.Mock;
} {
  const overlay = document.createElement('div');
  document.body.appendChild(overlay);

  // Nest adVideo inside overlay so getNonLinearContainer fallback resolves to overlay
  const adVideo = opts.adVideo ?? document.createElement('video');
  overlay.appendChild(adVideo);

  const tracker: Record<string, jest.Mock> = {
    trackSkip: jest.fn(),
    trackClick: jest.fn(),
    trackClickThrough: jest.fn(),
    ...opts.tracker,
  };
  const onSkip = opts.onSkip ?? jest.fn();

  const cfg: AdDomCfg = {
    nonLinearContainer: undefined,
    nonLinearSelector: undefined,
    companionContainer: undefined,
    companionSelector: undefined,
    mountEl: undefined,
    mountSelector: undefined,
    ...opts.cfg,
  };

  const dom = new AdDomManager(overlay, cfg, () => adVideo, () => tracker, onSkip);
  return { overlay, dom, adVideo, tracker, onSkip };
}

// ─── setSafeHTMLFn (standalone export) ───────────────────────────────────────

describe('setSafeHTMLFn', () => {
  it('removes blocked tags: SCRIPT, IFRAME, OBJECT, EMBED, STYLE, SVG, FORM, META', () => {
    const el = document.createElement('div');
    setSafeHTMLFn(
      el,
      [
        '<script>alert(1)</script>',
        '<iframe src="x"></iframe>',
        '<object data="y"></object>',
        '<embed src="z"/>',
        '<style>body{color:red}</style>',
        '<form><input type="text"/></form>',
        '<meta charset="utf-8"/>',
        '<p>safe</p>',
      ].join('')
    );

    expect(el.querySelector('script')).toBeNull();
    expect(el.querySelector('iframe')).toBeNull();
    expect(el.querySelector('object')).toBeNull();
    expect(el.querySelector('embed')).toBeNull();
    expect(el.querySelector('style')).toBeNull();
    expect(el.querySelector('form')).toBeNull();
    expect(el.querySelector('meta')).toBeNull();
    expect(el.querySelector('p')).not.toBeNull();
  });

  it('strips on* event handler attributes', () => {
    const el = document.createElement('div');
    setSafeHTMLFn(el, '<div onclick="alert(1)" onmouseover="x()">text</div>');
    const div = el.querySelector('div')!;
    expect(div.getAttribute('onclick')).toBeNull();
    expect(div.getAttribute('onmouseover')).toBeNull();
  });

  it('strips javascript: and vbscript: hrefs', () => {
    const el = document.createElement('div');
    setSafeHTMLFn(
      el,
      [
        '<a href="javascript:alert(1)">js</a>',
        '<a href="vbscript:MsgBox(1)">vbs</a>',
        '<a href="https://safe.com">ok</a>',
      ].join('')
    );
    const [js, vbs, safe] = Array.from(el.querySelectorAll('a'));
    expect(js.getAttribute('href')).toBeNull();
    expect(vbs.getAttribute('href')).toBeNull();
    expect(safe.getAttribute('href')).toBe('https://safe.com');
  });

  it('strips unsafe data: URIs but allows data:image/*', () => {
    const el = document.createElement('div');
    setSafeHTMLFn(
      el,
      [
        '<img src="data:text/html;base64,Zm9v"/>',
        '<img src="data:image/png;base64,abc"/>',
        '<img src="data:image/jpeg;base64,def"/>',
        '<img src="data:image/gif;base64,ghi"/>',
        '<img src="data:image/webp;base64,jkl"/>',
        '<img src="data:image/svg+xml;base64,mno"/>',
      ].join('')
    );
    const imgs = Array.from(el.querySelectorAll('img'));
    // data:text/html should have src stripped
    expect(imgs[0].getAttribute('src')).toBeNull();
    // All data:image/* should be kept
    expect(imgs[1].getAttribute('src')).toBe('data:image/png;base64,abc');
    expect(imgs[2].getAttribute('src')).toBe('data:image/jpeg;base64,def');
    expect(imgs[3].getAttribute('src')).toBe('data:image/gif;base64,ghi');
    expect(imgs[4].getAttribute('src')).toBe('data:image/webp;base64,jkl');
    expect(imgs[5].getAttribute('src')).toBe('data:image/svg+xml;base64,mno');
  });

  it('strips srcdoc attribute', () => {
    const el = document.createElement('div');
    setSafeHTMLFn(el, '<iframe srcdoc="<p>test</p>"></iframe>');
    // iframe is blocked entirely, but even if we check a div:
    const el2 = document.createElement('div');
    setSafeHTMLFn(el2, '<div srcdoc="<p>test</p>">content</div>');
    expect(el2.querySelector('div')!.getAttribute('srcdoc')).toBeNull();
  });

  it('allows relative and absolute path src/href', () => {
    const el = document.createElement('div');
    setSafeHTMLFn(
      el,
      [
        '<img src="/images/a.png"/>',
        '<img src="./b.png"/>',
        '<img src="http://example.com/c.png"/>',
        '<img src="https://example.com/d.png"/>',
      ].join('')
    );
    const imgs = Array.from(el.querySelectorAll('img'));
    expect(imgs[0].getAttribute('src')).toBe('/images/a.png');
    expect(imgs[1].getAttribute('src')).toBe('./b.png');
    expect(imgs[2].getAttribute('src')).toBe('http://example.com/c.png');
    expect(imgs[3].getAttribute('src')).toBe('https://example.com/d.png');
  });
});

// ─── AdDomManager.setSafeHTML (instance method mirrors setSafeHTMLFn) ─────────

describe('AdDomManager.setSafeHTML', () => {
  it('removes blocked tags via instance method', () => {
    const { dom } = makeDom();
    const el = document.createElement('div');
    dom.setSafeHTML(el, '<script>alert(1)</script><p>ok</p>');
    expect(el.querySelector('script')).toBeNull();
    expect(el.querySelector('p')).not.toBeNull();
  });

  it('strips on* handlers and unsafe hrefs', () => {
    const { dom } = makeDom();
    const el = document.createElement('div');
    dom.setSafeHTML(el, '<a onclick="x()" href="javascript:void(0)">x</a>');
    const a = el.querySelector('a')!;
    expect(a.getAttribute('onclick')).toBeNull();
    expect(a.getAttribute('href')).toBeNull();
  });
});

// ─── AdDomManager.addSessionUnsub ─────────────────────────────────────────────

describe('AdDomManager.addSessionUnsub', () => {
  it('registers cleanup callbacks that run on clearSession()', () => {
    const { dom } = makeDom();
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    dom.addSessionUnsub(fn1);
    dom.addSessionUnsub(fn2);
    dom.clearSession();
    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).toHaveBeenCalledTimes(1);
  });

  it('clears the unsub list after clearSession()', () => {
    const { dom } = makeDom();
    const fn = jest.fn();
    dom.addSessionUnsub(fn);
    dom.clearSession();
    dom.clearSession(); // second call should not re-run fn
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

// ─── AdDomManager.resolveContainer ────────────────────────────────────────────

describe('AdDomManager.resolveContainer', () => {
  it('returns the element directly when el has nodeType === 1', () => {
    const { dom } = makeDom();
    const el = document.createElement('div');
    expect(dom.resolveContainer(el)).toBe(el);
  });

  it('queries by selector when el is not provided', () => {
    const container = document.createElement('div');
    container.id = 'my-companion';
    document.body.appendChild(container);

    const { dom } = makeDom();
    const result = dom.resolveContainer(undefined, '#my-companion');
    expect(result).toBe(container);

    container.remove();
  });

  it('returns undefined when selector matches nothing', () => {
    const { dom } = makeDom();
    expect(dom.resolveContainer(undefined, '#nonexistent-zzz')).toBeUndefined();
  });

  it('returns undefined when neither el nor selector provided', () => {
    const { dom } = makeDom();
    expect(dom.resolveContainer()).toBeUndefined();
  });
});

// ─── AdDomManager.resolveMount ────────────────────────────────────────────────

describe('AdDomManager.resolveMount', () => {
  it('returns mountEl directly when configured', () => {
    const mountEl = document.createElement('div');
    document.body.appendChild(mountEl);
    const { dom, adVideo } = makeDom({ cfg: { mountEl } });
    expect(dom.resolveMount(adVideo as HTMLMediaElement)).toBe(mountEl);
  });

  it('queries mountSelector when configured', () => {
    const mount = document.createElement('div');
    mount.id = 'mount-target';
    document.body.appendChild(mount);
    const { dom, adVideo } = makeDom({ cfg: { mountSelector: '#mount-target' } });
    expect(dom.resolveMount(adVideo as HTMLMediaElement)).toBe(mount);
    mount.remove();
  });

  it('falls back to parentElement when no mount config', () => {
    const wrapper = document.createElement('div');
    const media = document.createElement('video');
    wrapper.appendChild(media);
    document.body.appendChild(wrapper);
    const { dom } = makeDom();
    expect(dom.resolveMount(media as HTMLMediaElement)).toBe(wrapper);
  });
});

// ─── AdDomManager.requestSkip ─────────────────────────────────────────────────

describe('AdDomManager.requestSkip', () => {
  it('emits skip event and seeks ad video to end', () => {
    const { dom, adVideo } = makeDom();
    const emitSkip = jest.fn();
    const log = jest.fn();

    // Make adVideo have a known duration
    Object.defineProperty(adVideo, 'duration', { value: 30, configurable: true });
    Object.defineProperty(adVideo, 'currentTime', {
      get: () => 15,
      set: jest.fn(),
      configurable: true,
    });

    dom.requestSkip('button', adVideo, { kind: 'preroll', breakId: 'b1' }, emitSkip, log);
    expect(emitSkip).toHaveBeenCalledWith({ break: { kind: 'preroll', id: 'b1' }, reason: 'button' });
  });

  it('blocks early skip when current time is before skipAtSeconds', () => {
    const { dom, adVideo } = makeDom();
    const emitSkip = jest.fn();
    const log = jest.fn();

    // Set up skip offset state
    dom.skipOffsetRaw = '00:00:20';
    dom.skipAtSeconds = 20;

    Object.defineProperty(adVideo, 'currentTime', { value: 5, configurable: true });

    dom.requestSkip('button', adVideo, undefined, emitSkip, log);
    expect(emitSkip).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith(expect.stringContaining('too early'), expect.anything());
  });

  it('allows skip when currentTime >= skipAtSeconds', () => {
    const { dom, adVideo } = makeDom();
    const emitSkip = jest.fn();
    const log = jest.fn();

    dom.skipOffsetRaw = '00:00:05';
    dom.skipAtSeconds = 5;

    Object.defineProperty(adVideo, 'currentTime', { value: 10, configurable: true });
    Object.defineProperty(adVideo, 'duration', { value: 30, configurable: true });

    dom.requestSkip('api', adVideo, undefined, emitSkip, log);
    expect(emitSkip).toHaveBeenCalled();
  });

  it('handles undefined adVideo gracefully', () => {
    const { dom } = makeDom();
    const emitSkip = jest.fn();
    dom.requestSkip('api', undefined, undefined, emitSkip, jest.fn());
    expect(emitSkip).toHaveBeenCalled();
  });

  it('handles tracker.trackSkip() throwing without crashing', () => {
    const tracker = { trackSkip: jest.fn(() => { throw new Error('track error'); }) };
    const { dom, adVideo } = makeDom({ tracker });
    const emitSkip = jest.fn();
    expect(() =>
      dom.requestSkip('button', adVideo, undefined, emitSkip, jest.fn())
    ).not.toThrow();
    expect(emitSkip).toHaveBeenCalled();
  });
});

// ─── AdDomManager.renderCompanion ─────────────────────────────────────────────

describe('AdDomManager.renderCompanion', () => {
  it('returns null when companion has no resource', () => {
    const { dom } = makeDom();
    expect(dom.renderCompanion({})).toBeNull();
    expect(dom.renderCompanion(null)).toBeNull();
  });

  it('renders an <img> for staticResource', () => {
    const { dom } = makeDom();
    const companion = { staticResource: { value: 'https://example.com/banner.jpg' } };
    const el = dom.renderCompanion(companion)!;
    expect(el).not.toBeNull();
    expect(el.querySelector('img')?.src).toContain('banner.jpg');
  });

  it('renders an <img> for staticResource as plain string', () => {
    const { dom } = makeDom();
    const companion = { staticResource: 'https://example.com/banner2.jpg' };
    const el = dom.renderCompanion(companion)!;
    expect(el.querySelector('img')?.src).toContain('banner2.jpg');
  });

  it('renders an <iframe> for iFrameResource', () => {
    const { dom } = makeDom();
    const companion = { iFrameResource: { value: 'https://example.com/comp.html' } };
    const el = dom.renderCompanion(companion)!;
    expect(el).not.toBeNull();
    const iframe = el.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe!.src).toContain('comp.html');
  });

  it('renders an <iframe> for IFrameResource (capitalized)', () => {
    const { dom } = makeDom();
    const companion = { IFrameResource: 'https://example.com/COMP.html' };
    const el = dom.renderCompanion(companion)!;
    expect(el.querySelector('iframe')).not.toBeNull();
  });

  it('renders sanitized HTML for htmlResource', () => {
    const { dom } = makeDom();
    const companion = { htmlResource: { value: '<p>Ad content</p><script>bad</script>' } };
    const el = dom.renderCompanion(companion)!;
    expect(el).not.toBeNull();
    expect(el.querySelector('p')).not.toBeNull();
    expect(el.querySelector('script')).toBeNull();
  });

  it('attaches click handler when click URL is present (string)', () => {
    const { dom, tracker } = makeDom();
    const openSpy = jest.spyOn(window, 'open').mockReturnValue(null);

    const companion = {
      staticResource: { value: 'https://example.com/banner.jpg' },
      companionClickThrough: 'https://example.com/click',
    };
    const el = dom.renderCompanion(companion)!;
    expect(el.style.cursor).toBe('pointer');

    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(openSpy).toHaveBeenCalledWith('https://example.com/click', '_blank', 'noopener,noreferrer');
    expect(tracker.trackClick).toHaveBeenCalled();
    expect(tracker.trackClickThrough).toHaveBeenCalled();

    openSpy.mockRestore();
  });

  it('attaches click handler when click URL is an object with .url', () => {
    const { dom } = makeDom();
    const openSpy = jest.spyOn(window, 'open').mockReturnValue(null);

    const companion = {
      staticResource: { value: 'https://example.com/banner.jpg' },
      companionClickThrough: { url: 'https://example.com/obj-click' },
    };
    const el = dom.renderCompanion(companion)!;
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(openSpy).toHaveBeenCalledWith('https://example.com/obj-click', '_blank', 'noopener,noreferrer');

    openSpy.mockRestore();
  });
});

// ─── AdDomManager.nonLinearSuggestedDurationSeconds ───────────────────────────

describe('AdDomManager.nonLinearSuggestedDurationSeconds', () => {
  it('returns 10 as default for null/empty input', () => {
    const { dom } = makeDom();
    expect(dom.nonLinearSuggestedDurationSeconds(null)).toBe(10);
    expect(dom.nonLinearSuggestedDurationSeconds({})).toBe(10);
  });

  it('returns numeric value directly', () => {
    const { dom } = makeDom();
    expect(dom.nonLinearSuggestedDurationSeconds({ minSuggestedDuration: 30 })).toBe(30);
  });

  it('parses HH:MM:SS timecode string', () => {
    const { dom } = makeDom();
    expect(dom.nonLinearSuggestedDurationSeconds({ minSuggestedDuration: '00:00:15' })).toBe(15);
    expect(dom.nonLinearSuggestedDurationSeconds({ minSuggestedDuration: '00:01:00' })).toBe(60);
  });

  it('parses plain numeric string', () => {
    const { dom } = makeDom();
    expect(dom.nonLinearSuggestedDurationSeconds({ minSuggestedDuration: '20' })).toBe(20);
  });

  it('returns 10 for invalid or zero values', () => {
    const { dom } = makeDom();
    expect(dom.nonLinearSuggestedDurationSeconds({ minSuggestedDuration: 0 })).toBe(10);
    expect(dom.nonLinearSuggestedDurationSeconds({ minSuggestedDuration: 'not-a-number' })).toBe(10);
    expect(dom.nonLinearSuggestedDurationSeconds({ minSuggestedDuration: '0' })).toBe(10);
  });

  it('uses attributes.minSuggestedDuration as fallback', () => {
    const { dom } = makeDom();
    expect(dom.nonLinearSuggestedDurationSeconds({ attributes: { minSuggestedDuration: '25' } })).toBe(25);
  });
});

// ─── AdDomManager.renderNonLinear ─────────────────────────────────────────────

describe('AdDomManager.renderNonLinear', () => {
  it('returns null when non-linear has no resource', () => {
    const { dom } = makeDom();
    expect(dom.renderNonLinear({})).toBeNull();
    expect(dom.renderNonLinear(null)).toBeNull();
  });

  it('renders an <img> for staticResource', () => {
    const { dom } = makeDom();
    const nl = { staticResource: { value: 'https://example.com/nl.jpg' } };
    const el = dom.renderNonLinear(nl)!;
    expect(el.querySelector('img')?.src).toContain('nl.jpg');
  });

  it('renders an <iframe> for iFrameResource', () => {
    const { dom } = makeDom();
    const nl = { iFrameResource: { value: 'https://example.com/nl.html' } };
    const el = dom.renderNonLinear(nl)!;
    expect(el.querySelector('iframe')).not.toBeNull();
    expect(el.querySelector('iframe')!.src).toContain('nl.html');
  });

  it('renders an <iframe> for IFrameResource (capitalized)', () => {
    const { dom } = makeDom();
    const nl = { IFrameResource: 'https://example.com/NL.html' };
    const el = dom.renderNonLinear(nl)!;
    expect(el.querySelector('iframe')).not.toBeNull();
  });

  it('renders sanitized HTML for htmlResource', () => {
    const { dom } = makeDom();
    const nl = { htmlResource: { value: '<span>Ad</span><script>bad</script>' } };
    const el = dom.renderNonLinear(nl)!;
    expect(el.querySelector('span')).not.toBeNull();
    expect(el.querySelector('script')).toBeNull();
  });

  it('attaches click handler and opens URL on click', () => {
    const { dom, tracker } = makeDom();
    const openSpy = jest.spyOn(window, 'open').mockReturnValue(null);

    const nl = {
      staticResource: { value: 'https://example.com/nl.jpg' },
      nonLinearClickThrough: 'https://example.com/nl-click',
    };
    const el = dom.renderNonLinear(nl)!;
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(openSpy).toHaveBeenCalledWith('https://example.com/nl-click', '_blank', 'noopener,noreferrer');
    expect(tracker.trackClick).toHaveBeenCalled();

    openSpy.mockRestore();
  });

  it('click handler skips when target is a BUTTON element', () => {
    const { dom } = makeDom();
    const openSpy = jest.spyOn(window, 'open').mockReturnValue(null);

    const nl = {
      staticResource: { value: 'https://example.com/nl.jpg' },
      nonLinearClickThrough: 'https://example.com/nl-click',
    };
    const el = dom.renderNonLinear(nl)!;
    document.body.appendChild(el);

    // Simulate click from a BUTTON child
    const btn = document.createElement('button');
    el.appendChild(btn);
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(openSpy).not.toHaveBeenCalled();

    openSpy.mockRestore();
  });

  it('supports staticResources array (picks first)', () => {
    const { dom } = makeDom();
    const nl = { staticResources: [{ value: 'https://example.com/first.jpg' }, { value: 'https://example.com/second.jpg' }] };
    const el = dom.renderNonLinear(nl)!;
    expect(el.querySelector('img')?.src).toContain('first.jpg');
  });
});

// ─── AdDomManager.mountSimidIframe ────────────────────────────────────────────

describe('AdDomManager.mountSimidIframe', () => {
  it('creates a sandboxed iframe inside a .op-ads__simid wrapper', () => {
    const { dom, overlay } = makeDom();
    const iframe = dom.mountSimidIframe('https://example.com/simid.html');

    expect(iframe).toBeInstanceOf(HTMLIFrameElement);
    expect(iframe.src).toContain('simid.html');
    expect(iframe.getAttribute('sandbox')).toContain('allow-scripts');
    expect(iframe.getAttribute('referrerpolicy')).toBe('no-referrer');

    const wrap = overlay.querySelector('.op-ads__simid');
    expect(wrap).not.toBeNull();
    expect(wrap!.contains(iframe)).toBe(true);
  });

  it('replaces existing iframe when called again', () => {
    const { dom, overlay } = makeDom();
    dom.mountSimidIframe('https://example.com/simid-v1.html');
    const iframe2 = dom.mountSimidIframe('https://example.com/simid-v2.html');

    const wraps = overlay.querySelectorAll('.op-ads__simid');
    // Only one wrapper should exist
    expect(wraps).toHaveLength(1);
    // The iframe inside should be the new one
    expect(iframe2.src).toContain('simid-v2.html');
    expect(wraps[0].querySelector('iframe')).toBe(iframe2);
  });
});

// ─── AdDomManager.mountCompanions ─────────────────────────────────────────────

describe('AdDomManager.mountCompanions', () => {
  it('does nothing when no companion container is configured', () => {
    const { dom } = makeDom();
    // Should not throw, and no DOM changes to the overlay
    dom.mountCompanions({ companions: [{ staticResource: { value: 'x.jpg' } }] });
  });

  it('renders companions into the companion container', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const { dom } = makeDom({ cfg: { companionContainer: container } });
    dom.mountCompanions({
      companions: [
        { staticResource: { value: 'https://example.com/c1.jpg' } },
        { staticResource: { value: 'https://example.com/c2.jpg' } },
      ],
    });

    const wrap = container.querySelector('.op-ads__companions');
    expect(wrap).not.toBeNull();
    expect(wrap!.querySelectorAll('img')).toHaveLength(2);

    container.remove();
  });

  it('does nothing when companions array is empty', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const { dom } = makeDom({ cfg: { companionContainer: container } });
    dom.mountCompanions({ companions: [] });
    expect(container.querySelector('.op-ads__companions')).toBeNull();
    container.remove();
  });

  it('does nothing when rendered companions are all null', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const { dom } = makeDom({ cfg: { companionContainer: container } });
    // A companion with no resource renders null
    dom.mountCompanions({ companions: [{}] });
    expect(container.querySelector('.op-ads__companions')).toBeNull();
    container.remove();
  });
});

// ─── AdDomManager.mountNonLinear ──────────────────────────────────────────────

describe('AdDomManager.mountNonLinear', () => {
  it('does nothing for creative with no non-linears', () => {
    const { dom, overlay } = makeDom();
    dom.mountNonLinear({});
    expect(overlay.querySelector('.op-ads__nonlinear')).toBeNull();
  });

  it('mounts non-linears from nonLinearAds.nonLinears', () => {
    const { dom, overlay } = makeDom();
    dom.mountNonLinear({
      nonLinearAds: {
        nonLinears: [
          { staticResource: { value: 'https://example.com/nl.jpg' } },
        ],
      },
    });
    const wrap = overlay.querySelector('.op-ads__nonlinear');
    expect(wrap).not.toBeNull();
    expect(wrap!.querySelector('img')).not.toBeNull();
  });

  it('wraps a single non-linear object in an array', () => {
    const { dom, overlay } = makeDom();
    dom.mountNonLinear({
      nonLinearAds: {
        nonLinear: { staticResource: { value: 'https://example.com/single.jpg' } },
      },
    });
    expect(overlay.querySelector('.op-ads__nonlinear img')).not.toBeNull();
  });

  it('handles nonlinear type creative with variations array', () => {
    const { dom, overlay } = makeDom();
    dom.mountNonLinear({
      type: 'nonlinear',
      variations: [
        { staticResource: { value: 'https://example.com/var.jpg' } },
      ],
    });
    expect(overlay.querySelector('.op-ads__nonlinear img')).not.toBeNull();
  });
});

// ─── AdDomManager.safeWindowOpen ─────────────────────────────────────────────

describe('AdDomManager.safeWindowOpen', () => {
  it('opens http/https URLs', () => {
    const { dom } = makeDom();
    const openSpy = jest.spyOn(window, 'open').mockReturnValue(null);

    dom.safeWindowOpen('https://example.com');
    expect(openSpy).toHaveBeenCalledWith('https://example.com/', '_blank', 'noopener,noreferrer');

    dom.safeWindowOpen('http://example.com');
    expect(openSpy).toHaveBeenCalledTimes(2);

    openSpy.mockRestore();
  });

  it('ignores javascript: URLs', () => {
    const { dom } = makeDom();
    const openSpy = jest.spyOn(window, 'open').mockReturnValue(null);

    dom.safeWindowOpen('javascript:alert(1)');
    expect(openSpy).not.toHaveBeenCalled();

    openSpy.mockRestore();
  });

  it('swallows errors from invalid URLs', () => {
    const { dom } = makeDom();
    expect(() => dom.safeWindowOpen('not-a-url://')).not.toThrow();
  });
});
