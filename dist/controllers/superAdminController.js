"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.superAdminController = void 0;
const superAdminServices_1 = require("../services/superAdminServices");
const superAdminSchema_1 = require("../schemas/superAdminSchema");
const superAdmin = new superAdminServices_1.superAdminServices();
class superAdminController {
    superAdminLogin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = superAdminSchema_1.superAdminSchema.parse(req.body);
                const user = yield superAdmin.loginSuperAdminServices(data);
                res.status(200).json(user);
            }
            catch (err) {
                next(err);
            }
        });
    }
    dashboardData(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const id = String((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
                const data = yield superAdmin.adminDashboard(id);
                res.status(200).json(data);
            }
            catch (err) {
                next(err);
            }
        });
    }
    awsCredentials(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield superAdmin.awsCredentials(); // This is the service method
                res.status(200).json(data);
            }
            catch (err) {
                next(err);
            }
        });
    }
}
exports.superAdminController = superAdminController;
