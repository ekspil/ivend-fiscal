const FiscalRequest = function ({external_id, sno, inn,  itemName, itemPrice, paymentType,  itemType, place, controllerUid}) { //email, timestamp,
    const paymentTypeMap = {
        CASH: 1,
        CASHLESS: 2
    }
    const snoTypeMap = {
        osn: 0,
        usn_income: 1,
        usn_income_outcome: 2,
        envd: 3,
        esn: 4,
        patent: 5
    }
    const itemTypeMap = {
        service: 4,
        commodity: 1
    }


    //const date = new Date(timestamp)

    const payload = {
        id: external_id,
        inn: inn,
        group: "4010033",
        key: "4010033",
        content: {
            type: 1,
            positions: [
                {
                    quantity: 1,
                    price: itemPrice,
                    tax: sno === "osn" ? 1 : 6,
                    text: itemName,
                    paymentMethodType: 4,
                    paymentSubjectType: itemTypeMap[itemType]
                }
            ],
            checkClose: {
                payments: [
                    {
                        type: paymentTypeMap[paymentType],
                        amount: itemPrice
                    }
                ],
                taxationSystem: snoTypeMap[sno]
            },
            automatNumber: controllerUid,
            settlementAddress: place,
            settlementPlace: place,
            customerContact: "user@domain.com"
        }
    }


    return payload
}


module.exports = FiscalRequest


    
