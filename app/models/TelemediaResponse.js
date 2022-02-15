
class TelemediaErrorDetails {
    constructor({code, error, text}) {
        this.code = code
        this.error = error
        this.text = text
    }
}

class TelemediaResponse {
    constructor({fixed_check, created_at, error, link, total_amount, check_number, shift, check_type}) {
        this.uuid = fixed_check
        this.created_at = created_at
        this.error = error ? (new TelemediaErrorDetails(error)) : null
        this.link = link
        this.total_amount = total_amount
        this.check_number = check_number
        this.shift = shift
        this.check_type = check_type
    }
}

module.exports = TelemediaResponse
