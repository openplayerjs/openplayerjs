import type {
  AdVerification,
  CaptionResource,
  NormalizedMediaFile,
  PodAd,
  VastClosedCaption,
  VastInput,
  XmlNonLinearItem,
} from './types';

// ─── Utility ─────────────────────────────────────────────────────────────────

export function isXmlString(src: string): boolean {
  return src.trim().startsWith('<');
}

export function toXmlDocument(xml: string): XMLDocument {
  return new DOMParser().parseFromString(String(xml || ''), 'text/xml');
}

export function buildParsedForNonLinearFromXml(xmlText: string): XMLDocument {
  return toXmlDocument(xmlText);
}

export async function getVastXmlText(input: VastInput): Promise<string> {
  if (input.kind === 'xml') {
    if (typeof input.value === 'string') return input.value;
    try {
      return new XMLSerializer().serializeToString(input.value);
    } catch {
      return String(input.value);
    }
  }
  const res = await fetch(input.value);
  if (!res.ok) throw new Error(`VAST request failed: ${res.status}`);
  return res.text();
}

export function parseTimecodeToSeconds(s: string): number | null {
  const timecodeMatch = /^(\d+):(\d+):(\d+(?:\.\d+)?)$/.exec(String(s).trim());
  if (!timecodeMatch) return null;
  const hh = Number(timecodeMatch[1]);
  const mm = Number(timecodeMatch[2]);
  const ss = Number(timecodeMatch[3]);
  if (![hh, mm, ss].every((x) => Number.isFinite(x))) return null;
  return hh * 3600 + mm * 60 + ss;
}

export function computeSkipAtSeconds(skipOffset: string | undefined, duration: number): number | undefined {
  if (!skipOffset) return undefined;
  const s = skipOffset.trim();
  if (!s) return undefined;

  if (s.endsWith('%')) {
    const p = Number(s.slice(0, -1));
    if (Number.isFinite(p) && p >= 0 && p <= 100 && Number.isFinite(duration) && duration > 0) {
      return (p / 100) * duration;
    }
    return undefined;
  }

  const tc = parseTimecodeToSeconds(s);
  if (tc != null) return tc;

  const n = Number(s);
  if (Number.isFinite(n) && n >= 0) return n;
  return undefined;
}

// ─── Media file selection ─────────────────────────────────────────────────────

export function pickBestMediaFile(mediaFiles: any[], preferredMediaTypes: string[]): NormalizedMediaFile | null {
  if (!Array.isArray(mediaFiles) || mediaFiles.length === 0) return null;

  const normalized = mediaFiles
    .map((m) => ({
      type: String(m?.mimeType || m?.type || ''),
      fileURL: String(m?.fileURL || m?.url || m?.src || ''),
      bitrate: Number(m?.bitrate || m?.bitRate || 0),
      width: Number(m?.width || 0),
      height: Number(m?.height || 0),
      raw: m,
    }))
    .filter((m) => Boolean(m.fileURL));

  if (normalized.length === 0) return null;

  for (const t of preferredMediaTypes) {
    const candidates = normalized.filter((m) => (m.type || '').toLowerCase() === t.toLowerCase());
    if (candidates.length) return candidates.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];
  }

  return normalized.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];
}

export function extractSkipOffsetFromCreative(creative: any): string | undefined {
  const linear = creative?.linear || creative?.Linear || creative;

  const skipDelay = linear?.skipDelay ?? linear?.skipdelay;
  if (typeof skipDelay === 'number' && Number.isFinite(skipDelay) && skipDelay >= 0) return String(skipDelay);

  const candidates: unknown[] = [
    linear?.skipOffset,
    linear?.skipoffset,
    linear?.attributes?.skipOffset,
    linear?.attributes?.skipoffset,
    linear?.attributes?.skipOffset?.value,
    linear?.attributes?.skipoffset?.value,
    linear?.attributes?.skipOffset?.['#text'],
    linear?.attributes?.skipoffset?.['#text'],
  ];

  if (linear && typeof linear === 'object') {
    for (const k of ['skipOffset', 'skipoffset', 'skipDelay', 'skipdelay']) {
      candidates.push((linear as any)[k]);
      candidates.push((linear as any)?.attributes?.[k]);
    }
  }

  const normalize = (raw: unknown): string | undefined => {
    if (typeof raw === 'number' && Number.isFinite(raw) && raw >= 0) return String(raw);
    if (typeof raw === 'string') {
      const s = raw.trim();
      return s ? s : undefined;
    }
    if (raw && typeof raw === 'object') {
      const obj = raw as { value?: unknown; '#text'?: unknown; text?: unknown };
      const v = obj.value ?? obj['#text'] ?? obj.text;
      if (typeof v === 'string') {
        const s = v.trim();
        return s ? s : undefined;
      }
    }
    return undefined;
  };

  for (const c of candidates) {
    const v = normalize(c);
    if (v) return v;
  }
  return undefined;
}

// ─── SIMID detection ──────────────────────────────────────────────────────────

/**
 * Looks for a SIMID MediaFile in a VAST creative or raw XMLDocument.
 * SIMID MediaFiles have `apiFramework="SIMID"` and `type="text/html"`.
 * Returns the URL of the first SIMID creative found, or undefined.
 */
export function extractSimidUrl(creative: any, rawDoc?: XMLDocument | null): string | undefined {
  // Path 1: parsed library object
  // vast-client may expose InteractiveCreativeFile as interactiveCreativeFiles[] or inside mediaFiles[]
  const mediaFiles = [
    ...(creative?.mediaFiles ||
      creative?.MediaFiles ||
      creative?.linear?.mediaFiles ||
      creative?.linear?.MediaFiles ||
      []),
    ...(creative?.interactiveCreativeFiles ||
      creative?.linear?.interactiveCreativeFiles ||
      creative?.linear?.InteractiveCreativeFiles || [creative?.interactiveCreativeFile] || [
        creative?.InteractiveCreativeFile,
      ] ||
      []),
  ];

  for (const mf of mediaFiles) {
    const framework = String(mf?.apiFramework || mf?.APIFramework || '').toLowerCase();
    if (framework === 'simid') {
      const url = String(mf?.fileURL || mf?.url || mf?.src || '').trim();
      if (url) return url;
    }
  }

  // Path 2: raw XML doc fallback
  // Real-world SIMID ads use <InteractiveCreativeFile apiFramework="SIMID"> (VAST 4.x),
  // but some older implementations may use <MediaFile apiFramework="SIMID">.
  if (rawDoc) {
    for (const tagName of ['InteractiveCreativeFile', 'MediaFile']) {
      const els = Array.from(rawDoc.getElementsByTagName(tagName));
      for (const el of els) {
        const framework = (el.getAttribute('apiFramework') || '').toLowerCase();
        if (framework === 'simid') {
          const url = (el.textContent || '').trim();
          if (url) return url;
        }
      }
    }
  }

  return undefined;
}

// ─── Ad Verifications (OMID) ──────────────────────────────────────────────────

/**
 * Extracts AdVerification entries from a parsed VAST response or raw XMLDocument.
 * Returns an array of verification resources usable by OmidSession.
 */
export function extractAdVerifications(parsed: any, rawDoc?: XMLDocument | null): AdVerification[] {
  const out: AdVerification[] = [];

  // Path 1: library-parsed object
  const ads = extractAdsFromParsed(parsed);
  for (const ad of ads) {
    const verifications: any[] = ad?.adVerifications || ad?.AdVerifications || [];
    for (const v of verifications) {
      const vendor = String(v?.vendor || v?.Vendor || '');
      const resources: any[] =
        v?.resource ||
        v?.resources ||
        v?.JavaScriptResource ||
        v?.javaScriptResource ||
        (v?.javascriptResource ? [v.javascriptResource] : []);
      const resArr = Array.isArray(resources) ? resources : [resources];
      for (const r of resArr) {
        const scriptUrl = String(r?.uri || r?.url || r?.browserOptional?.value || r?.value || r || '').trim();
        if (!scriptUrl) continue;
        const params = String(v?.verificationParameters?.value || v?.parameters || v?.params || '');
        out.push({ vendor, scriptUrl, params });
      }
    }
  }

  if (out.length > 0) return out;

  // Path 2: raw XML fallback
  if (rawDoc) {
    const byTag = (root: ParentNode, tag: string): Element[] => {
      try {
        return Array.from((root as any).getElementsByTagNameNS('*', tag) as HTMLCollectionOf<Element>);
      } catch {
        /* ignore */
      }
      try {
        return Array.from((root as any).getElementsByTagName(tag) as HTMLCollectionOf<Element>);
      } catch {
        return [];
      }
    };

    const verEls = byTag(rawDoc, 'Verification');
    for (const el of verEls) {
      const vendor = el.getAttribute('vendor') || '';
      const jsEls = byTag(el, 'JavaScriptResource');
      for (const jsEl of jsEls) {
        const scriptUrl = (jsEl.textContent || '').trim();
        if (!scriptUrl) continue;
        const paramsEl = el.querySelector('VerificationParameters');
        const params = (paramsEl?.textContent || '').trim();
        out.push({ vendor, scriptUrl, params });
      }
    }
  }

  return out;
}

// ─── Pod ad collection ────────────────────────────────────────────────────────

export function extractAdsFromParsed(parsed: any): any[] {
  const direct = parsed?.ads || parsed?.vastResponse?.ads;
  if (Array.isArray(direct) && direct.length) return direct;

  const adPods = parsed?.adPods || parsed?.vastResponse?.adPods || parsed?.vastResponse?.adpods;
  if (Array.isArray(adPods) && adPods.length) {
    const flattened: any[] = [];
    for (const pod of adPods) {
      const ads = pod?.ads || pod?.Ads;
      if (Array.isArray(ads)) flattened.push(...ads);
    }
    if (flattened.length) return flattened;
  }

  const singlePod = parsed?.adPod || parsed?.vastResponse?.adPod || parsed?.vastResponse?.adpod;
  const singleAds = singlePod?.ads || singlePod?.Ads;
  if (Array.isArray(singleAds) && singleAds.length) return singleAds;

  return [];
}

export function collectPodAds(parsed: any, preferredMediaTypes: string[]): PodAd[] {
  const ads = extractAdsFromParsed(parsed);
  const out: PodAd[] = [];

  for (const ad of ads) {
    const creatives = ad?.creatives || ad?.Creatives || [];
    const seqRaw = ad?.sequence || ad?.attributes?.sequence || undefined;
    const seq = seqRaw != null ? Number(seqRaw) : undefined;

    for (let cidx = 0; cidx < creatives.length; cidx++) {
      const creative = creatives[cidx];
      const mediaFiles =
        creative?.mediaFiles ||
        creative?.MediaFiles ||
        creative?.linear?.mediaFiles ||
        creative?.Linear?.mediaFiles ||
        creative?.linear?.MediaFiles ||
        creative?.linear?.mediafiles ||
        [];
      const mf = pickBestMediaFile(mediaFiles, preferredMediaTypes);
      if (!mf) continue;

      const skipOffset = extractSkipOffsetFromCreative(creative);
      const companions = creative?.companionAds?.companions || creative?.companions || undefined;
      const nonLinears = creative?.nonLinearAds?.nonLinears || creative?.nonLinears || undefined;

      out.push({
        ad,
        creative,
        mediaFile: mf,
        sequence: Number.isFinite(seq) ? seq : undefined,
        creativeIndex: cidx,
        skipOffset,
        companions: Array.isArray(companions) ? companions : undefined,
        nonLinears: Array.isArray(nonLinears) ? nonLinears : undefined,
      });
    }
  }

  return out.sort((a, b) => {
    const as = a.sequence ?? Number.MAX_SAFE_INTEGER;
    const bs = b.sequence ?? Number.MAX_SAFE_INTEGER;
    if (as !== bs) return as - bs;
    return (a.creativeIndex ?? 0) - (b.creativeIndex ?? 0);
  });
}

export function collectPodAdsFromXml(doc: XMLDocument, preferredMediaTypes: string[]): PodAd[] {
  if (!doc) return [];
  const ads = Array.from(doc.getElementsByTagName('Ad'));
  const out: PodAd[] = [];

  for (const adEl of ads) {
    const seqAttr = adEl.getAttribute('sequence');
    const seq = seqAttr != null ? Number(seqAttr) : undefined;
    const creatives = Array.from(adEl.getElementsByTagName('Creative'));

    for (let cidx = 0; cidx < creatives.length; cidx++) {
      const cEl = creatives[cidx];
      const linearEl = cEl.getElementsByTagName('Linear')?.[0];
      if (!linearEl) continue;

      const skipOffset = linearEl.getAttribute('skipoffset') || linearEl.getAttribute('skipOffset') || undefined;
      const mediaFilesEl = linearEl.getElementsByTagName('MediaFiles')?.[0];
      if (!mediaFilesEl) continue;

      const mediaEls = Array.from(mediaFilesEl.getElementsByTagName('MediaFile'));
      const mediaFiles = mediaEls.map((m) => ({
        type: m.getAttribute('type') || '',
        mimeType: m.getAttribute('type') || '',
        bitrate: Number(m.getAttribute('bitrate') || 0),
        bitRate: Number(m.getAttribute('bitRate') || 0),
        width: Number(m.getAttribute('width') || 0),
        height: Number(m.getAttribute('height') || 0),
        fileURL: (m.textContent || '').trim(),
        url: (m.textContent || '').trim(),
        rawEl: m,
      }));

      const mf = pickBestMediaFile(mediaFiles, preferredMediaTypes);
      if (!mf) continue;

      out.push({
        ad: { id: adEl.getAttribute('id') || undefined },
        creative: { linear: { MediaFiles: mediaFiles } },
        mediaFile: mf,
        sequence: Number.isFinite(seq) ? seq : undefined,
        creativeIndex: cidx,
        skipOffset: skipOffset || undefined,
      });
    }
  }

  return out.sort((a, b) => {
    const as = a.sequence ?? Number.MAX_SAFE_INTEGER;
    const bs = b.sequence ?? Number.MAX_SAFE_INTEGER;
    if (as !== bs) return as - bs;
    return (a.creativeIndex ?? 0) - (b.creativeIndex ?? 0);
  });
}

// ─── Non-linear collection ────────────────────────────────────────────────────

export function collectNonLinearCreatives(
  parsed: any
): { ad: any; creative: any; nonLinear: any; sequence?: number }[] {
  const ads = extractAdsFromParsed(parsed);
  const out: { ad: any; creative: any; nonLinear: any; sequence?: number }[] = [];

  for (const ad of ads) {
    const creatives = ad?.creatives || ad?.Creatives || [];
    for (const creative of creatives) {
      const raw =
        creative?.variations ??
        creative?.nonLinearAds?.nonLinears ??
        creative?.nonLinearAds?.nonLinear ??
        creative?.NonLinearAds?.NonLinear ??
        creative?.nonLinears ??
        creative?.NonLinears ??
        undefined;

      if (raw === creative?.variations && creative?.type !== 'nonlinear') continue;

      const nonLinears = Array.isArray(raw) ? raw : raw ? [raw] : [];
      if (nonLinears.length === 0) continue;

      const seqRaw = ad?.sequence || ad?.attributes?.sequence || undefined;
      const seq = seqRaw != null ? Number(seqRaw) : undefined;

      for (const nl of nonLinears) {
        out.push({ ad, creative, nonLinear: nl, sequence: Number.isFinite(seq) ? seq : undefined });
      }
    }
  }

  return out.sort((a, b) => {
    if (a.sequence == null && b.sequence == null) return 0;
    if (a.sequence == null) return 1;
    if (b.sequence == null) return -1;
    return a.sequence - b.sequence;
  });
}

export function collectNonLinearFromXml(doc: XMLDocument): XmlNonLinearItem[] {
  const out: XmlNonLinearItem[] = [];
  const pickText = (el: Element | null) => (el?.textContent || '').trim();

  const byLocalName = (root: ParentNode, localName: string): Element[] => {
    try {
      if ((root as any).getElementsByTagNameNS) {
        const els = (root as any).getElementsByTagNameNS('*', localName) as HTMLCollectionOf<Element>;
        const arr = Array.from(els);
        if (arr.length) return arr;
      }
    } catch {
      /* ignore */
    }
    try {
      return Array.from((root as any).getElementsByTagName(localName) as HTMLCollectionOf<Element>);
    } catch {
      return [];
    }
  };

  const firstChildText = (root: Element, localName: string): string => {
    const els = byLocalName(root, localName);
    return pickText(els[0] ?? null);
  };

  const companions: any[] = [];
  try {
    const compEls = byLocalName(doc, 'Companion');
    for (const c of compEls) {
      const w = Number(c.getAttribute('width') || 0);
      const h = Number(c.getAttribute('height') || 0);
      const staticRes = firstChildText(c, 'StaticResource');
      const click = firstChildText(c, 'CompanionClickThrough');
      if (!staticRes) continue;
      companions.push({
        width: w || undefined,
        height: h || undefined,
        staticResource: { value: staticRes },
        clickThrough: click || undefined,
      });
    }
  } catch {
    /* ignore */
  }

  const nlEls = byLocalName(doc, 'NonLinear');
  for (const nl of nlEls) {
    const w = Number(nl.getAttribute('width') || 0);
    const h = Number(nl.getAttribute('height') || 0);
    const minSuggestedDuration = nl.getAttribute('minSuggestedDuration') || undefined;
    const staticRes = firstChildText(nl, 'StaticResource');
    const iframeRes = firstChildText(nl, 'IFrameResource');
    const htmlRes = firstChildText(nl, 'HTMLResource');
    const click = firstChildText(nl, 'NonLinearClickThrough');

    const nonLinear: any = {
      width: w || undefined,
      height: h || undefined,
      minSuggestedDuration,
      staticResource: staticRes ? { value: staticRes } : undefined,
      iFrameResource: iframeRes ? { value: iframeRes } : undefined,
      htmlResource: htmlRes ? { value: htmlRes } : undefined,
      nonLinearClickThrough: click || undefined,
    };
    out.push({ nonLinear, companions: companions.length ? companions : undefined });
  }

  return out;
}

// ─── Caption helpers (pure) ───────────────────────────────────────────────────

export function extractClosedCaptions(mediaFileRaw: any): VastClosedCaption[] {
  if (!mediaFileRaw) return [];

  const cc =
    mediaFileRaw.closedCaptionFiles ??
    mediaFileRaw.ClosedCaptionFiles ??
    mediaFileRaw.closedCaptionFile ??
    mediaFileRaw.ClosedCaptionFile ??
    null;

  const arr: any[] = Array.isArray(cc)
    ? cc
    : Array.isArray(cc?.closedCaptionFiles)
      ? cc.closedCaptionFiles
      : Array.isArray(cc?.ClosedCaptionFile)
        ? cc.ClosedCaptionFile
        : Array.isArray(cc?.closedCaptionFile)
          ? cc.closedCaptionFile
          : [];

  return arr
    .map((x) => ({
      type: x?.type ?? x?.mimeType ?? x?.mime_type,
      language: x?.language ?? x?.lang,
      fileURL: x?.fileURL ?? x?.url ?? x?.src,
    }))
    .filter((x) => typeof x.fileURL === 'string' && x.fileURL.length > 0);
}

export function buildCaptionsFromVastMediaFileRaw(mediaFileRaw: any): CaptionResource[] {
  const ccFiles = extractClosedCaptions(mediaFileRaw);
  return ccFiles
    .map((f, i) => {
      const lang = f.language ? String(f.language) : '';
      const type = f.type ? String(f.type) : '';
      return {
        src: String(f.fileURL),
        kind: 'captions' as const,
        srclang: lang || undefined,
        label: lang ? lang.toUpperCase() : `CC ${i + 1}`,
        type: type || undefined,
      };
    })
    .filter((x) => !!x.src);
}
