# cached-execute

[![npm version](https://badge.fury.io/js/cached-execute.svg)](https://badge.fury.io/js/cached-execute)

> lock and load

Forked of [advanced-cache](https://github.com/HotelQuickly/advanced-cache). For personal use. I plan to gradually add features as I see fit.

## Install

```sh
yarn add cached-execute
# npm install cached-execute
```

## Example

```js
const Promise = require('bluebird')
const { CachedExecute, CachePolicy } = require('./src')

const cache = new CachedExecute({
    host: '127.0.0.1',
    port: 6379,
    keyPrefix: 'test:'
})

// asString example
const policy = new CachePolicy(['item', 1], 60, 30)
function stringPromise() {
    return Promise.delay(100).then(() => 'hello world')
}
cache.asString(policy, stringPromise).then(val => console.log('asString', val))

// asSerialized example
const serializedPolicy = new CachePolicy(['item', 2], '1m', 30)
function objectPromise() {
    return Promise.delay(100).then(() => ({ hello: 'world', foo: 'bar' }))
}
cache.asSerialized(serializedPolicy, objectPromise).then(val => console.log('asSerialized', val))

// asHash example
const hashPolicy = new CachePolicy(['item', 3], 60, 30, ['foo'])
cache.asHash(hashPolicy, objectPromise).then(val => console.log('asHash', val))
```

Output

```
asString hello world
asSerialized { hello: 'world', foo: 'bar' }
asHash { hello: 'world', foo: 'bar' }
```