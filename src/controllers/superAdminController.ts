import { Response } from "express";
import { Request } from "express";
import { superAdminServices } from "../services/superAdminServices";
import { superAdminSchema } from "../schemas/superAdminSchema";
import { AuthenticatedRequest } from "../types/index";
const superAdmin = new superAdminServices();
export class superAdminController {
  async superAdminLogin(req: Request, res: Response , next: Function) {
    try {
      const data = superAdminSchema.parse(req.body);
      const user = await superAdmin.loginSuperAdminServices(data);
      res.status(200).json(user);
    } catch (err) {
     next(err);
    }
  }
  async dashboardData(req: AuthenticatedRequest, res: Response, next: Function) {
    try {
      const id = String(req.user?.id!);
      const data = await superAdmin.adminDashboard(id);
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  }
 
  async awsCredentials(req: Request, res: Response, next: Function) {
    try {
      const data = await superAdmin.awsCredentials(); // This is the service method
      res.status(200).json(data);
    } catch (err) {
     next(err);
    }
  }
}
 

