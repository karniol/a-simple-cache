import { Cache } from './cache';
import { HashCode } from './hash';

export const Memoize = {
    it,
    invalidate,
};

function it<A extends any[], R>(func: (...args: A) => R, ttl: number): (...args: A) => R {
    const wrapped = function(...args: A): R {
        const key = `${HashCode.ofFunction(func)}:${HashCode.ofString(args.toString())}`;

        if (Cache.isValid(key)) {
            return Cache.get(key);
        }

        const value = func(...args);

        Cache.set(key, value, ttl);

        return value;
    };

    // keep reference to original func
    Object.defineProperty(wrapped, 'original', {
        value: func,
        writable: false
    });

    return wrapped;
}

function invalidate<F extends Function>(func: F): void {
    const original = (func as any).original;

    let funcHash: number;

    if (typeof original === 'function') {
        funcHash = HashCode.ofFunction(original);
    } else {
        funcHash = HashCode.ofFunction(func);
    }

    for (const key of Cache.keys(k => k.startsWith(`${funcHash}:`))) {
        Cache.delete(key);
    }
}
