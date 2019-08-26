const ErrorHandler = require("./error/ErrorHandler")

function Routes({fastify, receiptController}) {
    fastify.setErrorHandler(ErrorHandler)

    fastify.post("/api/v1/receipt", receiptController.createReceipt)
}

module.exports = Routes
