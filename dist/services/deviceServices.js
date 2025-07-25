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
exports.DeviceServices = void 0;
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
const customError_1 = require("../types/customError");
const utils_1 = require("../helpers/utils");
class DeviceServices {
    updateDeviceToken(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("🔥 Starting updateDeviceToken");
                console.log("Received ID:", id);
                console.log("Received Data:", data);
                let company, user;
                if (data.user_type === "COMPANY") {
                    console.log("🔍 Handling COMPANY user_type");
                    company = yield prismaClient_1.default.company.findFirst({
                        where: {
                            id: id,
                            status: "ACTIVE",
                            // user_type: data.user_type, // Only include this if it exists in your schema
                        },
                    });
                    console.log("✅ Company found:", company);
                    if (!company) {
                        console.error("❌ Company not found with ID:", id);
                        throw new customError_1.CustomError("User not found", 404);
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
                    const existingDevice = yield prismaClient_1.default.device.findFirst({
                        where: { userId: company.id },
                    });
                    console.log("🧾 Existing Device (COMPANY):", existingDevice);
                    const device = existingDevice
                        ? yield prismaClient_1.default.device.update({
                            where: { id: existingDevice.id },
                            data: deviceData,
                        })
                        : yield prismaClient_1.default.device.create({
                            data: deviceData,
                        });
                    console.log("💾 Device Saved (COMPANY):", device);
                    if (device.deviceToken) {
                        console.log("📲 Sending push notification to COMPANY device...");
                        yield (0, utils_1.pushNotificationDelhi)(device.deviceToken, "Device Token Updated", `🎉 Welcome back, ${company.name}! You’ve successfully signed in to your WearO Journey account. 🚀`);
                        console.log("✅ Push sent to COMPANY device");
                    }
                    return {
                        message: "Device token updated successfully",
                        data: Object.assign(Object.assign({}, device), { id: device.id.toString(), userId: device.userId.toString() }),
                    };
                }
                else {
                    console.log("🔍 Handling USER user_type");
                    user = yield prismaClient_1.default.user.findFirst({
                        where: {
                            id: id,
                            status: "ACTIVE",
                            user_type: data.user_type,
                        },
                    });
                    console.log("✅ User found:", user);
                    if (!user) {
                        console.error("❌ User not found with ID:", id);
                        throw new customError_1.CustomError("User not found", 404);
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
                    const existingDevice = yield prismaClient_1.default.device.findFirst({
                        where: { userId: user.id },
                    });
                    console.log("🧾 Existing Device (USER):", existingDevice);
                    const device = existingDevice
                        ? yield prismaClient_1.default.device.update({
                            where: { id: existingDevice.id },
                            data: deviceData,
                        })
                        : yield prismaClient_1.default.device.create({
                            data: deviceData,
                        });
                    console.log("💾 Device Saved (USER):", device);
                    if (device.deviceToken) {
                        console.log("📲 Sending push notification to USER device...");
                        yield (0, utils_1.pushNotificationDelhi)(device.deviceToken, "Device Token Updated", `🎉 Welcome back, ${user.name}! You’ve successfully signed in to your WearO Journey account. 🚀`);
                        console.log("✅ Push sent to USER device");
                    }
                    return {
                        message: "Device token updated successfully",
                        data: Object.assign(Object.assign({}, device), { id: device.id.toString(), userId: device.userId.toString() }),
                    };
                }
            }
            catch (error) {
                console.error("❗ Error in updateDeviceToken:", error);
                throw error instanceof customError_1.CustomError
                    ? error
                    : new customError_1.CustomError("Failed to update device token", 500, error.message);
            }
        });
    }
}
exports.DeviceServices = DeviceServices;
