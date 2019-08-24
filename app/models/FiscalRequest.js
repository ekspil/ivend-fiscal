const FiscalRequest = ({extId, email, sno, inn, place, itemName, receiptAmount, paymentType, timestamp}) => {
    const paymentTypeInteger = paymentType

    return {
        external_id: extId,
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
                    price: receiptAmount,
                    quantity: 1.0,
                    sum: receiptAmount,
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
                    type: paymentType ? "0" : "10",
                    sum: receiptAmount
                }
            ],

            total: receiptAmount
        },
        service: {
            callback_url: ""
        },
        timestamp
    }
}


module.exports = FiscalRequest
