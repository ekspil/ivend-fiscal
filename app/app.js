const fastify = require("fastify")({})
const logger = require("my-custom-logger")
const MainController = require("./controllers/MainController")
const ReceiptService = require("./service/ReceiptService")
const ReceiptDAO = require("./daos/ReceiptDAO")
const Routes = require("./routes")

const verifyEnvKeys = () => {
    //if (!process.env.REDIS_HOST) {
    //   throw new Error("REDIS_HOST not set")
    //}
}

const buildDependencies = ({knex}) => {
    const receiptDAO = new ReceiptDAO({knex})
    const receiptService = new ReceiptService({receiptDAO})
    const mainController = new MainController({receiptService})

    return {mainController}
}

const start = async (port) => {
    verifyEnvKeys()

    const knex = require("knex")({
        client: "pg",
        connection: {
            host: process.env.POSTGRES_HOST,
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DB,
            ssl: true
        }
    })

    await knex.raw("SELECT 1+1")

    const {mainController} = buildDependencies({knex})

    Routes({fastify, mainController})

    fastify.register(require("fastify-healthcheck"))

    if (port) {
        fastify.listen(port, "0.0.0.0", (err) => {
            logger.info("Server started on port " + port)
            if (err) throw err
        })
    }

    return fastify
}

const stop = async () => {
    await fastify.close()
}

module.exports = {
    start,
    stop
}
