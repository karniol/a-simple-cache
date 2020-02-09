import { Cache } from './cache';
import { HashCode } from './hash';

export const Memoize = {
    it,
    invalidate,
};

export type AnyFunction<A extends any[], R> = (...args: A) => R;

export type MemoizedFunction<A extends any[], R> = AnyFunction<A, R> & { __func: AnyFunction<A, R>; __funcHash: number };

function it<A extends any[], R>(func: AnyFunction<A, R>, ttl: number): MemoizedFunction<A, R> {
    const funcHash = HashCode.ofFunction(func);
    
    return Object.defineProperties(
        function(...args: A): R {
            const key = `${funcHash}:` + `${HashCode.of(args)}`;

            if (Cache.isValid(key)) {
                return Cache.get(key);
            }

            const value = func(...args);

            Cache.set(key, value, ttl);

            return value;
        }, { 
            __func: { value: func, writable: false },
            __funcHash: { value: funcHash, writable: false }
        });
}

function invalidate<A extends any[], R>(func: AnyFunction<A, R> | MemoizedFunction<A, R>): void {
    let funcHash: number;

    if (typeof (func as MemoizedFunction<A,R>).__func === 'function') {
        funcHash = (func as MemoizedFunction<A,R>).__funcHash;
    } else {
        funcHash = HashCode.ofFunction(func);
    }

    for (const key of Cache.keys(k => k.startsWith(`${funcHash}:`))) {
        Cache.delete(key);
    }
}
