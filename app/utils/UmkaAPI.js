const fetch = require("node-fetch")

/**
 * Get UMKA token for sending authorized requests
 *
 * @param login {string}
 * @param pass {string}
 * @returns {Promise<string>}
 */
const getToken = async (login, pass) => {
    const response = await fetch(`https://umka365.ru/kkm-trade/atolpossystem/v4/getToken?login=${login}&pass=${pass}`)

    const json = await response.json()

    return json.data.token
}


/**
 *
 * @param machineKkt {string}
 * @param saleData {UmkaSaleData}
 * @returns {Promise<boolean|string|*>}
 */
const registerSale = async (machineKkt, saleData) => {
    const token = await getToken(process.env.UMKA_LOGIN, process.env.UMKA_PASS)

    const response = await fetch(`https://umka365.ru/kkm-trade/atolpossystem/v4/${machineKkt || "any"}/sell/`)

    const headers = {
        "Content-Type": "application/json",
        token
    }

    const json = await response.json()

    return json.data.token
}


const getReport = async (login, pass) => {
    const serverUrl = server || process.env.FISCAL_DEFAULT_SERVER
    let axConf = {
        method: "get",
        baseURL: `https://${serverUrl}/kkm-trade/atolpossystem/v4/any/report/${id}`,
        params: {
            "token": token
        }

    }
    return await axios(axConf)
        .then((response) => {
            return response.data
        })
}
