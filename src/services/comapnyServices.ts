import prisma from "../config/prismaClient";
import {CustomError} from "../types/customError";
import {generateCMP_ID, sendMailApproval} from "../helpers/utils";
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
                    company_ID: data.company_ID,
                    mobileNumber: data.mobileNumber,
                    isApproved: "PENDING",
                },
            });

            // Add this check
            const existingUser = await prisma.user.findUnique({
                where: {email: data.email},
            });

            if (existingUser) {
                throw new CustomError("User with the provided email already exists", 400, "User already exists");
            }

            const newUser = await prisma.user.create({
                data: {
                    uuid: newCompany.uuid,
                    name: data.name,
                    email: data.email,
                    password: hasPassword,
                    user_type: "COMPANY",
                    companyId: newCompany.id,
                },
            });

            return {
                message: "Company registered successfully",
                company: {
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

    async loginCompanyServices(data: any) {
        try {
            const userData = await prisma.user.findUnique({
                where: {email: data.email},
            });

            if (!userData) {
                throw new CustomError("User not found", 404, "User not found");
            }

            const isPasswordValid = userData.password ? await bcrypt.compare(data.password, userData.password) : false;

            if (!isPasswordValid) {
                throw new CustomError("Invalid password", 401, "Invalid password");
            }

            if (userData.user_type !== "SUB_ADMIN") {
                throw new CustomError("Unauthorized", 401, "Unauthorized");
            }

            const jwtPayload = {
                login_id: userData.email,
                id: userData.id.toString(),
                uuid: userData.uuid,
                user_type: userData.user_type,
            };

            const token = jwt.sign(jwtPayload, process.env.JWT_SECRET!, {
                expiresIn: "30d",
            });

            const user = {
                id: userData.id.toString(),
                uuid: userData.uuid,
                name: userData.name,
                email: userData.email,
                user_type: userData.user_type,
                companyId: userData.companyId?.toString() ?? null, // in case companyId is BigInt
            };
            await prisma.user.update({
                where: {email: data.email},
                data: {
                    lastLogin: new Date(),
                },
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
                },
            });
            if (!companyData) {
                throw new CustomError("Company not found", 404, "Not found");
            }

            const existingCompany = await prisma.company.findUnique({
                where: {
                    id: data.id,
                    email: data.email,
                    name: data.name,
                    mobileNumber: data.mobileNumber,
                },
            });
            if (existingCompany) {
                throw new CustomError(
                    "Company with the provided email, name or mobile number already exists",
                    409,
                    "Conflict"
                );
            }

            const updatedComapny = await prisma.company.update({
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
                company: {
                    ...updatedComapny,
                    id: updatedComapny.id.toString(), // Only if `id` is BigInt
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
                companies: companyData.map((company: any) => ({
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
                company: {
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
                where: {id: data.id},
            });
            if (!companyData) {
                throw new CustomError("Company not found", 404, "Not found");
            }
            if (companyData.isApproved !== "PENDING") {
                throw new CustomError("Company request already approved or rejected", 400, "Bad Request");
            }
            const updatedCompany = await prisma.company.update({
                where: {id: data.id},
                data: {
                    isApproved: "APPROVED",
                },
            });
            // await sendMailApproval(companyData.email, companyData.password);
            return {
                message: "Company request approved successfully",
                company: {
                    ...companyData,
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
                where: {id: data.id},
            });
            if (!companyData) {
                throw new CustomError("Company not found", 404, "Not found");
            }
            if (companyData.isApproved !== "PENDING") {
                throw new CustomError("Company request already approved or rejected", 400, "Bad Request");
            }
            const updatedCompany = await prisma.company.update({
                where: {id: companyData.id},
                data: {
                    isApproved: "REJECTED",
                },
            });
            return {
                message: "Company request rejected successfully",
                company: {
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
            // Check if company with same email exists
            const companyData = await prisma.company.findUnique({
                where: {
                    email: data.email,
                    name: data.name,
                    mobileNumber: data.mobileNumber,
                },
            });

            if (companyData) {
                throw new CustomError("Company already exists", 400, "Company with the provided email already exists");
            }

            if (data.password !== data.confirmPassword) {
                throw new CustomError("Password mismatch", 400, "Password and confirm password do not match");
            }
            const companyID = generateCMP_ID();

            // add new company
            const hasPassword = bcrypt.hashSync(data.password, 10);
            const newCompany = await prisma.company.create({
                data: {
                    uuid: uuidv4(),
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
            const newUser = await prisma.user.create({
                data: {
                    uuid: newCompany.uuid,
                    name: data.name,
                    email: data.email,
                    password: hasPassword,
                    user_type: "SUB_ADMIN",
                    companyId: newCompany.id,
                },
            });
 

            return {
                message: "Company registered successfully",
                company: {
                    ...newCompany,
                    id: newCompany.id.toString(),
                },
            };
        } catch (error: any) {
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
                },
            });
            if (!companyData) {
                throw new CustomError("Company not found", 404, "Not found");
            }

            const updateCompany = await prisma.company.update({
                where: {id: companyData.id},
                data: {
                    status: "BLOCKED",
                },
            });
            return {
                message: "Company inactive successfully",
                company: {
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
                },
            });
            if (!companyData) {
                throw new CustomError("Company not found", 404, "Not found");
            }

            const updateCompany = await prisma.company.update({
                where: {id: companyData.id},
                data: {
                    status: "ACTIVE",
                },
            });
            return {
                message: "Company activate successfully",
                company: {
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
                },
            });
            if (!companyData) {
                throw new CustomError("Company not found", 404, "Not found");
            }

            const updateCompany = await prisma.company.update({
                where: {id: companyData.id},
                data: {
                    status: "DELETED",
                },
            });
            return {
                message: "Company activate successfully",
                company: {
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
