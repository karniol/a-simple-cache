import { expect } from 'chai';
import sinon, { SinonFakeTimers } from 'sinon';
import { prettyprint } from '../utils';

import { Cache, theCache } from '../../src/cache';

// eslint-disable-next-line
const testValues = [0, 42, null, undefined, true, false, [], {}, function() {}];

function addFakeEntry(): string {
    const key = Math.random().toString(36);
    theCache[key] = { value: 0, cachedAt: new Date(), ttlMilliseconds: 1 };
    return key;
}

describe('SimpleCache', () => {
    let clock: SinonFakeTimers;

    beforeEach(() => {
        clock = sinon.useFakeTimers();
    });

    afterEach(() => {
        for (const key in theCache) {
            delete theCache[key];
        }

        clock.restore();
    });

    describe('set', () => {
        it('does not throw error when TTL is positive', () => {
            const goodCall = (): void => Cache.set('1', 'Hello, world!', 9001);

            expect(goodCall).to.not.throw;
        });

        it('throws error when TTL is zero', () => {
            const badCall = (): void => Cache.set('1', 'Hello, world?', 0);

            expect(badCall).to.throw(RangeError);
        });

        it('throws error when TTL is negative', () => {
            const sadCall = (): void => Cache.set('1', 'Goodbye, world... :(', -9001);

            expect(sadCall).to.throw(RangeError);
        });
    });

    describe('get', () => {
        it('returns null when key does not exist', () => {
            expect(Cache.get('1')).to.equal(null);
        });
    });

    describe('set + get', () => {
        for (const i in testValues) {
            it(`${prettyprint(testValues[i])}`, () => {
                Cache.set('1', testValues[i], 1);
                expect(Cache.get('1')).to.equal(testValues[i]);
            });
        }

        it('NaN', () => {
            Cache.set('1', NaN, 1);
            expect(Cache.get('1')).to.be.NaN;
        });
    });

    describe('isValid', () => {
        it('returns false when a key has not been added', () => {
            expect(Cache.isValid('key that has not been added yet')).eq(false);
        });

        describe('respects time', () => {
            it('returns true when no time has passed', () => {
                Cache.set('1', '1', 1);
                expect(Cache.isValid('1')).to.equal(true);
            });

            it('returns true when less than TTL time has passed', () => {
                Cache.set('1', '1', 1000);
                clock.tick(999);
                expect(Cache.isValid('1')).to.equal(true);
            });

            it('returns false when exactly TTL time has passed', () => {
                Cache.set('1', '1', 1000);
                clock.tick(1000);
                expect(Cache.isValid('1')).to.equal(false);
            });

            it('returns false when more than TTL time has passed', () => {
                Cache.set('1', '1', 1000);
                clock.tick(1001);
                expect(Cache.isValid('1')).to.equal(false);
            });
        });
    });

    describe('delete', () => {
        it('returns false when trying to delete non-existent key', () => {
            expect(Cache.delete('non-existent')).to.equal(false);
        });

        it('returns true when deleting existing key', () => {
            Cache.set('1', '1', 1);
            expect(Cache.delete('1')).to.equal(true);
        });
    });

    describe('keys', () => {
        it('count is 0 if no keys have been added', () => {
            expect(Cache.keys().length).to.equal(0);
        });

        it('count changes correctly', () => {
            addFakeEntry();
            expect(Cache.keys().length).to.equal(1);
            addFakeEntry();
            expect(Cache.keys().length).to.equal(2);
            addFakeEntry();
            expect(Cache.keys().length).to.equal(3);
        });

        it('count is 0 after clearing', () => {
            addFakeEntry();
            addFakeEntry();
            addFakeEntry();
            Cache.clear();
            expect(Cache.keys().length).to.equal(0);
        });

        it('can be filtered', () => {
            expect(Cache.keys(k => k.startsWith('anything')).length).to.equal(0);
        });

        it('filters correctly', () => {
            const key = addFakeEntry();

            for (let i = 0; i < 10; i++) {
                addFakeEntry();
            }

            expect(Cache.keys(k => k.startsWith(key)).length).to.equal(1);
        });
    });
});
