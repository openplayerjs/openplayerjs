export const vastGetMock = jest.fn();
export const vastParseMock = jest.fn();
export const trackerCtorMock = jest.fn();

export class VASTClient {
  get = vastGetMock;
  parseVAST = vastParseMock;
}

export class VASTTracker {
  trackImpression = jest.fn();
  trackStart = jest.fn();
  trackComplete = jest.fn();
  trackPause = jest.fn();
  trackResume = jest.fn();
  trackFirstQuartile = jest.fn();
  trackMidpoint = jest.fn();
  trackThirdQuartile = jest.fn();
  trackMute = jest.fn();
  trackUnmute = jest.fn();
  trackClick = jest.fn();
  trackClickThrough = jest.fn();
  trackCreativeView = jest.fn();
  trackSkip = jest.fn();
  setDuration = jest.fn();
  setProgress = jest.fn();
  constructor() {
    trackerCtorMock();
  }
}
