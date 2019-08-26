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

            await this.fiscalService.handleFiscalizationResult(receipt, result.uuid)


            logger.info("Successfully registered sale")
        } catch (e) {
            if (e.code === "23505") {
                //race condition
                return
            }

            //todo test no race condition here
            await this.receiptService.setStatus(receipt.id, ReceiptStatus.ERROR)
            logger.error(e)
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
