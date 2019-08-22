const logger = require("my-custom-logger")

function Routes({fastify, mainController}) {
    fastify.setErrorHandler((error, request, reply) => {
        if (error.message === "Not Found") {
            return reply.type("application/json").code(404).send()
        }

        logger.error(error)
        logger.error(`RequestBody: ${JSON.stringify(request.body)}`)
        logger.error(error.stack)

        reply.type("application/json").code(500).send()
    })

    fastify.post("/api/v1/printer/:remotePrinterId/queue", mainController.insertJob)
    fastify.get("/api/v1/printer/:remotePrinterId/queue", mainController.getItemFromQueue)
    fastify.delete("/api/v1/printer/:remotePrinterId/queue", mainController.removeLastJob)
}

module.exports = Routes
