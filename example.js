const Promise = require('bluebird')
const { CachedExecute, CachePolicy } = require('./src')

const cachedExecute = new CachedExecute({
    host: '127.0.0.1',
    port: 6379,
    keyPrefix: 'test:'
})

// asString example
const policy = new CachePolicy(['item', 1], 60, 30)
function stringPromise() {
    return Promise.delay(100).then(() => 'hello world')
}
cachedExecute
    .asString(policy, stringPromise)
    .then(val => console.log('asString', val))

// asSerialized example
const serializedPolicy = new CachePolicy(['item', 2], '1m', 30)
function objectPromise() {
    return Promise.delay(100).then(() => ({ hello: 'world', foo: 'bar' }))
}
cachedExecute
    .asSerialized(serializedPolicy, objectPromise)
    .then(val => console.log('asSerialized', val))

// asHash example
const hashPolicy = new CachePolicy(['item', 3], 60, 30, ['foo'])
cachedExecute
    .asHash(hashPolicy, objectPromise)
    .then(val => console.log('asHash', val))
