const FiscalRequest = function ({external_id, email, sno, inn, place, itemName, itemPrice, paymentType, timestamp, itemType}) {
    const paymentTypeMap = {
        CASH: "cash",
        CASHLESS: "cashless"
    }

    const payload = {
        externalId: external_id,
        cashierLogin: process.env.UMKA_LOGIN,
        cashierPassword: process.env.UMKA_PASS,
        operationDt: new Date(timestamp).toISOString(),
        operation: "sell",
        companyEmail: email,
        companySno: sno,
        companyInn: inn,
        paymentAddress: place,
        paymentType: paymentTypeMap[paymentType],
        clientEmail: "mail@domain.com",
        clientPhone: "",
        itemName,
        itemPrice: itemPrice,
        itemQuantity: 1,
        itemSum: itemPrice,
        itemBarcode: "",
        itemUserData: "",
        measurementUnit: "шт",
        paymentMethod: "full_prepayment",
        paymentObject: itemType,
        vatType: "none"
    }

    if(sno === "osn"){
        payload.vatType = "vat20"
    }

    return {docs: [payload]}
}


module.exports = FiscalRequest
