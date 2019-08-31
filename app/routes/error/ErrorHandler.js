const logger = require("my-custom-logger")
const ReceiptNotFoundError = require("../../errors/ReceiptNotFoundError")

const ErrorHandler = (error, request, reply) => {
    if (error.message === "Not Found") {
        logger.error("Url not found " + request.req.url)
        return reply.type("application/json").code(404).send({message: "URL not found"})
    }

    if(error instanceof ReceiptNotFoundError) {
        logger.debug("Receipt not found with id " + error.receiptId)
        return reply.type("application/json").code(404).send({message: "Receipt not found"})
    }

    const msg = `
    body: ${JSON.stringify(request.body)}
    query: ${JSON.stringify(request.query)}
    params: ${JSON.stringify(request.params)}
    error: ${error.message || error}
    stack: ${error.stack}
    `
    logger.error(msg)

    return reply.type("application/json").code(500).send({message: "Internal Server Error"})
}


module.exports = ErrorHandler
