import { expect } from 'chai';

import * as events from '../src/js/utils/events';
import * as time from '../src/js/utils/time';

describe('utils', () => {
    it('must return a number of seconds in STMPE format', () => {
        let formatted = time.formatTime(0);
        expect(formatted).to.equal('00:00');

        formatted = time.formatTime(3600);
        expect(formatted).to.equal('01:00:00');
    });
    it('must return an STMPE string to a number of seconds', () => {
        let formatted = time.timeToSeconds('00:00');
        expect(formatted).to.equal(0);

        formatted = time.timeToSeconds('01:00:00');
        expect(formatted).to.equal(3600);
    });
    it('must return a custom event to be dispatched', () => {
        let event = events.addEvent('custom');
        let custom = new CustomEvent('custom');
        expect(event.type).to.equal(custom.type);

        event = events.addEvent('test', { detail: { data: 'test'}});
        custom = new CustomEvent('test', { detail: { data: 'test'}});
        expect(event.detail.data).to.equal((custom.detail as any).data);
    });
});
