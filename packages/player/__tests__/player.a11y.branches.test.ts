/** @jest-environment jsdom */

import { setA11yLabel } from '../src/a11y';

describe('a11y branch coverage', () => {
  test('ensureLabelledBy reuses existing aria-labelledby span on repeated calls', () => {
    const parent = document.createElement('div');
    const el = document.createElement('div'); // non-button → ensureLabelledBy path
    parent.appendChild(el);
    document.body.appendChild(parent);

    setA11yLabel(el, 'First label');
    const spanId = el.getAttribute('aria-labelledby')!;
    const span = document.getElementById(spanId);
    expect(span?.textContent).toBe('First label');

    // Second call: finds span by id and reuses it (lines 36-37)
    setA11yLabel(el, 'Second label');
    expect(el.getAttribute('aria-labelledby')).toBe(spanId);
    expect(document.getElementById(spanId)?.textContent).toBe('Second label');
  });

  test('ensureLabelledBy inserts span before el when el is already in parent (line 44-45)', () => {
    const parent = document.createElement('div');
    const el = document.createElement('div');
    parent.appendChild(el);

    setA11yLabel(el, 'Label');

    // Span should be the sibling before el
    const children = Array.from(parent.children);
    const spanIdx = children.findIndex((c) => c.classList.contains('op-player__sr-only'));
    const elIdx = children.indexOf(el);
    expect(spanIdx).toBeGreaterThanOrEqual(0);
    expect(spanIdx).toBeLessThan(elIdx);
  });

  test('ensureLabelledBy falls back to aria-label when no parent and no container', () => {
    const el = document.createElement('div'); // not in DOM, no parentElement, no opts.container
    setA11yLabel(el, 'Fallback');
    expect(el.getAttribute('aria-label')).toBe('Fallback');
  });
});
