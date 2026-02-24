import { EventBus } from '../src/core/events';

describe('core/events', () => {
  test('on/emit/unsubscribe and listenerCount', () => {
    const bus = new EventBus();
    const a = jest.fn();
    const b = jest.fn();

    const offA = bus.on('custom:event', a);
    bus.on('custom:event', b);

    expect(bus.listenerCount('custom:event')).toBe(2);
    bus.emit('custom:event', { x: 1 });
    expect(a).toHaveBeenCalledWith({ x: 1 });
    expect(b).toHaveBeenCalledWith({ x: 1 });

    offA();
    expect(bus.listenerCount('custom:event')).toBe(1);
  });

  test('clear removes all listeners', () => {
    const bus = new EventBus();
    const cb = jest.fn();
    bus.on('e1', cb);
    bus.on('e2', cb);
    bus.clear();
    bus.emit('e1');
    bus.emit('e2');
    expect(cb).not.toHaveBeenCalled();
  });
});
