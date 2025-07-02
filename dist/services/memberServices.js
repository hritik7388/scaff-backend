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
exports.AddMemberServices = void 0;
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
const customError_1 = require("../types/customError");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
class AddMemberServices {
    addNewMemberServices(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userData = yield prismaClient_1.default.user.findUnique({
                    where: { id: id,
                        user_type: "COMPANY",
                        status: "ACTIVE"
                    },
                });
                if (!userData) {
                    throw new customError_1.CustomError("Company not found", 404, "Company not found");
                }
                const existingUser = yield prismaClient_1.default.user.findUnique({
                    where: { email: data.email,
                        mobileNumber: data.mobileNumber,
                    },
                });
                if (existingUser) {
                    throw new customError_1.CustomError("User already exists", 400, "User already exists");
                }
                const hashedPassword = yield bcryptjs_1.default.hash(data.password, 10);
                const newUser = yield prismaClient_1.default.user.create({
                    data: {
                        uuid: (0, uuid_1.v4)(),
                        name: data.name,
                        email: data.email,
                        password: hashedPassword,
                        mobileNumber: data.mobileNumber,
                        dob: new Date(data.dob),
                        jobId: data.jobId,
                        idProofImage: data.idProofImage,
                        photoImage: data.photoImage,
                        address: data.address,
                        user_type: data.user_type,
                        companyId: data.companyId,
                    },
                });
                // await sendMailApproval(companyData.email, companyData.password);
                return {
                    message: "Company registered successfully",
                    company: Object.assign(Object.assign({}, newUser), { id: newUser.id.toString() }),
                };
            }
            catch (error) {
                console.log("error===================>>>", error);
                throw error instanceof customError_1.CustomError
                    ? error
                    : new customError_1.CustomError("Failed to add member", 500, error.message);
            }
        });
    }
}
exports.AddMemberServices = AddMemberServices;
