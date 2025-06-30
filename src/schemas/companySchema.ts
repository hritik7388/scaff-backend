import {z} from "zod";

export const companyRegisterSchema = z.object({
    name: z.string().min(1, "Company Name is required"),
    email: z.string().email("Invalid email format").min(1, "Email is required"),
    image: z.string().min(1, "Image URL is required"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    company_ID: z.string(),
    confirmPassword: z.string().min(8, "Confirm Password must be at least 8 characters long"),
    mobileNumber: z
    .string()
    .min(10, "Phone number mustbe at least 10 characters long")
    .max(15, "Phone number cannot exceed 15 characters"),
    address: z.string().min(1, "Address is required"), 
});

export const compnayLoginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export const companyUpdateSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Company Name is required").optional(),
    email: z.string().email("Invalid email format").min(1, "Email is required").optional(),
    image: z.string().min(1, "Image URL is required").optional(),
    password: z.string().min(8, "Password must be at least 8 characters long").optional(),
    company_ID: z.string().optional(),
    confirmPassword: z.string().min(8, "Confirm Password must be at least 8 characters long").optional(),
    mobileNumber: z
    .string()
    .min(10, "Phone number must be at least 10 characters long")
    .max(15, "Phone number cannot exceed 15 characters")
    .optional(),
    address: z.string().min(1, "Address is required").optional(),
});

export const companyIdSchema = z.object({
    id: z.string(),
});

export const approveCompanyRequestSchema = z.object({
    id: z.string(),
});
export const rejectCompanyRequestSchema = z.object({
    id: z.string(),
});

export const addNewCompanySchema = z.object({
    name: z.string().min(1, "Company Name is required"),
    email: z.string().email("Invalid email format").min(1, "Email is required"),
    image: z.string().min(1, "Image URL is required"),
    password: z.string().min(8, "Password must be at least 8 characters long"),

    company_ID: z.string(),
    confirmPassword: z.string().min(8, "Confirm Password must be at least 8 characters long"),
    mobileNumber: z
    
    .string()
    
    .min(10, "Phone number mustbe at least 10 characters long")
    .max(15, "Phone number cannot exceed 15 characters"),
    address: z.string().min(1, "Address is required"), 
});

export const companyStatus = z.object({
    id: z.string(),
});
