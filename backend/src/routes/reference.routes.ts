import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { ClassService, StreamService } from '../services/class.service';
import { sendSuccess } from '../utils/response';

const router = Router();
const classService = new ClassService();
const streamService = new StreamService();

router.use(authenticate);

router.get('/classes', async (_req, res, next) => {
  try {
    const classes = await classService.findAll();
    sendSuccess(res, classes);
  } catch (error) {
    next(error);
  }
});

router.get('/streams', async (_req, res, next) => {
  try {
    const streams = await streamService.findAll();
    sendSuccess(res, streams);
  } catch (error) {
    next(error);
  }
});

export default router;
