import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database';
import { env } from '../config/env';
import { AuthUser, Role } from '../types';
import { UnauthorizedError } from '../utils/errors';
import { logAudit } from '../utils/audit';

export class AuthService {
  async login(email: string, password: string): Promise<{ user: AuthUser; accessToken: string }> {
    const user = await db('users')
      .where({ email, is_active: true })
      .first();

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    await db('users').where({ id: user.id }).update({ last_login_at: new Date() });

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role as Role,
      full_name: user.full_name,
    };

    const accessToken = jwt.sign(authUser, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    await logAudit({
      user_id: user.id,
      action: 'LOGIN',
      entity_type: 'user',
      entity_id: user.id,
    });

    return { user: authUser, accessToken };
  }

  async getCurrentUser(userId: number): Promise<AuthUser> {
    const user = await db('users')
      .select('id', 'full_name', 'email', 'role')
      .where({ id: userId, is_active: true })
      .first();

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role as Role,
      full_name: user.full_name,
    };
  }
}
