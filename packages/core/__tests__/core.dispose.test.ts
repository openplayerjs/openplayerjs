/** @jest-environment jsdom */

import { DisposableStore } from '../src/core/dispose';

describe('DisposableStore', () => {
  test('disposes in reverse order and only once', () => {
    const calls: string[] = [];
    const d = new DisposableStore();

    d.add(() => calls.push('a'));
    d.add(() => calls.push('b'));
    d.add(() => calls.push('c'));

    d.dispose();
    d.dispose();

    expect(calls).toEqual(['c', 'b', 'a']);
  });

  test('if already disposed, added disposers execute immediately', () => {
    const calls: string[] = [];
    const d = new DisposableStore();
    d.dispose();

    d.add(() => calls.push('x'));
    expect(calls).toEqual(['x']);
  });

  test('tracks DOM listeners via addEventListener', () => {
    const d = new DisposableStore();
    const el = document.createElement('div');

    const handler = jest.fn();
    d.addEventListener(el, 'click', handler);

    el.dispatchEvent(new MouseEvent('click'));
    expect(handler).toHaveBeenCalledTimes(1);

    d.dispose();
    el.dispatchEvent(new MouseEvent('click'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('isDisposed returns false before disposal and true afterwards', () => {
    const d = new DisposableStore();
    expect(d.isDisposed).toBe(false);
    d.dispose();
    expect(d.isDisposed).toBe(true);
  });

  test('add() with undefined creates a no-op disposer that does not throw', () => {
    const d = new DisposableStore();
    const disposer = d.add(undefined);
    expect(typeof disposer).toBe('function');
    expect(() => d.dispose()).not.toThrow();
  });

  test('add() on already-disposed store invokes the disposer immediately', () => {
    const calls: string[] = [];
    const d = new DisposableStore();
    d.dispose();

    const returned = d.add(() => calls.push('immediate'));
    expect(calls).toEqual(['immediate']);
    expect(() => returned()).not.toThrow();
  });

  test('dispose() swallows errors thrown by individual disposers', () => {
    const d = new DisposableStore();
    const calls: string[] = [];

    d.add(() => { throw new Error('boom'); });
    d.add(() => calls.push('safe'));

    expect(() => d.dispose()).not.toThrow();
    expect(calls).toContain('safe');
  });
});
