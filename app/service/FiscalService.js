const FiscalData = require("../models/domain/FiscalData")
const ReceiptStatus = require("../enums/ReceiptStatus")
const UmkaAPI = require("../utils/UmkaAPI")
const UmkaNewAPI = require("../utils/UmkaNewAPI")
const RekassaAPI = require("../utils/RekassaAPI")
const OrangeAPI = require("../utils/OrangeAPI")
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
        this.handleFiscalizationResultUmka = this.handleFiscalizationResultUmka.bind(this)
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
        fiscalData.fiscalDocumentNumber = fiscal_document_number || 1
        fiscalData.ecrRegistrationNumber = ecr_registration_number
        fiscalData.fiscalDocumentAttribute = fiscal_document_attribute || 1
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
    async handleFiscalizationResultUmka(receipts) {
        if(receipts.length < 1) return
        const reports = await UmkaNewAPI.getReport(receipts)

        for (let receipt of receipts){
            const {id, controllerUid} = receipt


            const externalId = `IVEND-receipt-${id}-${controllerUid}`

            const report = reports.find(it => it.externalId === externalId)
            if(!report) continue
            if(report.state === "waiting") continue
            if(report.state !== "success"){
                await this.receiptDAO.knex.transaction(async (trx) => {
                    await this.receiptDAO.setStatus(receipt.id, ReceiptStatus.ERROR, trx)
                })
                continue

            }


            const {fisc} = report

            const {
                total, fnsSite, fnNumber, shiftNumber, receiptDatetime, fiscalReceiptNumber,
                fiscalDocumentNumber, ecrRegistrationNumber, fiscalDocumentAttribute
            } = fisc

            const fiscalData = new FiscalData({})

            fiscalData.extId = externalId
            fiscalData.totalAmount = total
            fiscalData.fnsSite = fnsSite
            fiscalData.fnNumber = fnNumber
            fiscalData.shiftNumber = shiftNumber
            fiscalData.receiptDatetime = new Date(receiptDatetime),
            fiscalData.fiscalReceiptNumber = fiscalReceiptNumber
            fiscalData.fiscalDocumentNumber = fiscalDocumentNumber || 1
            fiscalData.ecrRegistrationNumber = ecrRegistrationNumber
            fiscalData.fiscalDocumentAttribute = fiscalDocumentAttribute || 1
            fiscalData.extTimestamp = new Date(receiptDatetime)
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
                        const {id} = await this.fiscalDataDAO.findByExt(externalId, trx)

                        await this.receiptDAO.setFiscalDataId(receipt.id, id, trx)

                        await this.receiptDAO.setStatus(receipt.id, ReceiptStatus.SUCCESS, trx)
                    })
                }
                catch (e) {
                    logger.debug(`FISCAL_DB_SELECT_ERROR ${e.message} ${JSON.stringify(fiscalData)}`)
                }

            }

        }

    }
    async handleFiscalizationResultOrange(receipts) {

        for (let receipt of receipts){


            const report = await OrangeAPI.getReport(receipt)
            if(report.state === "waiting") continue
            if(report.state !== "success"){
                await this.receiptDAO.knex.transaction(async (trx) => {
                    await this.receiptDAO.setStatus(receipt.id, ReceiptStatus.ERROR, trx)
                })
                continue

            }


            const {fisc} = report



            const fiscalData = new FiscalData({})

            const total = fisc.content.positions.reduce((acc, item) => {
                return acc = acc + (Number(item.price) * Number(item.quantity))
            }, 0)

            fiscalData.extId = fisc.id
            fiscalData.totalAmount = total
            fiscalData.fnsSite = fisc.fnsWebsite
            fiscalData.fnNumber = fisc.fsNumber
            fiscalData.shiftNumber = fisc.shiftNumber
            fiscalData.receiptDatetime = new Date(fisc.processedAt)
            fiscalData.fiscalReceiptNumber = fisc.documentIndex
            fiscalData.fiscalDocumentNumber = fisc.documentNumber || 1
            fiscalData.ecrRegistrationNumber = fisc.deviceRN
            fiscalData.fiscalDocumentAttribute = fisc.fp || 1
            fiscalData.extTimestamp = new Date(fisc.processedAt)
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

                        const {id} = await this.fiscalDataDAO.findByExt(fisc.id, trx)

                        await this.receiptDAO.setFiscalDataId(receipt.id, id, trx)

                        await this.receiptDAO.setStatus(receipt.id, ReceiptStatus.SUCCESS, trx)
                    })
                }
                catch (e) {
                    logger.debug(`FISCAL_DB_SELECT_ERROR ${e.message} ${JSON.stringify(fiscalData)}`)
                }

            }

        }

    }
    async setWaitingStatusUmka(receipt) {

        try {
            await this.receiptDAO.knex.transaction(async (trx) => {

                await this.receiptDAO.setStatus(receipt.id, ReceiptStatus.WAITING, trx)
            })
        }
        catch (e) {
            logger.debug(`FISCAL_SET_STATUS_WAITING_ERROR_${receipt.id} ${e.message} `)
        }



        return true
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
        fiscalData.fiscalDocumentNumber = fiscal_document_number || 1
        fiscalData.ecrRegistrationNumber = ecr_registration_number
        fiscalData.fiscalDocumentAttribute = fiscal_document_attribute || 1
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
        fiscalData.fiscalDocumentNumber = check_number || 1
        fiscalData.ecrRegistrationNumber = link
        fiscalData.fiscalDocumentAttribute = check_type || 1
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
