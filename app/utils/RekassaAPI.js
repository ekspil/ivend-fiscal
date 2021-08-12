/* eslint-disable no-empty */

const fetch = require("node-fetch")
const RekassaResponse = require("../models/RekassaResponse")
const RekassaReceiptReport = require("../models/RekassaReceiptReport")
const UmkaNotAuthorized = require("../errors/UmkaNotAuthorized")
const UmkaResponseError = require("../errors/UmkaResponseError")
const logger = require("my-custom-logger")


/**
 * Get UMKA token for sending authorized requests
 *
 * @returns {Promise<string>}
 */
const getToken = async (number, password) => {

    const data = {
        number,
        password
    }
    const headers = {
        "Content-Type": "application/json"
    }
    const response = await fetchUrl(`${process.env.REKASSA_URL}/api/auth/login?apiKey=${process.env.REKASSA_APIKEY}`, {
        method: "POST",
        body: JSON.stringify(data),
        headers

    })

    switch (response.status) {
        case 200: {
            const text = await response.text()

            return text
        }
        default:
            throw new Error("Cannot login, unknown status code: " + response.status)
    }
}


const fetchUrl = async (url, options) => {
    if (!options) {
        options = {}
    }
    const method = options.method || "GET"
    const body = options.body
    logger.debug(`rekassa_api_fetch_url [${method}] ${url} ${body || ""}`)

    return await fetch(url, options)
}

class RekassaAPI {

    /**
     *
     * @param machineKkt {string}
     * @param fiscalRequest {FiscalRequest}
     * @returns {Promise<UmkaResponse>}
     */
    static async registerSale(rekassaKkt, fiscalRequest, receipt) {
        const token = await getToken(receipt.rekassa_number, receipt.rekassa_password)


        const headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        }

        const response = await fetchUrl(`${process.env.REKASSA_URL}/api/crs/${rekassaKkt}/tickets`, {
            method: "POST",
            headers,
            body: JSON.stringify(fiscalRequest)
        })

        switch (response.status) {
            case 401: {
                throw new UmkaNotAuthorized()
            }
            case 200: {
                const json = await response.json()

                const rekassaResponse = new RekassaResponse(json, token)

                if (rekassaResponse.error) {
                    logger.error("rekassa_api_sale_error " + rekassaResponse)

                    throw new Error(`Error while sending sale to UMKA: [${rekassaResponse.error.code}] ${rekassaResponse.error.text}`)
                }

                logger.debug(`rekassa_api_sale_success ${rekassaResponse.id}`)

                return rekassaResponse
            }
            default: {
                const text = await response.text()

                let json = null

                try {
                    json = JSON.parse(text)
                    json = new RekassaResponse(json)
                } catch (e) {
                }

                if (json) {
                    throw new UmkaResponseError(json)
                }

                logger.error(`rekassa_api_error_unknown_status_code ${fiscalRequest.external_id} ${response.status} ${text}`)
                throw new Error("Unknown status code from server: " + response.status)
            }
        }
    }

    /**
     * Get report (status)
     * @param uuid {string}
     * @returns {Promise<UmkaReceiptReport>}
     */
    static async getReport(data, receipt) {
        const headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + data.token
        }
        const body = {type: "DOWNLOAD"}

        const response = await fetchUrl(`${process.env.REKASSA_URL}/api/crs/${receipt.rekassa_kkt_id}/tickets/${data.uuid}/receipts`, {
            method: "POST",
            headers,
            body: JSON.stringify(body)
        })

        switch (response.status) {
            case 401: {
                throw new UmkaNotAuthorized()
            }
            case 200: {
                const json = await response.json()

                const rekassaResponse = new RekassaReceiptReport(json)

                if (rekassaResponse.error) {
                    logger.error("rekassa_api_get_report_failed " + rekassaResponse)

                    throw new Error(`Failed to get report with uuid ${data.uuid}: [${rekassaResponse.error.code}] ${rekassaResponse.error.text}`)
                }

                logger.debug(`rekassa_api_successful_report ${data.uuid} ${JSON.stringify(rekassaResponse)}`)

                return rekassaResponse
            }
            default: {
                const text = await response.text()

                let json = null

                try {
                    json = JSON.parse(text)
                    json = new RekassaResponse(json)
                } catch (e) {
                }

                if (json) {
                    throw new UmkaResponseError(json)
                }

                logger.error(`rekassa_api_error_unknown_status_code ${data.uuid} ${response.status} ${text}`)
                throw new Error("Unknown status code from server: " + response.status)
            }
        }
    }
}


module.exports = RekassaAPI
