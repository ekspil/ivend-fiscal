const fastify = require("fastify")({})
const logger = require("my-custom-logger")
const ReceiptController = require("./controllers/ReceiptController")
const ReceiptService = require("./service/ReceiptService")
const CacheService = require("./service/CacheService")
const FiscalService = require("./service/FiscalService")
const ReceiptDAO = require("./daos/ReceiptDAO")
const FiscalDataDAO = require("./daos/FiscalDataDAO")
const Routes = require("./routes")
const FiscalizationWorker = require("./workers/FiscalizationWorker")
const Redis = require("ioredis")

const verifyEnvKeys = () => {
    if (!process.env.REDIS_HOST) {
        throw new Error("REDIS_HOST not set")
    }
}

let knex

const buildDependencies = ({knex, redis}) => {
    const receiptDAO = new ReceiptDAO({knex})
    const fiscalDataDAO = new FiscalDataDAO({knex})
    const receiptService = new ReceiptService({receiptDAO})
    const cacheService = new CacheService({redis})
    const fiscalService = new FiscalService({receiptDAO, fiscalDataDAO})
    const receiptController = new ReceiptController({receiptService})

    return {receiptController, receiptService, fiscalService, cacheService}
}

const start = async (port) => {
    verifyEnvKeys()

    knex = require("knex")({
        client: "pg",
        connection: {
            host: process.env.POSTGRES_HOST,
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            port: process.env.POSTGRES_PORT,
            database: process.env.POSTGRES_DB,
            ssl: true
        }
    })

    const redis = new Redis({
        host: process.env.REDIS_HOST,
        port: process.env.POSTGRES_PORT,
        password: process.env.REDIS_PASSWORD,
    })

    await knex.raw("SELECT 1+1")

    const {receiptController, receiptService, fiscalService, cacheService} = buildDependencies({knex, redis})

    Routes({fastify, receiptController})

    const fiscalizationWorker = new FiscalizationWorker({receiptService, fiscalService, cacheService})

    if (process.env.NODE_ENV !== "test") {
        fiscalizationWorker.start()
    }

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
    await knex.destroy()
    logger.info("Stopped...")
}

module.exports = {
    start,
    stop
}
