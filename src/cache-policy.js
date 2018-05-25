const ms = require('ms')

class CachePolicy {
    constructor(keyParts, ttl, reloadBefore, fields) {
        this.key = keyParts.join(':')
        this.ttl = typeof ttl === 'string' ? ms(ttl) / 1000 : ttl
        this.reloadBefore = reloadBefore
        this.lockKey = `${this.key}:lock`
        this.fields = fields
    }
}

module.exports = CachePolicy
