const ReceiptDTO = require("../models/dto/ReceiptDTO")

class ReceiptController {


    /**
     * constructor
     * @param receiptService {ReceiptService}
     */
    constructor({receiptService}) {
        this.receiptService = receiptService

        this.createReceipt = this.createReceipt.bind(this)
    }

    async createReceipt(request) {
        const receiptDTO = new ReceiptDTO(request.body)

        const receipt = await this.receiptService.create(receiptDTO)

        return new ReceiptDTO(receipt)
    }

}

module.exports = ReceiptController
