import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { studentService } from '../../services/student.service';
import { referenceService } from '../../services/reference.service';
import { ClassItem, Stream } from '../../types';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function StudentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    full_name: '',
    class_id: '',
    stream_id: '',
    enrollment_date: new Date().toISOString().split('T')[0],
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditing);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([referenceService.getClasses(), referenceService.getStreams()])
      .then(([c, s]) => { setClasses(c); setStreams(s); });
  }, []);

  useEffect(() => {
    if (isEditing && id) {
      studentService.findById(Number(id)).then((student) => {
        setFormData({
          full_name: student.full_name,
          class_id: String(student.class_id),
          stream_id: String(student.stream_id),
          enrollment_date: student.enrollment_date,
        });
        if (student.photo_url) setPhotoPreview(student.photo_url);
        setIsFetching(false);
      }).catch(() => {
        toast.error('Student not found');
        navigate('/secretary/students');
      });
    }
  }, [id, isEditing, navigate]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.full_name.trim()) errs.full_name = 'Full name is required';
    else if (formData.full_name.trim().length < 2) errs.full_name = 'Name must be at least 2 characters';
    if (!formData.class_id) errs.class_id = 'Class is required';
    if (!formData.stream_id) errs.stream_id = 'Stream is required';
    if (!formData.enrollment_date) errs.enrollment_date = 'Enrollment date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.append('full_name', formData.full_name.trim());
      fd.append('class_id', formData.class_id);
      fd.append('stream_id', formData.stream_id);
      fd.append('enrollment_date', formData.enrollment_date);
      if (photo) fd.append('photo', photo);

      if (isEditing) {
        await studentService.update(Number(id), fd);
        toast.success('Student updated successfully');
      } else {
        const student = await studentService.create(fd);
        toast.success('Student created successfully');
        navigate(`/secretary/students/${student.id}`);
        return;
      }
      navigate(`/secretary/students/${id}`);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to save student';
      toast.error(msg);
      if (error.response?.data?.errors) {
        setErrors(Object.fromEntries(
          Object.entries(error.response.data.errors).map(([k, v]) => [k, (v as string[])[0]])
        ));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error('Only JPEG, PNG, WebP images are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  if (isFetching) return <LoadingSpinner size="lg" className="h-64" />;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditing ? 'Edit Student' : 'Register New Student'}
      </h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-lg border ${errors.full_name ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Enter student full name"
            />
            {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
              <select
                value={formData.class_id}
                onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-lg border ${errors.class_id ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select Class</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.class_id && <p className="text-red-500 text-xs mt-1">{errors.class_id}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stream *</label>
              <select
                value={formData.stream_id}
                onChange={(e) => setFormData({ ...formData, stream_id: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-lg border ${errors.stream_id ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select Stream</option>
                {streams.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {errors.stream_id && <p className="text-red-500 text-xs mt-1">{errors.stream_id}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Date *</label>
            <input
              type="date"
              value={formData.enrollment_date}
              onChange={(e) => setFormData({ ...formData, enrollment_date: e.target.value })}
              className={`w-full px-4 py-2.5 rounded-lg border ${errors.enrollment_date ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`}
            />
            {errors.enrollment_date && <p className="text-red-500 text-xs mt-1">{errors.enrollment_date}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student Photo</label>
            <div className="flex items-center gap-4">
              {photoPreview && (
                <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded-lg object-cover border" />
              )}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} className="text-sm" />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
              {isLoading ? 'Saving...' : isEditing ? 'Update Student' : 'Register Student'}
            </button>
            <button type="button" onClick={() => navigate(-1)}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
