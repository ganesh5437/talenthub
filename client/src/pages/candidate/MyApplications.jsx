import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../../api/axios';
import { AppLayout } from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import PipelineProgress from '../../components/PipelineProgress';
import { Alert, Card, EmptyState, PageHeader, PageLoader, StatCard } from '../../components/ui';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/applications/my')
      .then((res) => setApplications(res.data))
      .catch((err) => setError(errorMessage(err, 'Failed to load applications')))
      .finally(() => setLoading(false));
  }, []);

  const active = applications.filter((a) => !['HIRED', 'REJECTED'].includes(a.status)).length;
  const interviews = applications.reduce(
    (n, a) => n + (a.interviews?.filter((iv) => new Date(iv.scheduledAt) > new Date()).length || 0),
    0
  );

  return (
    <AppLayout width="max-w-5xl">
      <PageHeader title="My applications" subtitle="Track where you are in every hiring process." />
      <Alert type="error">{error}</Alert>

      {loading ? (
        <PageLoader />
      ) : applications.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Find a job you like and apply in one click."
          action={<Link to="/candidate/dashboard" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Browse jobs</Link>}
        />
      ) : (
        <>
          <div className="mb-8 grid grid-cols-3 gap-4">
            <StatCard label="Applied" value={applications.length} />
            <StatCard label="In progress" value={active} accent="text-indigo-600" />
            <StatCard label="Upcoming interviews" value={interviews} accent="text-teal-600" />
          </div>
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id} className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{app.job?.title}</h3>
                    <p className="text-sm text-slate-500">{app.job?.company?.name}</p>
                    <p className="mt-1 text-xs text-slate-400">Applied on {new Date(app.createdAt).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
                <PipelineProgress status={app.status} />
                {app.status === 'REJECTED' && (
                  <p className="mt-3 text-sm text-slate-500">Thank you for applying. The company decided not to move forward this time.</p>
                )}
                {app.status === 'HIRED' && (
                  <p className="mt-3 text-sm font-medium text-emerald-700">🎉 Congratulations — you've been hired!</p>
                )}
                {app.interviews?.length > 0 && (
                  <div className="mt-4 rounded-xl bg-slate-50 p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Interviews</p>
                    {app.interviews.map((iv) => (
                      <div key={iv.id} className="flex items-center justify-between py-1 text-sm">
                        <span className="text-slate-700">Round {iv.round} · {new Date(iv.scheduledAt).toLocaleString()}</span>
                        <StatusBadge status={iv.result} />
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </>
      )}
    </AppLayout>
  );
};

export default MyApplications;
