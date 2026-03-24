let srId = 0;

export type Announcer = (message: string) => void;

export type LabelTarget = HTMLElement;

type SetLabelOptions = {
  container?: HTMLElement;
};

function nextId() {
  srId += 1;
  return `op-player-sr-${srId}`;
}

function ensureSrSpan(host: HTMLElement, text: string): HTMLSpanElement {
  const existing = host.querySelector(':scope > span.op-player__sr-only') as HTMLSpanElement | null;
  const span = existing ?? document.createElement('span');
  if (!existing) {
    span.className = 'op-player__sr-only';
    host.appendChild(span);
  }
  span.textContent = text;
  return span;
}

function ensureLabelledBy(el: HTMLElement, labelText: string, opts?: SetLabelOptions): void {
  const parent = el.parentElement ?? opts?.container;
  if (!parent) {
    el.setAttribute('aria-label', labelText);
    return;
  }

  const labelledBy = el.getAttribute('aria-labelledby');
  let span: HTMLSpanElement | null = null;

  if (labelledBy) {
    const found = document.getElementById(labelledBy);
    if (found && found instanceof HTMLSpanElement) span = found;
  }

  if (!span) {
    span = document.createElement('span');
    span.className = 'op-player__sr-only';
    span.id = nextId();
    if (el.parentElement === parent && parent.contains(el)) {
      parent.insertBefore(span, el);
    } else {
      parent.appendChild(span);
    }
    el.setAttribute('aria-labelledby', span.id);
  }

  span.textContent = labelText;
  el.removeAttribute('aria-label');
}

export function setA11yLabel(el: LabelTarget, labelText: string, opts?: SetLabelOptions): void {
  const tag = el.tagName.toLowerCase();
  const isButtonLike = tag === 'button' || el.getAttribute('role') === 'button';

  if (isButtonLike) {
    ensureSrSpan(el, labelText);
    el.removeAttribute('aria-label');
    return;
  }

  ensureLabelledBy(el, labelText, opts);
}

type SharedEntry = { announce: Announcer; refs: number; _destroy: () => void };
const _sharedAnnouncers = new WeakMap<HTMLElement, SharedEntry>();

/**
 * Returns the shared announcer for `wrapper`, creating it on first call.
 * Multiple controls attached to the same wrapper share the same 2 live-region
 * nodes. Each caller receives its own `destroy` handle; the DOM nodes are only
 * removed once every caller has destroyed its handle (ref-counting).
 */
export function getSharedAnnouncer(wrapper: HTMLElement): { announce: Announcer; destroy: () => void } {
  let entry = _sharedAnnouncers.get(wrapper);
  if (!entry) {
    const { announce, destroy } = createAnnouncer(wrapper);
    entry = { announce, refs: 0, _destroy: destroy };
    _sharedAnnouncers.set(wrapper, entry);
  }
  entry.refs += 1;
  const captured = entry;
  const destroy = () => {
    captured.refs -= 1;
    if (captured.refs <= 0) {
      captured._destroy();
      _sharedAnnouncers.delete(wrapper);
    }
  };
  return { announce: entry.announce, destroy };
}

export function createAnnouncer(wrapper: HTMLElement): { announce: Announcer; destroy: () => void } {
  const regions: HTMLDivElement[] = [];
  let turn = 0;

  for (let i = 0; i < 2; i++) {
    const el = document.createElement('div');
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-atomic', 'true');
    el.className = 'op-player__sr-only op-player__announcer';
    el.setAttribute('aria-hidden', 'true');
    wrapper.appendChild(el);
    regions.push(el);
  }

  const announce: Announcer = (message: string) => {
    // Rotate between the two regions — forces a DOM mutation even for the
    // same string, which re-triggers announcement in most screen readers.
    const current = regions[turn % 2];
    const other = regions[(turn + 1) % 2];
    turn++;

    other.textContent = '';
    other.setAttribute('aria-hidden', 'true');

    current.setAttribute('aria-hidden', 'false');
    current.textContent = message;
  };

  const destroy = () => {
    regions.forEach((r) => r.remove());
  };

  return { announce, destroy };
}
