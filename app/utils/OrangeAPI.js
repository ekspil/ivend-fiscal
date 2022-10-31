/* eslint-disable no-empty */

const fetch = require("node-fetch")
const logger = require("my-custom-logger")
//const path = require("path")
const fs = require("fs")
const https = require("https")


var rs = require("jsrsasign")
var rsu = require("jsrsasign-util")
var pem = rsu.readFile("ivend_prv.pem")
var prvKey = rs.KEYUTIL.getKey(pem)


const cert = fs.readFileSync(
    "7805714120.crt",
    `utf-8`,
)
const key = fs.readFileSync(
    "7805714120.key",
    "utf-8",
)





const reqUrl = "https://api.orangedata.ru:12003/api/v2/documents"
class OrangeAPI {

    /**
     *
     * @param machineKkt {string}
     * @param fiscalRequest {FiscalRequest}
     * @returns {Promise<UmkaResponse>}
     */
    static async registerSale(machineKkt, fiscalRequest) {
        const data = JSON.stringify(fiscalRequest)

        const sig = new rs.Signature({alg: "SHA256withRSA"})
        sig.init(prvKey)
        sig.updateString(data)
        const sigVal = sig.sign()
        const sig64 = Buffer.from(sigVal, "hex").toString("base64")


        const headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Signature": sig64
        }


        const options = {
            cert,
            key,
            passphrase:
                "1234",
            rejectUnauthorized: false,
            keepAlive: false,
        }

        const sslConfiguredAgent = new https.Agent(options)

        try {
            // make the request just as you would normally ...
            const response = await fetch(reqUrl, {
                headers: headers, // ... pass everything just as you usually would
                method: "POST",
                body: data,
                agent: sslConfiguredAgent, // ... but add the agent we initialised
            })
            let json
            switch (response.status) {
                case 200:
                    return true
                case 201:
                    return true
                case 409:
                    return true
                default:
                    json = await response.json()
                    logger.error(`orange_new_api_error_unknown_status_code ${response.status}  ${json} `)
                    return false

            }
        } catch (error) {
            logger.info(error.message)
        }
    }

    /**
     * Get report (status)
     * @param uuid {string}
     * @returns {Promise<{state: string}>}
     */
    static async getReport(receipt) {
        const extId = `IVEND-receipt-${receipt.id}-${receipt.controllerUid}`
        const headers = {
            Accept: "application/json",
            "Content-Type": "application/json"
        }
        const repUrl = `https://api.orangedata.ru:12003/api/v2/documents/${receipt.inn}/status/${extId}`
        const options = {
            cert,
            key,
            passphrase:
                "1234",
            rejectUnauthorized: false,
            keepAlive: false,
        }

        const sslConfiguredAgent = new https.Agent(options)

        try {
            // make the request just as you would normally ...
            const response = await fetch(repUrl, {
                headers: headers, // ... pass everything just as you usually would
                method: "GET",
                agent: sslConfiguredAgent, // ... but add the agent we initialised
            })
            let json
            switch (response.status) {
                case 200:
                    json =  await response.json()
                    return {state: "success", fisc: json}
                case 202:
                    return {state: "waiting"}
                default:
                    json = await response.json()
                    logger.error(`orange_new_api_error_unknown_status_code ${response.status}  ${json} `)
                    return {state: "error"}

            }

        } catch (error) {
            logger.error(error.message)
        }
    }
}


module.exports = OrangeAPI
