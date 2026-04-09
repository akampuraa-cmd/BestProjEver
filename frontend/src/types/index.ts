export enum Role {
  SECRETARY = 'secretary',
  BURSAR = 'bursar',
  DOS = 'dos',
  ADMIN = 'admin',
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  MOBILE_MONEY = 'mobile_money',
  CARD = 'card',
}

export enum StudentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  GRADUATED = 'graduated',
  TRANSFERRED = 'transferred',
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: Role;
}

export interface Student {
  id: number;
  unique_student_id: string;
  full_name: string;
  photo_url: string | null;
  class_id: number;
  stream_id: number;
  enrollment_date: string;
  status: StudentStatus;
  class_name?: string;
  stream_name?: string;
  created_by_name?: string;
  updated_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ClassItem {
  id: number;
  name: string;
  level_order: number;
}

export interface Stream {
  id: number;
  name: string;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
}

export interface AcademicYear {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export interface Term {
  id: number;
  name: string;
  academic_year_id: number;
  academic_year_name?: string;
  start_date: string;
  end_date: string;
}

export interface Exam {
  id: number;
  name: string;
  term_id: number;
  class_id: number | null;
  exam_date: string | null;
  term_name?: string;
  class_name?: string;
}

export interface FeeStructure {
  id: number;
  academic_year_id: number;
  term_id: number;
  class_id: number;
  fee_category: string;
  amount: number;
  is_active: boolean;
  academic_year_name?: string;
  term_name?: string;
  class_name?: string;
}

export interface Payment {
  id: number;
  student_id: number;
  amount: number;
  payment_date: string;
  method: PaymentMethod;
  reference_no: string | null;
  receipt_no: string;
  notes: string | null;
  student_name?: string;
  unique_student_id?: string;
  recorded_by_name?: string;
  created_at: string;
}

export interface Grade {
  id: number;
  student_id: number;
  subject_id: number;
  exam_id: number;
  score: number;
  grade_letter: string | null;
  remarks: string | null;
  subject_name?: string;
  subject_code?: string;
  exam_name?: string;
  term_name?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
