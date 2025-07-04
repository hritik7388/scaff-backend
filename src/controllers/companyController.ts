import {Response} from "express";
import {Request} from "express";
import {
    companyRegisterSchema,
    compnayLoginSchema,
    companyUpdateSchema,
    companyIdSchema,
    approveCompanyRequestSchema,
    rejectCompanyRequestSchema,
    addNewCompanySchema,
    companyStatus,
} from "../schemas/companySchema";
import {CompanyServices} from "../services/comapnyServices";
import {AuthenticatedRequest} from "../types/index";

const companyServiceController = new CompanyServices();

export class CompanyControllers {
    async registerCompany(req: Request, res: Response) {
        try {
            const data = companyRegisterSchema.parse(req.body);
            const company = await companyServiceController.registerCompany(data);
            res.status(201).json(company);
        } catch (err) {
            res.status(400).json({error: (err as Error).message});
        }
    }
    async companyLogin(req: Request, res: Response) {
        try {
            const data = compnayLoginSchema.parse(req.body);
            const user = await companyServiceController.loginCompanyServices(data);
            res.status(200).json(user);
        } catch (err) {
            res.status(400).json({error: (err as Error).message});
        }
    }
    async updatedCompanyDetails(req: AuthenticatedRequest, res: Response) {
        try {
            const id = Number(req.user?.id!);
            const data = companyUpdateSchema.parse(req.body);
            const company = await companyServiceController.updateCompanyDetails(id, data);
            res.status(200).json(company);
        } catch (err) {
            res.status(400).json({error: (err as Error).message});
        }
    }

    async getAllCompnay(req: AuthenticatedRequest, res: Response) {
        try {
            const id = req.user?.id!;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const companies = await companyServiceController.getCompanyallDetails(id, page, limit);
            res.status(200).json(companies);
        } catch (err) {
            res.status(400).json({error: (err as Error).message});
        }
    }

    async getCompanyById(req: AuthenticatedRequest, res: Response) {
        try {
            const id = req.user?.id!;
            const data = companyIdSchema.parse(req.body);
            const company = await companyServiceController.getCompanyById(id, data);
            res.status(200).json(company);
        } catch (err) {
            res.status(400).json({error: (err as Error).message});
        }
    }

    async approveCompanyrequest(req: AuthenticatedRequest, res: Response) {
        try {
            const id = Number(req.user?.id!);
            const data = approveCompanyRequestSchema.parse(req.body);
            const company = await companyServiceController.approveCompanyRequest(id, data);

            res.status(200).json(company);
        } catch (err) {
            res.status(400).json({error: (err as Error).message});
        }
    }

    async rejectCompanyrequest(req: AuthenticatedRequest, res: Response) {
        try {
            const id = Number(req.user?.id!);
            const data = rejectCompanyRequestSchema.parse(req.body);
            const company = await companyServiceController.rejectCompanyRequest(id, data);

            res.status(200).json(company);
        } catch (err) {
            res.status(400).json({error: (err as Error).message});
        }
    }

    async searchCompany(req: AuthenticatedRequest, res: Response) {
        try {
            const id = Number(req.user?.id!);
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const data = req.query.search;
            const searchData = await companyServiceController.searchCompany(id, data, page, limit);
            res.status(200).json(searchData);
        } catch (err) {
            res.status(400).json({error: (err as Error).message});
        }
    }

    async addNewCompanyBySuperAdmin(req: AuthenticatedRequest, res: Response) {
        try {
            const id = Number(req.user?.id!);
            const data = addNewCompanySchema.parse(req.body);
            const company = await companyServiceController.addNewCompany(id, data);
            res.status(201).json(company);
        } catch (err) {
            res.status(400).json({error: (err as Error).message});
        }
    }

    async blockCompanyBySuperAdmin(req: AuthenticatedRequest, res: Response) {
        try {
            const id = Number(req.user?.id!);
            const data = companyStatus.parse(req.body);
            const company = await companyServiceController.blockCompany(id, data);
            res.status(201).json(company);
        } catch (err) {
            res.status(400).json({error: (err as Error).message});
        }
    }

    async unblockCompanyBySuperAdmin(req: AuthenticatedRequest, res: Response) {
        try {
            const id = Number(req.user?.id!);
            const data = companyStatus.parse(req.body);
            const company = await companyServiceController.unblockCompany(id, data);
            res.status(201).json(company);
        } catch (err) {
            res.status(400).json({error: (err as Error).message});
        }
    }

    async deleteCompanyBySuperAdmin(req: AuthenticatedRequest, res: Response) {
        try {
            const id = Number(req.user?.id!);
            const data = companyStatus.parse(req.body);
            const company = await companyServiceController.deleteCompany(id, data);
            res.status(201).json(company);
        } catch (err) {
            res.status(400).json({error: (err as Error).message});
        }
    }
}
