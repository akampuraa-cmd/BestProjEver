import api from './api';
import { FeeStructure, Payment, ApiResponse, PaginatedResponse } from '../types';

export const financeService = {
  async getFees(params?: Record<string, string | number>): Promise<PaginatedResponse<FeeStructure>> {
    const { data } = await api.get<PaginatedResponse<FeeStructure>>('/finance/fees', { params });
    return data;
  },

  async createFee(fee: Partial<FeeStructure>): Promise<FeeStructure> {
    const { data } = await api.post<ApiResponse<FeeStructure>>('/finance/fees', fee);
    return data.data!;
  },

  async updateFee(id: number, updates: Partial<FeeStructure>): Promise<FeeStructure> {
    const { data } = await api.patch<ApiResponse<FeeStructure>>(`/finance/fees/${id}`, updates);
    return data.data!;
  },

  async getStudentFinance(studentId: number): Promise<Record<string, unknown>> {
    const { data } = await api.get<ApiResponse<Record<string, unknown>>>(`/finance/students/${studentId}`);
    return data.data!;
  },

  async recordPayment(payment: Record<string, unknown>): Promise<Payment> {
    const { data } = await api.post<ApiResponse<Payment>>('/finance/payments', payment);
    return data.data!;
  },

  async getPayments(params?: Record<string, string | number>): Promise<PaginatedResponse<Payment>> {
    const { data } = await api.get<PaginatedResponse<Payment>>('/finance/payments', { params });
    return data;
  },

  async getReceipt(receiptNo: string): Promise<Record<string, unknown>> {
    const { data } = await api.get<ApiResponse<Record<string, unknown>>>(`/finance/receipts/${receiptNo}`);
    return data.data!;
  },

  async getDashboard(): Promise<Record<string, unknown>> {
    const { data } = await api.get<ApiResponse<Record<string, unknown>>>('/finance/dashboard');
    return data.data!;
  },
};
