const FiscalRequest = function ({itemName, itemPrice, paymentType, timestamp}) { //external_id, email, sno, inn, place, itemType
    const paymentTypeMap = {
        CASH: "PAYMENT_CASH",
        CASHLESS: "PAYMENT_CARD"
    }


    const date = new Date(timestamp)



    const payload = {
        amounts: {
            total: {
                bills: Number(itemPrice),
                coins: 0
            },
            taken: {
                bills: paymentType === "CASH" ? Number(itemPrice) : "0",
                coins: 0
            },
            change: {
                bills: "0",
                coins: 0
            }
        },
        dateTime: {
            date: {
                year: String(date.getFullYear()),
                month: String(date.getMonth() + 1),
                day: String(date.getDate())
            },
            time: {
                hour: String(date.getUTCHours()),
                minute: String(date.getMinutes()),
                second: String(date.getSeconds())
            }
        },
        domain: {
            type: "DOMAIN_SERVICES"
        },
        items: [
            {
                type: "ITEM_TYPE_COMMODITY",
                commodity: {
                    name: itemName,
                    sectionCode: "1",
                    quantity: 1000,
                    price: {
                        bills: Number(itemPrice),
                        coins: 0
                    },
                    sum: {
                        bills: Number(itemPrice),
                        coins: 0
                    },
                    auxiliary: [
                        {
                            key: "UNIT_TYPE",
                            value: "PIECE" //ONE_SERVICE
                        }
                    ]
                }
            }
        ],
        operation: "OPERATION_SELL",
        payments: [
            {
                type: paymentTypeMap[paymentType],
                sum: {
                    bills: Number(itemPrice),
                    coins: 0
                }
            }
        ]


    }


    return payload
}


module.exports = FiscalRequest


    
