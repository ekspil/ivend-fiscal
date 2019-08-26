class FiscalData {
    /* eslint-disable indent */
    constructor({
                    id, extId, ext_id, totalAmount, total_amount, fnsSite, fns_site, fnNumber, fn_number, shiftNumber, shift_number, receiptDatetime, receipt_datetime, fiscalReceiptNumber, fiscal_receipt_number,
                    fiscalDocumentNumber, fiscal_document_number, ecrRegistrationNumber, ecr_registration_number, fiscalDocumentAttribute, fiscal_document_attribute, extTimestamp, ext_timestamp, createdAt, created_at
                }) {
        this.id = id
        this.extId = extId || ext_id //Внешний ID системы, например uuid запроса умки
        this.totalAmount = totalAmount || total_amount // Итоговая сумма документа в рублях (ex: 100)
        this.fnsSite = fnsSite  || fns_site// Адрес сайта ФНС
        this.fnNumber = fnNumber || fn_number// Номер ФН
        this.shiftNumber = shiftNumber || shift_number// Номер смены
        this.receiptDatetime = receiptDatetime || receipt_datetime// Дата и время документа из ФН
        this.fiscalReceiptNumber = fiscalReceiptNumber || fiscal_receipt_number// Номер чека в смене
        this.fiscalDocumentNumber = fiscalDocumentNumber || fiscal_document_number// Фискальный номер документа
        this.ecrRegistrationNumber = ecrRegistrationNumber || ecr_registration_number// Регистрационный номер ККТ
        this.fiscalDocumentAttribute = fiscalDocumentAttribute || fiscal_document_attribute// Фискальный признак документа
        this.extTimestamp = extTimestamp || ext_timestamp// Таймштамп поставщика (Умка)
        this.createdAt = createdAt || created_at// Время создания записи
    }

}

module.exports = FiscalData
