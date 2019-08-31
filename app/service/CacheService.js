class CacheService {

    /**
     *
     * @param redis {Redis}
     */
    constructor({redis}) {
        this.redis = redis

        this.get = this.get.bind(this)
        this.set = this.set.bind(this)
        this.flush = this.flush.bind(this)
    }

    async get(key) {
        return await this.redis.get(key)
    }

    /**
     *
     * @param key {string}
     * @param value {string}
     * @param timeoutSeconds {number}
     * @returns {Promise<void>}
     */
    async set(key, value, timeoutSeconds) {
        if (timeoutSeconds) {
            await this.redis.set(key, value, "ex", timeoutSeconds)
            return
        }
        await this.redis.set(key, value)
    }

    async flush(key) {
        await this.redis.del(key)
    }
}

module.exports = CacheService
