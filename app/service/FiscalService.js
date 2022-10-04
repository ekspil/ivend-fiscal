const FiscalData = require("../models/domain/FiscalData")
const ReceiptStatus = require("../enums/ReceiptStatus")
const UmkaAPI = require("../utils/UmkaAPI")
const RekassaAPI = require("../utils/RekassaAPI")
const DateUtils = require("../utils/DateUtils")
const logger = require("my-custom-logger")

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
        this.handleFiscalizationResultRekassa = this.handleFiscalizationResultRekassa.bind(this)
        this.handleFiscalizationResultTelemedia = this.handleFiscalizationResultTelemedia.bind(this)
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

        let operation = false

        try {
            await this.receiptDAO.knex.transaction(async (trx) => {

                const {id} = await this.fiscalDataDAO.create(fiscalData, trx)

                await this.receiptDAO.setFiscalDataId(receipt.id, id, trx)

                await this.receiptDAO.setStatus(receipt.id, ReceiptStatus.SUCCESS, trx)
                operation = true
            })
        }
        catch (e) {
            logger.debug(`FISCAL_DB_INSERT_ERROR ${e.message} ${JSON.stringify(fiscalData)}`)
        }

        if(!operation){

            try {
                await this.receiptDAO.knex.transaction(async (trx) => {

                    const {id} = await this.fiscalDataDAO.findByExt(uuid, trx)

                    await this.receiptDAO.setFiscalDataId(receipt.id, id, trx)

                    await this.receiptDAO.setStatus(receipt.id, ReceiptStatus.SUCCESS, trx)
                })
            }
            catch (e) {
                logger.debug(`FISCAL_DB_SELECT_ERROR ${e.message} ${JSON.stringify(fiscalData)}`)
            }

        }



        return fiscalData
    }

    async handleFiscalizationResultRekassa(receipt, result) {
        const report = await RekassaAPI.getReport(result, receipt)

        const {payload, timestamp} = report

        const {
            total, fns_site, fn_number, shift_number, receipt_datetime, fiscal_receipt_number,
            fiscal_document_number, ecr_registration_number, fiscal_document_attribute
        } = payload

        const fiscalData = new FiscalData({})

        fiscalData.extId = result.uuid
        fiscalData.totalAmount = total
        fiscalData.fnsSite = fns_site
        fiscalData.fnNumber = fn_number
        fiscalData.shiftNumber = shift_number
        fiscalData.receiptDatetime = new Date(receipt_datetime),
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

        return fiscalData
    }
    async handleFiscalizationResultTelemedia(receipt, result) {
        //const report = await RekassaAPI.getReport(result, receipt)

        const {created_at, total_amount, link, uuid, check_number, shift, check_type} = result

        let timestamp = created_at.split(" ")
        timestamp[0] = timestamp[0].split(".").reverse().join("-")
        timestamp = timestamp.join("T") + ":00"

        const fiscalData = new FiscalData({})

        fiscalData.extId = uuid
        fiscalData.totalAmount = total_amount
        fiscalData.fnsSite = link
        fiscalData.fnNumber = check_number
        fiscalData.shiftNumber = shift
        fiscalData.receiptDatetime = new Date(timestamp)
        fiscalData.fiscalReceiptNumber = uuid
        fiscalData.fiscalDocumentNumber = check_number
        fiscalData.ecrRegistrationNumber = link
        fiscalData.fiscalDocumentAttribute = check_type
        fiscalData.extTimestamp = new Date(timestamp)
        fiscalData.createdAt = new Date()


        await this.receiptDAO.knex.transaction(async (trx) => {
            const {id} = await this.fiscalDataDAO.create(fiscalData, trx)

            await this.receiptDAO.setFiscalDataId(receipt.id, id, trx)

            await this.receiptDAO.setStatus(receipt.id, ReceiptStatus.SUCCESS, trx)
        })

        return fiscalData
    }
}

module.exports = FiscalService
