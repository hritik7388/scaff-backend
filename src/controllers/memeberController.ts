import { Response } from "express";
import { Request } from "express"; 
import { AddMemberServices } from "../services/memberServices"; 
import { addMemberSchema } from "../schemas/memeberSchema";

import { AuthenticatedRequest } from "../types";

const memeberData = new AddMemberServices();

export class AddMemberController {
  async addNewMember(req: AuthenticatedRequest, res: Response) {
    try {
      const id = Number(req.user?.id!);
      const data = addMemberSchema.parse(req.body);
      const member = await memeberData.addNewMemberServices(id, data);
      res.status(201).json(member);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }
}