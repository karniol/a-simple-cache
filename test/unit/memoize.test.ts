import chai, { expect } from 'chai';
import sinon, { SinonFakeTimers } from 'sinon';
import sinonChai from 'sinon-chai';
import { replaceObject, ReplacedInstance } from 'ts-sinon';

import { HashCode } from '../../src/hash';
import { Cache } from '../../src/cache';
import { Memoize } from '../../src/memoize';

chai.use(sinonChai);

describe('Memoize', () => {
    let clock: SinonFakeTimers;
    let cacheStub: ReplacedInstance<typeof Cache>;
    let hashStub: ReplacedInstance<typeof HashCode>;
	
    const ttl = 1000;

    beforeEach(() => {
        clock = sinon.useFakeTimers();
        cacheStub = replaceObject(Cache);
        hashStub = replaceObject(HashCode);
    });

    afterEach(() => {
        clock.restore();
        cacheStub.restore();
        hashStub.restore();
    });

    describe('it', () => {
        let myFunc: sinon.SinonStub;
        const myFuncHash = 1234;

        let memoizedFunc: Function;

        const givenArgs = [false, 0, ''];
        const givenArgsHash = 5678;
        const correctValue = 'correct value';
        const correctCacheKey = `${myFuncHash}:${givenArgsHash}`;
	
        beforeEach(() => {
            myFunc = sinon.stub();
            myFunc.withArgs(...givenArgs).returns(correctValue);

            hashStub.ofFunction.withArgs(myFunc).returns(myFuncHash);
            hashStub.ofString.withArgs(givenArgs.toString()).returns(givenArgsHash);

            cacheStub.isValid.returns(false);
            memoizedFunc = Memoize.it(myFunc, ttl);
        });

        describe('verifies validity of cached value', () => {
            it('yes', () => {
                memoizedFunc(...givenArgs);
	
                expect(cacheStub.isValid).to.be.called;
            });

            it('using the correct key', () => {
                memoizedFunc(...givenArgs);
	
                expect(cacheStub.isValid).to.be.calledWith(correctCacheKey);
            });
        });

        describe('gets value from cache', () => {
            it('yes', () => {
                cacheStub.isValid.returns(true);
	
                memoizedFunc(...givenArgs);
	
                expect(cacheStub.get).to.be.called;
            });
	
            it('using the correct key', () => {
                cacheStub.isValid.returns(true);
	
                memoizedFunc(...givenArgs);
	
                expect(cacheStub.get).to.be.calledWith(correctCacheKey);
            });
        });

        describe('sets value in cache', () => {
            it('yes', () => {
                memoizedFunc(...givenArgs);
	
                expect(cacheStub.set).to.be.called;
            });
	
            it('using the correct key', () => {
                memoizedFunc(...givenArgs);
	
                expect(cacheStub.set).to.be.calledWith(correctCacheKey);
            });

            it('using the correct value', () => {
                memoizedFunc(...givenArgs);
	
                expect(cacheStub.set).to.be.calledWith(correctCacheKey, correctValue);
            });
	
            it('using the correct TTL', () => {
                memoizedFunc(...givenArgs);
	
                expect(cacheStub.set).to.be.calledWith(correctCacheKey, correctValue, ttl);
            });
        });

        describe('calls function', () => {
            it('yes', () => {
                memoizedFunc(...givenArgs);
	
                expect(myFunc).to.be.calledOnce;
            });
	
            it('returns correct value', () => {
                const result = memoizedFunc(...givenArgs);
	
                expect(result).to.equal(correctValue);
            });

            it('caches result', () => {
                memoizedFunc(...givenArgs);
	
                expect(cacheStub.isValid).to.be.calledOnce;
                expect(cacheStub.get).to.not.be.called;
                expect(myFunc).to.be.calledOnce;
                expect(myFunc).to.be.calledWith(...givenArgs);
                expect(cacheStub.set).to.be.calledOnce;
            });
        });

        describe('respects time', () => {
            it('gets value from cache if no time has passed', () => {
                memoizedFunc(...givenArgs);
	
                cacheStub.isValid.returns(true);
                cacheStub.get.returns(correctValue);
	
                memoizedFunc(...givenArgs);
	
                expect(cacheStub.isValid).to.be.calledTwice;
                expect(cacheStub.get).to.be.calledOnce;
                expect(cacheStub.set).to.be.calledOnce;
                expect(myFunc).to.be.calledOnce;
                expect(myFunc).to.be.calledWith(...givenArgs);
            });
	
            it('returns correct value from cache if no time has passed', () => {
                const firstResult = memoizedFunc(...givenArgs);
	
                cacheStub.isValid.returns(true);
                cacheStub.get.returns(correctValue);
	
                const secondResult = memoizedFunc(...givenArgs);
	
                expect(firstResult).to.equal(correctValue);
                expect(secondResult).to.equal(firstResult);
            });
			
            it('gets value from cache after some time has passed', () => {
                memoizedFunc(...givenArgs);
	
                clock.tick(ttl - 1);
                cacheStub.isValid.returns(true);
                cacheStub.get.returns(correctValue);
	
                memoizedFunc(...givenArgs);
	
                expect(cacheStub.isValid).to.be.calledTwice;
                expect(cacheStub.get).to.be.calledOnce;
                expect(cacheStub.set).to.be.calledOnce;
                expect(myFunc).to.be.calledOnce;
                expect(myFunc).to.be.calledWith(...givenArgs);
            });
	
            it('returns correct value from cache after some time has passed', () => {
                const firstResult = memoizedFunc(...givenArgs);
	
                clock.tick(ttl - 1);
                cacheStub.isValid.returns(true);
                cacheStub.get.returns(correctValue);
	
                const secondResult = memoizedFunc(...givenArgs);
	
                expect(firstResult).to.equal(correctValue);
                expect(secondResult).to.equal(firstResult);
            });
	
            it('caches again after TTL has passed', () => {
                memoizedFunc(...givenArgs);
	
                clock.tick(ttl);
                cacheStub.isValid.returns(false);
	
                memoizedFunc(...givenArgs);
	
                expect(cacheStub.isValid).to.be.calledTwice;
                expect(cacheStub.get).to.not.be.called;
                expect(cacheStub.set).to.be.calledTwice;
                expect(myFunc).to.be.calledTwice;
                expect(myFunc).to.be.calledWith(...givenArgs);
            });
	
            it('returns correct value after TTL has passed', () => {
                const result1 = memoizedFunc(...givenArgs);
	
                clock.tick(ttl);
                cacheStub.isValid.returns(false);
	
                const result2 = memoizedFunc(...givenArgs);
	
                expect(result1).to.equal(correctValue);
                expect(result2).to.equal(result1);
            });
        });
    });

    describe('invalidate', () => {
        let myFunc: sinon.SinonStub;
        const myFuncHash = 1234;

        let memoizedFunc: Function;

        const givenArgs = [1, 2, 3, 4];
        const correctValues = ['one', 'two', 'three', 'four'];
        const givenArgsHashes = [1001, 2002, 3003, 4004];

        const correctCacheKeys: string[] = [];

        beforeEach(() => {
            myFunc = sinon.stub();

            hashStub.ofFunction.withArgs(myFunc).returns(myFuncHash);
		
            for (const i in givenArgs) {
                myFunc.withArgs(givenArgs[i]).returns(correctValues[i]);
                hashStub.ofString.withArgs(givenArgs[i].toString()).returns(givenArgsHashes[i]);
                correctCacheKeys.push(`${myFuncHash}:${givenArgsHashes[i]}`);
            }

            cacheStub.keys.returns(correctCacheKeys);

            memoizedFunc = Memoize.it(myFunc, ttl);
			
            for (const arg of givenArgs) {
                memoizedFunc(arg);
            }
        });

        function invalidationTests(): void {
            it('calls keys of cache', () => {
                expect(cacheStub.keys).to.be.called;
            });

            it('calls keys of cache with a function', () => {
                expect(typeof cacheStub.keys.getCall(0).args[0]).to.equal('function');
            });

            it('calls keys of cache with the correct function', () => {
                const correctKey = `${myFuncHash}:anything`;
                const incorrectKey = 'something:anything';

                const func = cacheStub.keys.getCall(0).args[0] as Function;

                expect(func(correctKey)).to.equal(true);
                expect(func(incorrectKey)).to.equal(false);
            });

            it('calls delete of cache', () => {
                expect(cacheStub.delete).to.be.called;
            });

            it('calls delete of cache the correct amount of times', () => {
                expect(cacheStub.delete).to.have.callCount(correctCacheKeys.length);
            });

            it('calls delete of cache with the correct keys', () => {
                for (const key of correctCacheKeys) {
                    expect(cacheStub.delete).to.have.been.calledWith(key);
                }
            });
        }

        describe('when called on original function', () => {
            beforeEach(() => {
                Memoize.invalidate(myFunc);
            });

            invalidationTests();
        });

        describe('when called on wrapped function', () => {
            beforeEach(() => {
                Memoize.invalidate(memoizedFunc);
            });

            invalidationTests();
        });
    });

    describe('original', () => {
        let myFunc: sinon.SinonStub;
        let memoizedFunc: Function;

        const givenArgs = [false, 0, ''];

        beforeEach(() => {
            myFunc = sinon.stub();
            memoizedFunc = Memoize.it(myFunc, ttl);
        });

        it('property exists', () => {
            expect((memoizedFunc as any).original).to.equal(myFunc);
        });

        it('does not invoke cache when called', () => {
            (memoizedFunc as any).original(...givenArgs);

            for (const stubName of Object.keys(Cache)) {
                expect(cacheStub[stubName]).to.have.not.been.called;
            }
        });
    });
});
