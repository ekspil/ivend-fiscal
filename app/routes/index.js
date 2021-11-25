const ErrorHandler = require("./error/ErrorHandler")

function Routes({fastify, receiptController}) {
    fastify.setErrorHandler(ErrorHandler)

    fastify.post("/api/v1/fiscal/receipt", receiptController.createReceipt)
    fastify.post("/api/v1/fiscal/statuses", receiptController.getStatuses)
    fastify.post("/api/v1/fiscal/receiptRekassa", receiptController.createReceiptRekassa)
    fastify.get("/api/v1/fiscal/receipt/:id", receiptController.getReceiptById)
    fastify.get("/api/v1/fiscal/receipt/resend/:id", receiptController.resend)
    fastify.get("/api/v1/fiscal/status/kktRegNumber/:id", receiptController.getKktStatus)
    fastify.get("/api/v1/fiscal/status/controllerUid/:id", receiptController.getControllerKktStatus)
    fastify.get("/api/v1/fiscal/info/kktRegNumber/:id", receiptController.getKktInfo)
    fastify.get("/api/v1/fiscal/info/controllerUid/:id", receiptController.getControllerKktInfo)
}

module.exports = Routes
