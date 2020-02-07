import { log, sleep } from '../utils';

import { Memoize } from '../../src/memoize';
import { time } from '../../src/time';


let options: any = {
    isCachedThresholdMs: 10,
    pollingRate: 333,
    cacheFor: 6 * time.second,
};

options = {
    ...options,
    iterations: options.cacheFor / options.pollingRate,
}

const sleepAndScream = Memoize.it(sleepAndScream_, options.cacheFor);

(async () => {
    // boo!
    (async () => {
        let lastCalled = new Date();
        let msBetweenCalls = 0;

        for (let i = 0; i < options.iterations; i++) {
            log(await sleepAndScream('@_@ boo!'));

            msBetweenCalls = new Date().getTime() - lastCalled.getTime();
            lastCalled = new Date();

            log(' - (boo) ms between last 2 calls: ', msBetweenCalls);

            if (msBetweenCalls <= options.isCachedThresholdMs) {
                log(`Polling... (boo) (${options.pollingRate} ms)`);
                await sleep(options.pollingRate);
                lastCalled = new Date();
            }

            if (i === 1) {
                log(' !!!!!!!!! Cache invalidated for all callers!')
                Memoize.invalidate(sleepAndScream);
            }
        }
    })();

    // help me!
    (async () => {
        let lastCalled = new Date();
        let msBetweenCalls = 0;

        for (let i = 0; i < options.iterations; i++) {
            log(await sleepAndScream('\\o/ help me!'));

            msBetweenCalls = new Date().getTime() - lastCalled.getTime();
            lastCalled = new Date();

            log(' - (help me) ms between last 2 calls: ', msBetweenCalls);

            if (msBetweenCalls <= options.isCachedThresholdMs) {
                log(`Polling... (help me) (${options.pollingRate} ms)`);
                await sleep(options.pollingRate);
                lastCalled = new Date();
            }
        }
    })();
})();


async function sleepAndScream_(k: string): Promise<string> {
    await sleep(2000);
    return k.toUpperCase();
}
