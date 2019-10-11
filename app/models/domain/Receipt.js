class Receipt {

    constructor({id, controllerUid, controller_uid, email, sno, inn, place, itemName, item_name, itemPrice, item_price, paymentType, payment_type, status, fiscalData, createdAt, created_at, kktRegNumber, kkt_reg_number}) {
        this.id = id
        this.controllerUid = controllerUid || controller_uid
        this.email = email
        this.sno = sno
        this.inn = inn
        this.place = place
        this.itemName = itemName || item_name
        this.itemPrice = itemPrice || item_price
        this.paymentType = paymentType || payment_type
        this.kktRegNumber = kktRegNumber || kkt_reg_number // строка регистрационный номер ККМ (kktRegNumber) с ведущими нулями
        this.fiscalData = fiscalData
        this.status = status
        this.createdAt = createdAt || created_at
    }

}

module.exports = Receipt
