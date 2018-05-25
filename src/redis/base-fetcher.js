const debug = require('debug')('cached-execute:base-fetcher')
const Promise = require('bluebird')

class BaseFetcher {
    constructor(redis, redlock, opts) {
        this.redis = redis
        this.redlock = redlock
        this.opts = opts
    }

    async execute(policy, loadFn, loadFnArgs) {
        const fetchFn = loadFnArgs ? loadFn.bind(null, ...loadFnArgs) : loadFn

        const id = Math.ceil(Math.random() * 10000000)
        return this.goFetch(id, policy, fetchFn)
    }

    // eslint-disable-next-line
    setCache() {
        throw new Error('not implemented')
    }

    // eslint-disable-next-line
    getCache() {
        throw new Error('not implemented')
    }

    async lockAndLoad(id, policy, loadFn) {
        debug('lockAndLoad')
        let lock
        try {
            lock = await this.redlock.lock(
                policy.lockKey,
                this.opts.lockIntervalMs
            )
        } catch (err) {
            debug('lockAndLoad unable to get lock err, delay and retry', err)
            await Promise.delay(this.opts.retryIntervalMs)
            return this.goFetch(id, policy, loadFn)
        }

        const value = await loadFn()
        const setCachePromise = value
            ? this.setCache(policy, value)
            : Promise.resolve()

        await setCachePromise
        await lock.unlock()
        return value
    }

    async goFetch(id, policy, loadFn) {
        const value = await this.getCache(policy)
        if (value) {
            debug('found in cache => return')
            this.reloadIfExpiring(id, policy, loadFn)
            return value
        }

        debug('missing in cache => lock and load')
        return this.lockAndLoad(id, policy, loadFn)
    }

    async reloadIfExpiring(id, policy, loadFn) {
        if (policy.reloadBefore) {
            try {
                const ttl = await this.redis.ttl(policy.key)
                if (ttl < policy.reloadBefore) {
                    debug('reloading', ttl, policy.reloadBefore)
                    this.lockAndLoad(id, policy, loadFn)
                }
            } catch (err) {
                debug('reloadIfExpiring err', err)
            }
        }
    }
}

module.exports = BaseFetcher
