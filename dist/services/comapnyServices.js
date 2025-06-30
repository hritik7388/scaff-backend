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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyServices = void 0;
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
const customError_1 = require("../types/customError");
const utils_1 = require("../helpers/utils");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class CompanyServices {
    registerCompany(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const companyData = yield prismaClient_1.default.company.findUnique({
                    where: {
                        email: data.email,
                        name: data.name,
                        mobileNumber: data.mobileNumber,
                    },
                });
                if (companyData) {
                    throw new customError_1.CustomError("Company with the provided email already exists", 400, "Company already exists");
                }
                if (data.password !== data.confirmPassword) {
                    throw new customError_1.CustomError("Password and confirm password do not match", 400, "Password mismatch");
                }
                const hasPassword = bcryptjs_1.default.hashSync(data.password, 10);
                const newCompany = yield prismaClient_1.default.company.create({
                    data: {
                        name: data.name,
                        email: data.email,
                        address: data.address,
                        image: data.image,
                        password: hasPassword,
                        company_ID: data.company_ID,
                        mobileNumber: data.mobileNumber,
                        isApproved: "PENDING",
                    },
                });
                // Add this check
                const existingUser = yield prismaClient_1.default.user.findUnique({
                    where: { email: data.email },
                });
                if (existingUser) {
                    throw new customError_1.CustomError("User with the provided email already exists", 400, "User already exists");
                }
                const newUser = yield prismaClient_1.default.user.create({
                    data: {
                        name: data.name,
                        email: data.email,
                        password: hasPassword,
                        user_type: "SUB_ADMIN",
                        companyId: newCompany.id,
                    },
                });
                if (data.deviceToken && data.deviceType) {
                    const existingDevice = yield prismaClient_1.default.device.findFirst({
                        where: { userId: newUser.id },
                    });
                    if (existingDevice) {
                        yield prismaClient_1.default.device.update({
                            where: { id: existingDevice.id },
                            data: { deviceToken: data.deviceToken, deviceType: data.deviceType },
                        });
                    }
                    else {
                        yield prismaClient_1.default.device.create({
                            data: { userId: newUser.id, deviceToken: data.deviceToken, deviceType: data.deviceType },
                        });
                    }
                }
                return {
                    message: "Company registered successfully",
                    company: Object.assign(Object.assign({}, newCompany), { id: newCompany.id.toString() }),
                };
            }
            catch (error) {
                console.log("error===================>>>", error);
                throw error instanceof customError_1.CustomError
                    ? error
                    : new customError_1.CustomError("Failed to register company", 500, error.message);
            }
        });
    }
    loginCompanyServices(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
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
                if (userData.user_type !== "SUB_ADMIN") {
                    throw new customError_1.CustomError("Unauthorized", 401, "Unauthorized");
                }
                // ✅ Device token handling
                if (data.deviceToken && data.deviceType) {
                    const existingDevice = yield prismaClient_1.default.device.findFirst({
                        where: { userId: userData.id },
                    });
                    if (existingDevice) {
                        yield prismaClient_1.default.device.update({
                            where: { id: existingDevice.id },
                            data: { deviceToken: data.deviceToken, deviceType: data.deviceType },
                        });
                    }
                    else {
                        yield prismaClient_1.default.device.create({
                            data: { userId: userData.id, deviceToken: data.deviceToken, deviceType: data.deviceType },
                        });
                    }
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
                const user = {
                    id: userData.id.toString(),
                    uuid: userData.uuid,
                    name: userData.name,
                    email: userData.email,
                    user_type: userData.user_type,
                    companyId: (_b = (_a = userData.companyId) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : null, // in case companyId is BigInt
                };
                return {
                    message: "Login successful",
                    token,
                    user,
                };
            }
            catch (error) {
                console.error("❌ Login error:", error);
                throw error instanceof customError_1.CustomError ? error : new customError_1.CustomError("Failed to login company", 500, error.message);
            }
        });
    }
    updateCompanyDetails(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userData = yield prismaClient_1.default.user.findUnique({
                    where: { id: id },
                });
                if (!userData || userData.user_type !== "SUPER_ADMIN") {
                    throw new customError_1.CustomError("USER not found or not a super admin", 404, "Not Found");
                }
                const companyData = yield prismaClient_1.default.company.findUnique({
                    where: {
                        id: data.id,
                    },
                });
                if (!companyData) {
                    throw new customError_1.CustomError("Company not found", 404, "Not found");
                }
                const existingCompany = yield prismaClient_1.default.company.findUnique({
                    where: {
                        id: data.id,
                        email: data.email,
                        name: data.name,
                        mobileNumber: data.mobileNumber,
                    },
                });
                if (existingCompany) {
                    throw new customError_1.CustomError("Company with the provided email, name or mobile number already exists", 409, "Conflict");
                }
                const updatedComapny = yield prismaClient_1.default.company.update({
                    where: {
                        id: companyData.id,
                    },
                    data: {
                        name: data.name,
                        email: data.email,
                        address: data.address,
                        image: data.image,
                        password: data.password,
                        mobileNumber: data.mobileNumber,
                    },
                });
                return {
                    message: "Company details updated successfully",
                    company: Object.assign(Object.assign({}, updatedComapny), { id: updatedComapny.id.toString() }),
                };
            }
            catch (error) {
                console.log("error===================>>>", error);
                throw error instanceof customError_1.CustomError
                    ? error
                    : new customError_1.CustomError("Failed to update company details", 500, error.message);
            }
        });
    }
    getCompanyallDetails(id, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const skip = (page - 1) * limit;
                const [companyData, totalCount] = yield Promise.all([
                    prismaClient_1.default.company.findMany({
                        skip,
                        take: limit,
                    }),
                    prismaClient_1.default.company.count(),
                ]);
                const totalPages = Math.ceil(totalCount / limit);
                return {
                    message: "All company details fetched successfully",
                    companies: companyData.map((company) => (Object.assign(Object.assign({}, company), { id: company.id.toString() }))),
                    totalCount,
                    totalPages,
                    currentPage: page,
                };
            }
            catch (error) {
                console.log("error===================>>>", error);
                throw error instanceof customError_1.CustomError
                    ? error
                    : new customError_1.CustomError("Failed to fetch company details", 500, error.message);
            }
        });
    }
    getCompanyById(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const companyData = yield prismaClient_1.default.company.findUnique({
                    where: { id: data.id },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        address: true,
                        image: true,
                        mobileNumber: true,
                        isApproved: true,
                    },
                });
                if (!companyData) {
                    throw new customError_1.CustomError("Company not found", 404, "Not Found");
                }
                return {
                    message: "Company details fetched successfully",
                    company: Object.assign(Object.assign({}, companyData), { id: companyData.id.toString() }),
                };
            }
            catch (error) {
                console.error("getCompanyById error:", error);
                throw error instanceof customError_1.CustomError
                    ? error
                    : new customError_1.CustomError("Failed to fetch company details", 500, error.message);
            }
        });
    }
    approveCompanyRequest(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userData = yield prismaClient_1.default.user.findUnique({
                    where: { id: id },
                });
                if (!userData || userData.user_type !== "SUPER_ADMIN") {
                    throw new customError_1.CustomError("USER not found or not a super admin", 404, "Not Found");
                }
                const companyData = yield prismaClient_1.default.company.findUnique({
                    where: { id: data.id },
                });
                if (!companyData) {
                    throw new customError_1.CustomError("Company not found", 404, "Not found");
                }
                if (companyData.isApproved !== "PENDING") {
                    throw new customError_1.CustomError("Company request already approved or rejected", 400, "Bad Request");
                }
                const updatedCompany = yield prismaClient_1.default.company.update({
                    where: { id: data.id },
                    data: {
                        isApproved: "APPROVED",
                    },
                });
                // await sendMailApproval(companyData.email, companyData.password);
                return {
                    message: "Company request approved successfully",
                    company: Object.assign(Object.assign({}, companyData), { id: companyData.id.toString() }),
                };
            }
            catch (error) {
                console.log("error===================>>>", error);
                throw error instanceof customError_1.CustomError
                    ? error
                    : new customError_1.CustomError("Failed to approve company request", 500, error.message);
            }
        });
    }
    rejectCompanyRequest(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userData = yield prismaClient_1.default.user.findUnique({
                    where: { id: id },
                });
                if (!userData || userData.user_type !== "SUPER_ADMIN") {
                    throw new customError_1.CustomError("USER not found or not a super admin", 404, "Not Found");
                }
                const companyData = yield prismaClient_1.default.company.findUnique({
                    where: { id: data.id },
                });
                if (!companyData) {
                    throw new customError_1.CustomError("Company not found", 404, "Not found");
                }
                if (companyData.isApproved !== "PENDING") {
                    throw new customError_1.CustomError("Company request already approved or rejected", 400, "Bad Request");
                }
                const updatedCompany = yield prismaClient_1.default.company.update({
                    where: { id: companyData.id },
                    data: {
                        isApproved: "REJECTED",
                    },
                });
                return {
                    message: "Company request rejected successfully",
                    company: Object.assign(Object.assign({}, updatedCompany), { id: updatedCompany.id.toString() }),
                };
            }
            catch (error) {
                console.log("error===================>>>", error);
                throw error instanceof customError_1.CustomError
                    ? error
                    : new customError_1.CustomError("Failed to approve company request", 500, error.message);
            }
        });
    }
    searchCompany(id_1, data_1) {
        return __awaiter(this, arguments, void 0, function* (id, data, page = 1, limit = 10) {
            try {
                const userData = yield prismaClient_1.default.user.findUnique({
                    where: { id: id },
                });
                if (!userData || userData.user_type !== "SUPER_ADMIN") {
                    throw new customError_1.CustomError("USER not found or not a super admin", 404, "Not Found");
                }
                const skip = (Number(page) - 1) * Number(limit);
                const take = Number(limit);
                let whereCondition = {};
                if (data && typeof data === "string" && data.trim() !== "") {
                    const conditions = [
                        {
                            company_ID: data,
                        },
                        {
                            name: {
                                contains: data.toLowerCase(),
                            },
                        },
                    ];
                    if (!isNaN(Number(data))) {
                        conditions.unshift({
                            id: BigInt(data),
                        });
                    }
                    whereCondition = {
                        OR: conditions,
                    };
                }
                const companies = yield prismaClient_1.default.company.findMany({
                    where: whereCondition,
                    skip,
                    take,
                });
                const totalCompanies = yield prismaClient_1.default.company.count({
                    where: whereCondition,
                });
                return {
                    message: "Company search successful",
                    total: totalCompanies,
                    currentPage: Number(page),
                    totalPages: Math.ceil(totalCompanies / Number(limit)),
                    data: companies.map((company) => (Object.assign(Object.assign({}, company), { id: company.id.toString() }))),
                };
            }
            catch (error) {
                console.error("searchCompany error:", error);
                throw error instanceof customError_1.CustomError
                    ? error
                    : new customError_1.CustomError("Failed to search company", 500, error.message);
            }
        });
    }
    addNewCompany(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userData = yield prismaClient_1.default.user.findUnique({
                    where: { id: id },
                });
                if (!userData || userData.user_type !== "SUPER_ADMIN") {
                    throw new customError_1.CustomError("USER not found or not a super admin", 404, "Not Found");
                }
                // Check if company with same email exists
                const companyData = yield prismaClient_1.default.company.findUnique({
                    where: {
                        email: data.email,
                        name: data.name,
                        mobileNumber: data.mobileNumber,
                    },
                });
                if (companyData) {
                    throw new customError_1.CustomError("Company already exists", 400, "Company with the provided email already exists");
                }
                if (data.password !== data.confirmPassword) {
                    throw new customError_1.CustomError("Password mismatch", 400, "Password and confirm password do not match");
                }
                const companyID = (0, utils_1.generateCMP_ID)();
                // add new company
                const hasPassword = bcryptjs_1.default.hashSync(data.password, 10);
                const newCompany = yield prismaClient_1.default.company.create({
                    data: {
                        name: data.name,
                        email: data.email,
                        address: data.address,
                        image: data.image,
                        password: data.password,
                        company_ID: companyID,
                        mobileNumber: data.mobileNumber,
                        isApproved: "APPROVED",
                    },
                });
                const newUser = yield prismaClient_1.default.user.create({
                    data: {
                        name: data.name,
                        email: data.email,
                        password: hasPassword,
                        user_type: "SUB_ADMIN",
                        companyId: newCompany.id,
                    },
                });
                if (data.deviceToken && data.deviceType) {
                    const existingDevice = yield prismaClient_1.default.device.findFirst({
                        where: { userId: newUser.id },
                    });
                    if (existingDevice) {
                        yield prismaClient_1.default.device.update({
                            where: { id: existingDevice.id },
                            data: { deviceToken: data.deviceToken, deviceType: data.deviceType },
                        });
                    }
                    else {
                        yield prismaClient_1.default.device.create({
                            data: { userId: newUser.id, deviceToken: data.deviceToken, deviceType: data.deviceType },
                        });
                    }
                }
                return {
                    message: "Company registered successfully",
                    company: Object.assign(Object.assign({}, newCompany), { id: newCompany.id.toString() }),
                };
            }
            catch (error) {
                throw error instanceof customError_1.CustomError
                    ? error
                    : new customError_1.CustomError("Failed to register company", 500, error.message);
            }
        });
    }
    inactiveCompany(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userData = yield prismaClient_1.default.user.findUnique({
                    where: { id: id },
                });
                if (!userData || userData.user_type !== "SUPER_ADMIN") {
                    throw new customError_1.CustomError("USER not found or not a super admin", 404, "Not Found");
                }
                const companyData = yield prismaClient_1.default.company.findUnique({
                    where: {
                        id: data.id
                    }
                });
                if (!companyData) {
                    throw new customError_1.CustomError("Company not found", 404, "Not found");
                }
                const updateCompany = yield prismaClient_1.default.company.update({
                    where: { id: companyData.id },
                    data: {
                        // Add the fields you want to update here, for example:
                        status: "INACTIVE",
                    },
                });
                return {
                    message: "Company inactive successfully",
                    company: Object.assign(Object.assign({}, updateCompany), { id: updateCompany.id.toString() }),
                };
            }
            catch (error) {
                throw error instanceof customError_1.CustomError
                    ? error
                    : new customError_1.CustomError("Failed to register company", 500, error.message);
            }
        });
    }
}
exports.CompanyServices = CompanyServices;
