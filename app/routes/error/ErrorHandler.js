const logger = require("my-custom-logger")

const ErrorHandler = (error, request, reply) => {
    if (error.message === "Not Found") {
        logger.error("Url not found " + request.req.url)
        return reply.type("application/json").code(404).send({message: "Not found"})
    }

    logger.error(error)
    logger.error(`RequestBody: ${JSON.stringify(request.body)}`)
    logger.error(error.stack)

    return reply.type("application/json").code(500).send({message: "Internal Server Error"})
}


module.exports = ErrorHandler
