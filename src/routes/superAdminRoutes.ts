
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

/**
 * @route   GET /api/v1/superAdmin/dashboard
 * @desc    Get super admin dashboard data
 * @access  Private (Super Admin)
 */
router.get('/dashboardData', superAdminRoutes.dashboardData.bind(superAdminRoutes));

/**
 * @route   GET /api/v1/superAdmin/awsCredentials
 * @desc    Get AWS credentials
 * @access  Private (Super Admin)
 */
router.get('/awsCredentials', superAdminRoutes.awsCredentials.bind(superAdminRoutes));
 

export default router;