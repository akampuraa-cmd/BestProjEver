import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { AcademicsService } from '../services/academics.service';
import { sendSuccess, sendCreated } from '../utils/response';

const academicsService = new AcademicsService();

export class AcademicsController {
  // Subjects
  async createSubject(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const subject = await academicsService.createSubject(req.body, req.user!.id);
      sendCreated(res, subject, 'Subject created');
    } catch (error) {
      next(error);
    }
  }

  async findAllSubjects(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const subjects = await academicsService.findAllSubjects();
      sendSuccess(res, subjects);
    } catch (error) {
      next(error);
    }
  }

  async updateSubject(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const subject = await academicsService.updateSubject(parseInt(req.params.id, 10), req.body, req.user!.id);
      sendSuccess(res, subject, 'Subject updated');
    } catch (error) {
      next(error);
    }
  }

  // Academic Years
  async createAcademicYear(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const year = await academicsService.createAcademicYear(req.body, req.user!.id);
      sendCreated(res, year, 'Academic year created');
    } catch (error) {
      next(error);
    }
  }

  async findAllAcademicYears(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const years = await academicsService.findAllAcademicYears();
      sendSuccess(res, years);
    } catch (error) {
      next(error);
    }
  }

  // Terms
  async createTerm(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const term = await academicsService.createTerm(req.body, req.user!.id);
      sendCreated(res, term, 'Term created');
    } catch (error) {
      next(error);
    }
  }

  async findAllTerms(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const academicYearId = req.query.academic_year_id ? parseInt(req.query.academic_year_id as string, 10) : undefined;
      const terms = await academicsService.findAllTerms(academicYearId);
      sendSuccess(res, terms);
    } catch (error) {
      next(error);
    }
  }

  // Exams
  async createExam(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const exam = await academicsService.createExam(req.body, req.user!.id);
      sendCreated(res, exam, 'Exam created');
    } catch (error) {
      next(error);
    }
  }

  async findAllExams(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const termId = req.query.term_id ? parseInt(req.query.term_id as string, 10) : undefined;
      const exams = await academicsService.findAllExams(termId);
      sendSuccess(res, exams);
    } catch (error) {
      next(error);
    }
  }

  // Grades
  async getGradeSheet(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const sheet = await academicsService.getGradeSheet(req.query as any);
      sendSuccess(res, sheet);
    } catch (error) {
      next(error);
    }
  }

  async bulkSaveGrades(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await academicsService.bulkSaveGrades(req.body, req.user!.id);
      sendSuccess(res, result, `${result.saved} grades saved successfully`);
    } catch (error) {
      next(error);
    }
  }

  async getStudentReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = parseInt(req.params.studentId, 10);
      const examId = req.query.exam_id ? parseInt(req.query.exam_id as string, 10) : undefined;
      const termId = req.query.term_id ? parseInt(req.query.term_id as string, 10) : undefined;
      const report = await academicsService.getStudentReport(studentId, examId, termId);
      sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  }

  async getClassPerformance(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const examId = parseInt(req.query.exam_id as string, 10);
      const classId = parseInt(req.query.class_id as string, 10);
      const performance = await academicsService.getClassPerformance(examId, classId);
      sendSuccess(res, performance);
    } catch (error) {
      next(error);
    }
  }

  async dashboard(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await academicsService.getDashboardStats();
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }
}
