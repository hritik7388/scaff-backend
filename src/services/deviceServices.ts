import prisma from "../config/prismaClient";
import {CustomError} from "../types/customError";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export class DeviceServices {
async updateDeviceToken(id: number, data: any) {
    console.log("id========================>>>>",id)
  try { 
    const user = await prisma.user.findFirst({
      where: { companyId: id },  
    });

    if (!user) {
      throw new CustomError("User not found", 404);
    } 
    const existingDevice = await prisma.device.findUnique({
      where: { id: id },
    });

    let device;

    if (existingDevice) { 
      device = await prisma.device.update({
        where: { id: id },
        data: {
          userId: data.id,
          deviceToken: data.deviceToken,
          deviceType: data.deviceType,
          deviceName: data.deviceName,
          deviceVersion: data.deviceVersion,
          appVersion: data.appVersion,
          osVersion: data.osVersion, 
          user_type:user.user_type,
          lastLogin:user.lastLogin
        },
      });
    } else { 
      device = await prisma.device.create({
        data: {
          userId: data.id,
          deviceToken: data.deviceToken,
          deviceType: data.deviceType,
          deviceName: data.deviceName,
          deviceVersion: data.deviceVersion,
          appVersion: data.appVersion,
          osVersion: data.osVersion,  
          user_type:user.user_type,
          lastLogin:user.lastLogin
        },
      });
    }

    return device;
  } catch (error: any) {
    console.log("error===================>>>", error);
    throw error instanceof CustomError
      ? error
      : new CustomError("Failed to update device token", 500, error.message);
  }
}

}


