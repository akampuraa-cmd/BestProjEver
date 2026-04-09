import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { upload } from '../middleware/upload';
import { createStudentSchema, updateStudentSchema, studentQuerySchema } from '../validators/student';
import { Role } from '../types';

const router = Router();
const controller = new StudentController();

router.use(authenticate);

router.get('/dashboard', authorize(Role.SECRETARY, Role.ADMIN), controller.dashboard.bind(controller));
router.get('/', validate(studentQuerySchema, 'query'), controller.findAll.bind(controller));
router.post('/', authorize(Role.SECRETARY, Role.ADMIN), upload.single('photo'), validate(createStudentSchema), controller.create.bind(controller));
router.get('/:id', controller.findById.bind(controller));
router.patch('/:id', authorize(Role.SECRETARY, Role.ADMIN), upload.single('photo'), controller.update.bind(controller));

export default router;
