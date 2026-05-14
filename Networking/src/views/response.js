class SuccessResponse {
    constructor(data, statusCode = 200) {
        this.statusCode = statusCode;
        this.data = data;
        this.status = "success";
    }
}

class FailedResponse {
    constructor(statusCode = 400, message = 'An error occurred') {
        this.statusCode = statusCode;
        this.status = "failed";
        this.message = message;
    }
}

class ErrorResponse {
    constructor(message, statusCode = 500) {
        this.message = message;
        this.statusCode = statusCode;
        this.status = "error";
    }
}

module.exports = {
    SuccessResponse,
    FailedResponse,
    ErrorResponse
};