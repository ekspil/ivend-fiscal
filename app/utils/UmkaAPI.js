/* eslint-disable no-empty */

const fetch = require("node-fetch")
const UmkaResponse = require("../models/UmkaResponse")
const UmkaReceiptReport = require("../models/UmkaReceiptReport")
const UmkaNotAuthorized = require("../errors/UmkaNotAuthorized")
const UmkaResponseError = require("../errors/UmkaResponseError")
const logger = require("my-custom-logger")


let token

/**
 * Get UMKA token for sending authorized requests
 *
 * @returns {Promise<string>}
 */
const getToken = async () => {
    const response = await fetchUrl(`https://umka365.ru/kkm-trade/atolpossystem/v4/getToken?login=${process.env.UMKA_LOGIN}&pass=${process.env.UMKA_PASS}`)

    switch (response.status) {
        case 200: {
            const json = await response.json()

            if (json.text) {
                logger.debug(`umka_login_error_text [${json.code}] ${json.error.text}`)
                throw new Error(`Failed to login: [${json.code}] ${json.error.text}`)
            }

            token = json.token
            break
        }
        default:
            throw new Error("Cannot login, unknown status code: " + response.status)
    }
}

// Umka token is valid 24 hours by the spec
// lets reget it every 23 hours
setInterval(() => {
    getToken()
}, 23 * 60 * 60 * 1000)

const fetchUrl = async (url, options) => {
    if (!options) {
        options = {}
    }
    const method = options.method || "GET"
    const body = options.body
    logger.debug(`umka_api_fetch_url [${method}] ${url} ${body || ""}`)

    return await fetch(url, options)
}

class UmkaAPI {

    /**
     *
     * @param machineKkt {string}
     * @param fiscalRequest {FiscalRequest}
     * @returns {Promise<UmkaResponse>}
     */
    static async registerSale(machineKkt, fiscalRequest) {
        const headers = {
            "Content-Type": "application/json",
            token
        }

        const response = await fetchUrl(`https://umka365.ru/kkm-trade/atolpossystem/v4/${machineKkt || "any"}/sell/`, {
            method: "POST",
            headers,
            body: JSON.stringify(fiscalRequest)
        })

        switch (response.status) {
            case 401: {
                await getToken()
                logger.error("umka_api_auth_error " + JSON.stringify(fiscalRequest))
                throw new UmkaNotAuthorized()
            }
            case 200: {
                const json = await response.json()

                const umkaResponse = new UmkaResponse(json)

                if (umkaResponse.error) {
                    logger.error("umka_api_sale_error " + umkaResponse)

                    throw new Error(`Error while sending sale to UMKA: [${umkaResponse.error.code}] ${umkaResponse.error.text}`)
                }

                logger.debug(`umka_api_sale_success ${umkaResponse.uuid}`)

                return umkaResponse
            }
            default: {
                const text = await response.text()

                let json = null

                try {
                    json = JSON.parse(text)
                    json = new UmkaResponse(json)
                } catch (e) {
                }

                if (json) {
                    throw new UmkaResponseError(json)
                }

                logger.error(`umka_api_error_unknown_status_code ${fiscalRequest.external_id} ${response.status} ${text}`)
                throw new Error("Unknown status code from server: " + response.status)
            }
        }
    }

    /**
     * Get report (status)
     * @param uuid {string}
     * @returns {Promise<UmkaReceiptReport>}
     */
    static async getReport(uuid) {
        const headers = {
            "Content-Type": "application/json",
            token
        }

        const response = await fetchUrl(`https://umka365.ru/kkm-trade/atolpossystem/v4/any/report/${uuid}`, {
            method: "GET",
            headers
        })

        switch (response.status) {
            case 401: {
                await getToken()
                throw new UmkaNotAuthorized()
            }
            case 200: {
                const json = await response.json()

                const umkaResponse = new UmkaReceiptReport(json)

                if (umkaResponse.error) {
                    logger.error("umka_api_get_report_failed " + umkaResponse)

                    throw new Error(`Failed to get report with uuid ${uuid}: [${umkaResponse.error.code}] ${umkaResponse.error.text}`)
                }

                logger.debug(`umka_api_successful_report ${uuid} ${JSON.stringify(umkaResponse)}`)

                return umkaResponse
            }
            default: {
                const text = await response.text()

                let json = null

                try {
                    json = JSON.parse(text)
                    json = new UmkaResponse(json)
                } catch (e) {
                }

                if (json) {
                    throw new UmkaResponseError(json)
                }

                logger.error(`umka_api_error_unknown_status_code ${uuid} ${response.status} ${text}`)
                throw new Error("Unknown status code from server: " + response.status)
            }
        }
    }
}


module.exports = UmkaAPI
