/** @jest-environment jsdom */

import * as Core from '@openplayerjs/core';
import OpenPlayerJS from '../src/umd';

describe('UMD interop: OpenPlayer exposes @openplayerjs/core statics', () => {
  test('exposes getOverlayManager and EVENT_OPTIONS for add-on UMD bundles', () => {
    const ctor = OpenPlayerJS as unknown as Record<string, unknown>;
    expect(typeof ctor).toBe('function');
    expect(typeof ctor['getOverlayManager']).toBe('function');
    const coreStatics = Core as unknown as Record<string, unknown>;
    expect(ctor['getOverlayManager']).toBe(coreStatics['getOverlayManager']);
    expect(ctor['EVENT_OPTIONS']).toBe(coreStatics['EVENT_OPTIONS']);
  });
});
