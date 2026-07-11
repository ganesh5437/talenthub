import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import RegisterCompany from './RegisterCompany';

const navLinks = [
  { path: '/company/dashboard', label: 'Dashboard' },
  { path: '/recruiter/dashboard', label: 'Jobs' },
  { path: '/recruiter/post-job', label: 'Post Job' },
];

const CompanyDashboard = () => {
  const [company, setCompany] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasCompany, setHasCompany] = useState(true);

  useEffect(() => {
    checkCompany();
  }, []);

  const checkCompany = async () => {
    try {
      const me = await api.get('/auth/me');
      if (!me.data.companyId) {
        setHasCompany(false);
        setLoading(false);
        return;
      }
      const [companyRes, statsRes] = await Promise.all([
        api.get(`/companies/${me.data.companyId}`),
        api.get('/admin/stats/company'),
      ]);
      setCompany(companyRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  if (!hasCompany) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar links={navLinks} />
        <RegisterCompany onRegistered={checkCompany} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar links={navLinks} />
      <div className="max-w-5xl mx-auto py-10 px-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-slate-800">{company?.name}</h1>
          <StatusBadge status={company?.status} />
        </div>
        <p className="text-slate-500 mb-6">{company?.description}</p>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-slate-500">Total Jobs</p>
            <p className="text-2xl font-bold text-slate-800">{stats?.totalJobs ?? 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-slate-500">Active Jobs</p>
            <p className="text-2xl font-bold text-green-600">{stats?.activeJobs ?? 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-slate-500">Applications</p>
            <p className="text-2xl font-bold text-indigo-600">{stats?.totalApplications ?? 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-slate-500">Hired</p>
            <p className="text-2xl font-bold text-teal-600">{stats?.hired ?? 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-slate-800 mb-3">Company Jobs</h2>
          {company?.jobs?.length === 0 ? (
            <p className="text-slate-500 text-sm">No jobs posted yet.</p>
          ) : (
            <div className="space-y-3">
              {company?.jobs?.map((job) => (
                <div key={job.id} className="flex justify-between items-center border-b border-slate-100 pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-slate-800">{job.title}</p>
                    <p className="text-xs text-slate-500">{job.type}</p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;