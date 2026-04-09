import { Router } from 'express';
import { FinanceController } from '../controllers/finance.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createFeeStructureSchema,
  updateFeeStructureSchema,
  recordPaymentSchema,
  paymentQuerySchema,
  feeQuerySchema,
} from '../validators/finance';
import { Role } from '../types';

const router = Router();
const controller = new FinanceController();

router.use(authenticate);

router.get('/dashboard', authorize(Role.BURSAR, Role.ADMIN), controller.dashboard.bind(controller));
router.get('/fees', validate(feeQuerySchema, 'query'), controller.findAllFees.bind(controller));
router.post('/fees', authorize(Role.BURSAR, Role.ADMIN), validate(createFeeStructureSchema), controller.createFeeStructure.bind(controller));
router.patch('/fees/:id', authorize(Role.BURSAR, Role.ADMIN), validate(updateFeeStructureSchema), controller.updateFeeStructure.bind(controller));
router.get('/students/:studentId', controller.getStudentFinance.bind(controller));
router.post('/payments', authorize(Role.BURSAR, Role.ADMIN), validate(recordPaymentSchema), controller.recordPayment.bind(controller));
router.get('/payments', validate(paymentQuerySchema, 'query'), controller.findAllPayments.bind(controller));
router.get('/receipts/:receiptNo', controller.getReceipt.bind(controller));

export default router;
