/** @jest-environment jsdom */

import { AdsPlugin } from '../src/ads';
import { extendAds, installAds } from '../src/install';

describe('installAds', () => {
  it('is a no-op for null/undefined', () => {
    expect(() => installAds(null)).not.toThrow();
    expect(() => installAds(undefined)).not.toThrow();
  });

  it('is a no-op for objects without .prototype', () => {
    expect(() => installAds({})).not.toThrow();
  });

  it('adds .ads getter and .playAds() to a constructor prototype', () => {
    // eslint-disable-next-line @typescript-eslint/no-extraneous-class
    class MockPlayer {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getPlugin(name: string): any { return name === 'ads' ? this.adsPlugin : undefined; }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      adsPlugin?: any;
    }

    installAds(MockPlayer);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(typeof (MockPlayer.prototype as any).playAds).toBe('function');
    const desc = Object.getOwnPropertyDescriptor(MockPlayer.prototype, 'ads');
    expect(desc).toBeDefined();
    expect(typeof desc!.get).toBe('function');
  });

  it('does not overwrite .ads if already defined', () => {
    class MockPlayer {
      get ads() { return 'original'; }
    }

    installAds(MockPlayer);
    const instance = new MockPlayer();
    expect(instance.ads).toBe('original');
  });

  it('does not overwrite .playAds if already defined', () => {
    const originalFn = jest.fn();
    class MockPlayer {
      playAds = originalFn;
    }

    installAds(MockPlayer);
    const instance = new MockPlayer();
    expect(instance.playAds).toBe(originalFn);
  });

  it('playAds() throws when ads plugin is not installed', () => {
    class MockPlayer {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getPlugin(_name: string): any { return undefined; }
    }
    installAds(MockPlayer);
    const instance = new MockPlayer() as unknown as { playAds(s: string): void };
    expect(() => instance.playAds('https://example.com/vast.xml')).toThrow('Ads plugin not installed');
  });

  it('playAds() throws for empty input (with plugin present)', () => {
    const mockPlugin: Partial<AdsPlugin> = { playAds: jest.fn() };
    class MockPlayer {
      getPlugin(_name: string) { return mockPlugin; }
    }
    installAds(MockPlayer);
    const instance = new MockPlayer() as unknown as { playAds(s: string): void };
    // Empty string after trim → throw
    expect(() => instance.playAds('')).toThrow('requires a non-empty');
    expect(() => instance.playAds('   ')).toThrow('requires a non-empty');
  });

  it('playAds() calls plugin.playAds for a URL', () => {
    const mockPlugin: Partial<AdsPlugin> = {
      playAds: jest.fn().mockResolvedValue(undefined),
    };
    class MockPlayer {
      getPlugin(_name: string) { return mockPlugin; }
    }
    installAds(MockPlayer);
    const instance = new MockPlayer() as unknown as { playAds(s: string): void };
    instance.playAds('https://example.com/vast.xml');
    expect(mockPlugin.playAds).toHaveBeenCalledWith('https://example.com/vast.xml');
  });

  it('playAds() calls plugin.playAdsFromXml for inline XML', () => {
    const mockPlugin: Partial<AdsPlugin> = {
      playAdsFromXml: jest.fn().mockResolvedValue(undefined),
    };
    class MockPlayer {
      getPlugin(_name: string) { return mockPlugin; }
    }
    installAds(MockPlayer);
    const instance = new MockPlayer() as unknown as { playAds(s: string): void };
    instance.playAds('<VAST version="3.0"/>');
    expect(mockPlugin.playAdsFromXml).toHaveBeenCalledWith('<VAST version="3.0"/>');
  });

  it('playAds() throws when plugin lacks playAdsFromXml and XML is passed', () => {
    const mockPlugin = { playAds: jest.fn() }; // no playAdsFromXml
    class MockPlayer {
      getPlugin(_name: string) { return mockPlugin; }
    }
    installAds(MockPlayer);
    const instance = new MockPlayer() as unknown as { playAds(s: string): void };
    expect(() => instance.playAds('<VAST/>')).toThrow('playAdsFromXml missing');
  });
});

describe('extendAds', () => {
  it('is a no-op for null player', () => {
    const plugin = new AdsPlugin();
    expect(() => extendAds(null, plugin)).not.toThrow();
  });

  it('calls player.extend() when it exists', () => {
    const extend = jest.fn();
    const player = { extend };
    const plugin = new AdsPlugin();
    extendAds(player, plugin);
    expect(extend).toHaveBeenCalledWith({ ads: plugin });
  });

  it('sets player.ads directly when extend is not a function', () => {
    const player: Record<string, unknown> = {};
    const plugin = new AdsPlugin();
    extendAds(player, plugin);
    expect(player.ads).toBe(plugin);
  });

  it('does not overwrite player.ads if already set', () => {
    const existingAds = {};
    const player = { ads: existingAds };
    const plugin = new AdsPlugin();
    extendAds(player, plugin);
    expect(player.ads).toBe(existingAds);
  });
});
