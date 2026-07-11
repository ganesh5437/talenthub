import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';

const navLinks = [
  { path: '/recruiter/dashboard', label: 'My Jobs' },
  { path: '/recruiter/post-job', label: 'Post Job' },
];

const PostJob = () => {
  const [form, setForm] = useState({
    title: '', description: '', skillsCsv: '', salaryMin: '', salaryMax: '',
    experience: '', type: 'ONSITE', status: 'DRAFT',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const payload = {
        ...form,
        salaryMin: form.salaryMin ? parseInt(form.salaryMin) : null,
        salaryMax: form.salaryMax ? parseInt(form.salaryMax) : null,
      };
      await api.post('/jobs', payload);
      setSuccess('Job posted successfully!');
      setTimeout(() => navigate('/recruiter/dashboard'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar links={navLinks} />
      <div className="max-w-2xl mx-auto py-10 px-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Post a New Job</h1>
        <div className="bg-white rounded-xl shadow-sm p-6">
          {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>}
          {success && <p className="bg-green-100 text-green-700 p-2 rounded mb-4 text-sm">{success}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Job Title</label>
              <input
                type="text" name="title" required value={form.title} onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Frontend Developer"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea
                name="description" required value={form.description} onChange={handleChange} rows={4}
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Job responsibilities, requirements..."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Skills (comma separated)</label>
              <input
                type="text" name="skillsCsv" value={form.skillsCsv} onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="React, Node.js, SQL"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Min Salary</label>
                <input
                  type="number" name="salaryMin" value={form.salaryMin} onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Max Salary</label>
                <input
                  type="number" name="salaryMax" value={form.salaryMax} onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Experience</label>
              <input
                type="text" name="experience" value={form.experience} onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. 2-4 years"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Work Type</label>
                <select
                  name="type" value={form.type} onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ONSITE">Onsite</option>
                  <option value="REMOTE">Remote</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Status</label>
                <select
                  name="status" value={form.status} onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="DRAFT">Save as Draft</option>
                  <option value="PUBLISHED">Publish Now</option>
                </select>
              </div>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Posting...' : 'Post Job'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostJob;