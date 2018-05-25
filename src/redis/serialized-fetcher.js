const BaseFetcher = require('./base-fetcher')

class SerializedFetcher extends BaseFetcher {
    async setCache(policy, value) {
        return this.redis.set(
            policy.key,
            JSON.stringify(value),
            'EX',
            policy.ttl
        )
    }

    async getCache(policy) {
        return this.redis.get(policy.key).then(JSON.parse)
    }
}

module.exports = SerializedFetcher
