"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMemberSchema = void 0;
const zod_1 = require("zod");
exports.addMemberSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters long"),
    mobileNumber: zod_1.z.string(),
    dob: zod_1.z.string().refine(val => !isNaN(Date.parse(val)), {
        message: "Invalid date format for dob",
    }),
    jobId: zod_1.z.string().min(1, "Job ID is required"),
    company_ID: zod_1.z.string().optional(),
    idProofImage: zod_1.z.string().min(1, "ID proof image is required"),
    photoImage: zod_1.z.string().min(1, "Photo image is required"),
    user_type: zod_1.z.enum([
        "PROJECT_MANAGER",
        "COMPETENT_PERSON",
        "TRADESMAN"
    ]),
    address: zod_1.z.string().optional(),
});
