class Receipt {


    constructor({id, controllerUid, controller_uid, email, sno, inn, place, itemName, item_name, itemType, item_type, itemPrice, item_price, paymentType, payment_type, status, fiscalData, createdAt, created_at, kktRegNumber, kkt_reg_number, rekassa_number, rekassa_password, rekassa_kkt_id, kkt_provider, kktProvider}) {
        this.id = id
        this.controllerUid = controllerUid || controller_uid
        this.email = email
        this.sno = sno
        this.inn = inn
        this.place = place
        this.itemName = itemName || item_name
        this.itemPrice = itemPrice || item_price
        this.itemType = itemType || item_type
        this.paymentType = paymentType || payment_type
        this.kktRegNumber = kktRegNumber || kkt_reg_number // строка регистрационный номер ККМ (kktRegNumber) с ведущими нулями
        this.fiscalData = fiscalData
        this.status = status
        this.rekassa_number = rekassa_number
        this.rekassa_password = rekassa_password
        this.rekassa_kkt_id = rekassa_kkt_id
        this.createdAt = createdAt || created_at
        this.kktProvider = kkt_provider || kktProvider
    }

}

module.exports = Receipt
