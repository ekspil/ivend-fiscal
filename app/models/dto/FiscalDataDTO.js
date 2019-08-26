class FiscalDataDTO {
    /* eslint-disable indent */
    constructor({
                    id, extId, totalAmount, fnsSite, fnNumber, shiftNumber, receiptDatetime, fiscalReceiptNumber,
                    fiscalDocumentNumber, ecrRegistrationNumber, fiscalDocumentAttribute, extTimestamp, createdAt
                }) {
        this.id = id
        this.extId = extId
        this.totalAmount = totalAmount
        this.fnsSite = fnsSite // Адрес сайта ФНС
        this.fnNumber = fnNumber // Номер ФН
        this.shiftNumber = shiftNumber // Номер смены
        this.receiptDatetime = receiptDatetime // Дата и время документа из ФН
        this.fiscalReceiptNumber = fiscalReceiptNumber // Номер чека в смене
        this.fiscalDocumentNumber = fiscalDocumentNumber // Фискальный номер документа
        this.ecrRegistrationNumber = ecrRegistrationNumber // Регистрационный номер ККТ
        this.fiscalDocumentAttribute = fiscalDocumentAttribute // Фискальный признак документа
        this.extTimestamp = extTimestamp // Таймштамп поставщика (Умка)
        this.createdAt = createdAt // Время создания записи
    }

}

module.exports = FiscalDataDTO
