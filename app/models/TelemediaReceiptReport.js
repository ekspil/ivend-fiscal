const RekassaResponse = require("./RekassaResponse")

class RekassaReceiptReportPayload {


    constructor(json) {

        {
            this.total = Number(json.data.ticket.amounts.total.bills) + Number(json.data.ticket.amounts.total.coins) // Итоговая сумма документа в рублях
            this.fns_site = json.fdo.url // Адрес сайта ФНС
            this.fn_number = json.ticketNumber // Номер ФН
            this.shift_number = json.shiftNumber // Номер смены
            this.receipt_datetime = json.messageTime // Дата и время документа из ФН
            this.fiscal_receipt_number = json.ticketNumber // Номер чека в смене
            this.fiscal_document_number = json.shiftDocumentNumber // Фискальный номер документа
            this.ecr_registration_number = json.qrCode // Регистрационный номер ККТ
            this.fiscal_document_attribute = json.shiftMessageNumber // Фискальный признак документа
        }
    }

}

class RekassaReceiptReport extends RekassaResponse {
    constructor(json) {
        super({id:json.id, messageTime: json.messageTime, error:json.error, status: json.status})
        this.timestamp = new Date(json.messageTime)

        this.payload = json.data ? (new RekassaReceiptReportPayload(json)) : null
    }
}

module.exports = RekassaReceiptReport
