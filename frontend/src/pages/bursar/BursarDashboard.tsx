import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, TrendingUp, AlertTriangle, Receipt } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { financeService } from '../../services/finance.service';
import toast from 'react-hot-toast';

export default function BursarDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await financeService.getDashboard();
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

  const fmt = (n: number) => new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="text-gray-500 mt-1">Fee collection overview</p>
        </div>
        <Link to="/bursar/payments" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
          Record Payment
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Expected" value={fmt(stats?.total_expected || 0)} icon={DollarSign} color="blue" />
        <StatCard title="Total Collected" value={fmt(stats?.total_collected || 0)} icon={TrendingUp} color="green" />
        <StatCard title="Outstanding" value={fmt(stats?.outstanding || 0)} icon={AlertTriangle} color="red" />
        <StatCard title="Collected Today" value={fmt(stats?.collected_today || 0)} icon={Receipt} color="purple" />
      </div>

      <Card title="Recent Payments" action={<Link to="/bursar/payments" className="text-sm text-blue-600 hover:underline">View All</Link>}>
        {stats?.recent_payments?.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {stats.recent_payments.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900">{p.student_name}</p>
                  <p className="text-sm text-gray-500">{p.unique_student_id} · {p.receipt_no}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{fmt(parseFloat(p.amount))}</p>
                  <p className="text-xs text-gray-400 capitalize">{p.method.replace('_', ' ')}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No payments recorded yet.</p>
        )}
      </Card>
    </div>
  );
}
