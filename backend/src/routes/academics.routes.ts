import { Router } from 'express';
import { AcademicsController } from '../controllers/academics.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createSubjectSchema,
  updateSubjectSchema,
  createAcademicYearSchema,
  createTermSchema,
  createExamSchema,
  bulkGradeSchema,
  gradeSheetQuerySchema,
} from '../validators/academics';
import { Role } from '../types';

const router = Router();
const controller = new AcademicsController();

router.use(authenticate);

// Dashboard
router.get('/dashboard', authorize(Role.DOS, Role.ADMIN), controller.dashboard.bind(controller));

// Subjects
router.get('/subjects', controller.findAllSubjects.bind(controller));
router.post('/subjects', authorize(Role.DOS, Role.ADMIN), validate(createSubjectSchema), controller.createSubject.bind(controller));
router.patch('/subjects/:id', authorize(Role.DOS, Role.ADMIN), validate(updateSubjectSchema), controller.updateSubject.bind(controller));

// Academic Years
router.get('/academic-years', controller.findAllAcademicYears.bind(controller));
router.post('/academic-years', authorize(Role.DOS, Role.ADMIN), validate(createAcademicYearSchema), controller.createAcademicYear.bind(controller));

// Terms
router.get('/terms', controller.findAllTerms.bind(controller));
router.post('/terms', authorize(Role.DOS, Role.ADMIN), validate(createTermSchema), controller.createTerm.bind(controller));

// Exams
router.get('/exams', controller.findAllExams.bind(controller));
router.post('/exams', authorize(Role.DOS, Role.ADMIN), validate(createExamSchema), controller.createExam.bind(controller));

// Grade Sheet & Grades
router.get('/grade-sheet', authorize(Role.DOS, Role.ADMIN), validate(gradeSheetQuerySchema, 'query'), controller.getGradeSheet.bind(controller));
router.post('/grades/bulk', authorize(Role.DOS, Role.ADMIN), validate(bulkGradeSchema), controller.bulkSaveGrades.bind(controller));

// Student Report
router.get('/students/:studentId/report', controller.getStudentReport.bind(controller));

// Analytics
router.get('/analytics/class-performance', authorize(Role.DOS, Role.ADMIN), controller.getClassPerformance.bind(controller));

export default router;
