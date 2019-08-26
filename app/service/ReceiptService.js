const logger = require("my-custom-logger")

class ReceiptService {

    /**
     *
     * @param receiptDAO {ReceiptDAO}
     */
    constructor({receiptDAO}) {
        this.receiptDAO = receiptDAO

        this.create = this.create.bind(this)
        this.getFirstPending = this.getFirstPending.bind(this)
        this.setStatus = this.setStatus.bind(this)
    }

    /**
     *
     * @param receipt {Receipt}
     * @returns {Promise<Receipt>}
     */
    async create(receipt) {
        // todo Validate

        return await this.receiptDAO.create(receipt)
    }

    /**
     *
     * @returns {Promise<Receipt>}
     */
    async getFirstPending() {
        return await this.receiptDAO.getFirstPending()
    }

    async setStatus(receiptId, status, trx) {
        return await this.receiptDAO.setStatus(receiptId, status, trx)
    }

}

module.exports = ReceiptService
