import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, BarChart3, FileCheck } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { academicsService } from '../../services/academics.service';
import toast from 'react-hot-toast';

export default function DosDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await academicsService.getDashboard();
        setStats(data);
      } catch (error: any) {
        toast.error('Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, []);

  if (isLoading) return <LoadingSpinner size="lg" className="h-64" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academic Dashboard</h1>
          <p className="text-gray-500 mt-1">Academic performance overview</p>
        </div>
        <Link to="/dos/grades" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
          Enter Grades
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Active Subjects" value={stats?.total_subjects || 0} icon={BookOpen} color="blue" />
        <StatCard title="Recent Exams" value={stats?.recent_exams?.length || 0} icon={FileCheck} color="green" />
        <StatCard title="Analytics" value="View" icon={BarChart3} color="purple" subtitle="Class performance" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Quick Actions">
          <div className="space-y-2">
            <Link to="/dos/subjects" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700">
              <BookOpen size={18} className="text-blue-600" /> Manage Subjects
            </Link>
            <Link to="/dos/config" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700">
              <GraduationCap size={18} className="text-green-600" /> Academic Configuration
            </Link>
            <Link to="/dos/grades" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700">
              <FileCheck size={18} className="text-purple-600" /> Grade Entry
            </Link>
            <Link to="/dos/analytics" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700">
              <BarChart3 size={18} className="text-yellow-600" /> Class Performance
            </Link>
          </div>
        </Card>

        <Card title="Recent Exams">
          {stats?.recent_exams?.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {stats.recent_exams.map((exam: any) => (
                <div key={exam.id} className="py-3">
                  <p className="font-medium text-gray-900">{exam.name}</p>
                  <p className="text-sm text-gray-500">{exam.term_name} · {exam.exam_date || 'No date set'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No exams configured yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
