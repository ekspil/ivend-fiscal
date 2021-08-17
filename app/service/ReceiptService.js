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
    async getById(receiptId) {
        return await this.receiptDAO.getById(receiptId)
    }

    /**
     *
     * @returns {Promise<Receipt>}
     */
    async getFirstPending() {
        return await this.receiptDAO.getFirstPending()
    }

    /**
     *
     * @returns {Promise<Receipt>}
     */
    async getRandomPending() {
        return await this.receiptDAO.getRandomPending()
    }


    /**
     *
     * @returns {Promise<Receipt>}
     */
    async getAllPending() {
        return await this.receiptDAO.getAllPending()
    }

    async setStatus(receiptId, status, trx) {
        return await this.receiptDAO.setStatus(receiptId, status, trx)
    }

}

module.exports = ReceiptService
