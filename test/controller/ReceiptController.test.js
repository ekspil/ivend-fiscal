require("dotenv").config()

const request = require("supertest")
const App = require("../../app/app")
const ReceiptDTO = require("../../app/models/dto/ReceiptDTO")
const SNO = require("../../app/enums/SNO")
const PaymentType = require("../../app/enums/PaymentType")

let fastify


beforeAll(async () => {
    fastify = await App.start()
})

afterAll(async () => {
    await App.stop()
})

describe("Test POST receipt (/api/v1/fiscal/receipt)", () => {

    test("Should create Receipt", async () => {
        const receiptDTO = new ReceiptDTO(
            {
                email: "test@test.ru",
                place: "Красная площадь",
                inn: "7727529784",
                itemName: "Услуги мойки",
                itemPrice: "100.00",
                paymentType: PaymentType.CASHLESS,
                sno: SNO.envd
            })

        const response = await fastify.inject({
            method: "POST", url: "/api/v1/receipt", payload: receiptDTO, headers: {
                "Content-Type": "application/json"
            }
        })

        expect(response.statusCode).toEqual(200)

        const body = JSON.parse(response.body)

        expect(body.email).toBe(receiptDTO.email)
        expect(body.place).toBe(receiptDTO.place)
        expect(body.inn).toBe(receiptDTO.inn)
        expect(body.email).toBe(receiptDTO.email)
        expect(body.email).toBe(receiptDTO.email)
    })

})