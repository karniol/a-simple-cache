export function prettyprint(a: any) {
	if (Array.isArray(a) && a.length === 0) {
		return '[]';
	}

	return `${a}`
}