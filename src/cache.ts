export const Cache = {
    has,
    set,
    get,
    isValid,
    delete: delete_,
    keys,
    clear,
};

export type Key = string;

export type KeyFilter = (key: Key) => boolean;

export interface Entry {
    value: any;
    cachedAt: Date;
    ttl: number;
}

export interface Cache {
    [key: string]: Entry;
}

export const theCache: Cache = Object.create(null);

function has(key: Key): boolean {
    return (key in theCache);
}

function set(key: Key, value: any, ttl: number): void {
    if (ttl <= 0) {
        throw new RangeError(`TTL must be a positive number, got ${ttl}`);
    }

    if (!validateKey(key)) {
        throw new TypeError('key must be a non-empty string or a number');
    }

    theCache[key] = { value, cachedAt: new Date(), ttl };
}

function get(key: Key): any | null {
    return has(key) ? theCache[key].value : null;
}

function isValid(key: Key): boolean {
    const entry: Entry = theCache[key];

    if (entry) {
        const expiresAt = entry.cachedAt.getTime() + entry.ttl;

        return new Date().getTime() < expiresAt;
    }

    return false;
}

function delete_(key: Key): boolean {
    return has(key) ? delete theCache[key as Key] : false;
}

function clear(): void {
    Object.keys(theCache).forEach((key: string) => delete theCache[key]);
}

function keys(by?: KeyFilter): Key[] {
    if (by) {
        return Object.keys(theCache).filter(by);
    } else {
        return Object.keys(theCache);
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
