require("dotenv").config()

const App = require("../app/app")

let fastify


beforeAll(async ()=> {
    fastify = await App.start()
})

afterAll(async () => {
    await App.stop()
})

describe("Test index (/)", () => {

    test("Should return 404", async () => {
        const response = await fastify.inject({ method: "GET", url: "/" })
        //const response = await request.agent(fastify.server).get("/")
        expect(response.statusCode).toEqual(404)
    })

})
