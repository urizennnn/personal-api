

class CustomAPIErrorHandler extends Error{
    constructor(message,statusCode){
        super(message)
        this.statusCode = statusCode
    }
}

function createCustomError(msg,statusCode){
    return new CustomAPIErrorHandler(msg,statusCode)
}

module.exports = {createCustomError,CustomAPIErrorHandler}