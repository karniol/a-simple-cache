import { Memoize } from './memoize';

export interface Cache {
    set: typeof set;
    get: typeof get;
    has: typeof has;
    isValid: typeof isValid;
    delete: typeof delete_;
    keys: typeof keys;
    clear: typeof clear;
    memoize: typeof Memoize.it;
    invalidate: typeof Memoize.invalidate;
};

export const Cache: Cache = {
    set,
    get,
    has,
    isValid,
    delete: delete_,
    keys,
    clear,
    memoize: Memoize.it,
    invalidate: Memoize.invalidate,
};

type Key = string;

type KeyFilter = (key: Key) => boolean;

type Entry = {
    value: any;
    cachedAt: Date;
    ttl: number;
}

type CacheObject = {
    [key: string]: Entry;
}

export const cacheObject: CacheObject = Object.create(null);

function has(key: Key): boolean {
    return (key in cacheObject);
}

function set(key: Key, value: any, ttl: number): void {
    if (ttl <= 0) {
        throw new RangeError(`TTL must be a positive number, got ${ttl}`);
    }

    if (!validateKey(key)) {
        throw new TypeError('key must be a non-empty string or a number');
    }

    cacheObject[key] = { value, cachedAt: new Date(), ttl };
}

function get(key: Key): any | null {
    return has(key) ? cacheObject[key].value : null;
}

function isValid(key: Key): boolean {
    const entry: Entry = cacheObject[key];

    if (entry) {
        const expiresAt = entry.cachedAt.getTime() + entry.ttl;

        return new Date().getTime() < expiresAt;
    }

    return false;
}

function delete_(key: Key): boolean {
    return has(key) ? delete cacheObject[key as Key] : false;
}

function clear(): void {
    Object.keys(cacheObject).forEach((key: string) => delete cacheObject[key]);
}

function keys(by?: KeyFilter): Key[] {
    if (by) {
        return Object.keys(cacheObject).filter(by);
    } else {
        return Object.keys(cacheObject);
    }
}

export function validateKey(key: any): boolean {
    if (typeof key === 'number') {
        return isFinite(key);
    }

    if (typeof key === 'string') {
        return key.length === 0 ? false : true;
    }

    return false;
}
