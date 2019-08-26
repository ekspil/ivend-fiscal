const FiscalData = require("../models/domain/FiscalData")
const ReceiptStatus = require("../enums/ReceiptStatus")
const UmkaAPI = require("../utils/UmkaAPI")
const DateUtils = require("../utils/DateUtils")

class FiscalService {

    /**
     *
     * @param receiptDAO {ReceiptDAO}
     * @param fiscalDataDAO {FiscalDataDAO}
     */
    constructor({receiptDAO, fiscalDataDAO}) {
        this.receiptDAO = receiptDAO
        this.fiscalDataDAO = fiscalDataDAO

        this.handleFiscalizationResult = this.handleFiscalizationResult.bind(this)
    }

    async handleFiscalizationResult(receipt, uuid) {
        const report = await UmkaAPI.getReport(uuid)

        const {payload, timestamp} = report

        const {
            total, fns_site, fn_number, shift_number, receipt_datetime, fiscal_receipt_number,
            fiscal_document_number, ecr_registration_number, fiscal_document_attribute
        } = payload

        const fiscalData = new FiscalData({})

        fiscalData.extId = uuid
        fiscalData.totalAmount = total
        fiscalData.fnsSite = fns_site
        fiscalData.fnNumber = fn_number
        fiscalData.shiftNumber = shift_number
        fiscalData.receiptDatetime = DateUtils.getDateFromStr(receipt_datetime),
        fiscalData.fiscalReceiptNumber = fiscal_receipt_number
        fiscalData.fiscalDocumentNumber = fiscal_document_number
        fiscalData.ecrRegistrationNumber = ecr_registration_number
        fiscalData.fiscalDocumentAttribute = fiscal_document_attribute
        fiscalData.extTimestamp = new Date(timestamp)
        fiscalData.createdAt = new Date()


        await this.receiptDAO.knex.transaction(async (trx) => {
            const {id} = await this.fiscalDataDAO.create(fiscalData, trx)

            await this.receiptDAO.setFiscalDataId(receipt.id, id, trx)

            await this.receiptDAO.setStatus(receipt.id, ReceiptStatus.SUCCESS, trx)
        })
    }
}

module.exports = FiscalService
