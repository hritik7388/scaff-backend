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
class DeviceServices {
    updateDeviceToken(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("id========================>>>>", id);
            try {
                const user = yield prismaClient_1.default.user.findFirst({
                    where: { companyId: id },
                });
                if (!user) {
                    throw new customError_1.CustomError("User not found", 404);
                }
                const existingDevice = yield prismaClient_1.default.device.findUnique({
                    where: { id: id },
                });
                let device;
                if (existingDevice) {
                    device = yield prismaClient_1.default.device.update({
                        where: { id: id },
                        data: {
                            userId: data.id,
                            deviceToken: data.deviceToken,
                            deviceType: data.deviceType,
                            deviceName: data.deviceName,
                            deviceVersion: data.deviceVersion,
                            appVersion: data.appVersion,
                            osVersion: data.osVersion,
                            user_type: user.user_type,
                            lastLogin: user.lastLogin
                        },
                    });
                }
                else {
                    device = yield prismaClient_1.default.device.create({
                        data: {
                            userId: data.id,
                            deviceToken: data.deviceToken,
                            deviceType: data.deviceType,
                            deviceName: data.deviceName,
                            deviceVersion: data.deviceVersion,
                            appVersion: data.appVersion,
                            osVersion: data.osVersion,
                            user_type: user.user_type,
                            lastLogin: user.lastLogin
                        },
                    });
                }
                return device;
            }
            catch (error) {
                console.log("error===================>>>", error);
                throw error instanceof customError_1.CustomError
                    ? error
                    : new customError_1.CustomError("Failed to update device token", 500, error.message);
            }
        });
    }
}
exports.DeviceServices = DeviceServices;
