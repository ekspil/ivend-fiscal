const FiscalRequest = require("../models/FiscalRequest")
const FiscalRequestRekassa = require("../models/FiscalRequestRekassa")
const UmkaAPI = require("../utils/UmkaAPI")
const RekassaAPI = require("../utils/RekassaAPI")
const ReceiptStatus = require("../enums/ReceiptStatus")
const UmkaResponseError = require("../errors/UmkaResponseError")
const logger = require("my-custom-logger")
const redisProcessingPrefix = "fiscal_worker_processing_receipt_"

//todo test no race condition here
const markFailed = async (receiptService, receipt) => {
    try {
        await receiptService.setStatus(receipt.id, ReceiptStatus.ERROR)
    } catch (e1) {
        logger.error(`worker_process_receipt_set_status_failed ${e1}`)
    }
}

class FiscalizationWorker {

    /**
     *
     * @param receiptService {ReceiptService}
     * @param fiscalService {FiscalService}
     * @param cacheService {CacheService}
     */
    constructor({receiptService, fiscalService, cacheService}) {
        this.receiptService = receiptService
        this.fiscalService = fiscalService
        this.cacheService = cacheService
        this.working = false
        this.intervalWork = false

        this.processReceipt = this.processReceipt.bind(this)
        this.start = this.start.bind(this)
        this.stop = this.stop.bind(this)
    }

    async processReceipt(receipt) {
        if(!receipt){
            receipt = await this.receiptService.getRandomPending()
        }

        if (!receipt) {
            return
        }

        const isProcessing = await this.cacheService.get(redisProcessingPrefix + receipt.id)

        if (isProcessing) {
            return
        }

        try {
            await this.cacheService.set(redisProcessingPrefix + receipt.id, new Date().getTime(), Number(process.env.WORKER_PROCESSING_RECEIPT_CACHE_TIMEOUT_SECONDS))

            const {id, controllerUid, email, sno, inn, place, itemName, itemPrice, paymentType, createdAt, kktRegNumber, itemType} = receipt

            const extId = `IVEND-receipt-${id}-${controllerUid}`

            logger.debug(`worker_process_receipt_start #${id} ${extId} ${email} ${inn} ${itemName} ${itemPrice} ${kktRegNumber}`)

            let fiscalRequest
            let result
            if(!receipt.rekassa_number){
                fiscalRequest = new FiscalRequest({
                    external_id: extId,
                    email,
                    sno,
                    inn,
                    place,
                    itemName,
                    itemPrice,
                    paymentType,
                    timestamp: createdAt,
                    itemType
                })

                result = await UmkaAPI.registerSale(kktRegNumber, fiscalRequest)

                logger.debug(`worker_process_receipt_umka_replied ${result.uuid}`)

                await this.fiscalService.handleFiscalizationResult(receipt, result.uuid)

            }
            if(receipt.rekassa_number){
                fiscalRequest = new FiscalRequestRekassa({
                    external_id: extId,
                    email,
                    sno,
                    inn,
                    place,
                    itemName,
                    itemPrice,
                    paymentType,
                    timestamp: createdAt,
                    itemType
                })

                result = await RekassaAPI.registerSale(receipt.rekassa_kkt_id, fiscalRequest, receipt, this.cacheService)
                logger.debug(`worker_process_receipt_rekassa_replied ${result.uuid}`)

                await this.fiscalService.handleFiscalizationResultRekassa(receipt, result)

            }



            const time = await this.cacheService.get(redisProcessingPrefix + receipt.id)
            const startDate = new Date(Number(time))
            const diff = new Date() - startDate

            logger.debug(`worker_process_receipt_handled processing #${receipt.id} took ${diff} milliseconds`)
        } catch (e) {
            if (e.code === "23505") {
                //race condition
                return
            }

            if (e instanceof UmkaResponseError) {
                const {json} = e
                const createDate = receipt.createdAt
                const expireDate = new Date(createDate.getTime() + Number(process.env.FISCAL_PENDING_TIMEOUT_SECONDS) * 1000)
                const expired = (new Date() > expireDate )

                if (expired) {
                    logger.error(`worker_process_receipt_timeout ${receipt.id},  time1:${createDate}, time2:${expireDate}, ${JSON.stringify(e.json)}`)
                    return await markFailed(this.receiptService, receipt)
                }

                return logger.error(`worker_process_receipt_umka_bad_response ${receipt.id}, , code: ${e.code}, status: ${e.status}, json: ${JSON.stringify(json)}`)
            }
            else {
                const createDate = receipt.createdAt
                const expireDate = new Date(createDate.getTime() + Number(process.env.FISCAL_PENDING_TIMEOUT_SECONDS) * 1000)
                const expired = (new Date() > expireDate )

                if (expired) {
                    logger.error(`worker_process_receipt_timeout ${receipt.id},  time1:${createDate}, time2:${expireDate}, ${JSON.stringify(e.json)}`)
                    return await markFailed(this.receiptService, receipt)
                }
                logger.error(`error_receipt_unknown ${receipt.id}, code: ${e.code}, status: ${e.status}, e: ${JSON.stringify(e.json)}`)
            }

            // logger.error(`error_receipt_unknown ${receipt.id}, code: ${e.code}, status: ${e.status}, e: ${JSON.stringify(e.json)}`)
            // await markFailed(this.receiptService, receipt)
        } finally {
            await this.cacheService.flush(redisProcessingPrefix + receipt.id)
        }
    }

    async start() {
        this.intervalId = setInterval(async () =>{
            if (this.intervalWork) return
            this.intervalWork = true
            const rs = await this.receiptService.getAllPending()
            if(!rs) {
                this.intervalWork = false
                return
            }
            for(let r of rs){
                await this.processReceipt(r)
            }
            this.intervalWork = false


        }, 5000)
        this.working = true
        logger.info("UMKA receipt polling worker started")
    }

    async stop() {
        clearInterval(this.intervalId)
        this.intervalId = null
        this.working = false
        logger.info("UMKA receipt polling worker stopped")
    }
}

module.exports = FiscalizationWorker
