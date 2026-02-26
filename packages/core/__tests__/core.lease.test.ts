import { Lease } from '../src/core/lease';

describe('core/lease', () => {
  test('acquire/release ownership and notifications', () => {
    const lease = new Lease();
    const seen: [string, string | undefined][] = [];

    const unsub = lease.onChange((cap, owner) => {
      seen.push([cap, owner]);
    });

    expect(lease.acquire('playback', 'ads')).toBe(true);
    expect(lease.owner('playback')).toBe('ads');
    expect(seen).toEqual([['playback', 'ads']]);

    // Can't acquire an already-owned capability.
    expect(lease.acquire('playback', 'ui')).toBe(false);
    expect(lease.owner('playback')).toBe('ads');

    // Only the owner can release.
    lease.release('playback', 'ui');
    expect(lease.owner('playback')).toBe('ads');

    lease.release('playback', 'ads');
    expect(lease.owner('playback')).toBeUndefined();
    expect(seen).toEqual([
      ['playback', 'ads'],
      ['playback', undefined],
    ]);

    unsub();
  });

  test('listener failures are isolated', () => {
    const lease = new Lease();
    const ok = jest.fn();
    lease.onChange(() => {
      throw new Error('boom');
    });
    lease.onChange(ok);
    lease.acquire('playback', 'ads');
    expect(ok).toHaveBeenCalledWith('playback', 'ads');
  });
});
