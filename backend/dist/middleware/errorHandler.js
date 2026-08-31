"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: err.message,
            },
        });
    }
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            error: {
                code: 'INVALID_ID',
                message: 'Invalid Object ID',
            },
        });
    }
    res.status(500).json({
        success: false,
        error: {
            code: 'SERVER_ERROR',
            message: 'An unexpected error occurred',
        },
    });
};
exports.errorHandler = errorHandler;
