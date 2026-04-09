import db from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { PaginatedResponse } from '../types';
import { NotFoundError, ConflictError } from '../utils/errors';
import { logAudit } from '../utils/audit';
import {
  CreateFeeStructureInput,
  UpdateFeeStructureInput,
  RecordPaymentInput,
  PaymentQuery,
  FeeQuery,
} from '../validators/finance';

export class FinanceService {
  // Fee Structure Methods
  async createFeeStructure(data: CreateFeeStructureInput, userId: number): Promise<Record<string, unknown>> {
    const existing = await db('fee_structures')
      .where({
        academic_year_id: data.academic_year_id,
        term_id: data.term_id,
        class_id: data.class_id,
        fee_category: data.fee_category,
      })
      .first();

    if (existing) {
      throw new ConflictError('Fee structure already exists for this combination');
    }

    const [fee] = await db('fee_structures')
      .insert({ ...data, created_by: userId })
      .returning('*');

    await logAudit({
      user_id: userId,
      action: 'CREATE_FEE_STRUCTURE',
      entity_type: 'fee_structure',
      entity_id: fee.id,
      metadata: data,
    });

    return fee;
  }

  async findAllFees(query: FeeQuery): Promise<PaginatedResponse<Record<string, unknown>>> {
    const baseQuery = db('fee_structures as f')
      .select(
        'f.*',
        'ay.name as academic_year_name',
        't.name as term_name',
        'c.name as class_name'
      )
      .leftJoin('academic_years as ay', 'f.academic_year_id', 'ay.id')
      .leftJoin('terms as t', 'f.term_id', 't.id')
      .leftJoin('classes as c', 'f.class_id', 'c.id');

    if (query.academic_year_id) baseQuery.where('f.academic_year_id', query.academic_year_id);
    if (query.term_id) baseQuery.where('f.term_id', query.term_id);
    if (query.class_id) baseQuery.where('f.class_id', query.class_id);
    if (query.is_active !== undefined) baseQuery.where('f.is_active', query.is_active);

    const countResult = await baseQuery.clone().clearSelect().clearOrder().count('f.id as total').first();
    const total = parseInt((countResult as any)?.total || '0', 10);
    const page = query.page || 1;
    const limit = query.limit || 20;

    const data = await baseQuery
      .orderBy('f.created_at', 'desc')
      .limit(limit)
      .offset((page - 1) * limit);

    return {
      data,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    };
  }

  async updateFeeStructure(id: number, data: UpdateFeeStructureInput, userId: number): Promise<Record<string, unknown>> {
    const existing = await db('fee_structures').where({ id }).first();
    if (!existing) throw new NotFoundError('Fee structure');

    const [fee] = await db('fee_structures').where({ id }).update(data).returning('*');

    await logAudit({
      user_id: userId,
      action: 'UPDATE_FEE_STRUCTURE',
      entity_type: 'fee_structure',
      entity_id: id,
      metadata: data,
    });

    return fee;
  }

  // Payment Methods
  async generateReceiptNo(): Promise<string> {
    const date = new Date();
    const prefix = `RCP-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const randomPart = uuidv4().slice(0, 6).toUpperCase();
    return `${prefix}-${randomPart}`;
  }

  async recordPayment(data: RecordPaymentInput, userId: number): Promise<Record<string, unknown>> {
    const student = await db('students').where({ id: data.student_id }).first();
    if (!student) throw new NotFoundError('Student');

    const receiptNo = await this.generateReceiptNo();

    const [payment] = await db('payments')
      .insert({
        student_id: data.student_id,
        amount: data.amount,
        payment_date: data.payment_date,
        method: data.method,
        reference_no: data.reference_no || null,
        receipt_no: receiptNo,
        notes: data.notes || null,
        recorded_by: userId,
      })
      .returning('*');

    await logAudit({
      user_id: userId,
      action: 'RECORD_PAYMENT',
      entity_type: 'payment',
      entity_id: payment.id,
      metadata: { student_id: data.student_id, amount: data.amount, receipt_no: receiptNo },
    });

    return payment;
  }

  async findAllPayments(query: PaymentQuery): Promise<PaginatedResponse<Record<string, unknown>>> {
    const baseQuery = db('payments as p')
      .select(
        'p.*',
        's.full_name as student_name',
        's.unique_student_id',
        'u.full_name as recorded_by_name'
      )
      .leftJoin('students as s', 'p.student_id', 's.id')
      .leftJoin('users as u', 'p.recorded_by', 'u.id');

    if (query.student_id) baseQuery.where('p.student_id', query.student_id);
    if (query.method) baseQuery.where('p.method', query.method);
    if (query.date_from) baseQuery.where('p.payment_date', '>=', query.date_from);
    if (query.date_to) baseQuery.where('p.payment_date', '<=', query.date_to);

    const countResult = await baseQuery.clone().clearSelect().clearOrder().count('p.id as total').first();
    const total = parseInt((countResult as any)?.total || '0', 10);
    const page = query.page || 1;
    const limit = query.limit || 20;

    const data = await baseQuery
      .orderBy(`p.${query.sort_by || 'created_at'}`, query.sort_order || 'desc')
      .limit(limit)
      .offset((page - 1) * limit);

    return {
      data,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    };
  }

  async getStudentFinanceProfile(studentId: number): Promise<Record<string, unknown>> {
    const student = await db('students as s')
      .select('s.id', 's.unique_student_id', 's.full_name', 's.class_id', 'c.name as class_name', 'st.name as stream_name')
      .leftJoin('classes as c', 's.class_id', 'c.id')
      .leftJoin('streams as st', 's.stream_id', 'st.id')
      .where('s.id', studentId)
      .first();

    if (!student) throw new NotFoundError('Student');

    // Get current academic year
    const currentYear = await db('academic_years').where({ is_current: true }).first();

    let expectedFees = 0;
    if (currentYear) {
      const fees = await db('fee_structures')
        .where({ class_id: student.class_id, academic_year_id: currentYear.id, is_active: true })
        .sum('amount as total')
        .first();
      expectedFees = parseFloat((fees as any)?.total || '0');
    }

    const payments = await db('payments')
      .where({ student_id: studentId })
      .orderBy('payment_date', 'desc');

    const totalPaid = payments.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);

    return {
      student,
      expected_fees: expectedFees,
      total_paid: totalPaid,
      outstanding_balance: expectedFees - totalPaid,
      payments,
    };
  }

  async getReceiptByNo(receiptNo: string): Promise<Record<string, unknown>> {
    const payment = await db('payments as p')
      .select(
        'p.*',
        's.full_name as student_name',
        's.unique_student_id',
        'c.name as class_name',
        'u.full_name as recorded_by_name'
      )
      .leftJoin('students as s', 'p.student_id', 's.id')
      .leftJoin('classes as c', 's.class_id', 'c.id')
      .leftJoin('users as u', 'p.recorded_by', 'u.id')
      .where('p.receipt_no', receiptNo)
      .first();

    if (!payment) throw new NotFoundError('Receipt');
    return payment;
  }

  async getDashboardStats(): Promise<Record<string, unknown>> {
    const currentYear = await db('academic_years').where({ is_current: true }).first();

    let totalExpected = 0;
    if (currentYear) {
      const activeStudentIds = await db('students').where('status', 'active').select('id', 'class_id');
      
      for (const student of activeStudentIds) {
        const fees = await db('fee_structures')
          .where({ class_id: student.class_id, academic_year_id: currentYear.id, is_active: true })
          .sum('amount as total')
          .first();
        totalExpected += parseFloat((fees as any)?.total || '0');
      }
    }

    const totalCollected = await db('payments').sum('amount as total').first();
    const collectedAmount = parseFloat((totalCollected as any)?.total || '0');

    const today = new Date().toISOString().split('T')[0];
    const todayPayments = await db('payments')
      .where('payment_date', today)
      .sum('amount as total')
      .first();

    const recentPayments = await db('payments as p')
      .select('p.*', 's.full_name as student_name', 's.unique_student_id')
      .leftJoin('students as s', 'p.student_id', 's.id')
      .orderBy('p.created_at', 'desc')
      .limit(10);

    return {
      total_expected: totalExpected,
      total_collected: collectedAmount,
      outstanding: totalExpected - collectedAmount,
      collected_today: parseFloat((todayPayments as any)?.total || '0'),
      recent_payments: recentPayments,
    };
  }
}
