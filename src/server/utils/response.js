const successResponse = (h, data, message = 'Success', code = 200) => {
    return h.response({
        status: 'success',
        message,
        data
    }).code(code);
};

const errorResponse = (h, message = 'An error occurred', code = 400, data = null) => {
    return h.response({
        status: 'error',
        message,
        data
    }).code(code);
};

module.exports = { successResponse, errorResponse };