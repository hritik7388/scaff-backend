import prisma from "../config/prismaClient";
import {CustomError} from "../types/customError";
import {generateCMP_ID, sendMailApproval} from "../helpers/utils";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export class CompanyServices{
    async registerCompany(data:any){
        try{

        const companyData=await prisma.company.findUnique({
            where:{
                email:data.email,
                mobileNumber:data.mobileNumber,
                name:data.name

            }
        });
        if(companyData){
            throw new CustomError("Company already exists with this email or mobile number", 400);

        }
        
    }catch (error: any) {
            console.log("error===================>>>", error);
            throw error instanceof CustomError
                ? error
                : new CustomError("Failed to register company", 500, error.message);
        }

    }
}