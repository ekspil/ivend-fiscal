const FiscalRequest = function ({external_id, email, sno, inn, place, itemName, itemPrice, paymentType, timestamp}) {
    return {
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
                    payment_object: "commodity",
                    vat: {
                        type: "none",
                        sum: 0
                    }
                }
            ],
            payments: [
                {
                    type: paymentType ? "0" : "10",//todo fix
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
}


module.exports = FiscalRequest
