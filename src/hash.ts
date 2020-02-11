export interface HashCode {
    of: typeof of;
    ofString: typeof ofString;
    ofFunction: typeof ofFunction;
}

export const HashCode = {
    of,
    ofString,
    ofFunction,
};

function of(a: any): number {
    if (a === null) {
        return ofString('null');
    }

    if (a === undefined) {
        return ofString('undefined');
    }

    if (Array.isArray(a)) {
        return ofString(`[${a}]`);
    }

    if (typeof a.toString === 'function') {
        return ofString(a.toString());
    }

    return ofString(a);
}

// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
function ofString(s: string): number {
    if (typeof s !== 'string') {
        return 0;
    }

    const len = s.length;
    
    let hash = 0;

    for (let i = 0; i < len; ++i) {
        hash = (hash << 5) - hash + s.charCodeAt(i);
        hash |= 0;
    }

    return hash;
}

function ofFunction<F extends Function>(f: F): number {
    return ofString(`${f.name}${f.toString().replace(/\s/g, '')}`);
}
