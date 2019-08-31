const FiscalRequest = require("../models/FiscalRequest")
const UmkaAPI = require("../utils/UmkaAPI")
const ReceiptStatus = require("../enums/ReceiptStatus")
const UmkaApiTimeout = require("../errors/UmkaApiTimeout")
const logger = require("my-custom-logger")
const redisProcessingPrefix = "fiscal_worker_processing_receipt_"

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
        const receipt = await this.receiptService.getFirstPending()

        if (!receipt) {
            return
        }

        const isProcessing = await this.cacheService.get(redisProcessingPrefix + receipt.id)

        if (isProcessing) {
            return
        }

        try {
            await this.cacheService.set(redisProcessingPrefix + receipt.id, new Date().getTime(), Number(process.env.WORKER_PROCESSING_RECEIPT_TIMEOUT_SECONDS))

            const {id, email, sno, inn, place, itemName, itemPrice, paymentType, createdAt, kktRegNumber} = receipt

            const extId = `IVEND-receipt-${id}`

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
                timestamp: createdAt
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

            if (e instanceof UmkaApiTimeout) {
                return
            }

            //todo test no race condition here
            try {
                await this.receiptService.setStatus(receipt.id, ReceiptStatus.ERROR)
            } catch (e1) {
                logger.error(`worker_process_receipt_set_status_failed ${e1}`)
            }

            logger.error(`error_receipt_unknown ${receipt.id} ` + e)
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
