import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import { replaceObject, ReplacedInstance } from 'ts-sinon';

chai.use(sinonChai);

import { Cache, cacheObject } from '../../src/cache';
import { 
    Statistics,
    statisticsObject,
    isEnabled,
    setEnabled,
    trackedCacheMethodNames,
    hitMissTrackedCacheMethodNames,
    trueFalseTrackedCacheMethodNames,
    simplyTrackedCacheMethodNames,
    wrappedCacheMethods,
} from '../../src/statistics';

describe('Statistics', () => {
    afterEach(() => {
        for (const key in statisticsObject) {
            delete statisticsObject[key];
        }

        setEnabled(false);
    });

    describe('isEnabled', () => {
        it('is false by default', () => {
            expect(isEnabled()).to.equal(false);
        });
    });

    describe('setEnabled', () => {
        it('sets isEnabled to true', () => {
            setEnabled(true);
            expect(isEnabled()).to.equal(true);
        });

        it('sets isEnabled to false', () => {
            setEnabled(true);
            expect(isEnabled()).to.equal(true);

            setEnabled(false);
            expect(isEnabled()).to.equal(false);
        });
    });

    describe('enableStatistics', () => {
        it('sets isEnabled to true', () => {
            expect(isEnabled()).to.equal(false);

            Statistics.enableStatistics();

            expect(isEnabled()).to.equal(true);
        });

        it('cannot be called more than once', () => {
            Statistics.enableStatistics();

            const secondCall = (): void => Statistics.enableStatistics();

            expect(secondCall).to.throw('statistics are already enabled');
        });

        it('wraps all tracked cache methods', () => {
            const cacheStub: ReplacedInstance<typeof Cache> = replaceObject(Cache);

            Statistics.enableStatistics();

            for (const methodName of trackedCacheMethodNames) {
                expect(Cache[methodName]).to.equal(wrappedCacheMethods[methodName]);
            }

            cacheStub.restore();
        });

        it('does not wrap any other cache methods', () => {
            const cacheStub: ReplacedInstance<typeof Cache> = replaceObject(Cache);

            const untrackedCacheMethodNames = Object.keys(Cache)
                .filter(k => !trackedCacheMethodNames
                    .includes(k as typeof trackedCacheMethodNames[number]));

            const originalMethods = {};

            for (const methodName of untrackedCacheMethodNames) {
                originalMethods[methodName] = Cache[methodName];
            }

            Statistics.enableStatistics();

            for (const methodName of untrackedCacheMethodNames) {
                expect(Cache[methodName]).to.equal(originalMethods[methodName]);
            }

            cacheStub.restore();
        });
    });

    describe('statisticsObject', () => {
        describe('before enableStatistics', () => {
            it('is empty', () => {
                expect(Object.keys(statisticsObject).length).to.equal(0);
            });
        });

        describe('after enableStatistics', () => {
            beforeEach(() => {
                Statistics.enableStatistics();
            });

            it('has keys', () => {
                expect(Object.keys(statisticsObject).length).to.not.equal(0);
            });
    
            it('has keys of all tracked methods', () => {
                for (const methodName of trackedCacheMethodNames) {
                    expect(methodName in statisticsObject).to.equal(true);
                }
            });

            describe('simply tracked methods', () => {
                it('has values set to 0', () => {
                    for (const methodName of simplyTrackedCacheMethodNames) {
                        expect(statisticsObject[methodName]).to.equal(0);
                    }
                });
            });

            describe('hit-miss tracked methods', () => {
                it('has sub-objects', () => {
                    for (const methodName of hitMissTrackedCacheMethodNames) {
                        expect(typeof statisticsObject[methodName]).to.equal('object');
                    }
                });
    
                it('has 2 keys in sub-objects', () => {
                    for (const methodName of hitMissTrackedCacheMethodNames) {
                        expect(Object.keys(statisticsObject[methodName]).length).to.equal(2);
                    }
                });
    
                it('has values of sub-objects set to 0', () => {
                    for (const methodName of hitMissTrackedCacheMethodNames) {
                        expect(statisticsObject[methodName].hit).to.equal(0);
                        expect(statisticsObject[methodName].miss).to.equal(0);
                    }
                });
            });

            describe('true-false tracked methods', () => {
                it('has sub-objects', () => {
                    for (const methodName of trueFalseTrackedCacheMethodNames) {
                        expect(typeof statisticsObject[methodName]).to.equal('object');
                    }
                });
    
                it('has 2 keys in sub-objects', () => {
                    for (const methodName of trueFalseTrackedCacheMethodNames) {
                        expect(Object.keys(statisticsObject[methodName]).length).to.equal(2);
                    }
                });
    
                it('has values of sub-objects set to 0', () => {
                    for (const methodName of trueFalseTrackedCacheMethodNames) {
                        expect(statisticsObject[methodName].true).to.equal(0);
                        expect(statisticsObject[methodName].false).to.equal(0);
                    }
                });
            });
        });
    });

    describe('wrapped cache methods', () => {
        let cacheStub: ReplacedInstance<typeof Cache>;

        function addFakeEntry(): string {
            const key = Math.random().toString(36);
            cacheObject[key] = { value: 0, cachedAt: new Date(), ttl: 1 };
            return key;
        }

        function addFakeInvalidEntry(): string {
            const key = Math.random().toString(36);
            cacheObject[key] = { value: 0, cachedAt: new Date(0), ttl: 1 };
            return key;
        }

        function addFakeValidEntry(): string {
            const key = Math.random().toString(36);
            cacheObject[key] = { value: 0, cachedAt: new Date(), ttl: Infinity };
            return key;
        }
    
        beforeEach(() => {
            cacheStub = replaceObject(Cache);
            Statistics.enableStatistics();
        });

        afterEach(() => {
            for (const key in cacheObject) {
                delete cacheObject[key];
            }

            cacheStub.restore();
        });

        describe('set', () => {
            it('increments `set` when called', () => {
                expect(statisticsObject.set).to.equal(0);
                expect(Statistics.statistics.set).to.equal(0);

                Cache.set('key', 'value', 1);

                expect(statisticsObject.set).to.equal(1);
                expect(Statistics.statistics.set).to.equal(1);
            });
        });

        describe('get', () => {
            it('increments `get.hit` when called for existing key', () => {
                expect(statisticsObject.get.hit).to.equal(0);
                expect(Statistics.statistics.get.hit).to.equal(0);

                const key = addFakeEntry();

                Cache.get(key);

                expect(statisticsObject.get.hit).to.equal(1);
                expect(Statistics.statistics.get.hit).to.equal(1);
            });

            it('increments `get.miss` when called for non-existent key', () => {
                expect(statisticsObject.get.miss).to.equal(0);
                expect(Statistics.statistics.get.miss).to.equal(0);

                Cache.get('non-existent');

                expect(statisticsObject.get.miss).to.equal(1);
                expect(Statistics.statistics.get.miss).to.equal(1);
            });
        });

        describe('isValid', () => {
            it('increments `isValid.true` when called for valid key', () => {
                expect(statisticsObject.isValid.true).to.equal(0);
                expect(Statistics.statistics.isValid.true).to.equal(0);

                const key = addFakeValidEntry();

                Cache.isValid(key);

                expect(statisticsObject.isValid.true).to.equal(1);
                expect(Statistics.statistics.isValid.true).to.equal(1);
            });

            it('increments `isValid.false` when called for invalid key', () => {
                expect(statisticsObject.isValid.false).to.equal(0);
                expect(Statistics.statistics.isValid.false).to.equal(0);

                const key = addFakeInvalidEntry();

                Cache.isValid(key);

                expect(statisticsObject.isValid.false).to.equal(1);
                expect(Statistics.statistics.isValid.false).to.equal(1);
            });
        });

        describe('delete', () => {
            it('increments `delete` when called on existing key', () => {
                expect(statisticsObject.delete).to.equal(0);
                expect(Statistics.statistics.delete).to.equal(0);

                const key = addFakeEntry();

                Cache.delete(key);

                expect(statisticsObject.delete).to.equal(1);
                expect(Statistics.statistics.delete).to.equal(1);
            });

            it('does not increment `delete` when called on non-existent key', () => {
                expect(statisticsObject.delete).to.equal(0);
                expect(Statistics.statistics.delete).to.equal(0);
                
                Cache.delete('non-existent');

                expect(statisticsObject.delete).to.equal(0);
                expect(Statistics.statistics.delete).to.equal(0);
            });
        });
    });

    describe('statistics property', () => {
        it('exists', () => {
            expect(Statistics.statistics).to.not.be.undefined;
        });

        it('is equal to statisticsObject', () => {
            expect(Statistics.statistics).to.equal(statisticsObject);
        });
    });
});