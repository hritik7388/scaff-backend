import prisma from "../config/prismaClient";
import {CustomError} from "../types/customError";
import {sendMailApproval} from "../helpers/utils";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {v4 as uuidv4} from "uuid";
export class CompanyServices {
    async registerCompany(data: any) {
        try {
            const companyData = await prisma.company.findUnique({
                where: {
                    email: data.email,
                    name: data.name,
                    mobileNumber: data.mobileNumber,
                },
            });

            if (companyData) {
                throw new CustomError("Company with the provided email already exists", 400, "Company already exists");
            }

            if (data.password !== data.password) {
                throw new CustomError("Password  do not match", 400, "Password mismatch");
            }
            const hasPassword = bcrypt.hashSync(data.password, 10);

            const newCompany = await prisma.company.create({
                data: {
                    uuid: uuidv4(),
                    name: data.name,
                    email: data.email,
                    address: data.address,
                    image: data.image,
                    password: hasPassword,
                    mobileNumber: data.mobileNumber,
                    countryCode: data.countryCode, // ✅ This now works after generate
                    isApproved: "PENDING",
                    user_type: "COMPANY",
                    latitude: data.latitude,
                    longitude: data.longitude,
                },
            });
            
            const jwtPayload = {
                login_id: newCompany.email,
                id: newCompany.id.toString(),
                uuid: newCompany.uuid,
                user_type: newCompany.user_type,
                mobileNumber: newCompany.mobileNumber,
                countryCode: newCompany.countryCode,
            };

            const token = jwt.sign(jwtPayload, process.env.JWT_SECRET!, {
                expiresIn: "30d",
            });

            return {
                message: "Company registered successfully",
                token,
                data: {
                    ...newCompany,
                    id: newCompany.id.toString(),
                },
            };
        } catch (error: any) {
            console.log("error===================>>>", error);
            throw error instanceof CustomError
                ? error
                : new CustomError("Failed to register company", 500, error.message);
        }
    }

    async loginCompanyServices(data: any) {
        try {
            const companyData = await prisma.company.findUnique({
                where: {email: data.email, isDeleted: false, status: "ACTIVE"},
            });

            if (!companyData) {
                throw new CustomError("User not found", 404, "User not found");
            }

            const isPasswordValid = companyData.password && (await bcrypt.compare(data.password, companyData.password));

            console.log("hasPisPasswordValidassword====================>>>>", isPasswordValid);
            if (!isPasswordValid) {
                throw new CustomError("Invalid password", 401, "Invalid password");
            }

            if (companyData.user_type !== "COMPANY") {
                throw new CustomError("Unauthorized", 401, "Unauthorized");
            }
            if (companyData.id) {
                const company = await prisma.company.findUnique({
                    where: {id: companyData.id},
                    select: {isApproved: true},
                });
                if (!company || company.isApproved !== "APPROVED") {
                    throw new CustomError("Company not approved", 403, "Your company is not approved yet");
                }
            }

            const jwtPayload = {
                login_id: companyData.email,
                id: companyData.id.toString(),
                uuid: companyData.uuid,
                user_type: companyData.user_type,
            };

            const token = jwt.sign(jwtPayload, process.env.JWT_SECRET!, {
                expiresIn: "30d",
            });

            const user = {
                id: companyData.id.toString(),
                uuid: companyData.uuid,
                name: companyData.name,
                email: companyData.email,
                user_type: companyData.user_type,
                companyId: companyData.id?.toString() ?? null,
            };
            await prisma.company.update({
                where: {id: companyData.id},
                data: {lastLogin: new Date()},
            });

            return {
                message: "Login successful",
                token,
                user,
            };
        } catch (error: any) {
            console.error("❌ Login error:", error);
            throw error instanceof CustomError ? error : new CustomError("Failed to login company", 500, error.message);
        }
    }

    async updateCompanyDetails(id: number, data: any) {
        try {
            const userData = await prisma.user.findUnique({
                where: {id: id},
            });

            if (!userData || userData.user_type !== "SUPER_ADMIN") {
                throw new CustomError("USER not found or not a super admin", 404, "Not Found");
            }

            const companyData = await prisma.company.findUnique({
                where: {
                    id: data.id,
                    isDeleted: false,
                    status: "ACTIVE",
                },
            });

            if (!companyData) {
                throw new CustomError("Company not found", 404, "Not found");
            }
            const emailExists = await prisma.company.findFirst({
                where: {
                    email: data.email,
                },
            });
            if (emailExists) {
                throw new CustomError("Email already in use. Please use a different email.", 409, "Conflict");
            }
            const nameExists = await prisma.company.findFirst({
                where: {
                    name: data.name,
                },
            });
            if (nameExists) {
                throw new CustomError("Company name already in use. Please use a different name.", 409, "Conflict");
            }
            const mobileExists = await prisma.company.findFirst({
                where: {
                    mobileNumber: data.mobileNumber,
                },
            });
            if (mobileExists) {
                throw new CustomError("Mobile number already in use. Please use a different number.", 409, "Conflict");
            }

            const hasPassword = bcrypt.hashSync(data.password, 10);

            const updatedComapny = await prisma.company.update({
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
                    countryCode: data.countryCode, // ✅ Will not throw error now
                    latitude: data.latitude,
                    longitude: data.longitude,
                },
            });

            await prisma.user.updateMany({
                where: {companyId: updatedComapny.id},
                data: {
                    name: updatedComapny.name,
                    email: updatedComapny.email,
                    password: updatedComapny.password,
                },
            });

            return {
                message: "Company details updated successfully",
                data: {
                    ...updatedComapny,
                    id: updatedComapny.id.toString(),
                },
            };
        } catch (error: any) {
            console.log("error===================>>>", error);
            throw error instanceof CustomError
                ? error
                : new CustomError("Failed to update company details", 500, error.message);
        }
    }

    async getCompanyallDetails(id: number, page: number, limit: number) {
        try {
            const skip = (page - 1) * limit;

            const [companyData, totalCount] = await Promise.all([
                prisma.company.findMany({
                    skip,
                    take: limit,
                }),
                prisma.company.count(),
            ]);

            const totalPages = Math.ceil(totalCount / limit);

            return {
                message: "All company details fetched successfully",
                datas: companyData.map((company: any) => ({
                    ...company,
                    id: company.id.toString(),
                })),
                totalCount,
                totalPages,
                currentPage: page,
            };
        } catch (error: any) {
            console.log("error===================>>>", error);
            throw error instanceof CustomError
                ? error
                : new CustomError("Failed to fetch company details", 500, error.message);
        }
    }

    async getCompanyById(id: number, data: any) {
        try {
            const companyData = await prisma.company.findUnique({
                where: {id: data.id},
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
                throw new CustomError("Company not found", 404, "Not Found");
            }

            return {
                message: "Company details fetched successfully",
                data: {
                    ...companyData,
                    id: companyData.id.toString(),
                },
            };
        } catch (error: any) {
            console.error("getCompanyById error:", error);
            throw error instanceof CustomError
                ? error
                : new CustomError("Failed to fetch company details", 500, error.message);
        }
    }

    async approveCompanyRequest(id: number, data: any) {
        try {
            const userData = await prisma.user.findUnique({
                where: {id: id},
            });
            if (!userData || userData.user_type !== "SUPER_ADMIN") {
                throw new CustomError("USER not found or not a super admin", 404, "Not Found");
            }
            const companyData = await prisma.company.findUnique({
                where: {id: data.id, isDeleted: false, status: "ACTIVE"},
            });
            if (!companyData) {
                throw new CustomError("Company not found", 404, "Not found");
            }

            if (companyData.isApproved === "APPROVED") {
                throw new CustomError("Company request already approved", 400, "Already approved");
            }
            const updatedCompany = await prisma.company.update({
                where: {id: data.id},
                data: {
                    isApproved: "APPROVED",
                },
            });
            console.log("updatedCompany====================>>>>", updatedCompany);
            //   const mail = await sendMailApproval(updatedCompany.email, updatedCompany.password);
            // console.log("mail====================>>>>", mail);
            return {
                message: "Company request approved successfully",
                company: {
                    ...companyData,
                    ...updatedCompany,
                    id: companyData.id.toString(),
                },
            };
        } catch (error: any) {
            console.log("error===================>>>", error);
            throw error instanceof CustomError
                ? error
                : new CustomError("Failed to approve company request", 500, error.message);
        }
    }

    async rejectCompanyRequest(id: number, data: any) {
        try {
            const userData = await prisma.user.findUnique({
                where: {id: id},
            });
            if (!userData || userData.user_type !== "SUPER_ADMIN") {
                throw new CustomError("USER not found or not a super admin", 404, "Not Found");
            }
            const companyData = await prisma.company.findUnique({
                where: {id: data.id, isDeleted: false, status: "ACTIVE"},
            });
            if (!companyData) {
                throw new CustomError("Company not found", 404, "Not found");
            }

            if (companyData.isApproved === "REJECTED") {
                throw new CustomError("Company request already rejected", 400, "Already rejected");
            }
            const updatedCompany = await prisma.company.update({
                where: {id: companyData.id},
                data: {
                    isApproved: "REJECTED",
                },
            });
            return {
                message: "Company request rejected successfully",
                data: {
                    ...updatedCompany,
                    id: updatedCompany.id.toString(),
                },
            };
        } catch (error: any) {
            console.log("error===================>>>", error);
            throw error instanceof CustomError
                ? error
                : new CustomError("Failed to approve company request", 500, error.message);
        }
    }

    async searchCompany(id: number, data: any, page = 1, limit = 10) {
        try {
            const userData = await prisma.user.findUnique({
                where: {id: id},
            });

            if (!userData || userData.user_type !== "SUPER_ADMIN") {
                throw new CustomError("USER not found or not a super admin", 404, "Not Found");
            }

            const skip = (Number(page) - 1) * Number(limit);
            const take = Number(limit);

            let whereCondition: any = {};

            if (data && typeof data === "string" && data.trim() !== "") {
                const conditions: any[] = [
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

            const companies = await prisma.company.findMany({
                where: whereCondition,
                skip,
                take,
            });

            const totalCompanies = await prisma.company.count({
                where: whereCondition,
            });

            return {
                message: "Company search successful",
                total: totalCompanies,
                currentPage: Number(page),
                totalPages: Math.ceil(totalCompanies / Number(limit)),
                data: companies.map((company: any) => ({
                    ...company,
                    id: company.id.toString(),
                })),
            };
        } catch (error: any) {
            console.error("searchCompany error:", error);
            throw error instanceof CustomError
                ? error
                : new CustomError("Failed to search company", 500, error.message);
        }
    }

    async addNewCompany(id: number, data: any) {
        try {
            const userData = await prisma.user.findUnique({
                where: {id: id},
            });
            if (!userData || userData.user_type !== "SUPER_ADMIN") {
                throw new CustomError("USER not found or not a super admin", 404, "Not Found");
            }

            const companyData = await prisma.company.findUnique({
                where: {
                    email: data.email,
                    name: data.name,
                    mobileNumber: data.mobileNumber,
                },
            });

            if (companyData) {
                throw new CustomError("Company with the provided email already exists", 400, "Company already exists");
            }

            if (data.password !== data.confirmPassword) {
                throw new CustomError("Password and confirm password do not match", 400, "Password mismatch");
            }
            const hasPassword = bcrypt.hashSync(data.password, 10);
            const newCompany = await prisma.company.create({
                data: {
                    uuid: uuidv4(),
                    name: data.name,
                    email: data.email,
                    address: data.address,
                    image: data.image,
                    password: hasPassword,
                    mobileNumber: data.mobileNumber,
                    countryCode: data.countryCode,
                    isApproved: "APPROVED",
                    user_type: "COMPANY",
                },
            });

            // Add this check
            const existingUser = await prisma.user.findUnique({
                where: {email: data.email},
            });
            const newUser = await prisma.user.create({
                data: {
                    uuid: newCompany.uuid,
                    name: data.name,
                    email: data.email,
                    password: newCompany.password,
                    user_type: "COMPANY",
                    companyId: newCompany.id,
                    lastLogin: newCompany.lastLogin,
                    mobileNumber: newCompany.mobileNumber,
                    countryCode: data.countryCode, // Add countryCode here
                },
            });

            if (existingUser) {
                throw new CustomError("User with the provided email already exists", 400, "User already exists");
            }

            return {
                message: "Company registered successfully",
                data: {
                    ...newCompany,
                    id: newCompany.id.toString(), // convert BigInt to string
                },
            };
        } catch (error: any) {
            console.log("error===================>>>", error);
            throw error instanceof CustomError
                ? error
                : new CustomError("Failed to register company", 500, error.message);
        }
    }

    async blockCompany(id: number, data: any) {
        try {
            const userData = await prisma.user.findUnique({
                where: {id: id},
            });
            if (!userData || userData.user_type !== "SUPER_ADMIN") {
                throw new CustomError("USER not found or not a super admin", 404, "Not Found");
            }

            const companyData = await prisma.company.findUnique({
                where: {
                    id: data.id,
                    isDeleted: false,
                    status: "ACTIVE",
                },
            });
            if (!companyData) {
                throw new CustomError("Company not found or already blocked", 404, "Not found");
            }

            if (companyData.status === "BLOCKED") {
                throw new CustomError("Company request already blocked", 400, "Already blocked");
            }

            const updateCompany = await prisma.company.update({
                where: {id: companyData.id},
                data: {
                    status: "BLOCKED",
                },
            });
            await prisma.user.updateMany({
                where: {
                    companyId: updateCompany.id,
                },
                data: {
                    status: updateCompany.status as any,
                },
            });
            return {
                message: "Company BLOCKED successfully",
                data: {
                    ...updateCompany,
                    id: updateCompany.id.toString(),
                },
            };
        } catch (error: any) {
            throw error instanceof CustomError
                ? error
                : new CustomError("Failed to inactivate company", 500, error.message);
        }
    }

    async unblockCompany(id: number, data: any) {
        try {
            const userData = await prisma.user.findUnique({
                where: {id: id},
            });
            if (!userData || userData.user_type !== "SUPER_ADMIN") {
                throw new CustomError("USER not found or not a super admin", 404, "Not Found");
            }

            const companyData = await prisma.company.findUnique({
                where: {
                    id: data.id,
                    isDeleted: false,
                    status: "BLOCKED",
                },
            });
            if (!companyData) {
                throw new CustomError("Company not found or already active", 404, "Not found");
            }
            if (companyData.status === "ACTIVE") {
                throw new CustomError("Company request already unblocked", 400, "Already unblocked");
            }
            const updateCompany = await prisma.company.update({
                where: {id: companyData.id},
                data: {
                    status: "ACTIVE",
                },
            });
            await prisma.user.updateMany({
                where: {
                    companyId: updateCompany.id,
                },
                data: {
                    status: updateCompany.status as any,
                },
            });
            return {
                message: "Company activate successfully",
                data: {
                    ...updateCompany,
                    id: updateCompany.id.toString(),
                },
            };
        } catch (error: any) {
            throw error instanceof CustomError
                ? error
                : new CustomError("Failed to activate company", 500, error.message);
        }
    }

    async deleteCompany(id: number, data: any) {
        try {
            const userData = await prisma.user.findUnique({
                where: {id: id},
            });
            if (!userData || userData.user_type !== "SUPER_ADMIN") {
                throw new CustomError("USER not found or not a super admin", 404, "Not Found");
            }

            const companyData = await prisma.company.findUnique({
                where: {
                    id: data.id,
                    isDeleted: false,
                },
            });
            if (!companyData) {
                throw new CustomError("Company already deleted", 404, "Not found");
            }
            if (companyData.status === "DELETED") {
                throw new CustomError("Company request already deleted", 400, "Already deleted");
            }
            const updateCompany = await prisma.company.update({
                where: {id: companyData.id},
                data: {
                    status: "DELETED",
                    isDeleted: true,
                },
            });
            await prisma.user.updateMany({
                where: {
                    companyId: updateCompany.id,
                },
                data: {
                    status: updateCompany.status as any,
                    isDeleted: updateCompany.isDeleted,
                },
            });
            return {
                message: "Company deleted successfully",
                data: {
                    ...updateCompany,
                    id: updateCompany.id.toString(),
                },
            };
        } catch (error: any) {
            throw error instanceof CustomError
                ? error
                : new CustomError("Failed to activate company", 500, error.message);
        }
    }
}
