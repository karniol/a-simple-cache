import { expect } from 'chai';
import sinon, { SinonFakeTimers } from 'sinon';

import { Cache, cacheObject, validateKey } from '../../src/cache';

describe('Cache', () => {
    let clock: SinonFakeTimers;

    function addFakeEntry(): string {
        const key = Math.random().toString(36);
        cacheObject[key] = { value: 0, cachedAt: new Date(), ttl: 1 };
        return key;
    }

    beforeEach(() => {
        clock = sinon.useFakeTimers();
    });

    afterEach(() => {
        for (const key in cacheObject) {
            delete cacheObject[key];
        }

        clock.restore();
    });

    describe('set', () => {
        describe('accepts', () => {
            const goodCases = {
                'number': 0,
                'string': 'key',
            };

            for (const type in goodCases) {
                it(`${type}`, () => {
                    const actual = validateKey(goodCases[type]);
    
                    expect(actual).to.equal(true);
                });
            }
        });

        describe('does not throw if key of type', () => {
            const goodCases = {
                'number': 0,
                'string': 'key',
            };

            for (const type of Object.keys(goodCases)) {
                it(`${type}`, () => {
                    const goodCall = (): void => Cache.set(goodCases[type], 0, 1);
        
                    expect(goodCall).to.not.throw();
                });
            }
        });

        describe('throws if key of type', () => {
            const badCases = {
                'null': null,
                'undefined': undefined,
                'true': true,
                'false': false,
                'NaN': NaN,
                '-Infinity': -Infinity,
                'array': [],
                'object': {},
                // eslint-disable-next-line
                'function': function() {},
            };

            for (const type of Object.keys(badCases)) {
                it(`${type}`, () => {
                    const badCall = (): void => Cache.set(badCases[type], 0, 1);
        
                    expect(badCall).to.throw();
                });
            }
        });

        describe('setting TTL', () => {
            it('does not throw if positive', () => {
                const goodCall = (): void => Cache.set('1', 0, 1);
    
                expect(goodCall).to.not.throw();
            });
    
            it('throws if zero', () => {
                const badCall = (): void => Cache.set('1', 'Hello, world?', 0);
    
                expect(badCall).to.throw();
            });
    
            it('throws if negative', () => {
                const sadCall = (): void => Cache.set('1', 'Goodbye, world... :(', -1);
    
                expect(sadCall).to.throw();
            });
        });
    });

    describe('get', () => {
        it('returns null when key does not exist', () => {
            expect(Cache.get('1')).to.equal(null);
        });
    });

    describe('set + get', () => {
        const cases = {
            '0': 0,
            'null': null,
            'undefined': undefined,
            'true': true,
            'false': false,
            '-Infinity': -Infinity,
            'array': [],
            'object': {},
            // eslint-disable-next-line
            'function': function() {},
        };
        
        describe('sets and gets correct value of type', () => {
            for (const type in cases) {
                it(`${type}`, () => {
                    Cache.set('1', cases[type], 1);
                    expect(Cache.get('1')).to.equal(cases[type]);
                });
            }

            it('NaN', () => {
                Cache.set('1', NaN, 1);
                expect(Cache.get('1')).to.be.NaN;
            });
        });
    });

    describe('has', () => {
        it('returns false if key not in cache', () => {
            expect(Cache.has('key')).to.equal(false);
        });

        it('returns true if key in cache', () => {
            cacheObject['key'] = { value: 'value', cachedAt: new Date(), ttl: 1 };
            expect(Cache.has('key')).to.equal(true);
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

            expect(Cache.keys()).to.not.equal(1);
            expect(Cache.keys(k => k.startsWith(key)).length).to.equal(1);
        });
    });

    describe('validateKey', () => {
        describe('returns true for', () => {
            const goodCases = {
                'number': 0,
                'string': 'key',
            };
    
            for (const type in goodCases) {
                it(`${type}`, () => {
                    const actual = validateKey(goodCases[type]);
    
                    expect(actual).to.equal(true);
                });
            }
        });

        describe('returns false for', () => {
            const badCases = {
                'null': null,
                'undefined': undefined,
                'true': true,
                'false': false,
                'NaN': NaN,
                '-Infinity': -Infinity,
                'array': [],
                'object': {},
                'empty string': '',
                // eslint-disable-next-line
                'function': function() {},
            };
    
            for (const type in badCases) {
                it(`${type}`, () => {
                    const actual = validateKey(badCases[type]);
    
                    expect(actual).to.equal(false);
                });
            }
        });
    });
});
