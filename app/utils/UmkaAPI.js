const fetch = require("node-fetch")
const UmkaResponse = require("../models/UmkaResponse")
const UmkaReceiptReport = require("../models/UmkaReceiptReport")
const logger = require("my-custom-logger")


class UmkaAPI {
    /**
     * Get UMKA token for sending authorized requests
     *
     * @returns {Promise<string>}
     */
    static async getToken() {
        const response = await fetch(`https://umka365.ru/kkm-trade/atolpossystem/v4/getToken?login=${process.env.UMKA_LOGIN}&pass=${process.env.UMKA_PASS}`)

        switch (response.status) {
            case 200: {
                const json = await response.json()

                if (json.text) {
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

        const response = await fetch(`https://umka365.ru/kkm-trade/atolpossystem/v4/${machineKkt || "any"}/sell/`, {
            method: "POST",
            headers,
            body: JSON.stringify(fiscalRequest)
        })

        switch (response.status) {
            case 200: {
                const json = await response.json()

                const umkaResponse = new UmkaResponse(json)

                if (umkaResponse.error) {
                    logger.error(umkaResponse)

                    throw new Error(`Error while sending sale to UMKA: [${umkaResponse.error.code}] ${umkaResponse.error.text}`)
                }

                return umkaResponse
            }
            default: {
                const text = await response.text()
                console.log(text)
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

        const response = await fetch(`https://umka365.ru/kkm-trade/atolpossystem/v4/any/report/${uuid}`, {
            method: "GET",
            headers
        })

        switch (response.status) {
            case 200: {
                const json = await response.json()

                const umkaResponse = new UmkaReceiptReport(json)

                if (umkaResponse.error) {
                    logger.error(umkaResponse)

                    throw new Error(`Failed to get report with uuid ${uuid}: [${umkaResponse.error.code}] ${umkaResponse.error.text}`)
                }

                return umkaResponse
            }
            default: {
                throw new Error("Unknown status code from server: " + response.status)
            }
        }
    }
}


module.exports = UmkaAPI


/*
* Авторизация методом GET
https://umka365.ru/kkm-trade/atolpossystem/v3/getToken?login=[login]&pass=[pass]

Ответ на запрос авторизации
{
«code»: 1,
«text»: null,
«token»: «8657456346547586»
}
Либо
{
«code»: 19,
«text»: «Неверный логин или пароль»,
«token»: «»
}
* */
