import { expect } from 'chai';
import { prettyprint } from '../utils';

import { HashCode } from '../../src/hash';

// eslint-disable-next-line
const badCases: any[] = [0, 42, null, undefined, true, false, [], {}, function() {}];

describe('Hash', () => {
    describe('of', () => {
        describe('returns non-0 for', () => {
            for (const i in badCases) {
                it(`${prettyprint(badCases[i])}`, () => {
                    expect(HashCode.of(badCases[i])).to.not.equal(0);
                });
            }
        });

        describe('returns non-undefined for', () => {
            for (const i in badCases) {
                it(`${prettyprint(badCases[i])}`, () => {
                    expect(HashCode.of(badCases[i])).to.not.be.undefined;
                });
            }
        });

        it('hashes for unique values are different', () => {
            const hashes: number[] = [];

            for (const i in badCases) {
                const hash: number = HashCode.of(badCases[i]);
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
        describe('calculates hash correctly', () => {
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
            for (const i in badCases) {
                it(`${prettyprint(badCases[i])}`, () => {
                    expect(HashCode.ofString((badCases[i] as unknown) as string)).to.equal(0);
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
                    HashCode.ofFunction(function(k: string) {
                        k.toUpperCase();
                    })
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
                    HashCode.ofFunction((k: string) => {
                        k.toUpperCase();
                    })
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
