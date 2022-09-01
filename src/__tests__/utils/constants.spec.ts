/* eslint-disable @typescript-eslint/no-explicit-any */
import * as constants from '../../utils/constants';

describe('utils/constants', () => {
    let userAgent: jest.SpyInstance<string, []>;

    beforeEach(() => {
        userAgent = jest.spyOn(window.navigator, 'userAgent', 'get');
    });

    afterEach(() => {
        userAgent.mockRestore();
        delete (window as any).MediaSource;
        delete (window as any).SourceBuffer;
    });

    it('must check if browser can support HLS accordingly in Chrome', () => {
        userAgent.mockReturnValue(
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'
        );

        Object.defineProperty(window, 'MediaSource', {
            writable: true,
            value: {
                addEventListener: jest.fn(),
                isTypeSupported: jest.fn(() => true),
            },
        });
        expect(constants.supportsHLS()).toBeTrue();
    });

    it('must check if browser is Safari', () => {
        userAgent.mockReturnValue(
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_5_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6 Safari/605.1.15'
        );
        expect(constants.isSafari()).toBeTrue();
    });

    it('must check if browser is in an iOS device', () => {
        userAgent.mockReturnValue(
            'Mozilla/5.0 (iPhone; CPU iPhone OS 15_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6 Mobile/15E148 Safari/604.1'
        );
        expect(constants.isAndroid()).toBeFalse();
        expect(constants.isIOS()).toBeTrue();
        expect(constants.isIPhone()).toBeTrue();
        expect(constants.isSafari()).toBeTrue();
    });

    it('must check if browser has MSE support', () => {
        Object.defineProperty(window, 'MediaSource', {
            writable: true,
            value: {
                isTypeSupported: jest.fn(() => true),
            },
        });

        expect(constants.hasMSE()).toBeTrue();
    });

    it('must check if browser has support for passive events', () => {
        expect(constants.EVENT_OPTIONS).toContainKey('passive');
        expect(constants.EVENT_OPTIONS).toContainValue(false);
    });
});
