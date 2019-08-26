const Receipt = require("../models/domain/Receipt")
const ReceiptStatus = require("../enums/ReceiptStatus")

class ReceiptDAO {

    constructor({knex}) {
        this.knex = knex
    }

    /**
     *
     * @param receipt {ReceiptDTO}
     * @returns {Promise<Receipt>}
     */
    async create(receipt) {
        const {email, sno, inn, place, itemName, itemPrice, paymentType, fiscalData, status, createdAt} = receipt

        const [createdReceipt]  = await this.knex("receipts")
            .returning("*")
            .insert({
                email,
                sno,
                inn,
                place,
                item_name: itemName,
                item_price: itemPrice,
                payment_type: paymentType,
                status: ReceiptStatus.PENDING,
                created_at: new Date()
            })

        return new Receipt({...createdReceipt, createdAt: createdReceipt.created_at})
    }
}

module.exports = ReceiptDAO
