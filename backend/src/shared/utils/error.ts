const { ApiResponse } = require("../types/api")

function errorResponse(code: string, message: string, status = 400) {
  return {
    success: false,
    error: { code, message },
    status
  }
}

module.exports = { errorResponse }
