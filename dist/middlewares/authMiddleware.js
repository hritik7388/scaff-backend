"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
            const decoded = (jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET));
            req.user = {
                user_id: decoded.user_id,
                user_uuid: decoded.user_uuid,
                id: decoded.id,
                user_type: decoded.user_type // Ensure user_type is present in the token payload
            };
            next();
        }
        catch (error) {
            res.status(401).json({ message: 'Invalid or expired token' });
        }
    }
    else {
        res.status(401).json({ message: 'Authorization header missing or malformed' });
    }
};
exports.authMiddleware = authMiddleware;
