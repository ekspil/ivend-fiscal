const FiscalRequest = require("../models/FiscalRequest")
const FiscalRequestRekassa = require("../models/FiscalRequestRekassa")
const UmkaAPI = require("../utils/UmkaAPI")
const RekassaAPI = require("../utils/RekassaAPI")
const ReceiptStatus = require("../enums/ReceiptStatus")
const UmkaResponseError = require("../errors/UmkaResponseError")
const logger = require("my-custom-logger")
const redisProcessingPrefix = "fiscal_worker_processing_receipt_"

//todo test no race condition here
const markFailed = async (receiptService, receipt, notRepeat) => {
    try {
        if(notRepeat){
            await receiptService.setStatusNoRepeat(receipt.id, ReceiptStatus.ERROR)
            return
        }
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
            return "noReceipt"
        }

        const isProcessing = await this.cacheService.get(redisProcessingPrefix + receipt.id)

        if (isProcessing) {
            return "isProcessing"
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
                return "code_23505"
            }
            if(e.json && e.json.error && e.json.error.text){
                if(e.json.error.text.includes("Смена превысила 24 часа")){
                    logger.error(`worker_process_receipt_error_24hours ${receipt.id}`)
                    return await markFailed(this.receiptService, receipt, true)
                }
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

                logger.error(`worker_process_receipt_umka_bad_response ${receipt.id}, , code: ${e.code}, status: ${e.status}, json: ${JSON.stringify(json)}`)
                return "umka_error"
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
                return "rekassa_error"
            }

            // logger.error(`error_receipt_unknown ${receipt.id}, code: ${e.code}, status: ${e.status}, e: ${JSON.stringify(e.json)}`)
            // await markFailed(this.receiptService, receipt)
        } finally {

            //await this.cacheService.flush(redisProcessingPrefix + receipt.id)
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
            let tasks = []
            let delay = 0
            for (let r of rs) {
                const isProcessing = await this.cacheService.get(redisProcessingPrefix + r.id)

                if (isProcessing) {
                    continue
                }

                tasks.push(new Promise(async (resolve) => {
                    delay += 100

                    await new Promise(res => setTimeout(res, delay))
                    this.processReceipt(r)

                    resolve(r.id + ": send_to_umka")
                }))
            }



            //const listOfPromises = rs.map(r => this.processReceipt(r))
            // for(const promise of tasks){
            //     await promise
            // }
            await Promise.all(tasks)
            this.intervalWork = false


        }, 1000)

        this.intervalId = setInterval(async () =>{
            await this.receiptService.setErrorToPending()

        }, 3000000)


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
