/** @jest-environment jsdom */

// UMD add-on bundles (ads/hls) treat '@openplayer/core' as an external and
// expect it to be available on the global OpenPlayer constructor.

import * as Core from '@openplayer/core';
import OpenPlayer from '../src/umd';

describe('UMD interop: OpenPlayer exposes @openplayer/core statics', () => {
  test('exposes getOverlayManager and EVENT_OPTIONS for add-on UMD bundles', () => {
    const ctor: any = OpenPlayer;
    expect(typeof ctor).toBe('function');
    expect(typeof ctor.getOverlayManager).toBe('function');
    expect(ctor.getOverlayManager).toBe((Core as any).getOverlayManager);
    expect(ctor.EVENT_OPTIONS).toBe((Core as any).EVENT_OPTIONS);
    expect(ctor.Core).toBe(Core);
  });
});
