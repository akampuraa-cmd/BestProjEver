import { z } from 'zod';

export const createSubjectSchema = z.object({
  name: z.string().trim().min(1).max(255),
  code: z.string().trim().min(1).max(20),
  is_active: z.boolean().optional().default(true),
});

export const updateSubjectSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  code: z.string().trim().min(1).max(20).optional(),
  is_active: z.boolean().optional(),
});

export const createAcademicYearSchema = z.object({
  name: z.string().trim().min(1).max(50),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  is_current: z.boolean().optional().default(false),
});

export const createTermSchema = z.object({
  name: z.string().trim().min(1).max(100),
  academic_year_id: z.number().int().positive(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const createExamSchema = z.object({
  name: z.string().trim().min(1).max(255),
  term_id: z.number().int().positive(),
  class_id: z.number().int().positive().nullable().optional(),
  exam_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

export const bulkGradeSchema = z.object({
  grades: z.array(z.object({
    student_id: z.number().int().positive(),
    subject_id: z.number().int().positive(),
    exam_id: z.number().int().positive(),
    score: z.number().min(0).max(100),
    remarks: z.string().max(500).optional().nullable(),
  })).min(1, 'At least one grade is required'),
});

export const gradeSheetQuerySchema = z.object({
  exam_id: z.coerce.number().int().positive(),
  class_id: z.coerce.number().int().positive(),
  stream_id: z.coerce.number().int().positive().optional(),
});

export const studentReportQuerySchema = z.object({
  exam_id: z.coerce.number().int().positive().optional(),
  term_id: z.coerce.number().int().positive().optional(),
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
export type CreateAcademicYearInput = z.infer<typeof createAcademicYearSchema>;
export type CreateTermInput = z.infer<typeof createTermSchema>;
export type CreateExamInput = z.infer<typeof createExamSchema>;
export type BulkGradeInput = z.infer<typeof bulkGradeSchema>;
export type GradeSheetQuery = z.infer<typeof gradeSheetQuerySchema>;
export type StudentReportQuery = z.infer<typeof studentReportQuerySchema>;
