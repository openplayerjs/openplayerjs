import { expect } from 'chai';
import * as time from '../../src/js/utils/time';

describe('utils/time', () => {
    afterEach(done => {
        setTimeout(done, 500);
    });
    it('returns a number of seconds in STMPE format', () => {
        let formatted = time.formatTime(0);
        expect(formatted).to.equal('00:00');

        formatted = time.formatTime(3600);
        expect(formatted).to.equal('01:00:00');
    });
    it('returns an STMPE string to a number of seconds', () => {
        let formatted = time.timeToSeconds('00:00');
        expect(formatted).to.equal(0);

        formatted = time.timeToSeconds('01:00:00');
        expect(formatted).to.equal(3600);
    });
});
