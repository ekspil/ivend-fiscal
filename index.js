require("dotenv").config()

const App = require("./app/app")
const logger = require("my-custom-logger")
const version = require("./package").version

App
    .start(process.env.NODE_ENV === "test" ? null : Number(process.env.BACKEND_PORT))
    .then(() => {
        logger.info(`iVend Fiscal service v${version} started`)
    })
    .catch(err => {
        logger.error("Error during startup: " + err)
    })
