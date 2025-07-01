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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
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
                        uuid: (0, uuid_1.v4)(),
                        name: data.name,
                        email: data.email,
                        address: data.address,
                        image: data.image,
                        password: hasPassword,
                        company_ID: data.company_ID,
                        mobileNumber: data.mobileNumber,
                        isApproved: "PENDING",
                        user_type: "COMPANY",
                    },
                });
                const existingUser = yield prismaClient_1.default.user.findUnique({
                    where: { email: data.email },
                });
                const newUser = yield prismaClient_1.default.user.create({
                    data: {
                        uuid: newCompany.uuid,
                        name: data.name,
                        email: data.email,
                        password: newCompany.password,
                        user_type: "COMPANY",
                        companyId: newCompany.id,
                        lastLogin: newCompany.lastLogin,
                    },
                });
                if (existingUser) {
                    throw new customError_1.CustomError("User with the provided email already exists", 400, "User already exists");
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
                const companyData = yield prismaClient_1.default.company.findUnique({
                    where: { email: data.email, isDeleted: false, status: "ACTIVE" },
                });
                if (!companyData) {
                    throw new customError_1.CustomError("User not found", 404, "User not found");
                }
                const isPasswordValid = companyData.password && (yield bcryptjs_1.default.compare(data.password, companyData.password));
                console.log("hasPisPasswordValidassword====================>>>>", isPasswordValid);
                if (!isPasswordValid) {
                    throw new customError_1.CustomError("Invalid password", 401, "Invalid password");
                }
                if (companyData.user_type !== "COMPANY") {
                    throw new customError_1.CustomError("Unauthorized", 401, "Unauthorized");
                }
                if (companyData.id) {
                    const company = yield prismaClient_1.default.company.findUnique({
                        where: { id: companyData.id },
                        select: { isApproved: true },
                    });
                    if (!company || company.isApproved !== "APPROVED") {
                        throw new customError_1.CustomError("Company not approved", 403, "Your company is not approved yet");
                    }
                }
                const jwtPayload = {
                    login_id: companyData.email,
                    id: companyData.id.toString(),
                    uuid: companyData.uuid,
                    user_type: companyData.user_type,
                };
                const token = jsonwebtoken_1.default.sign(jwtPayload, process.env.JWT_SECRET, {
                    expiresIn: "30d",
                });
                const user = {
                    id: companyData.id.toString(),
                    uuid: companyData.uuid,
                    name: companyData.name,
                    email: companyData.email,
                    user_type: companyData.user_type,
                    companyId: (_b = (_a = companyData.id) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : null,
                };
                yield prismaClient_1.default.company.update({
                    where: { id: companyData.id },
                    data: { lastLogin: new Date() },
                });
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
                        isDeleted: false,
                        status: "ACTIVE",
                    },
                });
                if (!companyData) {
                    throw new customError_1.CustomError("Company not found", 404, "Not found");
                }
                const existingCompany = yield prismaClient_1.default.company.findFirst({
                    where: {
                        id: { not: data.id },
                        OR: [{ email: data.email }, { name: data.name }, { mobileNumber: data.mobileNumber }],
                    },
                });
                if (existingCompany) {
                    throw new customError_1.CustomError("Company with the provided email, name or mobile number already exists", 409, "Conflict");
                }
                const hasPassword = bcryptjs_1.default.hashSync(data.password, 10);
                const updatedComapny = yield prismaClient_1.default.company.update({
                    where: {
                        id: companyData.id,
                    },
                    data: {
                        name: data.name,
                        email: data.email,
                        address: data.address,
                        image: data.image,
                        password: hasPassword,
                        mobileNumber: data.mobileNumber,
                    },
                });
                yield prismaClient_1.default.user.updateMany({
                    where: { companyId: updatedComapny.id },
                    data: {
                        name: updatedComapny.name,
                        email: updatedComapny.email,
                        password: updatedComapny.password,
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
                    where: { id: data.id, isDeleted: false, status: "ACTIVE" },
                });
                if (!companyData) {
                    throw new customError_1.CustomError("Company not found", 404, "Not found");
                }
                if (companyData.isApproved === "APPROVED") {
                    throw new customError_1.CustomError("Company request already approved", 400, "Already approved");
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
                    company: Object.assign(Object.assign(Object.assign({}, companyData), updatedCompany), { id: companyData.id.toString() }),
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
                    where: { id: data.id, isDeleted: false, status: "ACTIVE" },
                });
                if (!companyData) {
                    throw new customError_1.CustomError("Company not found", 404, "Not found");
                }
                if (companyData.isApproved === "REJECTED") {
                    throw new customError_1.CustomError("Company request already rejected", 400, "Already rejected");
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
                        uuid: (0, uuid_1.v4)(),
                        name: data.name,
                        email: data.email,
                        address: data.address,
                        image: data.image,
                        password: hasPassword,
                        company_ID: data.company_ID,
                        mobileNumber: data.mobileNumber,
                        isApproved: "PENDING",
                        user_type: "COMPANY",
                    },
                });
                // Add this check
                const existingUser = yield prismaClient_1.default.user.findUnique({
                    where: { email: data.email },
                });
                const newUser = yield prismaClient_1.default.user.create({
                    data: {
                        uuid: newCompany.uuid,
                        name: data.name,
                        email: data.email,
                        password: newCompany.password,
                        user_type: "COMPANY",
                        companyId: newCompany.id,
                        lastLogin: newCompany.lastLogin,
                    },
                });
                if (existingUser) {
                    throw new customError_1.CustomError("User with the provided email already exists", 400, "User already exists");
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
    blockCompany(id, data) {
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
                        isDeleted: false,
                        status: "ACTIVE",
                    },
                });
                if (!companyData) {
                    throw new customError_1.CustomError("Company not found", 404, "Not found");
                }
                if (companyData.status === "BLOCKED") {
                    throw new customError_1.CustomError("Company request already blocked", 400, "Already blocked");
                }
                const updateCompany = yield prismaClient_1.default.company.update({
                    where: { id: companyData.id },
                    data: {
                        status: "BLOCKED",
                    },
                });
                yield prismaClient_1.default.user.updateMany({
                    where: {
                        companyId: updateCompany.id,
                    },
                    data: {
                        status: updateCompany.status,
                    },
                });
                return {
                    message: "Company BLOCKED successfully",
                    company: Object.assign(Object.assign({}, updateCompany), { id: updateCompany.id.toString() }),
                };
            }
            catch (error) {
                throw error instanceof customError_1.CustomError
                    ? error
                    : new customError_1.CustomError("Failed to inactivate company", 500, error.message);
            }
        });
    }
    unblockCompany(id, data) {
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
                        isDeleted: false,
                        status: "BLOCKED",
                    },
                });
                if (!companyData) {
                    throw new customError_1.CustomError("Company not found", 404, "Not found");
                }
                if (companyData.status === "ACTIVE") {
                    throw new customError_1.CustomError("Company request already unblocked", 400, "Already unblocked");
                }
                const updateCompany = yield prismaClient_1.default.company.update({
                    where: { id: companyData.id },
                    data: {
                        status: "ACTIVE",
                    },
                });
                yield prismaClient_1.default.user.updateMany({
                    where: {
                        companyId: updateCompany.id,
                    },
                    data: {
                        status: updateCompany.status,
                    },
                });
                return {
                    message: "Company activate successfully",
                    company: Object.assign(Object.assign({}, updateCompany), { id: updateCompany.id.toString() }),
                };
            }
            catch (error) {
                throw error instanceof customError_1.CustomError
                    ? error
                    : new customError_1.CustomError("Failed to activate company", 500, error.message);
            }
        });
    }
    deleteCompany(id, data) {
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
                        isDeleted: false,
                    },
                });
                if (!companyData) {
                    throw new customError_1.CustomError("Company already deleted", 404, "Not found");
                }
                if (companyData.status === "DELETED") {
                    throw new customError_1.CustomError("Company request already deleted", 400, "Already deleted");
                }
                const updateCompany = yield prismaClient_1.default.company.update({
                    where: { id: companyData.id },
                    data: {
                        status: "DELETED",
                        isDeleted: true,
                    },
                });
                yield prismaClient_1.default.user.updateMany({
                    where: {
                        companyId: updateCompany.id,
                    },
                    data: {
                        status: updateCompany.status,
                        isDeleted: updateCompany.isDeleted,
                    },
                });
                return {
                    message: "Company deleted successfully",
                    company: Object.assign(Object.assign({}, updateCompany), { id: updateCompany.id.toString() }),
                };
            }
            catch (error) {
                throw error instanceof customError_1.CustomError
                    ? error
                    : new customError_1.CustomError("Failed to activate company", 500, error.message);
            }
        });
    }
}
exports.CompanyServices = CompanyServices;
