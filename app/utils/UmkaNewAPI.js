/* eslint-disable no-empty */

const fetch = require("node-fetch")
const logger = require("my-custom-logger")

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

/**
 * Get UMKA token for sending authorized requests
 *
 * @returns {Promise<string>}
 */



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
        }

        const response = await fetchUrl(`https://umka365.ru/kkm-trade/api/kkmDocPackForFiscalization`, {
            method: "POST",
            headers,
            body: JSON.stringify(fiscalRequest)
        })

        switch (response.status) {
            case 200: {
                const json = await response.json()

                if (json.results && json.results[0] && json.results[0].status !== "OK" && json.results[0].status !== "OK 2") {
                    logger.error("umka_new_api_sale_error " + json.results[0].externalId + " " + json.results[0].status)

                    throw new Error(`Error while sending sale to UMKA`)
                }

                logger.debug(`umka_api_sale_success ${fiscalRequest.docs[0].externalId}`)

                return json.results[0]
            }
            default: {
                logger.error(`umka_api_error_unknown_status_code ${fiscalRequest.docs[0].externalId} ${response.status} `)
                throw new Error("Unknown status code from server: " + response.status)
            }
        }
    }

    /**
     * Get report (status)
     * @param uuid {string}
     * @returns {Promise<UmkaReceiptReport>}
     */
    static async getReport(rs) {

        const items = rs.map(item => {
            const {id, controllerUid, inn} = item

            const externalId = `IVEND-receipt-${id}-${controllerUid}`
            return {
                externalId,
                cashierLogin: process.env.UMKA_LOGIN,
                cashierPassword: process.env.UMKA_PASS,
                companyInn: inn
            }
        })
        const headers = {
            "Content-Type": "application/json",
        }
        const data = {
            items
        }

        const response = await fetchUrl(`https://umka365.ru/kkm-trade/api/kkmDocPackForFiscalization?print_info=fisc`, {
            method: "POST",
            headers,
            body: JSON.stringify(data)

        })

        switch (response.status) {
            case 200: {
                const json = await response.json()
                logger.debug(`debug_fiscal_json ${JSON.stringify(json.results)}`)
                return json.results
            }
            default: {
                logger.error(`umka_new_api_error_unknown_status_code ${response.status} `)
                throw new Error("Unknown status code from server: " + response.status)
            }
        }
    }
}


module.exports = UmkaAPI
