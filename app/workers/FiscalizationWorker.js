const FiscalRequest = require("../models/FiscalRequest")
const UmkaAPI = require("../utils/UmkaAPI")
const ReceiptStatus = require("../enums/ReceiptStatus")
const logger = require("my-custom-logger")

class FiscalizationWorker {

    /**
     *
     * @param receiptService {ReceiptService}
     * @param fiscalService {FiscalService}
     */
    constructor({receiptService, fiscalService}) {
        this.receiptService = receiptService
        this.fiscalService = fiscalService
        this.working = false

        this.processReceipt = this.processReceipt.bind(this)
        this.start = this.start.bind(this)
        this.stop = this.stop.bind(this)
    }

    async processReceipt() {
        const receipt = await this.receiptService.getFirstPending()

        try {
            if (!receipt) {
                return
            }

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

            logger.debug("worker_process_receipt_umka_replied ${result.uuid}")
            await this.fiscalService.handleFiscalizationResult(receipt, result.uuid)

            logger.debug("worker_process_receipt_handled")
        } catch (e) {
            if (e.code === "23505") {
                //race condition
                return
            }

            //todo test no race condition here
            await this.receiptService.setStatus(receipt.id, ReceiptStatus.ERROR)
            logger.error(e)
            logger.error(`error_receipt_unknown ${receipt.id}`)
        }
    }

    async start() {
        this.intervalId = setInterval(this.processReceipt, 3000)
        this.working = true
    }

    async stop() {
        clearInterval(this.intervalId)
        this.intervalId = null
        this.working = false
    }
}

module.exports = FiscalizationWorker
