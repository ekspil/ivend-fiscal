
class UmkaErrorDetails {
    constructor({code, error, text}) {
        this.code = code
        this.error = error
        this.text = text
    }
}

class UmkaResponse {
    constructor({uuid, timestamp, error, status}) {
        this.uuid = uuid
        this.timestamp = timestamp
        this.error = error ? (new UmkaErrorDetails(error)) : null
        this.status = status
    }
}

module.exports = UmkaResponse
