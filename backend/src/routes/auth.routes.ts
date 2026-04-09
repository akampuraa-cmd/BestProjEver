import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { loginSchema } from '../validators/auth';

const router = Router();
const controller = new AuthController();

router.post('/login', validate(loginSchema), controller.login.bind(controller));
router.post('/logout', authenticate, controller.logout.bind(controller));
router.get('/me', authenticate, controller.me.bind(controller));

export default router;
