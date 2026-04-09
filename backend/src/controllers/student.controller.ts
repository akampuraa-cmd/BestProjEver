import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { StudentService } from '../services/student.service';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

const studentService = new StudentService();

export class StudentController {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const photoUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
      const student = await studentService.create(req.body, req.user!.id, photoUrl);
      sendCreated(res, student, 'Student created successfully');
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await studentService.findAll(req.query as any);
      res.status(200).json({ success: true, message: 'Success', ...result });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = await studentService.findById(parseInt(req.params.id, 10));
      sendSuccess(res, student);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const photoUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
      const student = await studentService.update(
        parseInt(req.params.id, 10),
        req.body,
        req.user!.id,
        photoUrl
      );
      sendSuccess(res, student, 'Student updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async dashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await studentService.getDashboardStats(req.user!.id);
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }
}
