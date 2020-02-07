export function log(...messages: any[]) {
    console.log(new Date, ...messages);
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function prettyprint(a: any) {
	if (Array.isArray(a) && a.length === 0) {
		return '[]';
	}

	return `${a}`
}