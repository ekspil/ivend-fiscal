const FiscalData = require("../models/domain/FiscalData")
const DBUtils = require("../utils/DBUtils")

class FiscalDataDAO {

    constructor({knex}) {
        this.knex = knex

        this.create = this.create.bind(this)
    }

    /**
     *
     * @param fiscalData {FiscalData}
     * @returns {Promise<FiscalData>}
     */
    async create(fiscalData, trx) {
        const {
            extId, totalAmount, fnsSite, fnNumber, shiftNumber, receiptDatetime, fiscalReceiptNumber,
            fiscalDocumentNumber, ecrRegistrationNumber, fiscalDocumentAttribute, extTimestamp, createdAt
        } = fiscalData

        const [createdFiscalData] = await DBUtils.getKnex(this.knex, "fiscal_datas", trx)
            .returning("*")
            .insert({
                ext_id: extId,
                total_amount: totalAmount,
                fns_site: fnsSite,
                fn_number: fnNumber,
                shift_number: shiftNumber,
                receipt_date_time: receiptDatetime,
                fiscal_receipt_number: fiscalReceiptNumber,
                fiscal_document_number: fiscalDocumentNumber,
                ecr_registration_number: ecrRegistrationNumber,
                fiscal_document_attribute: fiscalDocumentAttribute,
                ext_timestamp: extTimestamp,
                created_at: createdAt
            })
            .transacting(trx)

        return new FiscalData(createdFiscalData)
    }


}

module.exports = FiscalDataDAO
