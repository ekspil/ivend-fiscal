const ErrorHandler = require("./error/ErrorHandler")

function Routes({fastify, receiptController}) {
    fastify.setErrorHandler(ErrorHandler)

    fastify.post("/api/v1/fiscal/receipt", receiptController.createReceipt)
    fastify.post("/api/v1/fiscal/receiptRekassa", receiptController.createReceiptRekassa)
    fastify.get("/api/v1/fiscal/receipt/:id", receiptController.getReceiptById)
}

module.exports = Routes
