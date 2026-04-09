import api from './api';
import { ClassItem, Stream, ApiResponse } from '../types';

export const referenceService = {
  async getClasses(): Promise<ClassItem[]> {
    const { data } = await api.get<ApiResponse<ClassItem[]>>('/reference/classes');
    return data.data!;
  },

  async getStreams(): Promise<Stream[]> {
    const { data } = await api.get<ApiResponse<Stream[]>>('/reference/streams');
    return data.data!;
  },
};
