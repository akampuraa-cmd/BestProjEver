import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { FinanceService } from '../services/finance.service';
import { sendSuccess, sendCreated } from '../utils/response';

const financeService = new FinanceService();

export class FinanceController {
  async createFeeStructure(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const fee = await financeService.createFeeStructure(req.body, req.user!.id);
      sendCreated(res, fee, 'Fee structure created');
    } catch (error) {
      next(error);
    }
  }

  async findAllFees(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await financeService.findAllFees(req.query as any);
      res.status(200).json({ success: true, message: 'Success', ...result });
    } catch (error) {
      next(error);
    }
  }

  async updateFeeStructure(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const fee = await financeService.updateFeeStructure(parseInt(req.params.id, 10), req.body, req.user!.id);
      sendSuccess(res, fee, 'Fee structure updated');
    } catch (error) {
      next(error);
    }
  }

  async recordPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const payment = await financeService.recordPayment(req.body, req.user!.id);
      sendCreated(res, payment, 'Payment recorded successfully');
    } catch (error) {
      next(error);
    }
  }

  async findAllPayments(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await financeService.findAllPayments(req.query as any);
      res.status(200).json({ success: true, message: 'Success', ...result });
    } catch (error) {
      next(error);
    }
  }

  async getStudentFinance(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await financeService.getStudentFinanceProfile(parseInt(req.params.studentId, 10));
      sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  }

  async getReceipt(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const receipt = await financeService.getReceiptByNo(req.params.receiptNo);
      sendSuccess(res, receipt);
    } catch (error) {
      next(error);
    }
  }

  async dashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await financeService.getDashboardStats();
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }
}
