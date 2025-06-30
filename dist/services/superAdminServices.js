"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.superAdminServices = void 0;
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
const customError_1 = require("../types/customError");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
class superAdminServices {
    loginSuperAdminServices(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userData = yield prismaClient_1.default.user.findUnique({
                    where: { email: data.email },
                });
                if (!userData) {
                    throw new customError_1.CustomError("User not found", 404, "User not found");
                }
                const isPasswordValid = userData.password ? yield bcryptjs_1.default.compare(data.password, userData.password) : false;
                if (!isPasswordValid) {
                    throw new customError_1.CustomError("Invalid password", 401, "Invalid password");
                }
                if (userData.user_type !== "SUPER_ADMIN") {
                    throw new customError_1.CustomError("Unauthorized", 401, "Unauthorized");
                }
                const jwtPayload = {
                    login_id: userData.email,
                    id: userData.id.toString(),
                    uuid: userData.uuid,
                    user_type: userData.user_type,
                };
                const token = jsonwebtoken_1.default.sign(jwtPayload, process.env.JWT_SECRET, {
                    expiresIn: "30d",
                });
                const { password: _password } = userData, safeUserData = __rest(userData, ["password"]);
                return {
                    message: "Login successful",
                    token,
                    user: Object.assign(Object.assign({}, safeUserData), { id: userData.id.toString() }),
                };
            }
            catch (error) {
                console.error("❌ Login error:", error);
                throw error instanceof customError_1.CustomError
                    ? error
                    : new customError_1.CustomError("Failed to login super admin", 500, error.message);
            }
        });
    }
}
exports.superAdminServices = superAdminServices;
(() => __awaiter(void 0, void 0, void 0, function* () {
    const superadminEmail = "superadmin@example.com";
    const superadminPassword = "supersecurepassword";
    try {
        // Check if a superadmin already exists
        const existingSuperAdmin = yield prismaClient_1.default.user.findFirst({
            where: { user_type: "SUPER_ADMIN" },
        });
        if (existingSuperAdmin) {
            console.log("✅ Default superadmin already created.");
        }
        else {
            const hashedPassword = yield bcryptjs_1.default.hash(superadminPassword, 10);
            yield prismaClient_1.default.user.create({
                data: {
                    uuid: (0, uuid_1.v4)(),
                    email: superadminEmail,
                    password: hashedPassword,
                    user_type: "SUPER_ADMIN", // ✅ only if added in model
                    name: "Super Admin",
                },
            });
            console.log("✅ Default superadmin created successfully.");
        }
    }
    catch (error) {
        console.error("❌ Error while checking or creating superadmin:", error);
    }
}))();
