import api from './api';
import { User, ApiResponse } from '../types';

interface LoginResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<ApiResponse<LoginResponse>>('/auth/login', { email, password });
    if (data.data) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    return data.data!;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  async getCurrentUser(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data.data!;
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try { return JSON.parse(userStr); } catch { return null; }
    }
    return null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
};
