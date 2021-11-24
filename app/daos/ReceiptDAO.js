const Receipt = require("../models/domain/Receipt")
const FiscalData = require("../models/domain/FiscalData")
const ReceiptStatus = require("../enums/ReceiptStatus")
const DBUtils = require("../utils/DBUtils")


class ReceiptDAO {

    constructor({knex}) {
        this.knex = knex

        this.create = this.create.bind(this)
        this.getById = this.getById.bind(this)
        this.getFirstPending = this.getFirstPending.bind(this)
        this.getAllPending = this.getAllPending.bind(this)
        this.setErrorToPending = this.setErrorToPending.bind(this)
        this.getRandomPending = this.getRandomPending.bind(this)
        this.setFiscalDataId = this.setFiscalDataId.bind(this)
        this.setStatus = this.setStatus.bind(this)
        this.getControllerKktInfo= this.getControllerKktInfo.bind(this)
        this.getKktInfo = this.getKktInfo.bind(this)
    }


    /**
     *
     * @param receipt {ReceiptDTO}
     * @returns {Promise<Receipt>}
     */
    async create(receipt, trx) {
        const {email, controllerUid, sno, inn, place, itemName, itemType, itemPrice, paymentType, kktRegNumber, rekassa_password, rekassa_number, rekassa_kkt_id} = receipt

        const [createdReceipt] = await DBUtils.getKnex(this.knex, "receipts", trx)
            .returning("*")
            .insert({
                email,
                sno,
                inn,
                place,
                rekassa_password,
                rekassa_number,
                rekassa_kkt_id,
                controller_uid: controllerUid,
                kkt_reg_number: kktRegNumber,
                item_name: itemName,
                item_price: itemPrice,
                item_type: itemType,
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
    async getById(receiptId, trx) {
        const [receipt] = await DBUtils.getKnex(this.knex, "receipts", trx)
            .where({"receipts.id": receiptId})
            .leftJoin("fiscal_datas", "receipts.fiscal_data_id", "fiscal_datas.id")
            .select(`receipts.id as receipt_id`)
            .select(`fiscal_datas.id as fiscal_data_id`)
            .select(`controller_uid`)
            .select(`ext_id`)
            .select(`total_amount`)
            .select(`fns_site`)
            .select(`fn_number`)
            .select(`shift_number`)
            .select(`receipt_date_time`)
            .select(`fiscal_receipt_number`)
            .select(`fiscal_document_number`)
            .select(`ecr_registration_number`)
            .select(`fiscal_document_attribute`)
            .select(`ext_timestamp`)
            .select(`fiscal_datas.created_at as f_created_at`)
            .select(`email`)
            .select(`sno`)
            .select(`inn`)
            .select(`place`)
            .select(`item_name`)
            .select(`item_price`)
            .select(`payment_type`)
            .select(`kkt_reg_number`)
            .select(`status`)
            .select(`receipts.created_at as r_created_at`)
            .select(`item_type`)

        if (!receipt) {
            return null
        }

        const fiscalData = new FiscalData({...receipt, id: receipt.fiscal_data_id, createdAt: receipt.f_create_at})

        return new Receipt({...receipt, createdAt: receipt.r_created_at, id: receipt.receipt_id, fiscalData: (fiscalData && fiscalData.id) ? fiscalData : null})
    }

    /**
     *
     * @returns {Promise<Receipt>}
     */
    async getFirstPending() {
        const [receipt] = await (DBUtils.getKnex(this.knex, "receipts")
            .where({status: ReceiptStatus.PENDING})
            .orderBy("id", "ASC")
            .select("*")
            .limit(1))

        if (!receipt) {
            return null
        }

        return new Receipt(receipt)
    }

    /**
     *
     * @returns {Promise<Receipt>}
     */
    async getControllerKktInfo(controllerUid) {
        const [receipt] = await (DBUtils.getKnex(this.knex, "receipts")
            .where({controller_uid: controllerUid, status: ReceiptStatus.SUCCESS})
            .orderBy("id", "DESC")
            .select("*")
            .limit(1))

        if (!receipt) {
            return null
        }

        return new Receipt(receipt)
    }

    /**
     *
     * @returns {Promise<Receipt>}
     */
    async getKktInfo(kktRegNumber) {
        const [receipt] = await (DBUtils.getKnex(this.knex, "receipts")
            .where({kkt_reg_number: kktRegNumber, status: ReceiptStatus.SUCCESS})
            .leftJoin("fiscal_datas", "receipts.fiscal_data_id", "fiscal_datas.id")
            .select(`receipts.id as receipt_id`)
            .select(`fiscal_datas.id as fiscal_data_id`)
            .select(`ext_id`)
            .select(`fiscal_document_number`)
            .select(`ext_timestamp`)
            .select(`kkt_reg_number`)
            .select(`status`)
            .select(`receipts.created_at as created_at`)
            .select(`item_type`)
            .orderBy("receipts.id", "DESC")
            .limit(1))

        if (!receipt) {
            return null
        }

        return receipt
    }
    /**
     *
     * @returns {Promise<Receipt>}
     */
    async getAllPending() {
        const receipts = await (DBUtils.getKnex(this.knex, "receipts")
            .select("*")
            .where({status: ReceiptStatus.PENDING})
            .orderBy("id", "desc"))


        if(!receipts || !receipts.length) {
            return null
        }

        return receipts.map(receipt => new Receipt(receipt))
    }
    /**
     *
     * @returns {Promise<Receipt>}
     */
    async getStatuses(ids) {

        const Ids = ids.filter(i => i)
        const receipts = await (DBUtils.getKnex(this.knex, "receipts")
            .select("*")
            .whereIn("id", Ids)
            .orderBy("id", "desc"))


        if(!receipts || !receipts.length) {
            return null
        }

        return receipts.map(receipt => new Receipt(receipt))
    }
    /**
     *
     * @returns {Promise<Receipt>}
     */
    async setErrorToPending() {
        const lastTime = new Date(new Date().getTime() - 86400000)


        await (DBUtils.getKnex(this.knex, "receipts")

            .whereNull("not_repeat"))
            .andWhere({status: ReceiptStatus.ERROR})
            .andWhere("created_at", ">", lastTime)
            .update({status: ReceiptStatus.PENDING})


    }

    /**
     *
     * @returns {Promise<Receipt>}
     */
    async getRandomPending() {
        const [receipt] = await (DBUtils.getKnex(this.knex, "receipts")
            .where({status: ReceiptStatus.PENDING})
            .orderByRaw("RANDOM()")
            .select("*")
            .limit(1))

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
        const [receipt] = await DBUtils.getKnex(this.knex, "receipts", trx)
            .where({id: receiptId})
            .update({
                fiscal_data_id: fiscalDataId
            })
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
        const [receipt] = await DBUtils.getKnex(this.knex, "receipts", trx)
            .where({id: receiptId})
            .update({
                status
            })
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
    async setStatusNoRepeat(receiptId, status, trx) {
        await DBUtils.getKnex(this.knex, "receipts", trx)
            .where({id: receiptId})
            .update({
                status,
                not_repeat: true
            })
    }
}

module.exports = ReceiptDAO
