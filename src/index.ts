import { Cache } from './cache';
import { Memoization } from './memoization';
import { time } from './time';

interface ASimpleCache extends Cache, Memoization {};

const cache: ASimpleCache = {
    ...Cache,
    ...Memoization,
};

export {
    cache,
    time
};
