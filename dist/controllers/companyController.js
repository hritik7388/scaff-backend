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
exports.CompanyControllers = void 0;
const companySchema_1 = require("../schemas/companySchema");
const comapnyServices_1 = require("../services/comapnyServices");
const companyServiceController = new comapnyServices_1.CompanyServices();
class CompanyControllers {
    registerCompany(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = companySchema_1.companyRegisterSchema.parse(req.body);
                const company = yield companyServiceController.registerCompany(data);
                res.status(201).json(company);
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        });
    }
    companyLogin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = companySchema_1.compnayLoginSchema.parse(req.body);
                const user = yield companyServiceController.loginCompanyServices(data);
                res.status(200).json(user);
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        });
    }
    updatedCompanyDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const id = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
                const data = companySchema_1.companyUpdateSchema.parse(req.body);
                const company = yield companyServiceController.updateCompanyDetails(id, data);
                res.status(200).json(company);
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        });
    }
    getAllCompnay(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const companies = yield companyServiceController.getCompanyallDetails(id, page, limit);
                res.status(200).json(companies);
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        });
    }
    getCompanyById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const data = companySchema_1.companyIdSchema.parse(req.body);
                const company = yield companyServiceController.getCompanyById(id, data);
                res.status(200).json(company);
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        });
    }
    approveCompanyrequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const id = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
                const data = companySchema_1.approveCompanyRequestSchema.parse(req.body);
                const company = yield companyServiceController.approveCompanyRequest(id, data);
                res.status(200).json(company);
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        });
    }
    rejectCompanyrequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const id = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
                const data = companySchema_1.rejectCompanyRequestSchema.parse(req.body);
                const company = yield companyServiceController.rejectCompanyRequest(id, data);
                res.status(200).json(company);
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        });
    }
    searchCompany(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const id = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const data = req.query.search;
                const searchData = yield companyServiceController.searchCompany(id, data, page, limit);
                res.status(200).json(searchData);
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        });
    }
    addNewCompanyBySuperAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const id = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
                const data = companySchema_1.addNewCompanySchema.parse(req.body);
                const company = yield companyServiceController.addNewCompany(id, data);
                res.status(201).json(company);
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        });
    }
    blockCompanyBySuperAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const id = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
                const data = companySchema_1.companyStatus.parse(req.body);
                const company = yield companyServiceController.blockCompany(id, data);
                res.status(201).json(company);
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        });
    }
    unblockCompanyBySuperAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const id = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
                const data = companySchema_1.companyStatus.parse(req.body);
                const company = yield companyServiceController.unblockCompany(id, data);
                res.status(201).json(company);
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        });
    }
    deleteCompanyBySuperAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const id = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
                const data = companySchema_1.companyStatus.parse(req.body);
                const company = yield companyServiceController.deleteCompany(id, data);
                res.status(201).json(company);
            }
            catch (err) {
                res.status(400).json({ error: err.message });
            }
        });
    }
}
exports.CompanyControllers = CompanyControllers;
