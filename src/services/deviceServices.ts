import prisma from "../config/prismaClient";
import { CustomError } from "../types/customError";
import { pushNotificationDelhi } from "../helpers/utils";

export class DeviceServices {
    async updateDeviceToken(id: number, data: any) {
        try {
            console.log("🔥 Starting updateDeviceToken");
            console.log("Received ID:", id);
            console.log("Received Data:", data);

            let company, user;

            if (data.user_type === "COMPANY") {
                console.log("🔍 Handling COMPANY user_type");

                company = await prisma.company.findFirst({
                    where: {
                        id: id,
                        status: "ACTIVE",
                        // user_type: data.user_type, // Only include this if it exists in your schema
                    },
                });

                console.log("✅ Company found:", company);

                if (!company) {
                    console.error("❌ Company not found with ID:", id);
                    throw new CustomError("User not found", 404);
                }

                const deviceData = {
                    userId: company.id,
                    deviceToken: data.deviceToken,
                    deviceType: data.deviceType,
                    deviceName: data.deviceName,
                    appVersion: data.appVersion,
                    osVersion: data.osVersion,
                    user_type: company.user_type,
                };

                console.log("📦 Device Data (COMPANY):", deviceData);

                const existingDevice = await prisma.device.findFirst({
                    where: { userId: company.id },
                });

                console.log("🧾 Existing Device (COMPANY):", existingDevice);

                const device = existingDevice
                    ? await prisma.device.update({
                          where: { id: existingDevice.id },
                          data: deviceData,
                      })
                    : await prisma.device.create({
                          data: deviceData,
                      });

                console.log("💾 Device Saved (COMPANY):", device);

                if (device.deviceToken) {
                    console.log("📲 Sending push notification to COMPANY device...");
                    await pushNotificationDelhi(
                        device.deviceToken,
                        "Device Token Updated",
                        `🎉 Welcome back, ${company.name}! You’ve successfully signed in to your WearO Journey account. 🚀`
                    );
                    console.log("✅ Push sent to COMPANY device");
                }

                return {
                    message: "Device token updated successfully",
                    data: {
                        ...device,
                        id: device.id.toString(),
                        userId: device.userId.toString(),
                    },
                };
            } else {
                console.log("🔍 Handling USER user_type");

                user = await prisma.user.findFirst({
                    where: {
                        id: id,
                        status: "ACTIVE",
                        user_type: data.user_type,
                    },
                });

                console.log("✅ User found:", user);

                if (!user) {
                    console.error("❌ User not found with ID:", id);
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

                console.log("📦 Device Data (USER):", deviceData);

                const existingDevice = await prisma.device.findFirst({
                    where: { userId: user.id },
                });

                console.log("🧾 Existing Device (USER):", existingDevice);

                const device = existingDevice
                    ? await prisma.device.update({
                          where: { id: existingDevice.id },
                          data: deviceData,
                      })
                    : await prisma.device.create({
                          data: deviceData,
                      });

                console.log("💾 Device Saved (USER):", device);

                if (device.deviceToken) {
                    console.log("📲 Sending push notification to USER device...");
                    await pushNotificationDelhi(
                        device.deviceToken,
                        "Device Token Updated",
                        `🎉 Welcome back, ${user.name}! You’ve successfully signed in to your WearO Journey account. 🚀`
                    );
                    console.log("✅ Push sent to USER device");
                }

                return {
                    message: "Device token updated successfully",
                    data: {
                        ...device,
                        id: device.id.toString(),
                        userId: device.userId.toString(),
                    },
                };
            }
        } catch (error: any) {
            console.error("❗ Error in updateDeviceToken:", error);
            throw error instanceof CustomError
                ? error
                : new CustomError("Failed to update device token", 500, error.message);
        }
    }
}
