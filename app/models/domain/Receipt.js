class Receipt {

    constructor({id, email, sno, inn, place, itemName, itemPrice, paymentType, status, fiscalData, createdAt, extId}) {
        this.id = id
        this.email = email
        this.sno = sno
        this.inn = inn
        this.place = place
        this.itemName = itemName
        this.itemPrice = itemPrice
        this.paymentType = paymentType
        this.extId = extId // уникальный ID со стороны ivend, уникальный среди всех документов. Всегда можно подать повторно чек с таким же external_id в умку
        this.fiscalData = fiscalData
        this.status = status
        this.createdAt = createdAt
    }

}

module.exports = Receipt
