import { useState, useEffect } from 'react';
import { financeService } from '../../services/finance.service';
import { referenceService } from '../../services/reference.service';
import { academicsService } from '../../services/academics.service';
import { FeeStructure, ClassItem, AcademicYear, Term } from '../../types';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function FeeSetupPage() {
  const [fees, setFees] = useState<FeeStructure[]>([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1, total: 0 });
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    academic_year_id: '', term_id: '', class_id: '', fee_category: '', amount: '',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [feesData, classesData, yearsData, termsData] = await Promise.all([
        financeService.getFees(),
        referenceService.getClasses(),
        academicsService.getAcademicYears(),
        academicsService.getTerms(),
      ]);
      setFees(feesData.data);
      setPagination(feesData.pagination);
      setClasses(classesData);
      setAcademicYears(yearsData);
      setTerms(termsData);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await financeService.createFee({
        academic_year_id: Number(formData.academic_year_id),
        term_id: Number(formData.term_id),
        class_id: Number(formData.class_id),
        fee_category: formData.fee_category,
        amount: Number(formData.amount),
      });
      toast.success('Fee structure created');
      setShowForm(false);
      setFormData({ academic_year_id: '', term_id: '', class_id: '', fee_category: '', amount: '' });
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create fee');
    }
  };

  const toggleActive = async (fee: FeeStructure) => {
    try {
      await financeService.updateFee(fee.id, { is_active: !fee.is_active });
      toast.success('Fee updated');
      loadData();
    } catch {
      toast.error('Failed to update fee');
    }
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-UG').format(n);
  const feeCategories = ['Tuition', 'Boarding', 'Activity Fee', 'Examination Fee', 'Development Fee'];

  const columns = [
    { key: 'fee_category', label: 'Category' },
    { key: 'class_name', label: 'Class' },
    { key: 'term_name', label: 'Term' },
    { key: 'academic_year_name', label: 'Year' },
    { key: 'amount', label: 'Amount', render: (f: FeeStructure) => <span className="font-mono">{fmt(f.amount)}</span> },
    { key: 'is_active', label: 'Status', render: (f: FeeStructure) => (
      <button onClick={() => toggleActive(f)}
        className={`px-2 py-1 rounded-full text-xs font-medium ${f.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
        {f.is_active ? 'Active' : 'Inactive'}
      </button>
    )},
  ];

  if (isLoading) return <LoadingSpinner size="lg" className="h-64" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Fee Setup</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
          {showForm ? 'Cancel' : '+ Add Fee'}
        </button>
      </div>

      {showForm && (
        <Card title="New Fee Structure">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select required value={formData.academic_year_id} onChange={(e) => setFormData({ ...formData, academic_year_id: e.target.value })}
              className="px-4 py-2.5 rounded-lg border border-gray-300">
              <option value="">Academic Year *</option>
              {academicYears.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
            </select>
            <select required value={formData.term_id} onChange={(e) => setFormData({ ...formData, term_id: e.target.value })}
              className="px-4 py-2.5 rounded-lg border border-gray-300">
              <option value="">Term *</option>
              {terms.filter((t) => !formData.academic_year_id || t.academic_year_id === Number(formData.academic_year_id))
                .map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select required value={formData.class_id} onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
              className="px-4 py-2.5 rounded-lg border border-gray-300">
              <option value="">Class *</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select required value={formData.fee_category} onChange={(e) => setFormData({ ...formData, fee_category: e.target.value })}
              className="px-4 py-2.5 rounded-lg border border-gray-300">
              <option value="">Category *</option>
              {feeCategories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div>
              <input type="number" required min="1" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300" placeholder="Amount *" />
            </div>
            <div className="flex items-end">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium">Save Fee</button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <DataTable columns={columns} data={fees as any} pagination={pagination} />
      </Card>
    </div>
  );
}
