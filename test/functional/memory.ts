import { rand, log, heapUsed, heapTotal } from '../utils';

import { Memoize } from '../../src/memoize';
import { Cache } from '../../src/cache';


log('Running generator with no cache');
generateWithNoCache();
log('Test with no cache ended');
Memoize.invalidate(getValue);

log('Running generator with cache then stopping');
generateWithCacheThenStop();
log('Test with cache and stopping ended');
Memoize.invalidate(getValue);

log('Running generator with cache and no stopping');
generateWithCache();
log('Test with cache and no stopping ended');
Memoize.invalidate(getValue);


function generateWithNoCache(): void {
    let i = 0;

    while (true) {
        getValue(rand());

        log(heapUsed().toFixed(2), ' / ', heapTotal().toFixed(2), ' / ', Cache.keys().length, 'keys');

        i++;

        if (i > 100) {
            break;
        }
    }
}

function generateWithCacheThenStop(): void {
    let heap: number;
    let hasInvalidatedOnce = false;
    let i = 0;

    const memoizedGetValue = Memoize.it(getValue, Infinity);

    while (true) {
        if (!hasInvalidatedOnce) {
            memoizedGetValue(rand());
        } else {
            getValue(rand());
        }

        heap = heapUsed();
        log(heap.toFixed(2), ' / ', heapTotal().toFixed(2), ' / ', Cache.keys().length, 'keys');

        if (!hasInvalidatedOnce && heap > 512) {
            log('Invalidated cache');
            Memoize.invalidate(memoizedGetValue);
            hasInvalidatedOnce = true;
            continue;
        }

        i++;

        if (i > 100 || heap > 1024) {
            break;
        }
    }
}

function generateWithCache(): void {
    let mem: number;
    let hasInvalidatedOnce = false;

    const memoizedGetValue = Memoize.it(getValue, Infinity);

    while (true) {
        memoizedGetValue(rand());

        mem = heapUsed();
        log(mem.toFixed(2), ' / ', heapTotal().toFixed(2), ' / ', Cache.keys().length, 'keys');

        if (!hasInvalidatedOnce && mem > 512) {
            log('Invalidated cache');
            Memoize.invalidate(getValue);
            hasInvalidatedOnce = true;
            continue;
        }

        if (mem > 1024) {
            break;
        }
    }
}

function getValue(k: string): object {
    return {
        id: k,
        name: rand(),
        data: {
            props: {
                this: rand(),
                that: rand(),
                those: [rand(), rand(), rand()],
            },
            methods: {
                join: (k: string): string => {
                    return k + rand();
                },
            },
            store: Array(1e6).map(() => rand()),
        },
        tags: Array(1e4).map(() => rand()),
    };
}
