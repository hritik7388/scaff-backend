import prisma from "../config/prismaClient";
import {CustomError} from "../types/customError";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export class DeviceServices {
async updateDeviceToken(id: number, data: any) {
  console.log("companyId========================>>>>", id);

  try { 
const user = await prisma.user.findFirst({
  where: {
    status: "ACTIVE",
    OR: [
      { id: id },           // user ID match
      { companyId: id }, // company ID match
    ],
  },
});
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    // Step 2: Prepare device data
    const deviceData = {
      userId: user.id,
      deviceToken: data.deviceToken,
      deviceType: data.deviceType,
      deviceName: data.deviceName,
      deviceVersion: data.deviceVersion,
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
        where: { id: existingDevice.id },
        data: deviceData,
      });
    } else { 
      device = await prisma.device.create({
        data: deviceData,
      });
    } 
return {
  ...device,
  id: device.id.toString(),
  userId: device.userId.toString(),
};
  } catch (error: any) {
    console.log("error===================>>>", error);
    throw error instanceof CustomError
      ? error
      : new CustomError("Failed to update device token", 500, error.message);
  }
}

}


