import prisma from "../config/prismaClient";
import {CustomError} from "../types/customError";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export class DeviceServices {
    async updateDeviceToken(id: number, data: any) {
        try {
            let user;
            if (data.user_type === "COMPANY") {
                user = await prisma.user.findFirst({
                    where: {
                        status: "ACTIVE",
                        companyId: id,
                        user_type: "COMPANY",
                    },
                });
            } else {
                user = await prisma.user.findFirst({
                    where: {
                        status: "ACTIVE",
                        id: id,
                        user_type: data.user_type,
                    },
                });
            }
            if (!user) {
                throw new CustomError("User not found", 404);
            }
            const deviceData = {
                userId: user.id,
                deviceToken: data.deviceToken,
                deviceType: data.deviceType,
                deviceName: data.deviceName, 
                appVersion: data.appVersion,
                osVersion: data.osVersion,
                user_type: user.user_type,
            };
            const existingDevice = await prisma.device.findFirst({
                where: {
                    userId: user.id,
                },
            });
            let device;
            if (existingDevice) {
                device = await prisma.device.update({
                    where: {id: existingDevice.id},
                    data: deviceData,
                });
            } else {
                device = await prisma.device.create({
                    data: deviceData,
                });
            }
            return {
                 message: "Device token updated successfully",
                data:{
                ...device,
                id: device.id.toString(),
                userId: device.userId.toString(),
                }
            };
        } catch (error: any) {
            throw error instanceof CustomError
                ? error
                : new CustomError("Failed to update device token", 500, error.message);
        }
    }
}
