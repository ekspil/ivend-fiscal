class ReceiptNotFoundError extends Error {

    constructor(receiptId) {
        super()
        this.receiptId = receiptId
    }
}

module.exports = ReceiptNotFoundError
