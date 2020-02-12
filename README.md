<h1><pre>a-simple-cache</pre></h1>


[![Travis CI Build Status](https://travis-ci.com/karniol/a-simple-cache.svg?branch=master)](https://travis-ci.com/karniol/a-simple-cache) [![Codecov Code Coverage](https://codecov.io/gh/karniol/a-simple-cache/branch/master/graph/badge.svg)](https://codecov.io/gh/karniol/a-simple-cache) [![a-simple-cache on npm](https://img.shields.io/npm/v/a-simple-cache.svg)](https://npmjs.com/package/a-simple-cache)

<hr>

Simple in-memory cache with additional utilities, including memoization and statistics.

<hr>

- [Basic functions](#basic-functions)
  - [`set`: caching a value](#set-caching-a-value)
  - [`get`: retrieving a value](#get-retrieving-a-value)
  - [`has`: checking if a key exists](#has-checking-if-a-key-exists)
  - [`isValid`: checking if an entry is valid](#isvalid-checking-if-an-entry-is-valid)
  - [`keys`: listing keys of entries](#keys-listing-keys-of-entries)
  - [`delete`: deleting entries](#delete-deleting-entries)
- [`time` constants](#time-constants)
- [Extended functions](#extended-functions)
    - [`memoize`: memoizing a function](#memoize-memoizing-a-function)
    - [`invalidate`: invalidating a function's cache](#invalidate-invalidating-a-functions-cache)
    - [`statistics`: get an overview of called cache methods](#statistics-get-an-overview-of-called-cache-methods)
- [Tests](#tests)

<hr>

## Basic functions

`cache` is an interface for storing values to and retrieving values from a global object.

### `set`: caching a value

```js
import { cache } from 'a-simple-cache';
```
```js
// for one minute
cache.set('key', 'value', 60000);
```
```js
// for three minutes
cache.set('my:id', { 
    'number': 42,
    'string': 'Hello!',
}, 180000);
```

### `get`: retrieving a value

```js
cache.get('key');
'value'
```
```js
cache.get('my:id');
{ number: 42, string: 'Hello!' }
```

### `has`: checking if a key exists

```js
cache.has('key');
true
```
```js
cache.has('non-existent key');
false
```

### `isValid`: checking if an entry is valid

```js
cache.isValid('key');
true
```
```js
// one minute passes
cache.isValid('key');
false

cache.isValid('my:id');
true
```
```js
// another two minutes pass
cache.isValid('my:id');
false
```

### `keys`: listing keys of entries

```js
cache.keys();
[ 'key', 'my:id' ]
```
```js
// or use a filter
cache.keys(k => k.startsWith('my:'));
[ 'my:id' ]
```

### `delete`: deleting entries

```js
cache.clear();
```
```js
// or delete one-by-one
for (const key of cache.keys()) {
    if (!cache.isValid(key)) {
        cache.delete(key);
    }
}
```
```js
cache.keys();
[ ]
```

## `time` constants

Caching time is expressed as a number of milliseconds, but the library provides a few constants for convenience.

```js
import { time } from 'a-simple-cache';
```
```js
time.second, time.minute, time.hour
1000, 60000, 3600000

time.day, time.week, time.month
86400000, 604800000, 2592000000
```

## Extended functions

#### `memoize`: memoizing a function

`memoize` returns a wrapped function that automatically caches values returned by the original function for any given argument combination.

On subsequent calls to the memoized function, cached values will be retrieved instead of re-running the function.

It is possible to set a time-to-live for the cached values, after which the original function will run again and new values will be stored in the cache.

```js
function expensive(arg) { ... }

const memoizedExpensive = cache.memoize(expensive, time.hour);
```
```js
// runs function
memoizedExpensive(0);
```
```js
// gets value from cache
memoizedExpensive(0);
```
```js
// one hour passes
// runs function again
memoizedExpensive(0); 
```

#### `invalidate`: invalidating a function's cache

Sometimes you need to invalidate a function's cache prematurely so that the function will start to run again for all argument combinations.

```js
// gets value from cache
memoizedExpensive(0);
```
```js
cache.invalidate(memoizedExpensive);
// or 
cache.invalidate(expensive);
```
```js
// one hour has not passed
// runs function again
memoizedExpensive(0);
```

#### `statistics`: get an overview of called cache methods

```js
// call once after importing
cache.enableStatistics();
```
```js
cache.statistics();
```
```js
{
    set: 0,
    delete: 0,
    get: { hit: 0, miss: 0 },
    isValid: { true: 0, false: 0 }
}
```

## Tests

```
npm run coverage
npm run coverage:open
```

```
npm run test:mutations
npm run test:mutations:open
```
