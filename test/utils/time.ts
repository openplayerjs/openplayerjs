import { expect } from 'chai';
import * as time from '../../src/js/utils/time';
import '../helper';

describe('utils/time', () => {
    it('returns a number of seconds in STMPE format', done => {
        let formatted = time.formatTime(0);
        expect(formatted).to.equal('00:00');

        formatted = time.formatTime(3600);
        expect(formatted).to.equal('01:00:00');
        done();
    });
    it('returns an STMPE string to a number of seconds', done => {
        let formatted = time.timeToSeconds('00:00');
        expect(formatted).to.equal(0);

        formatted = time.timeToSeconds('01:00:00');
        expect(formatted).to.equal(3600);
        done();
    });
});
