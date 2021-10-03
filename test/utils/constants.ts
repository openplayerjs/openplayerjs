import { expect } from 'chai';
import * as constants from '../../src/js/utils/constants';
import '../helper';

describe('utils/constants', () => {
    it('must check if browser can support HLS accordingly in Chrome', done => {
        expect(constants.SUPPORTS_HLS()).to.equal(true);
        done();
    });
});
