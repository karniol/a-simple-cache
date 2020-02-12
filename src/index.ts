import { Cache } from './cache';
import { Memoization } from './memoization';
import { Statistics } from './statistics';
import { time } from './time';

interface ASimpleCache extends Cache, Memoization, Statistics {};

const cache: ASimpleCache = {
    set: Cache.set,
    get: Cache.get,
    has: Cache.has,
    isValid: Cache.isValid,
    delete: Cache.delete,
    keys: Cache.keys,
    clear: Cache.clear,
    memoize: Memoization.memoize,
    invalidate: Memoization.invalidate,
    enableStatistics: Statistics.enableStatistics,
    statistics: Statistics.statistics,
};

export {
    cache,
    time
};
