import { expect } from 'chai';
import * as constants from '../../src/js/utils/constants';
import '../helper';

describe('utils/constants', () => {
    it('must check if browser can support HLS accordingly in Chrome', (done) => {
        expect(constants.SUPPORTS_HLS()).to.equal(true);
        done();
    });

    it('must check if browser is Chrome', (done) => {
        expect(constants.IS_ANDROID).to.equal(false);
        expect(constants.IS_CHROME).to.equal(true);
        expect(constants.IS_EDGE).to.equal(false);
        expect(constants.IS_FIREFOX).to.equal(false);
        expect(constants.IS_SAFARI).to.equal(false);
        expect(constants.IS_STOCK_ANDROID).to.equal(false);
        done();
    });

    it('must check if browser is in iOS', (done) => {
        expect(constants.IS_IOS).to.equal(false);
        expect(constants.IS_IPAD).to.equal(false);
        expect(constants.IS_IPOD).to.equal(false);
        expect(constants.IS_IPHONE).to.equal(false);
        done();
    });

    it('must check if browser has MSE support', (done) => {
        expect(constants.HAS_MSE).to.equal(true);
        done();
    });

    it('must check if browser has support for passive events', (done) => {
        expect(constants.EVENT_OPTIONS).to.eql({ passive: false });
        done();
    });
});
