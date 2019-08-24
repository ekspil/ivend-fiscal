const ReceiptDTO = require("../models/dto/ReceiptDTO")

class MainController {


    /**
     * constructor
     * @param receiptService {ReceiptService}
     */
    constructor({receiptService}) {
        this.receiptService = receiptService

        this.processReceipt = this.processReceipt.bind(this)
    }

    async processReceipt(request, reply) {
        const receiptDTO = new ReceiptDTO(request.body)

        const receipt = await this.receiptService.create(receiptDTO)

        return new ReceiptDTO(receipt)
    }

}

module.exports = MainController
