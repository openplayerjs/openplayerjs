/** @jest-environment jsdom */

import * as Core from '@openplayer/core';
import OpenPlayer from '../src/umd';

describe('UMD interop: OpenPlayer exposes @openplayer/core statics', () => {
  test('exposes getOverlayManager and EVENT_OPTIONS for add-on UMD bundles', () => {
    const ctor = OpenPlayer as unknown as Record<string, unknown>;
    expect(typeof ctor).toBe('function');
    expect(typeof ctor['getOverlayManager']).toBe('function');
    const coreStatics = Core as unknown as Record<string, unknown>;
    expect(ctor['getOverlayManager']).toBe(coreStatics['getOverlayManager']);
    expect(ctor['EVENT_OPTIONS']).toBe(coreStatics['EVENT_OPTIONS']);
    expect(ctor['Core']).toBe(Core);
  });
});
