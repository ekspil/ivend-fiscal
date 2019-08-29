const fetch = require("node-fetch")
const UmkaResponse = require("../models/UmkaResponse")
const UmkaReceiptReport = require("../models/UmkaReceiptReport")
const UmkaApiTimeout = require("../errors/UmkaApiTimeout")
const logger = require("my-custom-logger")

const fetchWithTimeout = async (url, options) => {

    return new Promise((resolve, reject) => {
        const timeoutMillis = Number(process.env.UMKA_API_FETCH_TIMEOUT_SECONDS) * 1000
        setTimeout(() => {
            logger.debug(`umka_api_fetch_url_timeout ${url} ${options.body ? JSON.stringify(options.body): undefined}`)
            reject(new UmkaApiTimeout())
        }, timeoutMillis)

        logger.debug(`umka_api_fetch_url ${url}`)

        fetch(url, options)
            .then(resp => resolve(resp))
            .catch(e => reject(e))
    })


}


class UmkaAPI {
    /**
     * Get UMKA token for sending authorized requests
     *
     * @returns {Promise<string>}
     */
    static async getToken() {
        const response = await fetchWithTimeout(`https://umka365.ru/kkm-trade/atolpossystem/v4/getToken?login=${process.env.UMKA_LOGIN}&pass=${process.env.UMKA_PASS}`)

        switch (response.status) {
            case 200: {
                const json = await response.json()

                if (json.text) {
                    logger.debug(`umka_api_error_text [${json.code}] ${json.error.text}`)
                    throw new Error(`Failed to login: [${json.code}] ${json.error.text}`)
                }

                return json.token
            }
            default:
                throw new Error("Cannot login, unknown status code: " + response.status)
        }
    }

    /**
     *
     * @param machineKkt {string}
     * @param fiscalRequest {FiscalRequest}
     * @returns {Promise<UmkaResponse>}
     */
    static async registerSale(machineKkt, fiscalRequest) {
        const token = await this.getToken()

        const headers = {
            "Content-Type": "application/json",
            token
        }

        const response = await fetchWithTimeout(`https://umka365.ru/kkm-trade/atolpossystem/v4/${machineKkt || "any"}/sell/`, {
            method: "POST",
            headers,
            body: JSON.stringify(fiscalRequest)
        })

        switch (response.status) {
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
                logger.error(`umka_api_error_unknown_status_code ${response.status} ${text}`)
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
        const token = await this.getToken()

        const headers = {
            "Content-Type": "application/json",
            token
        }

        const response = await fetchWithTimeout(`https://umka365.ru/kkm-trade/atolpossystem/v4/any/report/${uuid}`, {
            method: "GET",
            headers
        })

        switch (response.status) {
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
                throw new Error("Unknown status code from server: " + response.status)
            }
        }
    }
}


module.exports = UmkaAPI
