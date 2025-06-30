import { Router } from 'express';
import superAdminRoutes from './superAdminRoutes';
import companyRoutes from './companyRoutes';
const router = Router(); 
router.use('/v1/superAdmin', superAdminRoutes);
router.use('/v1/company', companyRoutes);
export default router;