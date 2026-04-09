import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import toast from 'react-hot-toast';
import { GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    const redirectMap: Record<string, string> = {
      [Role.SECRETARY]: '/secretary',
      [Role.BURSAR]: '/bursar',
      [Role.DOS]: '/dos',
      [Role.ADMIN]: '/secretary',
    };
    navigate(redirectMap[user.role] || '/secretary', { replace: true });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await login(email, password);
      toast.success('Login successful!');
      // Get user from localStorage since login resolved
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const redirectMap: Record<string, string> = {
        [Role.SECRETARY]: '/secretary',
        [Role.BURSAR]: '/bursar',
        [Role.DOS]: '/dos',
        [Role.ADMIN]: '/secretary',
      };
      navigate(redirectMap[storedUser.role] || '/secretary', { replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <GraduationCap size={32} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">School Management System</h1>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center mb-3">Demo Accounts</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button onClick={() => { setEmail('secretary@school.com'); setPassword('password123'); }}
              className="px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 text-gray-600">
              Secretary
            </button>
            <button onClick={() => { setEmail('bursar@school.com'); setPassword('password123'); }}
              className="px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 text-gray-600">
              Bursar
            </button>
            <button onClick={() => { setEmail('dos@school.com'); setPassword('password123'); }}
              className="px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 text-gray-600">
              DOS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
