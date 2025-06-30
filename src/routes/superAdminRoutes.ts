
import { Router } from "express";
import { superAdminController } from "../controllers/superAdminController";

const router = Router();


const superAdminRoutes = new superAdminController();
/**
 * @route   POST /api/v1/superAdmin/superAdminLogin
 * @desc    Login a super admin
 * @access  Public
 */
router.post('/login', superAdminRoutes.superAdminLogin.bind(superAdminRoutes));

 

export default router;