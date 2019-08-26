const logger = require("my-custom-logger")

function Routes({fastify, receiptController}) {
    fastify.setErrorHandler((error, request, reply) => {
        console.log(error)
        if (error.message === "Not Found") {
            return reply.type("application/json").code(404).send()
        }

        logger.error(error)
        logger.error(`RequestBody: ${JSON.stringify(request.body)}`)
        logger.error(error.stack)

        reply.type("application/json").code(500).send()
    })

    fastify.post("/api/v1/receipt", receiptController.createReceipt)
}

module.exports = Routes
