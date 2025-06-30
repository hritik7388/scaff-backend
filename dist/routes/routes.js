"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const superAdminRoutes_1 = __importDefault(require("./superAdminRoutes"));
const companyRoutes_1 = __importDefault(require("./companyRoutes"));
const deviceRoutes_1 = __importDefault(require("./deviceRoutes"));
const router = (0, express_1.Router)();
router.use('/v1/superAdmin', superAdminRoutes_1.default);
router.use('/v1/company', companyRoutes_1.default);
router.use('/v1/device', deviceRoutes_1.default);
exports.default = router;
