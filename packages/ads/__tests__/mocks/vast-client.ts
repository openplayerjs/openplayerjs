export const vastGetMock = jest.fn();
export const vastParseMock = jest.fn();
export const trackerCtorMock = jest.fn();

export class VASTClient {
  get = vastGetMock;
  parseVAST = vastParseMock;
}

export class VASTTracker {
  trackImpression = jest.fn();
  trackComplete = jest.fn();
  trackPause = jest.fn();
  trackResume = jest.fn();
  trackClickThrough = jest.fn();
  trackVolumeChange = jest.fn();
  trackSkip = jest.fn();
  constructor() {
    trackerCtorMock();
  }
}
