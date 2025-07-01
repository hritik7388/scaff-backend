import prisma from "../config/prismaClient";
import {CustomError} from "../types/customError";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {v4 as uuidv4} from "uuid";

export class AddMemberServices {
async addNewMemberServices(id: number, data: any) {
  try {
    const userData = await prisma.user.findUnique({
      where: { id: id ,
        user_type: "COMPANY",
        status:"ACTIVE"
      },
    });

    if (!userData) {
      throw new CustomError("Company not found", 404, "Company not found");
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email ,
        mobileNumber: data.mobileNumber,
      },
    });

    if (existingUser) {
      throw new CustomError("User already exists", 400, "User already exists");
    }
    

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await prisma.user.create({
      data: {
        uuid:uuidv4(),
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
                company: {
                    ...newUser,
                    id: newUser.id.toString(), // convert BigInt to string
                },
            };
  } catch (error: any) {
    console.log("error===================>>>", error);
    throw error instanceof CustomError
      ? error
      : new CustomError("Failed to add member", 500, error.message);
  }
}
}

