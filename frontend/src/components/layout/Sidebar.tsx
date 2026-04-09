import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import {
  LayoutDashboard, Users, DollarSign, GraduationCap, Search, LogOut,
  BookOpen, Receipt, BarChart3, FileText, Settings
} from 'lucide-react';
import clsx from 'clsx';

const menuItems = {
  [Role.SECRETARY]: [
    { path: '/secretary', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/secretary/students', label: 'Students', icon: Users },
    { path: '/secretary/students/new', label: 'Add Student', icon: FileText },
    { path: '/search', label: 'Search', icon: Search },
  ],
  [Role.BURSAR]: [
    { path: '/bursar', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/bursar/fees', label: 'Fee Setup', icon: DollarSign },
    { path: '/bursar/payments', label: 'Payments', icon: Receipt },
    { path: '/search', label: 'Search', icon: Search },
  ],
  [Role.DOS]: [
    { path: '/dos', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dos/subjects', label: 'Subjects', icon: BookOpen },
    { path: '/dos/config', label: 'Academic Config', icon: Settings },
    { path: '/dos/grades', label: 'Grade Entry', icon: GraduationCap },
    { path: '/dos/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/search', label: 'Search', icon: Search },
  ],
  [Role.ADMIN]: [
    { path: '/secretary', label: 'Admissions', icon: Users },
    { path: '/bursar', label: 'Finance', icon: DollarSign },
    { path: '/dos', label: 'Academics', icon: GraduationCap },
    { path: '/search', label: 'Search', icon: Search },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const items = menuItems[user.role] || [];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold">School SMS</h1>
        <p className="text-sm text-gray-400 mt-1 capitalize">{user.role} Panel</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path) && item.path.split('/').length > 2 ? false : location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="text-sm text-gray-400 mb-3 px-4">
          <p className="font-medium text-white">{user.full_name}</p>
          <p>{user.email}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white w-full text-sm transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
