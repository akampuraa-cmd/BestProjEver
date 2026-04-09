import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { studentService } from '../../services/student.service';
import { Student } from '../../types';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Edit, Printer, FileText, DollarSign, GraduationCap, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      studentService.findById(Number(id)).then(setStudent).catch(() => {
        toast.error('Student not found');
        navigate('/secretary/students');
      }).finally(() => setIsLoading(false));
    }
  }, [id, navigate]);

  const handlePrint = () => window.print();

  if (isLoading) return <LoadingSpinner size="lg" className="h-64" />;
  if (!student) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
        <div className="flex gap-2">
          <Link to={`/secretary/students/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
            <Edit size={16} /> Edit
          </Link>
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
            <Printer size={16} /> Print
          </button>
        </div>
      </div>

      <Card>
        <div className="flex items-start gap-6" id="profile-card">
          <div className="flex-shrink-0">
            {student.photo_url ? (
              <img src={student.photo_url} alt={student.full_name} className="w-32 h-32 rounded-xl object-cover" />
            ) : (
              <div className="w-32 h-32 rounded-xl bg-gray-100 flex items-center justify-center">
                <User size={48} className="text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{student.full_name}</h2>
              <p className="text-blue-600 font-mono">{student.unique_student_id}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Class:</span>
                <span className="ml-2 font-medium">{student.class_name}</span>
              </div>
              <div>
                <span className="text-gray-500">Stream:</span>
                <span className="ml-2 font-medium">{student.stream_name}</span>
              </div>
              <div>
                <span className="text-gray-500">Enrollment Date:</span>
                <span className="ml-2 font-medium">{new Date(student.enrollment_date).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                  student.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {student.status}
                </span>
              </div>
              {student.created_by_name && (
                <div>
                  <span className="text-gray-500">Registered By:</span>
                  <span className="ml-2 font-medium">{student.created_by_name}</span>
                </div>
              )}
              <div>
                <span className="text-gray-500">Created:</span>
                <span className="ml-2 font-medium">{new Date(student.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to={`/bursar/student/${id}`} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
          <div className="p-2 bg-green-50 rounded-lg"><DollarSign size={20} className="text-green-600" /></div>
          <div>
            <p className="font-medium text-gray-900">Finance Profile</p>
            <p className="text-sm text-gray-500">View fees and payments</p>
          </div>
        </Link>
        <Link to={`/dos/student/${id}/report`} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
          <div className="p-2 bg-purple-50 rounded-lg"><GraduationCap size={20} className="text-purple-600" /></div>
          <div>
            <p className="font-medium text-gray-900">Academic Report</p>
            <p className="text-sm text-gray-500">View grades and report card</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
