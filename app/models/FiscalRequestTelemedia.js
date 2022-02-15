const FiscalRequest = function ({itemName, itemPrice, paymentType, kassaId, sectionId}) { //external_id, email, sno, inn, place, itemType, timestamp,
    const paymentTypeMap = {
        CASH: 0,
        CASHLESS: 1
    }


    //const date = new Date(timestamp)

    const payload = {
        "operation_type": 2,
        "payments": [
            {
                "payment_type": paymentTypeMap[paymentType],
                "total": Number(itemPrice)
            }
        ],
        "kassa": kassaId,
        "items": [
            {
                "name": itemName,
                "is_catalog": false,
                "catalog": null,
                "section": sectionId,
                "quantity": 1,
                "price": Number(itemPrice),
                "sum": Number(itemPrice),
                "total": Number(itemPrice),
                "discount": 0,
                "discount_type": 0,
                "discount_value": 0,
                "markup": 0,
                "is_nds": false,
                "nds_percent": 12,
                "tax": 0,
                "is_discount_storno": false,
                "is_markup_storno": false,
                "is_storno": false,
                "id": null,
                "quantity_type": 796,
                "currency": null,
            }
        ],
        "total_amount": Number(itemPrice),
        "change": 0,
        "currency": false,
        "check_type": 2,
        "tax": 0,
        "html_code": false,
    }




    return payload
}


module.exports = FiscalRequest


    
