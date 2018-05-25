const debug = require('debug')('cached-execute:index')
const Redis = require('ioredis')
const Redlock = require('redlock')
const CachePolicy = require('./cache-policy')
const StringFetcher = require('./redis/string-fetcher')
const SerializedFetcher = require('./redis/serialized-fetcher')
const HashFetcher = require('./redis/hash-fetcher')

class CachedExecute {
    constructor(redisOpts, redlockOpts, opts) {
        const redlockDefaultOpts = { retryCount: 0 }
        const defaultOpts = { lockIntervalMs: 1000, retryIntervalMs: 50 }

        this.redis = new Redis(redisOpts)
        this.redlock = new Redlock(
            [this.redis],
            Object.assign({}, redlockDefaultOpts, redlockOpts)
        )
        this.opts = Object.assign({}, defaultOpts, opts)

        this.redis.on('connected', () => debug('connected to redis'))
        this.redis.on('error', err =>
            debug(`redis connection failed: ${err.message}`)
        )

        this.stringFetcher = new StringFetcher(
            this.redis,
            this.redlock,
            this.opts
        )
        this.serializedFetcher = new SerializedFetcher(
            this.redis,
            this.redlock,
            this.opts
        )
        this.hashFetcher = new HashFetcher(this.redis, this.redlock, this.opts)
    }

    async asString(policy, loadFn, loadFnArgs) {
        return this.stringFetcher.execute(policy, loadFn, loadFnArgs)
    }

    async asSerialized(policy, loadFn, loadFnArgs) {
        return this.serializedFetcher.execute(policy, loadFn, loadFnArgs)
    }

    async asHash(policy, loadFn, loadFnArgs) {
        return this.hashFetcher.execute(policy, loadFn, loadFnArgs)
    }
}

module.exports = { CachedExecute, CachePolicy }
