import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { AppLayout } from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import { Alert, Button, Card, Field, PageHeader, PageLoader, StatCard, inputClass } from '../../components/ui';
import { formatStatus } from '../../utils/pipeline';
import RegisterCompany from './RegisterCompany';

const STATUS_HELP = {
  PENDING: { type: 'warning', text: 'Your company is waiting for approval by the platform admin. You can post jobs once it is approved.' },
  REJECTED: { type: 'error', text: 'Your company registration was rejected by the platform admin.' },
  BLOCKED: { type: 'error', text: 'Your company has been blocked. Its jobs are hidden from candidates.' },
};

const AddRecruiterForm = ({ onAdded }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState({ type: 'info', text: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/companies/me/recruiters', form);
      setFlash({ type: 'success', text: `${res.data.message}: ${res.data.recruiter.email}` });
      setForm({ name: '', email: '', password: '' });
      onAdded();
    } catch (err) {
      setFlash({ type: 'error', text: errorMessage(err, 'Failed to add recruiter') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert type={flash.type} onClose={() => setFlash({ ...flash, text: '' })}>{flash.text}</Alert>
      <Field label="Full name">
        <input name="name" value={form.name} onChange={handleChange} className={inputClass} placeholder="Recruiter name" />
      </Field>
      <Field label="Email">
        <input type="email" name="email" required value={form.email} onChange={handleChange} className={inputClass} placeholder="recruiter@company.com" />
      </Field>
      <Field label="Temporary password" hint="Share it with the recruiter. Leave name & password empty to link an existing recruiter account.">
        <input type="text" name="password" value={form.password} onChange={handleChange} className={inputClass} placeholder="min. 6 characters" />
      </Field>
      <Button type="submit" loading={saving} className="w-full">Add recruiter</Button>
    </form>
  );
};

const CompanyDashboard = () => {
  const { refreshUser } = useAuth();
  const [company, setCompany] = useState(null);
  const [stats, setStats] = useState(null);
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasCompany, setHasCompany] = useState(true);
  const [error, setError] = useState('');

  const loadRecruiters = useCallback(async () => {
    const res = await api.get('/companies/me/recruiters');
    setRecruiters(res.data);
  }, []);

  const load = useCallback(async () => {
    try {
      const me = await refreshUser();
      if (!me.companyId) {
        setHasCompany(false);
        return;
      }
      setHasCompany(true);
      const [companyRes, statsRes] = await Promise.all([
        api.get(`/companies/${me.companyId}`),
        api.get('/admin/stats/company'),
        loadRecruiters(),
      ]);
      setCompany(companyRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError(errorMessage(err, 'Failed to load company'));
    } finally {
      setLoading(false);
    }
  }, [refreshUser, loadRecruiters]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <AppLayout>
        <PageLoader />
      </AppLayout>
    );
  }

  if (!hasCompany) {
    return (
      <AppLayout width="max-w-xl">
        <RegisterCompany onRegistered={load} />
      </AppLayout>
    );
  }

  const help = STATUS_HELP[company?.status];

  return (
    <AppLayout>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            {company?.name} <StatusBadge status={company?.status} />
          </span>
        }
        subtitle={company?.description || 'Company dashboard'}
        actions={
          company?.status === 'APPROVED' && (
            <Link to="/recruiter/post-job" className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
              + Post new job
            </Link>
          )
        }
      />
      <Alert type="error">{error}</Alert>
      {help && <Alert type={help.type}>{help.text}</Alert>}

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total jobs" value={stats?.totalJobs} />
        <StatCard label="Active jobs" value={stats?.activeJobs} accent="text-emerald-600" />
        <StatCard label="Applications" value={stats?.totalApplications} accent="text-indigo-600" />
        <StatCard label="Hired" value={stats?.hired} accent="text-teal-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Company jobs</h2>
            <Link to="/recruiter/dashboard" className="text-sm font-medium text-indigo-600 hover:underline">Manage →</Link>
          </div>
          {!company?.jobs?.length ? (
            <p className="text-sm text-slate-500">No jobs posted yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {company.jobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link to={`/recruiter/jobs/${job.id}/applicants`} className="font-medium text-slate-800 hover:text-indigo-600">
                      {job.title}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {formatStatus(job.type)} · {job._count?.applications ?? 0} applicants
                    </p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-4 font-semibold text-slate-900">Recruiters ({recruiters.length})</h2>
            {recruiters.length === 0 ? (
              <p className="text-sm text-slate-500">No recruiters yet. Add one below so they can post jobs for your company.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recruiters.map((r) => (
                  <li key={r.id} className="py-2.5">
                    <p className="text-sm font-medium text-slate-800">{r.name}</p>
                    <p className="text-xs text-slate-500">
                      {r.email} · {r._count?.createdJobs ?? 0} jobs {r.isBlocked && '· blocked'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card className="p-6">
            <h2 className="mb-4 font-semibold text-slate-900">Add a recruiter</h2>
            <AddRecruiterForm onAdded={loadRecruiters} />
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default CompanyDashboard;
