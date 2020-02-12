import { expect } from 'chai';

import { cache } from '../../src/index';
import { Cache } from '../../src/cache';
import { Memoization } from '../../src/memoization';
import { Statistics } from '../../src/statistics';

describe('API', () => {
    describe('has all methods from', () => {
        it('Cache', () => {
            for (const methodName of Object.keys(Cache)) {
                expect(cache[methodName]).to.equal(Cache[methodName]);
            }
        });

        it('Memoization', () => {
            for (const methodName of Object.keys(Memoization)) {
                expect(cache[methodName]).to.equal(Memoization[methodName]);
            }
        });

        it('Statistics', () => {
            for (const methodName of Object.keys(Statistics)) {
                expect(cache[methodName]).to.equal(Statistics[methodName]);
            }
        });
    });
});
