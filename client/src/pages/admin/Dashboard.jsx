import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';

const navLinks = [
  { path: '/admin/dashboard', label: 'Dashboard' },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('companies');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [statsRes, companiesRes, usersRes] = await Promise.all([
        api.get('/admin/stats/platform'),
        api.get('/companies'),
        api.get('/admin/users'),
      ]);
      setStats(statsRes.data);
      setCompanies(companiesRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyStatus = async (id, status) => {
    try {
      await api.patch(`/companies/${id}/status`, { status });
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update company');
    }
  };

  const handleToggleBlock = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/block`);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar links={navLinks} />
        <p className="text-center py-10 text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar links={navLinks} />
      <div className="max-w-6xl mx-auto py-10 px-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">SuperAdmin Dashboard</h1>

        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-slate-500">Total Users</p>
            <p className="text-2xl font-bold text-slate-800">{stats?.totalUsers ?? 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-slate-500">Companies</p>
            <p className="text-2xl font-bold text-indigo-600">{stats?.totalCompanies ?? 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-slate-500">Total Jobs</p>
            <p className="text-2xl font-bold text-slate-800">{stats?.totalJobs ?? 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-slate-500">Applications</p>
            <p className="text-2xl font-bold text-slate-800">{stats?.totalApplications ?? 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-slate-500">Hired</p>
            <p className="text-2xl font-bold text-teal-600">{stats?.totalHired ?? 0}</p>
          </div>
        </div>

        <div className="flex gap-4 mb-4 border-b border-slate-200">
          <button
            onClick={() => setTab('companies')}
            className={`pb-2 px-1 font-medium ${tab === 'companies' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}
          >
            Companies
          </button>
          <button
            onClick={() => setTab('users')}
            className={`pb-2 px-1 font-medium ${tab === 'users' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}
          >
            Users
          </button>
        </div>

        {tab === 'companies' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-slate-800 mb-4">All Companies</h2>
            {companies.length === 0 ? (
              <p className="text-slate-500 text-sm">No companies registered yet.</p>
            ) : (
              <div className="space-y-3">
                {companies.map((c) => (
                  <div key={c.id} className="flex justify-between items-center border-b border-slate-100 pb-3 last:border-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-800">{c.name}</p>
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="text-xs text-slate-500">{c.description}</p>
                    </div>
                    <div className="flex gap-2">
                      {c.status !== 'APPROVED' && (
                        <button
                          onClick={() => handleCompanyStatus(c.id, 'APPROVED')}
                          className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-200"
                        >
                          Approve
                        </button>
                      )}
                      {c.status !== 'REJECTED' && (
                        <button
                          onClick={() => handleCompanyStatus(c.id, 'REJECTED')}
                          className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-200"
                        >
                          Reject
                        </button>
                      )}
                      {c.status !== 'BLOCKED' && (
                        <button
                          onClick={() => handleCompanyStatus(c.id, 'BLOCKED')}
                          className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-200"
                        >
                          Block
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-slate-800 mb-4">All Users</h2>
            {users.length === 0 ? (
              <p className="text-slate-500 text-sm">No users found.</p>
            ) : (
              <div className="space-y-3">
                {users.map((u) => (
                  <div key={u.id} className="flex justify-between items-center border-b border-slate-100 pb-3 last:border-0">
                    <div>
                      <p className="font-medium text-slate-800">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.email} • {u.role}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {u.isBlocked && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Blocked</span>
                      )}
                      <button
                        onClick={() => handleToggleBlock(u.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                          u.isBlocked
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {u.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;