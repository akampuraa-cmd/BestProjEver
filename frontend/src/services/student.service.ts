import api from './api';
import { Student, ApiResponse, PaginatedResponse } from '../types';

export const studentService = {
  async findAll(params?: Record<string, string | number>): Promise<PaginatedResponse<Student>> {
    const { data } = await api.get<PaginatedResponse<Student>>('/students', { params });
    return data;
  },

  async findById(id: number): Promise<Student> {
    const { data } = await api.get<ApiResponse<Student>>(`/students/${id}`);
    return data.data!;
  },

  async create(formData: FormData): Promise<Student> {
    const { data } = await api.post<ApiResponse<Student>>('/students', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data!;
  },

  async update(id: number, formData: FormData): Promise<Student> {
    const { data } = await api.patch<ApiResponse<Student>>(`/students/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data!;
  },

  async getDashboard(): Promise<Record<string, unknown>> {
    const { data } = await api.get<ApiResponse<Record<string, unknown>>>('/students/dashboard');
    return data.data!;
  },
};
