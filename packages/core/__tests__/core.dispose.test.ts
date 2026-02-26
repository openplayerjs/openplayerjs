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
});
