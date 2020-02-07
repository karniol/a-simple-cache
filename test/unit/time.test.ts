import { expect } from 'chai';

import { time } from '../../src/time';

describe('time', () => {
    describe('constants', () => {
        const properties = [
            { name: 'second', value: 1000 },
            { name: 'minute', value: 60 * 1000 },
            { name: 'hour', value: 60 * 60 * 1000 },
            { name: 'day', value: 24 * 60 * 60 * 1000 },
            { name: 'week', value: 7 * 24 * 60 * 60 * 1000 },
            { name: 'month', value: 30 * 24 * 60 * 60 * 1000 },
        ];
    
        for (const property of properties) {
            it(`${property.name} is ${property.value} ms`, () => {
                expect(time[property.name]).to.equal(property.value);
            });
        }
    });
});