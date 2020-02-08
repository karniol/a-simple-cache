export const Cache = {
    set,
    get,
    isValid,
    delete: delete_,
    keys,
    clear,
};

export const theCache: Cache = {};

export interface Cache {
    [key: string]: Entry;
}

export interface Entry {
    value: any;
    cachedAt: Date;
    ttl: number;
}

function set(key: string | number, value: any, ttl: number): void {
    if (ttl <= 0) {
        throw new RangeError(`\`ttl\` must be a positive number, got ${ttl}`);
    }

    if (!validateKey(key)) {
        throw new TypeError('key must be either a string or a number');
    }

    theCache[key] = { value, cachedAt: new Date(), ttl };
}

function get(key: string | number): any | null {
    if (theCache.hasOwnProperty(key)) {
        return theCache[key].value;
    }

    return null;
}

function isValid(key: string): boolean {
    let cachedEntry: Entry | null = null;

    if (theCache.hasOwnProperty(key)) {
        cachedEntry = theCache[key];
    }

    if (cachedEntry) {
        const expiresAt = cachedEntry.cachedAt.getTime() + cachedEntry.ttl;

        return new Date().getTime() < expiresAt;
    }

    return false;
}

function delete_(key: string): boolean {
    if (theCache.hasOwnProperty(key)) {
        delete theCache[key];

        return true;
    }

    return false;
}

function clear(): void {
    Object.keys(theCache).forEach((key: string) => delete theCache[key]);
}

function keys(filterFunc?: (s: string) => boolean): string[] {
    if (filterFunc) {
        return Object.keys(theCache).filter(filterFunc);
    } else {
        return Object.keys(theCache);
    }
}

export function validateKey(key: any): boolean {
    if (typeof key === 'number') {
        return isFinite(key);
    }

    if (typeof key === 'string') {
        return true;
    }

    return false;
}
