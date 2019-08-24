const logger = require("my-custom-logger")

class FiscalService {

    /**
     *
     * @param receiptDAO {ReceiptDAO}
     */
    constructor({receiptDAO}) {
        this.receiptDAO = receiptDAO

        this.create = this.create.bind(this)
    }

    async getToken() {

    }

    /**
     *
     * @param receiptDto {ReceiptDTO}
     * @returns {Promise< Receipt>}
     */
    async sendReceipt(receiptDto) {
        // todo Validate

        return await this.receiptDAO.create(receiptDto)
    }

    /**
     *
     * @param receiptDto {ReceiptDTO}
     * @returns {Promise<Receipt>}
     */
    async getStatus(id) {
        // todo Validate
        const response = await fetch(`https://${serverUrl}/kkm-trade/atolpossystem/v4/any/report/${id}?token=${token}`)

    }

    async getToken() {
        const response = await fetch(`https://${serverUrl}/kkm-trade/atolpossystem/v4/any/report/${id}?token=${token}`)

    }

}

module.exports = ReceiptService
