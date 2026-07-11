import { useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const RegisterCompany = ({ onRegistered }) => {
  const [form, setForm] = useState({ name: '', description: '', website: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/companies', form);
      // Refresh user data to get updated companyId
      const me = await api.get('/auth/me');
      login({ ...user, ...me.data }, localStorage.getItem('token'));
      onRegistered();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register company');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Register Your Company</h1>
      <p className="text-slate-500 mb-6">Set up your company profile to start posting jobs.</p>
      <div className="bg-white rounded-xl shadow-sm p-6">
        {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Company Name</label>
            <input
              type="text" name="name" required value={form.name} onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. TechCorp Solutions"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea
              name="description" value={form.description} onChange={handleChange} rows={3}
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="What does your company do?"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Website</label>
            <input
              type="text" name="website" value={form.website} onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://yourcompany.com"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register Company'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterCompany;