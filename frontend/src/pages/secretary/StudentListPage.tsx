import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { studentService } from '../../services/student.service';
import { referenceService } from '../../services/reference.service';
import { Student, ClassItem, Stream } from '../../types';
import DataTable from '../../components/ui/DataTable';
import SearchInput from '../../components/ui/SearchInput';
import Card from '../../components/ui/Card';
import toast from 'react-hot-toast';

export default function StudentListPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1, total: 0 });
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Record<string, string | number>>({ page: 1, limit: 20 });

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await studentService.findAll(filters);
      setStudents(result.data);
      setPagination(result.pagination);
    } catch (error: any) {
      toast.error('Failed to load students');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  useEffect(() => {
    Promise.all([referenceService.getClasses(), referenceService.getStreams()])
      .then(([c, s]) => { setClasses(c); setStreams(s); });
  }, []);

  const handleSearch = useCallback((search: string) => {
    setFilters((f) => ({ ...f, search, page: 1 }));
  }, []);

  const columns = [
    { key: 'unique_student_id', label: 'Student ID' },
    { key: 'full_name', label: 'Full Name', render: (s: Student) => (
      <div className="flex items-center gap-3">
        {s.photo_url && <img src={s.photo_url} alt="" className="w-8 h-8 rounded-full object-cover" />}
        <span className="font-medium">{s.full_name}</span>
      </div>
    )},
    { key: 'class_name', label: 'Class' },
    { key: 'stream_name', label: 'Stream' },
    { key: 'status', label: 'Status', render: (s: Student) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
        {s.status}
      </span>
    )},
    { key: 'enrollment_date', label: 'Enrolled', render: (s: Student) => new Date(s.enrollment_date).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <Link to="/secretary/students/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
          + New Student
        </Link>
      </div>

      <Card>
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex-1 min-w-[200px]">
            <SearchInput onSearch={handleSearch} placeholder="Search by name or ID..." />
          </div>
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            onChange={(e) => setFilters((f) => ({ ...f, class_id: e.target.value ? Number(e.target.value) : '', page: 1 }))}
          >
            <option value="">All Classes</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            onChange={(e) => setFilters((f) => ({ ...f, stream_id: e.target.value ? Number(e.target.value) : '', page: 1 }))}
          >
            <option value="">All Streams</option>
            {streams.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="graduated">Graduated</option>
            <option value="transferred">Transferred</option>
          </select>
        </div>

        <DataTable
          columns={columns}
          data={students as any}
          pagination={pagination}
          onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
          onRowClick={(student: any) => navigate(`/secretary/students/${student.id}`)}
          isLoading={isLoading}
        />
      </Card>
    </div>
  );
}
