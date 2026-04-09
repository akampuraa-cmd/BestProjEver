import db from '../config/database';
import { NotFoundError, ConflictError } from '../utils/errors';
import { logAudit } from '../utils/audit';
import {
  CreateSubjectInput,
  UpdateSubjectInput,
  CreateAcademicYearInput,
  CreateTermInput,
  CreateExamInput,
  BulkGradeInput,
  GradeSheetQuery,
} from '../validators/academics';

function calculateGradeLetter(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

export class AcademicsService {
  // Subject Management
  async createSubject(data: CreateSubjectInput, userId: number): Promise<Record<string, unknown>> {
    const existing = await db('subjects').where({ code: data.code }).first();
    if (existing) throw new ConflictError('Subject code already exists');

    const [subject] = await db('subjects').insert(data).returning('*');
    await logAudit({ user_id: userId, action: 'CREATE_SUBJECT', entity_type: 'subject', entity_id: subject.id });
    return subject;
  }

  async findAllSubjects(): Promise<Record<string, unknown>[]> {
    return db('subjects').orderBy('name', 'asc');
  }

  async updateSubject(id: number, data: UpdateSubjectInput, userId: number): Promise<Record<string, unknown>> {
    const existing = await db('subjects').where({ id }).first();
    if (!existing) throw new NotFoundError('Subject');

    if (data.code) {
      const duplicate = await db('subjects').where({ code: data.code }).whereNot({ id }).first();
      if (duplicate) throw new ConflictError('Subject code already in use');
    }

    const [subject] = await db('subjects').where({ id }).update(data).returning('*');
    await logAudit({ user_id: userId, action: 'UPDATE_SUBJECT', entity_type: 'subject', entity_id: id });
    return subject;
  }

  // Academic Year Management
  async createAcademicYear(data: CreateAcademicYearInput, userId: number): Promise<Record<string, unknown>> {
    if (data.is_current) {
      await db('academic_years').update({ is_current: false });
    }
    const [year] = await db('academic_years').insert(data).returning('*');
    await logAudit({ user_id: userId, action: 'CREATE_ACADEMIC_YEAR', entity_type: 'academic_year', entity_id: year.id });
    return year;
  }

  async findAllAcademicYears(): Promise<Record<string, unknown>[]> {
    return db('academic_years').orderBy('start_date', 'desc');
  }

  // Term Management
  async createTerm(data: CreateTermInput, userId: number): Promise<Record<string, unknown>> {
    const [term] = await db('terms').insert(data).returning('*');
    await logAudit({ user_id: userId, action: 'CREATE_TERM', entity_type: 'term', entity_id: term.id });
    return term;
  }

  async findAllTerms(academicYearId?: number): Promise<Record<string, unknown>[]> {
    const query = db('terms as t')
      .select('t.*', 'ay.name as academic_year_name')
      .leftJoin('academic_years as ay', 't.academic_year_id', 'ay.id');
    if (academicYearId) query.where('t.academic_year_id', academicYearId);
    return query.orderBy('t.start_date', 'desc');
  }

  // Exam Management
  async createExam(data: CreateExamInput, userId: number): Promise<Record<string, unknown>> {
    const [exam] = await db('exams').insert(data).returning('*');
    await logAudit({ user_id: userId, action: 'CREATE_EXAM', entity_type: 'exam', entity_id: exam.id });
    return exam;
  }

  async findAllExams(termId?: number): Promise<Record<string, unknown>[]> {
    const query = db('exams as e')
      .select('e.*', 't.name as term_name', 'c.name as class_name')
      .leftJoin('terms as t', 'e.term_id', 't.id')
      .leftJoin('classes as c', 'e.class_id', 'c.id');
    if (termId) query.where('e.term_id', termId);
    return query.orderBy('e.created_at', 'desc');
  }

  // Grade Management
  async getGradeSheet(query: GradeSheetQuery): Promise<Record<string, unknown>> {
    const studentQuery = db('students as s')
      .select('s.id', 's.unique_student_id', 's.full_name')
      .where('s.class_id', query.class_id)
      .where('s.status', 'active');

    if (query.stream_id) studentQuery.where('s.stream_id', query.stream_id);
    const students = await studentQuery.orderBy('s.full_name', 'asc');

    const subjects = await db('subjects').where({ is_active: true }).orderBy('name', 'asc');

    const existingGrades = await db('grades')
      .where({ exam_id: query.exam_id })
      .whereIn('student_id', students.map((s: any) => s.id));

    const gradeMap: Record<string, any> = {};
    existingGrades.forEach((g: any) => {
      gradeMap[`${g.student_id}-${g.subject_id}`] = g;
    });

    return { students, subjects, existing_grades: gradeMap, exam_id: query.exam_id };
  }

  async bulkSaveGrades(data: BulkGradeInput, userId: number): Promise<{ saved: number; errors: string[] }> {
    const errors: string[] = [];
    let saved = 0;

    await db.transaction(async (trx) => {
      for (const grade of data.grades) {
        try {
          const gradeLetter = calculateGradeLetter(grade.score);

          const existing = await trx('grades')
            .where({
              student_id: grade.student_id,
              subject_id: grade.subject_id,
              exam_id: grade.exam_id,
            })
            .first();

          if (existing) {
            await trx('grades')
              .where({ id: existing.id })
              .update({
                score: grade.score,
                grade_letter: gradeLetter,
                remarks: grade.remarks || null,
                recorded_by: userId,
                updated_at: new Date(),
              });
          } else {
            await trx('grades').insert({
              student_id: grade.student_id,
              subject_id: grade.subject_id,
              exam_id: grade.exam_id,
              score: grade.score,
              grade_letter: gradeLetter,
              remarks: grade.remarks || null,
              recorded_by: userId,
            });
          }
          saved++;
        } catch (error: any) {
          errors.push(`Student ${grade.student_id}, Subject ${grade.subject_id}: ${error.message}`);
        }
      }
    });

    await logAudit({
      user_id: userId,
      action: 'BULK_SAVE_GRADES',
      entity_type: 'grade',
      metadata: { saved, errors_count: errors.length },
    });

    return { saved, errors };
  }

  async getStudentReport(studentId: number, examId?: number, termId?: number): Promise<Record<string, unknown>> {
    const student = await db('students as s')
      .select('s.*', 'c.name as class_name', 'st.name as stream_name')
      .leftJoin('classes as c', 's.class_id', 'c.id')
      .leftJoin('streams as st', 's.stream_id', 'st.id')
      .where('s.id', studentId)
      .first();

    if (!student) throw new NotFoundError('Student');

    let gradesQuery = db('grades as g')
      .select(
        'g.*',
        'sub.name as subject_name',
        'sub.code as subject_code',
        'e.name as exam_name',
        't.name as term_name'
      )
      .leftJoin('subjects as sub', 'g.subject_id', 'sub.id')
      .leftJoin('exams as e', 'g.exam_id', 'e.id')
      .leftJoin('terms as t', 'e.term_id', 't.id')
      .where('g.student_id', studentId);

    if (examId) gradesQuery = gradesQuery.where('g.exam_id', examId);
    if (termId) gradesQuery = gradesQuery.whereIn('g.exam_id', db('exams').where('term_id', termId).select('id'));

    const grades = await gradesQuery.orderBy('sub.name', 'asc');

    const totalScore = grades.reduce((sum: number, g: any) => sum + parseFloat(g.score), 0);
    const averageScore = grades.length > 0 ? totalScore / grades.length : 0;

    return {
      student,
      grades,
      summary: {
        total_subjects: grades.length,
        total_score: totalScore,
        average_score: Math.round(averageScore * 100) / 100,
        overall_grade: calculateGradeLetter(averageScore),
      },
    };
  }

  async getClassPerformance(examId: number, classId: number): Promise<Record<string, unknown>> {
    const subjects = await db('subjects').where({ is_active: true }).orderBy('name');

    const subjectStats = [];
    for (const subject of subjects) {
      const stats = await db('grades as g')
        .where({ 'g.exam_id': examId, 'g.subject_id': (subject as any).id })
        .whereIn('g.student_id', db('students').where({ class_id: classId, status: 'active' }).select('id'))
        .select(
          db.raw('COUNT(*) as total_students'),
          db.raw('AVG(g.score) as average_score'),
          db.raw('MAX(g.score) as highest_score'),
          db.raw('MIN(g.score) as lowest_score'),
          db.raw('COUNT(CASE WHEN g.score >= 50 THEN 1 END) as passed'),
          db.raw('COUNT(CASE WHEN g.score < 50 THEN 1 END) as failed')
        )
        .first();

      subjectStats.push({
        subject_id: (subject as any).id,
        subject_name: (subject as any).name,
        subject_code: (subject as any).code,
        ...stats,
      });
    }

    const topStudents = await db('grades as g')
      .select(
        's.id', 's.unique_student_id', 's.full_name',
        db.raw('AVG(g.score) as average_score'),
        db.raw('SUM(g.score) as total_score')
      )
      .leftJoin('students as s', 'g.student_id', 's.id')
      .where({ 'g.exam_id': examId })
      .whereIn('g.student_id', db('students').where({ class_id: classId, status: 'active' }).select('id'))
      .groupBy('s.id', 's.unique_student_id', 's.full_name')
      .orderBy('average_score', 'desc')
      .limit(10);

    return { subject_stats: subjectStats, top_students: topStudents };
  }

  async getDashboardStats(): Promise<Record<string, unknown>> {
    const recentExams = await db('exams as e')
      .select('e.*', 't.name as term_name')
      .leftJoin('terms as t', 'e.term_id', 't.id')
      .orderBy('e.created_at', 'desc')
      .limit(5);

    const totalSubjects = await db('subjects').where({ is_active: true }).count('id as count').first();

    return {
      total_subjects: parseInt((totalSubjects as any)?.count || '0', 10),
      recent_exams: recentExams,
    };
  }
}
