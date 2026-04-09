import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserPlus, TrendingUp, Clock } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { studentService } from '../../services/student.service';
import { Student } from '../../types';
import toast from 'react-hot-toast';

export default function SecretaryDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await studentService.getDashboard();
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
          <h1 className="text-2xl font-bold text-gray-900">Secretary Dashboard</h1>
          <p className="text-gray-500 mt-1">Student admissions overview</p>
        </div>
        <Link to="/secretary/students/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
          + New Student
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Students" value={stats?.total_students || 0} icon={Users} color="blue" />
        <StatCard title="New This Month" value={stats?.new_this_month || 0} icon={UserPlus} color="green" />
        <StatCard title="Active Rate" value={stats?.total_students ? '100%' : '0%'} icon={TrendingUp} color="purple" />
      </div>

      <Card title="Recently Added Students" action={<Link to="/secretary/students" className="text-sm text-blue-600 hover:underline">View All</Link>}>
        {stats?.recent_students?.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {stats.recent_students.map((student: any) => (
              <Link key={student.id} to={`/secretary/students/${student.id}`} className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-6 px-6">
                <div>
                  <p className="font-medium text-gray-900">{student.full_name}</p>
                  <p className="text-sm text-gray-500">{student.unique_student_id} · {student.class_name} · {student.stream_name}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded-full">{student.status}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No students yet.</p>
        )}
      </Card>
    </div>
  );
}
