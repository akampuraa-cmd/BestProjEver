import api from './api';
import { ApiResponse } from '../types';

interface SearchResults {
  students?: Array<{
    id: number;
    unique_student_id: string;
    full_name: string;
    photo_url: string | null;
    status: string;
    class_name: string;
    stream_name: string;
  }>;
  staff?: Array<{
    id: number;
    full_name: string;
    email: string;
    role: string;
    is_active: boolean;
  }>;
}

export const searchService = {
  async search(q: string, type: string = 'all'): Promise<SearchResults> {
    const { data } = await api.get<ApiResponse<SearchResults>>('/search', { params: { q, type } });
    return data.data!;
  },
};
