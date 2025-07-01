import { z } from "zod";

export const addMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  mobileNumber: z.string(),
  dob: z.string().refine(val => !isNaN(Date.parse(val)), {
  message: "Invalid date format for dob",
}),

  jobId: z.string().min(1, "Job ID is required"),
  company_ID: z.string().optional(),
  idProofImage: z.string().min(1, "ID proof image is required"),  
  photoImage: z.string().min(1, "Photo image is required"),     
  user_type: z.enum([     
    "PROJECT_MANAGER",
    "COMPETENT_PERSON",
    "TRADESMAN"
  ]), 
  address: z.string().optional(),
});