import { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  // Clean tables in reverse dependency order
  await knex('audit_logs').del();
  await knex('grades').del();
  await knex('payments').del();
  await knex('fee_structures').del();
  await knex('exams').del();
  await knex('terms').del();
  await knex('academic_years').del();
  await knex('subjects').del();
  await knex('students').del();
  await knex('streams').del();
  await knex('classes').del();
  await knex('users').del();

  const passwordHash = await bcrypt.hash('password123', 10);

  // Users
  await knex('users').insert([
    { id: 1, full_name: 'Jane Secretary', email: 'secretary@school.com', password_hash: passwordHash, role: 'secretary' },
    { id: 2, full_name: 'John Bursar', email: 'bursar@school.com', password_hash: passwordHash, role: 'bursar' },
    { id: 3, full_name: 'Mary DOS', email: 'dos@school.com', password_hash: passwordHash, role: 'dos' },
    { id: 4, full_name: 'Admin User', email: 'admin@school.com', password_hash: passwordHash, role: 'admin' },
  ]);

  // Classes
  await knex('classes').insert([
    { id: 1, name: 'Primary 1', level_order: 1 },
    { id: 2, name: 'Primary 2', level_order: 2 },
    { id: 3, name: 'Primary 3', level_order: 3 },
    { id: 4, name: 'Primary 4', level_order: 4 },
    { id: 5, name: 'Primary 5', level_order: 5 },
    { id: 6, name: 'Primary 6', level_order: 6 },
    { id: 7, name: 'Primary 7', level_order: 7 },
  ]);

  // Streams
  await knex('streams').insert([
    { id: 1, name: 'East' },
    { id: 2, name: 'West' },
    { id: 3, name: 'North' },
  ]);

  // Students
  await knex('students').insert([
    { id: 1, unique_student_id: 'S-2026-001', full_name: 'Alice Nakamya', class_id: 3, stream_id: 1, enrollment_date: '2026-01-15', status: 'active', created_by: 1 },
    { id: 2, unique_student_id: 'S-2026-002', full_name: 'Brian Ochieng', class_id: 3, stream_id: 2, enrollment_date: '2026-01-15', status: 'active', created_by: 1 },
    { id: 3, unique_student_id: 'S-2026-003', full_name: 'Catherine Auma', class_id: 4, stream_id: 1, enrollment_date: '2026-01-20', status: 'active', created_by: 1 },
    { id: 4, unique_student_id: 'S-2026-004', full_name: 'David Mugisha', class_id: 4, stream_id: 2, enrollment_date: '2026-02-01', status: 'active', created_by: 1 },
    { id: 5, unique_student_id: 'S-2026-005', full_name: 'Esther Nambi', class_id: 5, stream_id: 1, enrollment_date: '2026-02-10', status: 'active', created_by: 1 },
  ]);

  // Subjects
  await knex('subjects').insert([
    { id: 1, name: 'Mathematics', code: 'MATH', is_active: true },
    { id: 2, name: 'English', code: 'ENG', is_active: true },
    { id: 3, name: 'Science', code: 'SCI', is_active: true },
    { id: 4, name: 'Social Studies', code: 'SST', is_active: true },
    { id: 5, name: 'Kiswahili', code: 'KSW', is_active: true },
  ]);

  // Academic Years
  await knex('academic_years').insert([
    { id: 1, name: '2026', start_date: '2026-01-06', end_date: '2026-12-04', is_current: true },
  ]);

  // Terms
  await knex('terms').insert([
    { id: 1, name: 'Term 1', academic_year_id: 1, start_date: '2026-01-06', end_date: '2026-04-10' },
    { id: 2, name: 'Term 2', academic_year_id: 1, start_date: '2026-05-04', end_date: '2026-08-14' },
    { id: 3, name: 'Term 3', academic_year_id: 1, start_date: '2026-09-07', end_date: '2026-12-04' },
  ]);

  // Exams
  await knex('exams').insert([
    { id: 1, name: 'Beginning of Term 1 Exam', term_id: 1, class_id: null, exam_date: '2026-01-20' },
    { id: 2, name: 'Mid-Term 1 Exam', term_id: 1, class_id: null, exam_date: '2026-02-28' },
    { id: 3, name: 'End of Term 1 Exam', term_id: 1, class_id: null, exam_date: '2026-04-01' },
  ]);

  // Fee Structures
  await knex('fee_structures').insert([
    { academic_year_id: 1, term_id: 1, class_id: 3, fee_category: 'Tuition', amount: 350000, is_active: true, created_by: 2 },
    { academic_year_id: 1, term_id: 1, class_id: 3, fee_category: 'Boarding', amount: 250000, is_active: true, created_by: 2 },
    { academic_year_id: 1, term_id: 1, class_id: 3, fee_category: 'Activity Fee', amount: 50000, is_active: true, created_by: 2 },
    { academic_year_id: 1, term_id: 1, class_id: 4, fee_category: 'Tuition', amount: 400000, is_active: true, created_by: 2 },
    { academic_year_id: 1, term_id: 1, class_id: 4, fee_category: 'Boarding', amount: 250000, is_active: true, created_by: 2 },
    { academic_year_id: 1, term_id: 1, class_id: 5, fee_category: 'Tuition', amount: 450000, is_active: true, created_by: 2 },
  ]);

  // Payments
  await knex('payments').insert([
    { student_id: 1, amount: 350000, payment_date: '2026-01-15', method: 'bank_transfer', reference_no: 'BT-001', receipt_no: 'RCP-202601-A1B2C3', recorded_by: 2 },
    { student_id: 2, amount: 200000, payment_date: '2026-01-20', method: 'mobile_money', reference_no: 'MM-001', receipt_no: 'RCP-202601-D4E5F6', recorded_by: 2 },
    { student_id: 3, amount: 400000, payment_date: '2026-01-22', method: 'cash', receipt_no: 'RCP-202601-G7H8I9', recorded_by: 2 },
  ]);

  // Grades
  await knex('grades').insert([
    { student_id: 1, subject_id: 1, exam_id: 1, score: 85, grade_letter: 'A', recorded_by: 3 },
    { student_id: 1, subject_id: 2, exam_id: 1, score: 78, grade_letter: 'B+', recorded_by: 3 },
    { student_id: 1, subject_id: 3, exam_id: 1, score: 92, grade_letter: 'A+', recorded_by: 3 },
    { student_id: 2, subject_id: 1, exam_id: 1, score: 65, grade_letter: 'B', recorded_by: 3 },
    { student_id: 2, subject_id: 2, exam_id: 1, score: 72, grade_letter: 'B+', recorded_by: 3 },
    { student_id: 2, subject_id: 3, exam_id: 1, score: 58, grade_letter: 'C', recorded_by: 3 },
  ]);

  // Reset sequences
  await knex.raw("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))");
  await knex.raw("SELECT setval('classes_id_seq', (SELECT MAX(id) FROM classes))");
  await knex.raw("SELECT setval('streams_id_seq', (SELECT MAX(id) FROM streams))");
  await knex.raw("SELECT setval('students_id_seq', (SELECT MAX(id) FROM students))");
  await knex.raw("SELECT setval('subjects_id_seq', (SELECT MAX(id) FROM subjects))");
  await knex.raw("SELECT setval('academic_years_id_seq', (SELECT MAX(id) FROM academic_years))");
  await knex.raw("SELECT setval('terms_id_seq', (SELECT MAX(id) FROM terms))");
  await knex.raw("SELECT setval('exams_id_seq', (SELECT MAX(id) FROM exams))");
}
