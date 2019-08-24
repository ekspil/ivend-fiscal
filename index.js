require("dotenv").config()

const App = require("./app/app")
const logger = require("my-custom-logger")

App
    .start(process.env.NODE_ENV === "test" ? null : Number(process.env.BACKEND_PORT))
    .then(() => {
        logger.info("iVend Fiscal service started")
    })
    .catch(err => {
        logger.error("Error during startup: " + err)
    })
