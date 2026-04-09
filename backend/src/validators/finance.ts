import { z } from 'zod';

export const createFeeStructureSchema = z.object({
  academic_year_id: z.number().int().positive(),
  term_id: z.number().int().positive(),
  class_id: z.number().int().positive(),
  fee_category: z.string().trim().min(1).max(100),
  amount: z.number().positive('Amount must be positive'),
  is_active: z.boolean().optional().default(true),
});

export const updateFeeStructureSchema = z.object({
  amount: z.number().positive().optional(),
  is_active: z.boolean().optional(),
});

export const recordPaymentSchema = z.object({
  student_id: z.number().int().positive(),
  amount: z.number().positive('Payment amount must be positive'),
  payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date required'),
  method: z.enum(['cash', 'bank_transfer', 'mobile_money', 'card']),
  reference_no: z.string().max(100).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const paymentQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  student_id: z.coerce.number().int().positive().optional(),
  method: z.enum(['cash', 'bank_transfer', 'mobile_money', 'card']).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  sort_by: z.enum(['payment_date', 'amount', 'created_at']).optional().default('created_at'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const feeQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  academic_year_id: z.coerce.number().int().positive().optional(),
  term_id: z.coerce.number().int().positive().optional(),
  class_id: z.coerce.number().int().positive().optional(),
  is_active: z.coerce.boolean().optional(),
});

export type CreateFeeStructureInput = z.infer<typeof createFeeStructureSchema>;
export type UpdateFeeStructureInput = z.infer<typeof updateFeeStructureSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type PaymentQuery = z.infer<typeof paymentQuerySchema>;
export type FeeQuery = z.infer<typeof feeQuerySchema>;
