const FiscalRequest = require("../models/FiscalRequest")
const UmkaAPI = require("../utils/UmkaAPI")
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

        this.processReceipt = this.processReceipt.bind(this)
        this.start = this.start.bind(this)
        this.stop = this.stop.bind(this)
    }

    async processReceipt() {
        const receipt = await this.receiptService.getRandomPending()

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

            const fiscalRequest = new FiscalRequest({
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


            const result = await UmkaAPI.registerSale(kktRegNumber, fiscalRequest)

            logger.debug(`worker_process_receipt_umka_replied ${result.uuid}`)

            await this.fiscalService.handleFiscalizationResult(receipt, result.uuid)

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
                    logger.error(`worker_process_receipt_timeout ${receipt.id} ${JSON.stringify(e.json)}`)
                    return await markFailed(this.receiptService, receipt)
                }

                return logger.error(`worker_process_receipt_umka_bad_response ${receipt.id} ${JSON.stringify(json)}`)
            }

            logger.error(`error_receipt_unknown ${receipt.id} ` + e)
            await markFailed(this.receiptService, receipt)
        } finally {
            await this.cacheService.flush(redisProcessingPrefix + receipt.id)
        }
    }

    async start() {
        this.intervalId = setInterval(this.processReceipt, 3000)
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
