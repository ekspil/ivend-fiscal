class ReceiptDTO {

    constructor({id, email, sno, inn, place, itemName, itemPrice, paymentType, fiscalData, status, createdAt}) {
        this.id = id
        this.email = email
        this.sno = sno
        this.inn = inn
        this.place = place
        this.itemName = itemName
        this.itemPrice = itemPrice
        this.paymentType = paymentType
        this.fiscalData = fiscalData
        this.status = status
        this.createdAt = createdAt
    }

}

module.exports = ReceiptDTO
