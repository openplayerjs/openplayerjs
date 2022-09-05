import * as time from '../../utils/time';

describe('utils/time', () => {
    it('returns a number of seconds in STMPE format', () => {
        let formatted = time.formatTime(0);
        expect(formatted).toEqual('00:00');

        formatted = time.formatTime(3600);
        expect(formatted).toEqual('01:00:00');

        formatted = time.formatTime(6000, 12);
        expect(formatted).toEqual('01:40:00');
    });
    it('returns an STMPE string to a number of seconds', () => {
        let formatted = time.timeToSeconds('00:00');
        expect(formatted).toEqual(0);

        formatted = time.timeToSeconds('01:00:00');
        expect(formatted).toEqual(3600);
    });
});
