import { expect } from 'chai';
import { func } from '../src/';

describe('describe', () => {
    it('it', () => {
        const result = func(false);
        expect(result).to.equal(undefined);
    });
});
