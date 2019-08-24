class ReceiptDTO {

    constructor(raw = {}) {
        const {email, place, inn, name, price, extId, timestamp, payType, sno} = raw

        this.email = email
        this.place = place
        this.inn = inn
        this.name = name
        this.price = price
        this.extId = extId
        this.timestamp = timestamp
        this.payType = payType
        this.sno = sno
    }

}

module.exports = ReceiptDTO
