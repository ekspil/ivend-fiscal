
class RekassaErrorDetails {
    constructor({code, error, text}) {
        this.code = code
        this.error = error
        this.text = text
    }
}

class RekassaResponse {
    constructor({id, messageTime, error, status}, token) {
        this.uuid = id
        this.timestamp = messageTime
        this.error = error ? (new RekassaErrorDetails(error)) : null
        this.status = status
        this.token = token
    }
}

module.exports = RekassaResponse
