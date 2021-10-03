import { expect } from 'chai';
import * as events from '../../src/js/utils/events';
import '../helper';

describe('utils/events', () => {
    it('must return a custom event to be dispatched', done => {
        let event = events.addEvent('custom');
        let custom = new CustomEvent('custom');
        expect(event.type).to.equal(custom.type);

        event = events.addEvent('test', { detail: { data: 'test'}});
        custom = new CustomEvent('test', { detail: { data: 'test'}});
        expect(event.detail.data).to.equal((custom.detail as any).data);
        done();
    });
});
