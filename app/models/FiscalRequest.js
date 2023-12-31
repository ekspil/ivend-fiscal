const FiscalRequest = function ({external_id, email, sno, inn, place, itemName, itemPrice, paymentType, timestamp, itemType}) {
    const paymentTypeMap = {
        CASH: 0,
        CASHLESS:1
    }

    const payload = {
        external_id,
        receipt: {
            client: {
                email: "kkt@kkt.ru"
            },
            company: {
                email,
                sno,
                inn,
                payment_address: place
            },
            items: [
                {
                    name: itemName,
                    price: itemPrice,
                    quantity: 1.0,
                    sum: itemPrice,
                    measurement_unit: "шт",
                    payment_method: "full_payment",
                    payment_object: itemType || "commodity",
                    vat: {
                        type: "none",
                        sum: 0
                    }
                }
            ],

            payments: [
                {
                    type: paymentTypeMap[paymentType],
                    sum: itemPrice
                }
            ],

            total: itemPrice
        },
        service: {
            callback_url: ""
        },
        timestamp
    }

    if(sno === "osn"){
        payload.receipt.items[0].vat = {
            type: "vat20",
            sum: Number((itemPrice - (itemPrice/1.2)).toFixed(2))
        }
    }

    return payload
}


module.exports = FiscalRequest
