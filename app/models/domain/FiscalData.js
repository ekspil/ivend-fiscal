class FiscalData {
    /* eslint-disable indent */
    constructor({
                    extId, totalAmount, fnsSite, fnNumber, shiftNumber, receiptDatetime, fiscalReceiptNumber,
                    fiscalDocumentNumber, ecrRegistrationNumber, fiscalDocumentAttribute, extTimestamp, createdAt
                }) {
        this.extId = extId //Внешний ID системы, например uuid запроса умки
        this.totalAmount = totalAmount // Итоговая сумма документа в рублях (ex: 100)
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

module.exports = FiscalData
