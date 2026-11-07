import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { AppLayout } from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Alert, Button, Card, EmptyState, PageHeader, PageLoader, StatCard } from '../../components/ui';
import { formatSalary, formatStatus } from '../../utils/pipeline';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [flash, setFlash] = useState({ type: 'info', text: '' });
  const [toDelete, setToDelete] = useState(null);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await api.get('/jobs/my-jobs');
      setJobs(res.data);
    } catch (err) {
      setFlash({ type: 'error', text: errorMessage(err, 'Failed to load jobs') });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const setJobStatus = async (job, status) => {
    setBusyId(job.id);
    try {
      await api.patch(`/jobs/${job.id}`, { status });
      setFlash({ type: 'success', text: `"${job.title}" is now ${formatStatus(status).toLowerCase()}.` });
      await fetchJobs();
    } catch (err) {
      setFlash({ type: 'error', text: errorMessage(err, 'Failed to update job') });
    } finally {
      setBusyId(null);
    }
  };

  const deleteJob = async () => {
    const job = toDelete;
    setBusyId(job.id);
    try {
      await api.delete(`/jobs/${job.id}`);
      setFlash({ type: 'success', text: `"${job.title}" deleted.` });
      await fetchJobs();
    } catch (err) {
      setFlash({ type: 'error', text: errorMessage(err, 'Failed to delete job') });
    } finally {
      setBusyId(null);
      setToDelete(null);
    }
  };

  const totalApplicants = jobs.reduce((n, j) => n + (j.applications?.length || 0), 0);
  const hired = jobs.reduce((n, j) => n + (j.applications?.filter((a) => a.status === 'HIRED').length || 0), 0);
  const isAdmin = user?.role === 'COMPANY_ADMIN';

  return (
    <AppLayout>
      <PageHeader
        title={isAdmin ? 'Company Jobs' : 'My Job Postings'}
        subtitle={isAdmin ? 'Every job posted by your company.' : 'Manage your postings and review applicants.'}
        actions={
          <Link to="/recruiter/post-job" className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
            + Post new job
          </Link>
        }
      />

      <Alert type={flash.type} onClose={() => setFlash({ ...flash, text: '' })}>{flash.text}</Alert>

      {loading ? (
        <PageLoader label="Loading jobs…" />
      ) : (
        <>
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total jobs" value={jobs.length} />
            <StatCard label="Published" value={jobs.filter((j) => j.status === 'PUBLISHED').length} accent="text-emerald-600" />
            <StatCard label="Applicants" value={totalApplicants} accent="text-indigo-600" />
            <StatCard label="Hired" value={hired} accent="text-teal-600" />
          </div>

          {jobs.length === 0 ? (
            <EmptyState
              title="No jobs posted yet"
              description="Create your first job posting to start receiving applications."
              action={<Link to="/recruiter/post-job" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Post a job</Link>}
            />
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => {
                const count = job.applications?.length || 0;
                const active = job.applications?.filter((a) => !['HIRED', 'REJECTED'].includes(a.status)).length || 0;
                const salary = formatSalary(job.salaryMin, job.salaryMax);
                return (
                  <Card key={job.id} className="p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate font-semibold text-slate-900">{job.title}</h3>
                          <StatusBadge status={job.status} />
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatStatus(job.type)} · {job.experience || 'Any experience'}
                          {salary && ` · ${salary}`}
                          {isAdmin && job.recruiter && ` · by ${job.recruiter.name}`}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          <strong>{count}</strong> applicant{count === 1 ? '' : 's'}
                          {count > 0 && <span className="text-slate-400"> · {active} in progress</span>}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/recruiter/jobs/${job.id}/applicants`}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          View applicants
                        </Link>
                        {job.status === 'PUBLISHED' ? (
                          <Button size="sm" variant="secondary" loading={busyId === job.id} onClick={() => setJobStatus(job, 'CLOSED')}>
                            Close
                          </Button>
                        ) : (
                          <Button size="sm" variant="success-soft" loading={busyId === job.id} onClick={() => setJobStatus(job, 'PUBLISHED')}>
                            {job.status === 'CLOSED' ? 'Reopen' : 'Publish'}
                          </Button>
                        )}
                        {count === 0 && (
                          <Button size="sm" variant="danger-soft" disabled={busyId === job.id} onClick={() => setToDelete(job)}>
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this job?"
        message={<>"{toDelete?.title}" will be permanently deleted.</>}
        confirmLabel="Delete"
        variant="danger"
        loading={!!busyId}
        onConfirm={deleteJob}
        onCancel={() => setToDelete(null)}
      />
    </AppLayout>
  );
};

export default RecruiterDashboard;
