import {Response} from "express";
import {Request} from "express";
import { AuthenticatedRequest } from "../types/index";
import {deviceSchema} from '../schemas/deviceTokenSchema'
import { DeviceServices } from "../services/deviceServices";

const deviceServicesController= new DeviceServices();

export class  DeviceController{

async updateDevice(req: AuthenticatedRequest, res: Response) {
        try {
             const id = Number(req.user?.id!);
            const data = deviceSchema.parse(req.body);
            const user = await deviceServicesController.updateDeviceToken(id,data);
            res.status(200).json(user);
        } catch (err) {
            res.status(400).json({error: (err as Error).message});
        }
    }
}