import { cache } from './index';
import { Cache } from './cache';
import { set, get, isValid, delete_ } from './cache';

export const trackedCacheMethodNames = ['set', 'get', 'isValid', 'delete'] as const;
export const hitMissTrackedCacheMethodNames = ['get'] as const;
export const trueFalseTrackedCacheMethodNames = ['isValid'] as const;
export const simplyTrackedCacheMethodNames = ['set', 'delete'] as const;

type TrackedCacheMethods = Pick<Cache, typeof trackedCacheMethodNames[number]>;
type HitMissTrackedMethodName = keyof Pick<TrackedCacheMethods, typeof hitMissTrackedCacheMethodNames[number]>;
type TrueFalseTrackedMethodName = keyof Pick<TrackedCacheMethods, typeof trueFalseTrackedCacheMethodNames[number]>;
type SimplyTrackedMethodName = keyof Pick<TrackedCacheMethods, typeof simplyTrackedCacheMethodNames[number]>;

type StatisticsObject = {
    [K in HitMissTrackedMethodName]: {
        hit: number;
        miss: number;
    };
} & {
    [K in TrueFalseTrackedMethodName]: {
        true: number;
        false: number;
    }
} & {
    [K in SimplyTrackedMethodName]: number;
};

export const statisticsObject: StatisticsObject = Object.create({});

export interface Statistics {
    enableStatistics: typeof enableStatistics;
    statistics: typeof statistics;
};

export const Statistics: Statistics = {
    enableStatistics,
    statistics,
};

let isEnabled_ = false;

export function isEnabled(): boolean {
    return isEnabled_;
}

export function setEnabled(value: boolean): void {
    isEnabled_ = value;
}

function trackHit(methodName: HitMissTrackedMethodName): void {
    statisticsObject[methodName].hit += 1;
}

function trackMiss(methodName: HitMissTrackedMethodName): void {
    statisticsObject[methodName].miss += 1;
}

function trackTrue(methodName: TrueFalseTrackedMethodName): void {
    statisticsObject[methodName].true += 1;
}

function trackFalse(methodName: TrueFalseTrackedMethodName): void {
    statisticsObject[methodName].false += 1;
}

function trackMethod(methodName: SimplyTrackedMethodName): void {
    statisticsObject[methodName] += 1;
}

type WrappedCacheMethods = {
    [K in keyof TrackedCacheMethods]: typeof Cache[keyof TrackedCacheMethods];
};

export const wrappedCacheMethods: WrappedCacheMethods = {
    set: function(...args: Parameters<typeof Cache.set>): ReturnType<typeof Cache.set> {
        trackMethod('set');

        return set(...args);
    },
    get: function(...args: Parameters<typeof Cache.get>): ReturnType<typeof Cache.get> {
        const result = get(...args);

        typeof result !== 'undefined' ? trackHit('get') : trackMiss('get');

        return result;
    },
    isValid: function(...args: Parameters<typeof Cache.isValid>): ReturnType<typeof Cache.isValid> {
        const result = isValid(...args);

        result ? trackTrue('isValid') : trackFalse('isValid');

        return result;
    },
    delete: function(...args: Parameters<typeof Cache.delete>): ReturnType<typeof Cache.delete> {
        const result = delete_(...args);
        
        if (result) {
            trackMethod('delete');
        }

        return result;
    },
};

function enableStatistics(): boolean {
    if (isEnabled()) {
        throw new Error('statistics is already enabled');
    }

    for (const methodName of simplyTrackedCacheMethodNames) {
        statisticsObject[methodName] = 0;
    }

    for (const methodName of hitMissTrackedCacheMethodNames) {
        statisticsObject[methodName] = {
            hit: 0,
            miss: 0,
        };
    }

    for (const methodName of trueFalseTrackedCacheMethodNames) {
        statisticsObject[methodName] = {
            true: 0,
            false: 0,
        };
    }

    for (const methodName of Object.keys(wrappedCacheMethods)) {
        Cache[methodName] = wrappedCacheMethods[methodName];
        cache[methodName] = Cache[methodName];
    }

    setEnabled(true);

    return true;
}

function statistics(): StatisticsObject {
    return statisticsObject;
}
