const ReceiptDTO = require("../models/dto/ReceiptDTO")
const ReceiptInfoDTO = require("../models/dto/ReceiptInfoDTO")
const ReceiptNotFoundError = require("../errors/ReceiptNotFoundError")
const logger = require("my-custom-logger")

const kktStatusPrefix = "kkt_status_prefix_"
const controllerStatusPrefix = "controller_kkt_status_prefix_"

class ReceiptController {


    /**
     * constructor
     * @param receiptService {ReceiptService}
     */
    constructor({receiptService, cacheService}) {
        this.receiptService = receiptService
        this.cacheService = cacheService

        this.createReceipt = this.createReceipt.bind(this)
        this.createReceiptRekassa = this.createReceiptRekassa.bind(this)
        this.createReceiptTelemedia = this.createReceiptTelemedia.bind(this)
        this.getReceiptById = this.getReceiptById.bind(this)
        this.getControllerKktStatus = this.getControllerKktStatus.bind(this)
        this.getKktStatus = this.getKktStatus.bind(this)
        this.getControllerKktInfo = this.getControllerKktInfo.bind(this)
        this.getKktInfo = this.getKktInfo.bind(this)
        this.getStatuses = this.getStatuses.bind(this)
        this.resend = this.resend.bind(this)
    }

    async createReceipt(request) {
        const receiptDTO = new ReceiptDTO(request.body)

        const receipt = await this.receiptService.create(receiptDTO)

        logger.debug(`created_receipt ${JSON.stringify(receipt)}`)

        return new ReceiptDTO(receipt)
    }

    async getStatuses(request) {

        const statuses = await this.receiptService.getStatuses(request.body)

        return statuses
    }


    async resend(request) {

        const result = await this.receiptService.resend(request.params.id)

        return result
    }

    async createReceiptRekassa(request) {
        const receiptDTO = new ReceiptDTO(request.body)

        const receipt = await this.receiptService.create(receiptDTO)

        logger.debug(`created_receipt ${JSON.stringify(receipt)}`)

        return new ReceiptDTO(receipt)
    }

    async createReceiptTelemedia(request) {
        const receiptDTO = new ReceiptDTO(request.body)

        const receipt = await this.receiptService.create(receiptDTO)

        logger.debug(`created_receipt ${JSON.stringify(receipt)}`)

        return new ReceiptDTO(receipt)
    }

    async getKktStatus(request) {
        const {id} = request.params

        //const receipt = await this.receiptService.getKktStatus(id)


        const string = await this.cacheService.get(kktStatusPrefix + id)

        return {status: string}
    }

    async getKktInfo(request) {
        const {id} = request.params

        const receipt = await this.receiptService.getKktInfo(id)


        if (!receipt) {
            return null
        }

        return new ReceiptInfoDTO(receipt)
    }

    async getControllerKktInfo(request) {
        const {id} = request.params

        const receipt = await this.receiptService.getControllerKktInfo(id)


        if (!receipt) {
            return null
        }

        return new ReceiptInfoDTO(receipt)
    }


    async getControllerKktStatus(request) {
        const {id} = request.params
        //const receipt = await this.receiptService.getControllerKktStatus(id)


        const string = await this.cacheService.get(controllerStatusPrefix + id)

        return {status: string}
    }

    async getReceiptById(request) {
        const {id} = request.params

        const receipt = await this.receiptService.getById(id)

        if (!receipt) {
            throw new ReceiptNotFoundError(id)
        }

        return new ReceiptDTO(receipt)
    }

}

module.exports = ReceiptController
