const ReceiptDTO = require("../models/dto/ReceiptDTO")
const ReceiptNotFoundError = require("../errors/ReceiptNotFoundError")
const logger = require("my-custom-logger")

class ReceiptController {


    /**
     * constructor
     * @param receiptService {ReceiptService}
     */
    constructor({receiptService}) {
        this.receiptService = receiptService

        this.createReceipt = this.createReceipt.bind(this)
        this.getReceiptById = this.getReceiptById.bind(this)
    }

    async createReceipt(request) {
        const receiptDTO = new ReceiptDTO(request.body)

        const receipt = await this.receiptService.create(receiptDTO)

        logger.debug(`created_receipt ${JSON.stringify(receipt)}`)

        return new ReceiptDTO(receipt)
    }

    async getReceiptById(request) {
        const {id} = request.params

        const receipt = await this.receiptService.getById(id)

        if (!receipt) {
            throw new ReceiptNotFoundError(id)
        }

        return new ReceiptDTO(receipt)
    }

}

module.exports = ReceiptController
