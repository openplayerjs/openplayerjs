/** @jest-environment jsdom */

import * as Core from '@openplayer/core';
import OpenPlayerJS from '../src/umd';

describe('UMD interop: OpenPlayer exposes @openplayer/core statics', () => {
  test('exposes getOverlayManager and EVENT_OPTIONS for add-on UMD bundles', () => {
    const ctor = OpenPlayerJS as unknown as Record<string, unknown>;
    expect(typeof ctor).toBe('function');
    expect(typeof ctor['getOverlayManager']).toBe('function');
    const coreStatics = Core as unknown as Record<string, unknown>;
    expect(ctor['getOverlayManager']).toBe(coreStatics['getOverlayManager']);
    expect(ctor['EVENT_OPTIONS']).toBe(coreStatics['EVENT_OPTIONS']);
    // Add-on UMD bundles import `{ Core }` from `@openplayer/core`, so `OpenPlayerJS.Core`
    // must be the Core class (named export), not the namespace object.
    expect(ctor['Core']).toBe(coreStatics['Core']);
    // The full namespace is still exposed for compatibility/introspection.
    expect(ctor['CoreExports']).toBe(Core);
  });
});
