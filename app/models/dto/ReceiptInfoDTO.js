

class ReceiptDTO {

    constructor({receipt_id, created_at, kkt_reg_number, status, fiscal_document_number}) {
        this.id = receipt_id
        this.createdAt = created_at
        this.fiscalDocumentNumber = fiscal_document_number
        this.kktRegNumber = kkt_reg_number
        this.status = status
    }


}
module.exports = ReceiptDTO
