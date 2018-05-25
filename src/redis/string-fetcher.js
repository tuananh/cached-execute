const BaseFetcher = require('./base-fetcher')

class StringFetcher extends BaseFetcher {
    async setCache(policy, value) {
        return this.redis.set(policy.key, value, 'EX', policy.ttl)
    }

    async getCache(policy) {
        return this.redis.get(policy.key)
    }
}

module.exports = StringFetcher
