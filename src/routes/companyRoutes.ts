import {Router} from "express";
import {CompanyControllers} from "../controllers/companyController";
import {authMiddleware} from "../middlewares/authMiddleware";

const router = Router();

const companyController = new CompanyControllers();
/**
 * @route   POST /api/v1/company/register
 * @desc    Register a new company
 * @access  Public
 */
router.post("/registerCompany", companyController.registerCompany.bind(companyController));

/**
 * @route   POST /api/v1/company/login
 * @desc    Login company
 * @access  Public
 */
router.post("/companyLogin", companyController.companyLogin.bind(companyController));

/**
 * @route   PUT /api/v1/company/update
 * @desc    Upadte a existing  company
 * @access  Public
 */
router.put("/updatedCompanyDetails", authMiddleware, companyController.updatedCompanyDetails.bind(companyController));

/**
 * @route   GET /api/v1/company/all
 * @desc    Get all companies
 * @access  Private (Super Admin)
 */
router.get("/getAllCompnay", authMiddleware, companyController.getAllCompnay.bind(companyController));

/**
 * @route   GET /api/v1/company/getCompanyById
 * @desc    Get company by ID
 * @access  Private (Super Admin)
 */
router.get("/getCompanyById", authMiddleware, companyController.getCompanyById.bind(companyController));

/**
 * @route   POST /api/v1/company/approveCompanyrequest
 * @desc    Approve company request
 * @access  Private (Super Admin)
 */
router.post('/approveCompanyrequest', authMiddleware, companyController.approveCompanyrequest.bind(companyController));

/**
 * @route   POST /api/v1/company/rejectCompanyrequest
 * @desc    Reject company request
 * @access  Private (Super Admin)
 */
router.post('/rejectCompanyrequest', authMiddleware, companyController.rejectCompanyrequest.bind(companyController));



/**
 * @route   POST /api/v1/company/searchCompany
 * @desc    Search company by ID or name
 * @access  Private (Super Admin)
 */
router.get('/searchCompany', authMiddleware, companyController.searchCompany.bind(companyController));


/**
 * @route   POST /api/v1/company/addNewCompanyBySuperAdmin
 * @desc    Add a new company
 * @access  Private (Super Admin)
 */
router.post('/addNewCompanyBySuperAdmin', authMiddleware, companyController.addNewCompanyBySuperAdmin.bind(companyController));

/**
 * @route   POST /api/v1/company/addNewCompanyBySuperAdmin
 * @desc    Add a new company
 * @access  Private (Super Admin)
 */
router.patch('/inactiveCompanyBySuperAdmin', authMiddleware, companyController.inactiveCompanyBySuperAdmin.bind(companyController));

export default router;