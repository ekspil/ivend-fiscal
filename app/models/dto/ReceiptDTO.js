const FiscalDataDTO = require("./FiscalDataDTO")

class ReceiptDTO {

    constructor({id, email, sno, inn, place, itemName, itemPrice, paymentType, fiscalData, status, createdAt, kktRegNumber}) {
        this.id = id
        this.email = email
        this.sno = sno
        this.inn = inn
        this.place = place
        this.itemName = itemName
        this.itemPrice = itemPrice
        this.paymentType = paymentType
        this.fiscalData = fiscalData ? (new FiscalDataDTO(fiscalData)) : null
        this.kktRegNumber = kktRegNumber
        this.status = status
        this.createdAt = createdAt
    }

}

module.exports = ReceiptDTO
