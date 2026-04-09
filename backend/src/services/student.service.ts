import db from '../config/database';
import { PaginatedResponse } from '../types';
import { NotFoundError, ConflictError } from '../utils/errors';
import { logAudit } from '../utils/audit';
import { CreateStudentInput, UpdateStudentInput, StudentQuery } from '../validators/student';

export class StudentService {
  async generateStudentId(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `S-${year}-`;
    
    const lastStudent = await db('students')
      .where('unique_student_id', 'like', `${prefix}%`)
      .orderBy('unique_student_id', 'desc')
      .first();

    let nextNum = 1;
    if (lastStudent) {
      const lastNum = parseInt(lastStudent.unique_student_id.split('-').pop() || '0', 10);
      nextNum = lastNum + 1;
    }

    return `${prefix}${String(nextNum).padStart(3, '0')}`;
  }

  async create(data: CreateStudentInput, userId: number, photoUrl?: string): Promise<Record<string, unknown>> {
    const uniqueStudentId = await this.generateStudentId();

    const [student] = await db('students')
      .insert({
        unique_student_id: uniqueStudentId,
        full_name: data.full_name,
        class_id: data.class_id,
        stream_id: data.stream_id,
        enrollment_date: data.enrollment_date,
        photo_url: photoUrl || null,
        status: 'active',
        created_by: userId,
        updated_by: userId,
      })
      .returning('*');

    await logAudit({
      user_id: userId,
      action: 'CREATE_STUDENT',
      entity_type: 'student',
      entity_id: student.id,
      metadata: { unique_student_id: uniqueStudentId },
    });

    return student;
  }

  async findAll(query: StudentQuery): Promise<PaginatedResponse<Record<string, unknown>>> {
    const baseQuery = db('students as s')
      .select(
        's.*',
        'c.name as class_name',
        'st.name as stream_name',
        'u.full_name as created_by_name'
      )
      .leftJoin('classes as c', 's.class_id', 'c.id')
      .leftJoin('streams as st', 's.stream_id', 'st.id')
      .leftJoin('users as u', 's.created_by', 'u.id');

    if (query.class_id) baseQuery.where('s.class_id', query.class_id);
    if (query.stream_id) baseQuery.where('s.stream_id', query.stream_id);
    if (query.status) baseQuery.where('s.status', query.status);
    if (query.search) {
      baseQuery.where(function() {
        this.whereILike('s.full_name', `%${query.search}%`)
          .orWhereILike('s.unique_student_id', `%${query.search}%`);
      });
    }

    const countResult = await baseQuery.clone().clearSelect().clearOrder().count('s.id as total').first();
    const total = parseInt((countResult as any)?.total || '0', 10);

    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    const data = await baseQuery
      .orderBy(`s.${query.sort_by || 'created_at'}`, query.sort_order || 'desc')
      .limit(limit)
      .offset(offset);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number): Promise<Record<string, unknown>> {
    const student = await db('students as s')
      .select(
        's.*',
        'c.name as class_name',
        'st.name as stream_name',
        'creator.full_name as created_by_name',
        'updater.full_name as updated_by_name'
      )
      .leftJoin('classes as c', 's.class_id', 'c.id')
      .leftJoin('streams as st', 's.stream_id', 'st.id')
      .leftJoin('users as creator', 's.created_by', 'creator.id')
      .leftJoin('users as updater', 's.updated_by', 'updater.id')
      .where('s.id', id)
      .first();

    if (!student) throw new NotFoundError('Student');
    return student;
  }

  async update(id: number, data: UpdateStudentInput, userId: number, photoUrl?: string): Promise<Record<string, unknown>> {
    const existing = await db('students').where({ id }).first();
    if (!existing) throw new NotFoundError('Student');

    const updateData: Record<string, unknown> = { ...data, updated_by: userId };
    if (photoUrl) updateData.photo_url = photoUrl;

    const [student] = await db('students')
      .where({ id })
      .update(updateData)
      .returning('*');

    await logAudit({
      user_id: userId,
      action: 'UPDATE_STUDENT',
      entity_type: 'student',
      entity_id: id,
      metadata: { changes: data },
    });

    return student;
  }

  async getDashboardStats(userId: number): Promise<Record<string, unknown>> {
    const totalStudents = await db('students').where('status', 'active').count('id as count').first();
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const newThisMonth = await db('students')
      .where('created_at', '>=', startOfMonth.toISOString())
      .count('id as count')
      .first();

    const recentStudents = await db('students as s')
      .select('s.*', 'c.name as class_name', 'st.name as stream_name')
      .leftJoin('classes as c', 's.class_id', 'c.id')
      .leftJoin('streams as st', 's.stream_id', 'st.id')
      .orderBy('s.created_at', 'desc')
      .limit(5);

    return {
      total_students: parseInt((totalStudents as any)?.count || '0', 10),
      new_this_month: parseInt((newThisMonth as any)?.count || '0', 10),
      recent_students: recentStudents,
    };
  }
}
