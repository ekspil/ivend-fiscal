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
        this.getControllerKktInfo = this.getControllerKktInfo.bind(this)
        this.getKktInfo = this.getKktInfo.bind(this)
        this.getStatuses = this.getStatuses.bind(this)
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
     * @param receipt {Receipt}
     * @returns {Promise<Receipt>}
     */
    async getStatuses(ids) {
        // todo Validate

        const receipts = await this.receiptDAO.getStatuses(ids)
        if(!receipts) return []
        const statuses = receipts.map(r => {
            return {
                id: r.id,
                status: r.status
            }
        })
        return statuses
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
    async getKktInfo(kktRegNumber) {
        return await this.receiptDAO.getKktInfo(kktRegNumber)
    }

    /**
     *
     * @returns {Promise<Receipt>}
     */
    async getControllerKktInfo(controllerUid) {
        return await this.receiptDAO.getControllerKktInfo(controllerUid)
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


    /**
     *
     * @returns {Promise<Receipt>}
     */
    async setErrorToPending() {
        return await this.receiptDAO.setErrorToPending()
    }

    async setStatus(receiptId, status, trx) {
        return await this.receiptDAO.setStatus(receiptId, status, trx)
    }


    async setStatusNoRepeat(receiptId, status, trx) {
        return await this.receiptDAO.setStatusNoRepeat(receiptId, status, trx)
    }

}

module.exports = ReceiptService
