"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
const zod_1 = require("zod");
const customError_1 = require("../types/customError");
function errorMiddleware(err, req, res, next) {
    console.error(err.stack);
    // Handle Zod validation errors
    if (err instanceof zod_1.ZodError) {
        res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: err.errors,
        });
        return;
    }
    //Handle Custom Errors
    if (err instanceof customError_1.CustomError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.details,
            // stack:err.stack
        });
        return;
    }
    // Determine the status code
    const statusCode = err.status || 500;
    // Handle generic errors
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        // Optionally include stack trace (avoid in production)
        // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
}
