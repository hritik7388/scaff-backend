import {z} from "zod";

export const deviceSchema = z.object({  // Depending on your user ID type
  deviceToken: z.string().min(1, 'Device token is required'),
  deviceType: z.enum(['ios', 'android', 'web']), // Customize based on your allowed values
  deviceName: z.string().optional(), 
  appVersion: z.string().optional(),
  osVersion: z.string().optional(),
   
});