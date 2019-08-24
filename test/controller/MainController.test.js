require("dotenv").config()

const request = require("supertest")
const App = require("../../app/app")
const ReceiptDTO = require("../../app/models/dto/ReceiptDTO")

let fastify


beforeAll(async () => {
    fastify = await App.start()
})

afterAll(async () => {
    await App.stop()
})

describe("Test POST receipt (/api/v1/receipt)", () => {

    test("Should atomically accept receipt to process", async () => {
        const receiptDTO = new ReceiptDTO({
            email: "test@test.ru",
            place: "Красная площадь",
            inn: "7727529784",
            name: "Услуги мойки",
            price: "100.00",
            extId: "IVEND-30000482-0619-220819123258",
            timestamp: "22.08.19 12:32:58",
            payType: 0,
            sno: "envd"
        })

        const response = await fastify.inject({
            method: "POST", url: "/api/v1/receipt", payload: receiptDTO, headers: {
                "Content-Type": "application/json"
            }
        })

        expect(response.statusCode).toEqual(200)
    })


})
