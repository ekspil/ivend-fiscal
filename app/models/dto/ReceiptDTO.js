const FiscalDataDTO = require("./FiscalDataDTO")

class ReceiptDTO {

    constructor({id, controllerUid, email, sno, inn, place, itemName, itemPrice, paymentType, fiscalData, status, createdAt, kktRegNumber, itemType, rekassa_password, rekassa_number, rekassa_kkt_id}) {
        this.id = id
        this.controllerUid = controllerUid
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
        this.itemType = itemType
        this.rekassa_kkt_id = rekassa_kkt_id
        this.rekassa_number = rekassa_number
        this.rekassa_password = rekassa_password
    }


}
module.exports = ReceiptDTO
