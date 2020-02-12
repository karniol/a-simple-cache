import { Cache } from './cache';
import { Memoization } from './memoization';
import { Statistics } from './statistics';
import { time } from './time';

interface ASimpleCache extends Cache, Memoization, Statistics {};

const cache: ASimpleCache = {
    ...Cache,
    ...Memoization,
    ...Statistics,
};

export {
    cache,
    time
};
