export const HashCode = {
    of,
    ofString,
    ofFunction,
};

function of(a: any): number {
    if (a === null) {
        return HashCode.ofString('null');
    }

    if (a === undefined) {
        return HashCode.ofString('undefined');
    }

    if (Array.isArray(a) && a.length === 0) {
        return HashCode.ofString('[]');
    }

    if (typeof a.toString === 'function') {
        return HashCode.ofString(a.toString());
    }

    return HashCode.ofString(a);
}

// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
function ofString(s: string): number {
    if (typeof s !== 'string') {
        return 0;
    }

    let hash = 0;
    let char: number;

    if (s.length === 0) {
        return hash;
    }

    for (let i = 0; i < s.length; i++) {
        char = s.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
    }

    return hash;
}

function ofFunction<F extends Function>(f: F): number {
    return HashCode.ofString(`${f.name}:${f.toString().replace(/\s/g, '')}`);
}
