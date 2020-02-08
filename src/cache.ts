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

function get(key: string): any | null {
    if (theCache.hasOwnProperty(key)) {
        return theCache[key].value;
    }

    return null;
}

function set(key: string, value: any, ttl: number): void {
    if (ttl <= 0) {
        throw new RangeError(`SimpleCache: \`ttl\` must be a positive number, got ${ttl}`);
    }

    theCache[key] = { value, cachedAt: new Date(), ttl };
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

function keys(filterFunc?: (s: string) => boolean): string[] {
    if (filterFunc) {
        return Object.keys(theCache).filter(filterFunc);
    } else {
        return Object.keys(theCache);
    }
}

function clear(): void {
    Object.keys(theCache).forEach((key: string) => delete theCache[key]);
}
