import { Request } from 'express';

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

export interface AuthUser {
  id: number;
  email: string;
  role: Role;
  full_name: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}
