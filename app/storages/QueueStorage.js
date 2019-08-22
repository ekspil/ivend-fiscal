const jobs_key = "printer_jobs"
const logger = require("my-custom-logger")

class QueueStorage {

    constructor({redis}) {
        this.redis = redis
        this.queue = []

        this.getFirst = this.getFirst.bind(this)
        this.insert = this.insert.bind(this)
        this.removeFirst = this.removeFirst.bind(this)
    }

    async getFirst(remotePrinterId) {
        const item = await this.redis.lindex(`${jobs_key}_${remotePrinterId}`, 0)
        return JSON.parse(item)
    }

    async insert(remotePrinterId, item) {
        const key = `${jobs_key}_${remotePrinterId}`
        const str = JSON.stringify(item)
        logger.debug(`Inserting at ${key}: ${str}`)
        await this.redis.rpush(key, str)
    }

    async removeFirst(remotePrinterId) {
        const key = `${jobs_key}_${remotePrinterId}`
        const firstItem = await this.getFirst()
        logger.debug(`Removing ${key}: ` + JSON.stringify(firstItem))
        await this.redis.lpop(key)
    }

}

module.exports = QueueStorage
