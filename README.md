<h1><pre>a-simple-cache</pre></h1>


[![Travis CI Build Status](https://travis-ci.com/karniol/a-simple-cache.svg?branch=master)](https://travis-ci.com/karniol/a-simple-cache) [![Codecov Code Coverage](https://codecov.io/gh/karniol/a-simple-cache/branch/master/graph/badge.svg)](https://codecov.io/gh/karniol/a-simple-cache) [![a-simple-cache on npm](https://img.shields.io/npm/v/a-simple-cache.svg)](https://npmjs.com/package/a-simple-cache)

<hr>

Simple in-memory cache with additional utilities.

<hr>

- [`Cache`](#cache)
  - [Caching a value](#caching-a-value)
  - [Retrieving a value](#retrieving-a-value)
  - [Checking if a key exists](#checking-if-a-key-exists)
  - [Checking if an entry is valid](#checking-if-an-entry-is-valid)
  - [Listing keys of entries](#listing-keys-of-entries)
  - [Deleting entries](#deleting-entries)
- [Utilities](#utilities)
  - [`time`](#time)
  - [`Memoize`](#memoize)
    - [Memoizing a function with `it`](#memoizing-a-function-with-it)
    - [Invalidating a function's cache with `invalidate`](#invalidating-a-functions-cache-with-invalidate)
- [Tests](#tests)

<hr>

## `Cache`

`Cache` is a low-level interface for storing values to and retrieving values from a global object.

### Caching a value

```ts
import { Cache } from 'a-simple-cache';
```
```ts
// for one minute
Cache.set('key', 'value', 60000);

// for three minutes
Cache.set('my:id', { 
    'number': 42,
    'string': 'Hello!',
}, 180000);
```

### Retrieving a value

```ts
Cache.get('key');
'value'

Cache.get('my:id');
{ 'number': 42, 'string': 'Hello!' }
```

### Checking if a key exists

```ts
Cache.has('key');
true

Cache.has('non-existent key');
false
```

### Checking if an entry is valid

```ts
Cache.isValid('key');
true

// one minute passes

Cache.isValid('key');
false

Cache.isValid('my:id');
true

// another two minutes pass

Cache.isValid('my:id');
false
```

### Listing keys of entries

```ts
Cache.keys();
[ 'key', 'my:id' ]

// or use a filter

Cache.keys(k => k.startsWith('my:'));
[ 'my:id' ]
```

### Deleting entries

```ts
Cache.clear();

// or 

for (const key of Cache.keys()) {
    if (!Cache.isValid(key)) {
        Cache.delete(key);
    }
}

Cache.keys();
[ ]
```

## Utilities

### `time`

Caching time is expressed as a number of milliseconds, but the library provides a few constants for convenience.

```ts
import { time } from 'a-simple-cache';
```
```ts
time.second, time.minute, time.hour
1000, 60000, 3600000

time.day, time.week, time.month
86400000, 604800000, 2592000000
```

### `Memoize`

`Memoize` is a function wrapper that automatically caches values returned by the function for any given argument combination.

#### Memoizing a function with `it`

```ts
import { Memoize } from 'a-simple-cache';
```
```ts
function expensive(arg) { ... }

const memoizedExpensive = Memoize.it(expensive, time.hour);
```
```ts
// runs function
memoizedExpensive(0);

// gets value from cache
memoizedExpensive(0);

// one hour passes
// runs function again
memoizedExpensive(0); 
```

#### Invalidating a function's cache with `invalidate`

Sometimes you need to invalidate a function's cache prematurely so that the function will start to run again for all argument combinations.

```ts
// gets value from cache
memoizedExpensive(0);

Memoize.invalidate(memoizedExpensive);
// or 
Memoize.invalidate(expensive);

// one hour has not passed
// runs function again
memoizedExpensive(0);
```

## Tests

```
npm test
npm run coverage
```
