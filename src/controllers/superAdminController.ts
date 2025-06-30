import { Response } from "express";
import { Request } from "express";
import { superAdminServices } from "../services/superAdminServices";
import { superAdminSchema } from "../schemas/superAdminSchema";
import { AuthenticatedRequest } from "../types/index";
const superAdmin = new superAdminServices();
export class superAdminController {
  async superAdminLogin(req: Request, res: Response) {
    try {
      const data = superAdminSchema.parse(req.body);
      const user = await superAdmin.loginSuperAdminServices(data);
      res.status(200).json(user);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }

 
}
