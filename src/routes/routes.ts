import { Router } from 'express';
import superAdminRoutes from './superAdminRoutes';
import companyRoutes from './companyRoutes';
import deviceRoutes from './deviceRoutes'
const router = Router(); 
router.use('/v1/superAdmin', superAdminRoutes);
router.use('/v1/company', companyRoutes);
router.use('/v1/device',deviceRoutes)
export default router;