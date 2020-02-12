import { expect } from 'chai';

import { HashCode } from '../../src/hashcode';

describe('HashCode', () => {
    const cases = {
        '0': 0,
        'null': null,
        'undefined': undefined,
        'true': true,
        'false': false,
        'NaN': NaN,
        '-Infinity': -Infinity,
        'array': [],
        'object': {},
        // eslint-disable-next-line
        'function': function() {},
    };
    
    describe('of', () => {
        describe('returns non-0 for', () => {
            for (const type in cases) {
                it(`${type}`, () => {
                    expect(HashCode.of(cases[type])).to.not.equal(0);
                });
            }
        });

        describe('returns non-undefined for', () => {
            for (const type in cases) {
                it(`${type}`, () => {
                    expect(HashCode.of(cases[type])).to.not.be.undefined;
                });
            }
        });

        it('returns different hashes for unique values', () => {
            const hashes: number[] = [];

            for (const type in cases) {
                const hash: number = HashCode.of(cases[type]);
                hashes.push(hash);
            }

            const set: number[] = [...new Set(hashes)];

            expect(hashes.length).to.equal(set.length);
        });

        it('returns 0 if not string and prototype does not have toString', () => {
            const weirdOne = new Proxy(
                {},
                {
                    get: (target, property): any => {
                        if (property === 'toString') {
                            return undefined;
                        }

                        return Reflect.get(target, property);
                    }
                }
            );

            expect(HashCode.of(weirdOne)).to.equal(0);
        });
    });

    describe('ofString', () => {
    // https://www.tutorialspoint.com/compile_java_online.php
        describe('calculates hash correctly for', () => {
            it('Hello, world!', () => {
                expect(HashCode.ofString('Hello, world!')).to.equal(-1880044555);
            });

            it('hello world', () => {
                expect(HashCode.ofString('hello world')).to.equal(1794106052);
            });

            it('zero length string', () => {
                for (const s of ['', '', '']) {
                    expect(HashCode.ofString(s)).to.equal(0);
                }
            });

            it('emoji', () => {
                expect(HashCode.ofString('😂')).to.equal(1772901);
            });
        });

        describe('returns non-0 for', () => {
            it('one space', () => {
                expect(HashCode.ofString(' ')).to.not.equal(0);
            });

            it('one tab', () => {
                expect(HashCode.ofString('\t')).to.not.equal(0);
            });

            it('mixed whitespace', () => {
                expect(HashCode.ofString(' \t  \t ')).to.not.equal(0);
            });
        });

        describe('returns 0 for', () => {
            for (const type in cases) {
                it(`${type}`, () => {
                    expect(HashCode.ofString(cases[type])).to.equal(0);
                });
            }
        });
    });

    describe('ofFunction', () => {
        describe('function keyword', () => {
            it('returns non-0 hash for function having empty body', () => {
                expect(HashCode.ofFunction(function() {})).to.not.equal(0);
            });

            it('returns same hashes for anonymous functions having same body', () => {
                expect(
                    HashCode.ofFunction(function(k: string) {
                        k.toUpperCase();
                    })
                ).to.equal(
                    HashCode.ofFunction(function(k: string) {
                        k.toUpperCase();
                    })
                );
            });

            it('returns same hashes for anonymous functions having same body but different source', () => {
                expect(
                    HashCode.ofFunction(function(k: string) { k.toUpperCase(); })
                ).to.equal(
                    HashCode.ofFunction(function(k: string) {
                        k.toUpperCase();
                    })
                );
            });

            it('returns different hashes for differently named functions having same body', () => {
                function func1(): void {
                    return;
                }

                function func2(): void {
                    return;
                }

                expect(func1.name).to.not.equal(func2.name);
                expect(func1.toString()).to.not.equal(func2.toString());

                expect(HashCode.ofFunction(func1)).to.not.equal(
                    HashCode.ofFunction(func2)
                );
            });
        });

        describe('fat-arrow', () => {
            it('returns non-0 hash for function having empty body', () => {
                expect(HashCode.ofFunction(() => {})).to.not.equal(0);
            });

            it('returns same hashes for anonymous functions having same source', () => {
                expect(
                    HashCode.ofFunction((k: string) => {
                        k.toUpperCase();
                    })
                ).to.equal(
                    HashCode.ofFunction((k: string) => {
                        k.toUpperCase();
                    })
                );
            });

            it('returns same hashes for anonymous functions having same body but different source', () => {
                expect(
                    HashCode.ofFunction((k: string) => { k.toUpperCase(); })
                ).to.equal(
                    HashCode.ofFunction((k: string) => {
                        k.toUpperCase();
                    })
                );
            });

            it('returns different hashes for differently named functions having same body', () => {
                const func1 = (): void => {};
                const func2 = (): void => {};

                expect(func1.name).to.not.equal(func2.name);
                expect(func1.toString()).to.equal(func2.toString());

                expect(HashCode.ofFunction(func1)).to.not.equal(
                    HashCode.ofFunction(func2)
                );
            });
        });
    });
});
