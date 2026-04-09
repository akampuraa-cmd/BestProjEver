import { z } from 'zod';

export const createStudentSchema = z.object({
  full_name: z.string().trim().min(2, 'Full name must be at least 2 characters').max(255),
  class_id: z.number().int().positive('Class is required'),
  stream_id: z.number().int().positive('Stream is required'),
  enrollment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date (YYYY-MM-DD) is required'),
});

export const updateStudentSchema = z.object({
  full_name: z.string().trim().min(2).max(255).optional(),
  class_id: z.number().int().positive().optional(),
  stream_id: z.number().int().positive().optional(),
  enrollment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(['active', 'inactive', 'graduated', 'transferred']).optional(),
});

export const studentQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  class_id: z.coerce.number().int().positive().optional(),
  stream_id: z.coerce.number().int().positive().optional(),
  status: z.enum(['active', 'inactive', 'graduated', 'transferred']).optional(),
  search: z.string().optional(),
  sort_by: z.enum(['full_name', 'created_at', 'enrollment_date', 'unique_student_id']).optional().default('created_at'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type StudentQuery = z.infer<typeof studentQuerySchema>;
