"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const superAdminController_1 = require("../controllers/superAdminController");
const router = (0, express_1.Router)();
const superAdminRoutes = new superAdminController_1.superAdminController();
/**
 * @route   POST /api/v1/superAdmin/superAdminLogin
 * @desc    Login a super admin
 * @access  Public
 */
router.post('/login', superAdminRoutes.superAdminLogin.bind(superAdminRoutes));
exports.default = router;
