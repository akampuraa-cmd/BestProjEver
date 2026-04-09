import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import db from '../config/database';
import { sendSuccess } from '../utils/response';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const q = (req.query.q as string || '').trim();
    const type = (req.query.type as string) || 'all';
    const limit = Math.min(parseInt(req.query.limit as string || '10', 10), 50);

    if (!q || q.length < 2) {
      return sendSuccess(res, { students: [], staff: [] }, 'Search requires at least 2 characters');
    }

    const searchPattern = `%${q}%`;
    const results: Record<string, unknown[]> = {};

    if (type === 'all' || type === 'student') {
      results.students = await db('students as s')
        .select('s.id', 's.unique_student_id', 's.full_name', 's.photo_url', 's.status', 'c.name as class_name', 'st.name as stream_name')
        .leftJoin('classes as c', 's.class_id', 'c.id')
        .leftJoin('streams as st', 's.stream_id', 'st.id')
        .where(function() {
          this.whereILike('s.full_name', searchPattern)
            .orWhereILike('s.unique_student_id', searchPattern);
        })
        .limit(limit);
    }

    if (type === 'all' || type === 'staff') {
      results.staff = await db('users')
        .select('id', 'full_name', 'email', 'role', 'is_active')
        .where(function() {
          this.whereILike('full_name', searchPattern)
            .orWhereILike('email', searchPattern);
        })
        .limit(limit);
    }

    sendSuccess(res, results);
  } catch (error) {
    next(error);
  }
});

export default router;
