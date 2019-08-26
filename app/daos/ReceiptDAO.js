const Receipt = require("../models/domain/Receipt")
const ReceiptStatus = require("../enums/ReceiptStatus")


class ReceiptDAO {

    constructor({knex}) {
        this.knex = knex

        this.create = this.create.bind(this)
        this.getById = this.getById.bind(this)
        this.getFirstPending = this.getFirstPending.bind(this)
        this.setFiscalDataId = this.setFiscalDataId.bind(this)
        this.setStatus = this.setStatus.bind(this)
    }

    /**
     *
     * @param receipt {ReceiptDTO}
     * @returns {Promise<Receipt>}
     */
    async create(receipt) {
        const {email, sno, inn, place, itemName, itemPrice, paymentType, kktRegNumber} = receipt

        const [createdReceipt] = await this.knex("receipts")
            .returning("*")
            .insert({
                email,
                sno,
                inn,
                place,
                kkt_reg_number: kktRegNumber,
                item_name: itemName,
                item_price: itemPrice,
                payment_type: paymentType,
                status: ReceiptStatus.PENDING,
                created_at: new Date()
            })

        return new Receipt(createdReceipt)
    }

    /**
     *
     * @param receiptId {number}
     * @returns {Promise<Receipt>}
     */
    async getById(receiptId) {
        const [receipt] = await this.knex("receipts").where({id: receiptId})

        if (!receipt) {
            return null
        }

        return new Receipt(receipt)
    }

    /**
     *
     * @returns {Promise<Receipt>}
     */
    async getFirstPending() {
        const [receipt] = await this.knex("receipts")
            .where({status: ReceiptStatus.PENDING})
            .orderBy("id", "ASC")
            .select("*")
            .limit(1)

        if (!receipt) {
            return null
        }

        return new Receipt(receipt)
    }

    /**
     *
     * @returns {Promise<Receipt>}
     */
    async setFiscalDataId(receiptId, fiscalDataId, trx) {
        const [receipt] = await this.knex("receipts")
            .where({id: receiptId})
            .update({
                fiscal_data_id: fiscalDataId
            })
            .transacting(trx)
            .returning("*")

        if (!receipt) {
            return null
        }

        return new Receipt(receipt)
    }

    /**
     *
     * @param receiptId {number}
     * @param status {ReceiptStatus}
     * @param trx
     * @returns {Promise<*>}
     */
    async setStatus(receiptId, status, trx) {
        const [receipt] = await this.knex("receipts")
            .where({id: receiptId})
            .update({
                status
            })
            .transacting(trx)
            .returning("*")

        if (!receipt) {
            return null
        }

        return new Receipt(receipt)
    }
}

module.exports = ReceiptDAO
