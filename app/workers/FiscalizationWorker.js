const FiscalRequest = require("../models/FiscalRequest")
const FiscalRequestUmka = require("../models/FiscalRequestUmka")
const FiscalRequestRekassa = require("../models/FiscalRequestRekassa")
const FiscalRequestTelemedia = require("../models/FiscalRequestTelemedia")
const FiscalRequestOrange = require("../models/FiscalRequestOrange")
const UmkaAPI = require("../utils/UmkaAPI")
const OrangeAPI = require("../utils/OrangeAPI")
const RekassaAPI = require("../utils/RekassaAPI")
const TelemediaAPI = require("../utils/TelemediaAPI")
const UmkaNewAPI = require("../utils/UmkaNewAPI")
const ReceiptStatus = require("../enums/ReceiptStatus")
const UmkaResponseError = require("../errors/UmkaResponseError")
const logger = require("my-custom-logger")
const redisProcessingPrefix = "fiscal_worker_processing_receipt_"
const redisInWorkPrefix = "fiscal_worker_in_work_receipt_"
const kktStatusPrefix = "kkt_status_prefix_"
const controllerKktStatusPrefix = "controller_kkt_status_prefix_"

//todo test no race condition here
const markFailed = async (receiptService, receipt, notRepeat) => {
    try {
        if(notRepeat){
            await receiptService.setStatusNoRepeat(receipt.id, ReceiptStatus.ERROR)
            return
        }
        await receiptService.setStatus(receipt.id, ReceiptStatus.ERROR)
    } catch (e) {
        logger.error(`worker_process_receipt_set_status_failed ${e}`)
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
        this.checkBusy = false

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

        const isInWork = await this.cacheService.get(redisInWorkPrefix + receipt.kktRegNumber)

        if (isInWork) {
            return "inWork"
        }

        const isProcessing = await this.cacheService.get(redisProcessingPrefix + receipt.id)

        if (isProcessing) {
            return "isProcessing"
        }

        try {
            await this.cacheService.set(redisProcessingPrefix + receipt.id, new Date().getTime(), 3600)

            await this.cacheService.set(redisInWorkPrefix + receipt.kktRegNumber, new Date().getTime(), 3600)

            const {id, controllerUid, email, sno, inn, place, itemName, itemPrice, paymentType, createdAt, kktRegNumber, itemType} = receipt

            const extId = `IVEND-receipt-${id}-${controllerUid}`

            logger.debug(`worker_process_receipt_start #${id} ${extId} ${email} ${inn} ${itemName} ${itemPrice} ${kktRegNumber}`)

            let fiscalRequest
            let result
            if(receipt.kktProvider === "umka" || !receipt.kktProvider){
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
            if(receipt.kktProvider === "rekassa"){
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
            if(receipt.kktProvider === "umka_new"){
                fiscalRequest = new FiscalRequestUmka({
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

                result = await UmkaNewAPI.registerSale(kktRegNumber, fiscalRequest)
                logger.debug(`worker_process_receipt_umka_new_replied ${result.externalId}`)

                await this.fiscalService.setWaitingStatusUmka(receipt)

            }
            if(receipt.kktProvider === "orange"){
                fiscalRequest = new FiscalRequestOrange({
                    external_id: extId,
                    email,
                    sno,
                    inn,
                    place,
                    itemName,
                    itemPrice,
                    paymentType,
                    timestamp: createdAt,
                    itemType,
                    controllerUid
                })

                result = await OrangeAPI.registerSale(kktRegNumber, fiscalRequest)
                if(!result){
                    await markFailed(this.receiptService, receipt, true)
                    throw new Error("orange_data_reciept_error")
                }else{

                    logger.debug(`worker_process_receipt_orange_replied ${extId}`)

                    await this.fiscalService.setWaitingStatusUmka(receipt)
                }

            }
            if(receipt.kktProvider === "telemedia"){
                fiscalRequest = new FiscalRequestTelemedia({
                    external_id: extId,
                    email,
                    sno,
                    inn,
                    place,
                    itemName,
                    itemPrice,
                    paymentType,
                    timestamp: createdAt,
                    itemType,
                    kassaId: receipt.rekassa_kkt_id,
                    sectionId: receipt.rekassa_number
                })

                result = await TelemediaAPI.registerSale(fiscalRequest, receipt, this.cacheService)
                logger.debug(`worker_process_receipt_telemedia_replied ${result.uuid}`)

                await this.fiscalService.handleFiscalizationResultTelemedia(receipt, result)

            }



            const time = await this.cacheService.get(redisProcessingPrefix + receipt.id)
            const startDate = new Date(Number(time))
            const diff = new Date() - startDate

            logger.debug(`worker_process_receipt_handled processing #${receipt.id} took ${diff} milliseconds`)

            await this.cacheService.set(redisInWorkPrefix + receipt.kktRegNumber, "", 1)
            await this.cacheService.set(redisProcessingPrefix + receipt.id, "", 1)

            await this.cacheService.set(kktStatusPrefix + receipt.kktRegNumber, "OK", 86400)
            await this.cacheService.set(controllerKktStatusPrefix + receipt.controllerUid, "OK", 86400)

        } catch (e) {

            await this.cacheService.set(redisProcessingPrefix + receipt.id, new Date().getTime(), Number(process.env.WORKER_PROCESSING_RECEIPT_CACHE_TIMEOUT_SECONDS))
            await this.cacheService.set(redisInWorkPrefix + receipt.kktRegNumber, new Date().getTime(), 5)

            if (e.code === "23505") {
                //race condition
                return "code_23505"
            }
            if(e.json && e.json.error && e.json.error.text){
                if(e.json.error.text.includes("Смена превысила 24 часа")){
                    logger.error(`worker_process_receipt_error_24hours ${receipt.id}`)
                    return await markFailed(this.receiptService, receipt, true)
                }
                if(e.json.error.text.includes("error:235")){
                    logger.error(`worker_process_receipt_error_FN_expire ${receipt.id}`)
                    return await markFailed(this.receiptService, receipt, true)
                }
                if(e.json.error.text.includes("error:102")){
                    logger.error(`worker_process_receipt_error_KKT_WRONG_STATUS ${receipt.id}`)
                    return await markFailed(this.receiptService, receipt, true)
                }
                if(e.json.error.text.includes("error:212")){
                    logger.error(`worker_process_receipt_error_FN_WRONG_STATUS ${receipt.id}`)
                    return await markFailed(this.receiptService, receipt, true)
                }
                if(e.json.error.text.includes("error:451")){
                    logger.error(`worker_process_receipt_error_unsupported_juristic ${receipt.id}`)
                    return await markFailed(this.receiptService, receipt, true)
                }
                if(e.json.error.text.includes("error:166")){
                    logger.error(`worker_process_receipt_error_wrong_PHM ${receipt.id}`)
                    return await markFailed(this.receiptService, receipt, true)
                }
                if(e.json.error.text.includes("Время ожидания соединения истекло")){
                    logger.error(`worker_process_receipt_error_KKT_connection_error ${receipt.id}`)
                    return await markFailed(this.receiptService, receipt, false)
                }
                if(e.json.error.text.includes("Connection refused")){
                    logger.error(`worker_process_receipt_error_connection_refused ${receipt.id}`)
                    return await markFailed(this.receiptService, receipt, false)
                }
                if(e.json.error.text.includes("error:408")){
                    logger.error(`worker_process_receipt_error_request_timeout ${receipt.id}`)
                    return await markFailed(this.receiptService, receipt, false)
                }
            }

            if (e instanceof UmkaResponseError) {
                const {json} = e
                const createDate = receipt.createdAt
                const expireDate = new Date(createDate.getTime() + Number(process.env.FISCAL_PENDING_TIMEOUT_SECONDS) * 1000)
                const expired = (new Date() > expireDate )

                if (expired) {
                    logger.error(`worker_process_receipt_timeout ${receipt.id},  time1:${createDate}, time2:${expireDate}, ${JSON.stringify(e.json)}`)

                    await this.cacheService.set(kktStatusPrefix + receipt.kktRegNumber, "ERROR")
                    await this.cacheService.set(controllerKktStatusPrefix + receipt.controllerUid, "ERROR")
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
                    await this.cacheService.set(kktStatusPrefix + receipt.kktRegNumber, "ERROR")
                    await this.cacheService.set(controllerKktStatusPrefix + receipt.controllerUid, "ERROR")
                    return await markFailed(this.receiptService, receipt)
                }
                logger.error(`error_receipt_unknown ${receipt.id}, code: ${e.code}, status: ${e.status}, e: ${JSON.stringify(e.json)}`)
                return "rekassa_error"
            }

            // logger.error(`error_receipt_unknown ${receipt.id}, code: ${e.code}, status: ${e.status}, e: ${JSON.stringify(e.json)}`)
            // await markFailed(this.receiptService, receipt)
        } finally {

            await this.cacheService.flush(redisInWorkPrefix + receipt.kktRegNumber)
        }
    }

    async start() {
        this.intervalId = setInterval(async () =>{
            try{

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
                        delay += 50

                        await new Promise(res => setTimeout(res, delay))
                        await this.processReceipt(r)

                        resolve(  "worker_process_send_to_umka" + r.id)
                    }))
                }



                //const listOfPromises = rs.map(r => this.processReceipt(r))
                // for(const promise of tasks){
                //     await promise
                // }
                await Promise.all(tasks)
                this.intervalWork = false

            }
            catch (e) {
                logger.info("fiscal_super_error_")
                logger.info("fiscal_super_error_message: " + e.message)
                this.intervalWork = false
            }
            finally {
                this.intervalWork = false
            }


        }, 1000)

        this.intervalId = setInterval(async () =>{
            try{

                await this.receiptService.setErrorToPending()

            }catch (e) {
                logger.info(`fiscal_super_error_setErrorToPending ${e.message}`)
            }

        }, 3000000)

        this.intervalId = setInterval(async () =>{
            try{
                if(this.checkBusy) return

                this.checkBusy = true


                const rs = await this.receiptService.getAllWaiting()

                if(!rs) {
                    return
                }
                const umkaReceipts = rs.filter(item=>item.kktProvider === "umka_new")
                const orangeReceipts = rs.filter(item=>item.kktProvider === "orange")


                await Promise.all([
                    await this.fiscalService.handleFiscalizationResultUmka(umkaReceipts),
                    await this.fiscalService.handleFiscalizationResultOrange(orangeReceipts)
                ])



            }catch (e) {
                logger.info(`fiscal_super_error_setErrorToPending ${e.message}`)
            }
            finally {
                this.checkBusy = false
            }

        }, 1000)


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
