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
	[key: string]: Entry,
}

export interface Entry {
	value: any,
	cachedAt: Date,
	ttlMilliseconds: number,
}

function get(key: string): any | null {
	if (theCache.hasOwnProperty(key)) {
		return theCache[key].value;
	}

	return null;
}

function set(key: string, value: any, ttlMilliseconds: number): void {
	if (ttlMilliseconds <= 0) {
		throw new RangeError(`SimpleCache: \`ttlMilliseconds\` must be a positive number, got ${ttlMilliseconds}`);
	}

	theCache[key] = { value, cachedAt: new Date(), ttlMilliseconds };
}

function isValid(key: string): boolean {
	let cachedEntry: Entry | null = null;

	if (theCache.hasOwnProperty(key)) {
		cachedEntry = theCache[key];
	}

	if (cachedEntry) {
		const expiresAt = cachedEntry.cachedAt.getTime() + cachedEntry.ttlMilliseconds;

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
