/* eslint-disable no-empty */

const fetch = require("node-fetch")
const TelemediaResponse = require("../models/TelemediaResponse")
const TelemediaReceiptReport = require("../models/TelemediaReceiptReport")
const UmkaNotAuthorized = require("../errors/UmkaNotAuthorized")
const UmkaResponseError = require("../errors/UmkaResponseError")
const logger = require("my-custom-logger")




const fetchUrl = async (url, options) => {
    if (!options) {
        options = {}
    }
    const method = options.method || "GET"
    const body = options.body
    logger.debug(`telemedia_api_fetch_url [${method}] ${url} ${body || ""}`)

    return await fetch(url, options)
}

class TelemediaAPI {

    /**
     *
     * @param machineKkt {string}
     * @param fiscalRequest {FiscalRequest}
     * @returns {Promise<UmkaResponse>}
     */
    static async registerSale(fiscalRequest) {
        const token = process.env.TELEMEDIA_TOKEN


        const headers = {
            "Content-Type": "application/json",
            "Authorization": "Token " + token
        }

        const response = await fetchUrl(`${process.env.TELEMEDIA_URL}/api/operation/generate_check/`, {
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

                const telemediaResponse = new TelemediaResponse(json)

                if (telemediaResponse.error) {
                    logger.error("telemedia_api_sale_error " + telemediaResponse)

                    throw new Error(`Error while sending sale to TELEMEDIA: [${telemediaResponse.error.code}] ${telemediaResponse.error.text}`)
                }

                logger.debug(`telemedia_api_sale_success ${telemediaResponse.id}`)

                return telemediaResponse
            }
            default: {
                const text = await response.text()

                let json = null

                try {
                    json = JSON.parse(text)
                    json = new TelemediaResponse(json)
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

                const telemediaResponse = new TelemediaReceiptReport(json)

                if (telemediaResponse.error) {
                    logger.error("rekassa_api_get_report_failed " + telemediaResponse)

                    throw new Error(`Failed to get report with uuid ${data.uuid}: [${telemediaResponse.error.code}] ${telemediaResponse.error.text}`)
                }

                logger.debug(`rekassa_api_successful_report ${data.uuid} ${JSON.stringify(telemediaResponse)}`)

                return telemediaResponse
            }
            default: {
                const text = await response.text()

                let json = null

                try {
                    json = JSON.parse(text)
                    json = new TelemediaResponse(json)
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


module.exports = TelemediaAPI
