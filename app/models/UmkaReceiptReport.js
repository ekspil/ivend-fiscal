const UmkaResponse = require("./UmkaResponse")
const DateUtils = require("../utils/DateUtils")

class UmkaReceiptReportPayload {


    constructor({total, fns_site, fn_number, shift_number, receipt_datetime, fiscal_receipt_number, fiscal_document_number, ecr_registration_number, fiscal_document_attribute}) {

        {
            this.total = total // Итоговая сумма документа в рублях
            this.fns_site = fns_site // Адрес сайта ФНС
            this.fn_number = fn_number // Номер ФН
            this.shift_number = shift_number // Номер смены
            this.receipt_datetime = receipt_datetime // Дата и время документа из ФН
            this.fiscal_receipt_number = fiscal_receipt_number // Номер чека в смене
            this.fiscal_document_number = fiscal_document_number // Фискальный номер документа
            this.ecr_registration_number = ecr_registration_number // Регистрационный номер ККТ
            this.fiscal_document_attribute = fiscal_document_attribute // Фискальный признак документа
        }
    }

}

class UmkaReceiptReport extends UmkaResponse {
    constructor({uuid, timestamp, error, status, payload}) {
        super({uuid, timestamp, error, status})
        this.timestamp = DateUtils.getDateFromStr(timestamp)

        this.payload = payload ? (new UmkaReceiptReportPayload(payload)) : null
    }
}

module.exports = UmkaReceiptReport
