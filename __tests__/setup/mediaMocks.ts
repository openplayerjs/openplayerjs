const define = <K extends keyof HTMLMediaElement>(key: K, value: any) => {
  Object.defineProperty(HTMLMediaElement.prototype, key, {
    configurable: true,
    writable: true,
    value,
  });
};

// jsdom doesn’t implement these well; keep them stable across all suites.
define('play', jest.fn().mockResolvedValue(undefined));
define('pause', jest.fn());
define('load', jest.fn());

// canPlayType is used by engine selection in Player.resolveMediaEngine()
define(
  'canPlayType',
  jest.fn(() => 'probably')
);

// Some tests need duration/currentTime writable; jsdom may expose getters only.
Object.defineProperty(HTMLMediaElement.prototype, 'duration', {
  configurable: true,
  get() {
    // allow tests to overwrite via defineProperty on the instance if needed
    return (this as any).__duration ?? NaN;
  },
  set(v: number) {
    (this as any).__duration = v;
  },
});

Object.defineProperty(HTMLMediaElement.prototype, 'currentTime', {
  configurable: true,
  get() {
    return (this as any).__currentTime ?? 0;
  },
  set(v: number) {
    (this as any).__currentTime = v;
  },
});

// volume/muted should be writable in tests
Object.defineProperty(HTMLMediaElement.prototype, 'volume', {
  configurable: true,
  get() {
    return (this as any).__volume ?? 1;
  },
  set(v: number) {
    (this as any).__volume = v;
  },
});

Object.defineProperty(HTMLMediaElement.prototype, 'muted', {
  configurable: true,
  get() {
    return (this as any).__muted ?? false;
  },
  set(v: boolean) {
    (this as any).__muted = v;
  },
});

// Optional: playbackRate if you test rate controls
Object.defineProperty(HTMLMediaElement.prototype, 'playbackRate', {
  configurable: true,
  get() {
    return (this as any).__playbackRate ?? 1;
  },
  set(v: number) {
    (this as any).__playbackRate = v;
  },
});

// Reset call counts between tests (without re-defining)
beforeEach(() => {
  (HTMLMediaElement.prototype.play as jest.Mock).mockClear();
  (HTMLMediaElement.prototype.pause as jest.Mock).mockClear();
  (HTMLMediaElement.prototype.load as jest.Mock).mockClear();
  (HTMLMediaElement.prototype.canPlayType as jest.Mock).mockClear();
});

// Some Jest configs treat any file under __tests__ as a test file.
// Keep a tiny smoke test here to avoid "Your test suite must contain at least one test".
test('mediaMocks setup loads', () => {
  expect(typeof HTMLMediaElement.prototype.play).toBe('function');
});
