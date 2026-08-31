"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, data, statusCode = 200) => {
    res.status(statusCode).json({
        success: true,
        data,
    });
};
exports.sendSuccess = sendSuccess;
const sendError = (res, code, message, statusCode = 400) => {
    res.status(statusCode).json({
        success: false,
        error: {
            code,
            message,
        },
    });
};
exports.sendError = sendError;
