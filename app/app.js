const Redis = require("ioredis")
const fastify = require("fastify")({})
const logger = require("my-custom-logger")
const MainController = require("./controllers/MainController")
const QueueStorage = require("./storages/QueueStorage")
const Routes = require("./routes")


const verifyEnvKeys = () => {
    if (!process.env.REDIS_HOST) {
        throw new Error("REDIS_HOST not set")
    }
}

const buildDependencies = () => {
    const redis = new Redis({
        port: 6379,
        host: process.env.REDIS_HOST,
        password: process.env.REDIS_PASSWORD,
    })

    const queueStorage = new QueueStorage({redis})
    const mainController = new MainController({queueStorage})

    return {mainController}
}

const start = async () => {
    verifyEnvKeys()

    const {mainController} = buildDependencies()


    Routes({fastify, mainController})

    fastify.register(require("fastify-healthcheck"))

    fastify.listen(Number(process.env.BACKEND_PORT), "0.0.0.0", (err) => {
        logger.info("Server started on port " + Number(process.env.BACKEND_PORT))
        if (err) throw err
    })


}

const stop = () => {
    // Stop server
}

module.exports = {
    start,
    stop
}
