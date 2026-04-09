import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { AuthService } from '../services/auth.service';
import { sendSuccess } from '../utils/response';
import { env } from '../config/env';

const authService = new AuthService();

export class AuthController {
  async login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const { user, accessToken } = await authService.login(email, password);

      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      sendSuccess(res, { user, token: accessToken }, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async logout(_req: AuthRequest, res: Response): Promise<void> {
    res.clearCookie('access_token');
    sendSuccess(res, null, 'Logged out successfully');
  }

  async me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getCurrentUser(req.user!.id);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }
}
