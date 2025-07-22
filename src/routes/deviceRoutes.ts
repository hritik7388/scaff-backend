import {Router} from "express"; 
import {authMiddleware} from "../middlewares/authMiddleware";
import { DeviceController } from "../controllers/deviceController";


const router = Router();
const deviceControllers=new DeviceController();
/**
 * @route   PUT /api/v1/device/updateDevice
 * @desc    Upadte a existing  device
 * @access  Public
 */
router.post("/updateDevice", authMiddleware, deviceControllers.updateDevice.bind(deviceControllers));



export default router;