const logger = require("my-custom-logger")

const prepareFiscalData = ({inn, itemName, checkSum, extId, timeStamp, payType, eMail, sno, place}) => {

    logger.debug(`prepareData ${{
        inn,
        itemName,
        checkSum,
        extId,
        timeStamp,
        payType,
        eMail,
        sno,
        place
    }}`)

    return {
        external_id: extId,
        receipt: {
            client: {
                email: "kkt@kkt.ru"
            },
            company: {
                email: eMail,
                sno: sno,
                inn: inn,
                payment_address: place
            },
            items: [
                {
                    name: itemName,
                    price: checkSum,
                    quantity: 1.0,
                    sum: checkSum,
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
                    type: payType,
                    sum: checkSum
                }
            ],

            total: checkSum
        },
        service: {
            callback_url: ""
        },
        timestamp: timeStamp
    }


}
