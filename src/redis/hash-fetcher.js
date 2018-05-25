const BaseFetcher = require('./base-fetcher')
const isEmpty = require('lodash.isempty')

function mapHash(values, fields) {
    const hash = {}

    fields.forEach((field, index) => {
        const value = values[index]
        if (value) {
            hash[field] = value
        }
    })

    return hash
}

class HashFetcher extends BaseFetcher {
    async setCache(policy, value) {
        await this.redis.hmset(policy.key, value)
        await this.redis.expire(policy.key, policy.ttl)
    }

    async getCache(policy) {
        let reply
        if (policy.fields) {
            reply = await this.redis
                .hmget(policy.key, policy.fields)
                .then(val => mapHash(val, policy.fields))
        } else {
            reply = await this.redis.hgetall(policy.key)
        }
        if (isEmpty(reply)) return null
        return reply
    }
}

module.exports = HashFetcher
