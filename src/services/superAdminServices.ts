import prisma from "../config/prismaClient";
import {CustomError} from "../types/customError";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {v4 as uuidv4} from "uuid";

export class superAdminServices {
    async loginSuperAdminServices(data: any) {
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

            if (userData.user_type !== "SUPER_ADMIN") {
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
                await prisma.user.update({
                where: {id: userData.id},
                data: {lastLogin: new Date()},
            });


            const {password: _password, ...safeUserData} = userData;

            return {
                message: "Login successful",
                token,
                user: {
                    ...safeUserData,
                    id: userData.id.toString(),
                },
            };
        } catch (error: any) {
            console.error("❌ Login error:", error);
            throw error instanceof CustomError
                ? error
                : new CustomError("Failed to login super admin", 500, error.message);
        }
    }

    async adminDashboard(id: string) {
        try {
            // Total companies excluding deleted ones
            const totalCompanies = await prisma.company.count({
                where: {
                    status: {not: "DELETED"},
                },
            });

            const approvedCount = await prisma.company.count({
                where: {
                    isApproved: "APPROVED",
                    status: {not: "DELETED"},
                },
            });

            const activeCount = await prisma.company.count({
                where: {
                    status: "ACTIVE",
                },
            });

            const blockCount = await prisma.company.count({
                where: {
                    status: "BLOCKED",
                },
            });

            // Deleted companies counted separately
            const deletedCount = await prisma.company.count({
                where: {
                    status: "DELETED",
                },
            });

            const pendingCount = await prisma.company.count({
                where: {
                    isApproved: "PENDING",
                    status: {not: "DELETED"},
                },
            });

            const rejectedCount = await prisma.company.count({
                where: {
                    isApproved: "REJECTED",
                    status: {not: "DELETED"},
                },
            });

            return {
                message: "Admin dashboard data fetched successfully",
                totalCompanies, // Excludes deleted
                approvedCompanies: approvedCount,
                activeCompanies: activeCount,
                blockedCompanies: blockCount,
                deletedCompanies: deletedCount,
                pendingCompanies: pendingCount,
                rejectedCompanies: rejectedCount,
            };
        } catch (error: any) {
            throw error instanceof CustomError
                ? error
                : new CustomError("Failed to fetch admin dashboard", 500, error.message);
        }
    }
}

(async () => {
    const superadminEmail = "superadmin@example.com";
    const superadminPassword = "supersecurepassword";

    try {
        // Check if a superadmin already exists
        const existingSuperAdmin = await prisma.user.findFirst({
            where: {user_type: "SUPER_ADMIN"},
        });

        if (existingSuperAdmin) {
            console.log("✅ Default superadmin already created.");
        } else {
            const hashedPassword = await bcrypt.hash(superadminPassword, 10);

            await prisma.user.create({
                data: {
                    uuid: uuidv4(),
                    email: superadminEmail,
                    password: hashedPassword,
                    user_type: "SUPER_ADMIN", // ✅ only if added in model
                    name: "Super Admin",
                },
            });

            console.log("✅ Default superadmin created successfully.");
        }
    } catch (error) {
        console.error("❌ Error while checking or creating superadmin:", error);
    }
})();
