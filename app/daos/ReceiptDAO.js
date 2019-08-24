const Receipt = require("../models/Receipt")

class ReceiptDAO {

    constructor({knex}) {
        this.knex = knex
    }

    /**
     *
     * @param receipt
     * @returns {Promise<Receipt>}
     */
    async create(receipt) {
        const {name, price} = receipt

        const [createdReceipt]  = await this.knex("receipts")
            .returning("*")
            .insert({
                name,
                price,
                created_at: new Date(),
            })

        return new Receipt(createdReceipt)
    }
}

module.exports = ReceiptDAO
