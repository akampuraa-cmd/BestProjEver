import api from './api';
import { Subject, AcademicYear, Term, Exam, ApiResponse } from '../types';

export const academicsService = {
  // Subjects
  async getSubjects(): Promise<Subject[]> {
    const { data } = await api.get<ApiResponse<Subject[]>>('/academics/subjects');
    return data.data!;
  },

  async createSubject(subject: Partial<Subject>): Promise<Subject> {
    const { data } = await api.post<ApiResponse<Subject>>('/academics/subjects', subject);
    return data.data!;
  },

  async updateSubject(id: number, updates: Partial<Subject>): Promise<Subject> {
    const { data } = await api.patch<ApiResponse<Subject>>(`/academics/subjects/${id}`, updates);
    return data.data!;
  },

  // Academic Years
  async getAcademicYears(): Promise<AcademicYear[]> {
    const { data } = await api.get<ApiResponse<AcademicYear[]>>('/academics/academic-years');
    return data.data!;
  },

  async createAcademicYear(year: Partial<AcademicYear>): Promise<AcademicYear> {
    const { data } = await api.post<ApiResponse<AcademicYear>>('/academics/academic-years', year);
    return data.data!;
  },

  // Terms
  async getTerms(academicYearId?: number): Promise<Term[]> {
    const params = academicYearId ? { academic_year_id: academicYearId } : {};
    const { data } = await api.get<ApiResponse<Term[]>>('/academics/terms', { params });
    return data.data!;
  },

  async createTerm(term: Partial<Term>): Promise<Term> {
    const { data } = await api.post<ApiResponse<Term>>('/academics/terms', term);
    return data.data!;
  },

  // Exams
  async getExams(termId?: number): Promise<Exam[]> {
    const params = termId ? { term_id: termId } : {};
    const { data } = await api.get<ApiResponse<Exam[]>>('/academics/exams', { params });
    return data.data!;
  },

  async createExam(exam: Partial<Exam>): Promise<Exam> {
    const { data } = await api.post<ApiResponse<Exam>>('/academics/exams', exam);
    return data.data!;
  },

  // Grade Sheet
  async getGradeSheet(params: Record<string, number>): Promise<Record<string, unknown>> {
    const { data } = await api.get<ApiResponse<Record<string, unknown>>>('/academics/grade-sheet', { params });
    return data.data!;
  },

  async bulkSaveGrades(grades: Record<string, unknown>[]): Promise<Record<string, unknown>> {
    const { data } = await api.post<ApiResponse<Record<string, unknown>>>('/academics/grades/bulk', { grades });
    return data.data!;
  },

  // Reports
  async getStudentReport(studentId: number, params?: Record<string, number>): Promise<Record<string, unknown>> {
    const { data } = await api.get<ApiResponse<Record<string, unknown>>>(`/academics/students/${studentId}/report`, { params });
    return data.data!;
  },

  async getClassPerformance(examId: number, classId: number): Promise<Record<string, unknown>> {
    const { data } = await api.get<ApiResponse<Record<string, unknown>>>('/academics/analytics/class-performance', {
      params: { exam_id: examId, class_id: classId },
    });
    return data.data!;
  },

  async getDashboard(): Promise<Record<string, unknown>> {
    const { data } = await api.get<ApiResponse<Record<string, unknown>>>('/academics/dashboard');
    return data.data!;
  },
};
