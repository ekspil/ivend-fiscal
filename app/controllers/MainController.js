const receiptTemplate = require("../templates/receipt.tpl")

class MainController {


    constructor({queueStorage}) {
        this.queueStorage = queueStorage

        this.getItemFromQueue = this.getItemFromQueue.bind(this)
        this.insertJob = this.insertJob.bind(this)
        this.removeLastJob = this.removeLastJob.bind(this)
    }


    async processReceipt(request, reply) {
        const {remotePrinterId} = request.params

        const job = await this.queueStorage.getFirst(remotePrinterId)

        if (!job) {
            return reply.code(404).send()
        }

        const {replacements} = job

        const html = await receiptTemplate.render(replacements)

        return reply.type("application/json").code(200).send({replacements, html})
    }

    async insertJob(request, reply) {
        const {remotePrinterId} = request.params
        const {replacements} = request.body

        await this.queueStorage.insert(remotePrinterId, {replacements})

        return reply.code(200).send()
    }

    async removeLastJob(request, reply) {
        const {remotePrinterId} = request.params

        await this.queueStorage.removeFirst(remotePrinterId)

        return reply.code(200).send()
    }


}

module.exports = MainController
