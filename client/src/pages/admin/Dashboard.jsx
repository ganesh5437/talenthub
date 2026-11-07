import { useState, useEffect, useCallback } from 'react';
import api, { errorMessage } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { AppLayout } from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import { Alert, Button, Card, PageHeader, PageLoader, StatCard } from '../../components/ui';
import { formatStatus } from '../../utils/pipeline';

const COMPANY_ACTIONS = [
  { status: 'APPROVED', label: 'Approve', variant: 'success-soft' },
  { status: 'REJECTED', label: 'Reject', variant: 'danger-soft' },
  { status: 'BLOCKED', label: 'Block', variant: 'secondary' },
];

const AdminDashboard = () => {
  const { user: me } = useAuth();
  const [stats, setStats] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('companies');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [flash, setFlash] = useState({ type: 'info', text: '' });

  const loadAll = useCallback(async () => {
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
      setFlash({ type: 'error', text: errorMessage(err, 'Failed to load dashboard') });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleCompanyStatus = async (company, status) => {
    setBusyId(company.id);
    try {
      await api.patch(`/companies/${company.id}/status`, { status });
      setFlash({ type: 'success', text: `${company.name} is now ${status.toLowerCase()}.` });
      await loadAll();
    } catch (err) {
      setFlash({ type: 'error', text: errorMessage(err, 'Failed to update company') });
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleBlock = async (u) => {
    setBusyId(u.id);
    try {
      const res = await api.patch(`/admin/users/${u.id}/block`);
      setFlash({ type: 'success', text: `${u.name}: ${res.data.message.toLowerCase()}.` });
      await loadAll();
    } catch (err) {
      setFlash({ type: 'error', text: errorMessage(err, 'Failed to update user') });
    } finally {
      setBusyId(null);
    }
  };

  const pending = companies.filter((c) => c.status === 'PENDING').length;

  return (
    <AppLayout>
      <PageHeader title="Platform administration" subtitle="Approve companies, manage users and monitor the platform." />
      <Alert type={flash.type} onClose={() => setFlash({ ...flash, text: '' })}>{flash.text}</Alert>

      {loading ? (
        <PageLoader />
      ) : (
        <>
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            <StatCard label="Users" value={stats?.totalUsers} />
            <StatCard label="Companies" value={stats?.totalCompanies} accent="text-indigo-600" hint={pending ? `${pending} pending approval` : undefined} />
            <StatCard label="Jobs" value={stats?.totalJobs} />
            <StatCard label="Applications" value={stats?.totalApplications} />
            <StatCard label="Hired" value={stats?.totalHired} accent="text-teal-600" />
          </div>

          <div className="mb-4 flex gap-1 border-b border-slate-200">
            {[
              { key: 'companies', label: `Companies${pending ? ` (${pending} pending)` : ''}` },
              { key: 'users', label: 'Users' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
                  tab === t.key ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'companies' && (
            <Card className="divide-y divide-slate-100">
              {companies.length === 0 ? (
                <p className="p-6 text-sm text-slate-500">No companies registered yet.</p>
              ) : (
                companies.map((c) => (
                  <div key={c.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-900">{c.name}</p>
                        <StatusBadge status={c.status} />
                      </div>
                      {c.description && <p className="mt-0.5 text-sm text-slate-500">{c.description}</p>}
                      <p className="mt-1 text-xs text-slate-400">
                        {c.users?.length || 0} member{c.users?.length === 1 ? '' : 's'} · {c._count?.jobs ?? 0} jobs
                        {c.website && (
                          <> · <a href={c.website} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">{c.website}</a></>
                        )}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {COMPANY_ACTIONS.filter((a) => a.status !== c.status).map((a) => (
                        <Button key={a.status} size="sm" variant={a.variant} disabled={busyId === c.id} onClick={() => handleCompanyStatus(c, a.status)}>
                          {a.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </Card>
          )}

          {tab === 'users' && (
            <Card className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Role</th>
                    <th className="px-5 py-3 font-medium">Company</th>
                    <th className="px-5 py-3 font-medium">Joined</th>
                    <th className="px-5 py-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-900">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{formatStatus(u.role)}</td>
                      <td className="px-5 py-3 text-slate-600">{u.company?.name || '—'}</td>
                      <td className="px-5 py-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3 text-right">
                        {u.role === 'SUPER_ADMIN' || u.id === me?.id ? (
                          <span className="text-xs text-slate-400">—</span>
                        ) : (
                          <Button
                            size="sm"
                            variant={u.isBlocked ? 'success-soft' : 'danger-soft'}
                            disabled={busyId === u.id}
                            onClick={() => handleToggleBlock(u)}
                          >
                            {u.isBlocked ? 'Unblock' : 'Block'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </>
      )}
    </AppLayout>
  );
};

export default AdminDashboard;
