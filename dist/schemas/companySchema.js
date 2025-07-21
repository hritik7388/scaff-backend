"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyStatus = exports.addNewCompanySchema = exports.rejectCompanyRequestSchema = exports.approveCompanyRequestSchema = exports.companyIdSchema = exports.companyUpdateSchema = exports.compnayLoginSchema = exports.companyRegisterSchema = void 0;
const zod_1 = require("zod");
exports.companyRegisterSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Company Name is required"),
    email: zod_1.z.string().email("Invalid email format").min(1, "Email is required"),
    image: zod_1.z.string(),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters long"),
    mobileNumber: zod_1.z
        .string()
        .min(10, "Phone number mustbe at least 10 characters long")
        .max(15, "Phone number cannot exceed 15 characters"),
    countryCode: zod_1.z.string().min(1, "Country code is required").optional(),
    address: zod_1.z.string().min(1, "Address is required"),
    latitude: zod_1.z.number().optional(),
    longitude: zod_1.z.number().optional(),
});
exports.compnayLoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
exports.companyUpdateSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string().min(1, "Company Name is required").optional(),
    email: zod_1.z.string().email("Invalid email format").min(1, "Email is required").optional(),
    image: zod_1.z.string().min(1, "Image URL is required").optional(),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters long").optional(),
    mobileNumber: zod_1.z
        .string()
        .min(10, "Phone number must be at least 10 characters long")
        .max(15, "Phone number cannot exceed 15 characters")
        .optional(),
    address: zod_1.z.string().min(1, "Address is required").optional(),
    countryCode: zod_1.z.string().min(1, "Country code is required").optional(),
    latitude: zod_1.z.number().optional(),
    longitude: zod_1.z.number().optional(),
});
exports.companyIdSchema = zod_1.z.object({
    id: zod_1.z.string(),
});
exports.approveCompanyRequestSchema = zod_1.z.object({
    id: zod_1.z.string(),
});
exports.rejectCompanyRequestSchema = zod_1.z.object({
    id: zod_1.z.string(),
});
exports.addNewCompanySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Company Name is required"),
    email: zod_1.z.string().email("Invalid email format").min(1, "Email is required"),
    image: zod_1.z.string(),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters long"),
    mobileNumber: zod_1.z
        .string()
        .min(10, "Phone number mustbe at least 10 characters long")
        .max(15, "Phone number cannot exceed 15 characters"),
    countryCode: zod_1.z.string().min(1, "Country code is required").optional(),
    address: zod_1.z.string().min(1, "Address is required"),
    latitude: zod_1.z.number().optional(),
    longitude: zod_1.z.number().optional(),
});
exports.companyStatus = zod_1.z.object({
    id: zod_1.z.string(),
});
