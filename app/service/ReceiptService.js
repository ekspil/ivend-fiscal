const logger = require("my-custom-logger")

class ReceiptService {

    /**
     *
     * @param receiptDAO {ReceiptDAO}
     */
    constructor({receiptDAO}) {
        this.receiptDAO = receiptDAO

        this.create = this.create.bind(this)
    }

    /**
     *
     * @param receiptDto {ReceiptDTO}
     * @returns {Promise<Receipt>}
     */
    async create(receiptDto) {
        // todo Valida
        // te

        return await this.receiptDAO.create(receiptDto)
    }

}

module.exports = ReceiptService
