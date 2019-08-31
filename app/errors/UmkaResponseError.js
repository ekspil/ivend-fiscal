class UmkaResponseError extends Error{

    constructor(json) {
        super()
        this.json = json
    }
}

module.exports = UmkaResponseError
