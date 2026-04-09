import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../../services/search.service';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import SearchInput from '../../components/ui/SearchInput';
import Card from '../../components/ui/Card';
import { User, Users, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SearchPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); return; }
    setIsLoading(true);
    try {
      const data = await searchService.search(q);
      setResults(data);
    } catch {
      toast.error('Search failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getStudentLink = (studentId: number) => {
    if (user?.role === Role.BURSAR) return `/bursar/student/${studentId}`;
    if (user?.role === Role.DOS) return `/dos/student/${studentId}/report`;
    return `/secretary/students/${studentId}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Global Search</h1>
      <SearchInput onSearch={handleSearch} placeholder="Search students or staff..." debounceMs={400} />

      {isLoading && <p className="text-gray-500 text-sm">Searching...</p>}

      {results && (
        <div className="space-y-4">
          {results.students?.length > 0 && (
            <Card title={`Students (${results.students.length})`}>
              <div className="divide-y divide-gray-100">
                {results.students.map((s: any) => (
                  <button key={s.id} onClick={() => navigate(getStudentLink(s.id))}
                    className="flex items-center gap-3 py-3 w-full text-left hover:bg-gray-50 -mx-6 px-6">
                    {s.photo_url ? (
                      <img src={s.photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <User size={18} className="text-blue-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{s.full_name}</p>
                      <p className="text-sm text-gray-500">{s.unique_student_id} · {s.class_name} · {s.stream_name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {results.staff?.length > 0 && (
            <Card title={`Staff (${results.staff.length})`}>
              <div className="divide-y divide-gray-100">
                {results.staff.map((s: any) => (
                  <div key={s.id} className="flex items-center gap-3 py-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Users size={18} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{s.full_name}</p>
                      <p className="text-sm text-gray-500">{s.email} · <span className="capitalize">{s.role}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {(!results.students?.length && !results.staff?.length) && (
            <div className="text-center py-12">
              <Search size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No results found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
