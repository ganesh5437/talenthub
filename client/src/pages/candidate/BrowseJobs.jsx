import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../../api/axios';
import { AppLayout } from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import { Alert, Button, Card, EmptyState, PageHeader, PageLoader, inputClass } from '../../components/ui';
import { formatSalary, formatStatus, timeAgo } from '../../utils/pipeline';

const BrowseJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [applied, setApplied] = useState({}); // jobId -> application status
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [flash, setFlash] = useState({ type: 'info', text: '' });

  const fetchJobs = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const [jobsRes, appsRes] = await Promise.all([
        api.get('/jobs', { params }),
        api.get('/applications/my'),
      ]);
      setJobs(jobsRes.data);
      setApplied(Object.fromEntries(appsRes.data.map((a) => [a.jobId, a.status])));
    } catch (err) {
      setFlash({ type: 'error', text: errorMessage(err, 'Failed to load jobs') });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs({ search: search.trim() || undefined, type: type || undefined });
  };

  const applyToJob = async (job) => {
    setApplying(job.id);
    try {
      await api.post('/applications', { jobId: job.id });
      setApplied((a) => ({ ...a, [job.id]: 'APPLIED' }));
      setFlash({ type: 'success', text: `Applied to "${job.title}". Track it in My Applications.` });
    } catch (err) {
      setFlash({ type: 'error', text: errorMessage(err, 'Failed to apply') });
    } finally {
      setApplying(null);
    }
  };

  return (
    <AppLayout width="max-w-5xl">
      <PageHeader title="Find your next role" subtitle="Browse open positions from verified companies." />

      <form onSubmit={handleSearch} className="mb-6 flex flex-col gap-2 sm:flex-row">
        <input
          type="search"
          placeholder="Search by title, skill or company…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${inputClass} mt-0 flex-1`}
        />
        <select value={type} onChange={(e) => setType(e.target.value)} className={`${inputClass} mt-0 sm:w-40`} aria-label="Work type">
          <option value="">All types</option>
          <option value="ONSITE">Onsite</option>
          <option value="REMOTE">Remote</option>
          <option value="HYBRID">Hybrid</option>
        </select>
        <Button type="submit">Search</Button>
      </form>

      <Alert type={flash.type} onClose={() => setFlash({ ...flash, text: '' })}>
        {flash.text}
        {flash.type === 'success' && (
          <> <Link to="/candidate/applications" className="font-semibold underline">View</Link></>
        )}
      </Alert>

      {loading ? (
        <PageLoader label="Loading jobs…" />
      ) : jobs.length === 0 ? (
        <EmptyState title="No jobs found" description="Try a different keyword or clear the filters." />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">{jobs.length} open position{jobs.length === 1 ? '' : 's'}</p>
          {jobs.map((job) => {
            const salary = formatSalary(job.salaryMin, job.salaryMax);
            const status = applied[job.id];
            const skills = (job.skillsCsv || '').split(',').map((s) => s.trim()).filter(Boolean);
            const isOpen = expanded === job.id;
            return (
              <Card key={job.id} className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-lg font-bold text-indigo-700">
                      {job.company?.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
                      <p className="text-sm text-slate-500">{job.company?.name} · posted {timeAgo(job.createdAt)}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600">{formatStatus(job.type)}</span>
                        {job.experience && <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600">{job.experience}</span>}
                        {salary && <span className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">{salary}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {status ? (
                      <StatusBadge status={status} />
                    ) : (
                      <Button loading={applying === job.id} onClick={() => applyToJob(job)}>
                        Apply now
                      </Button>
                    )}
                  </div>
                </div>

                <p className={`mt-4 whitespace-pre-line text-sm text-slate-600 ${isOpen ? '' : 'line-clamp-2'}`}>{job.description}</p>
                {isOpen && skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {skills.map((s) => (
                      <span key={s} className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">{s}</span>
                    ))}
                  </div>
                )}
                <button onClick={() => setExpanded(isOpen ? null : job.id)} className="mt-2 text-sm font-medium text-indigo-600 hover:underline">
                  {isOpen ? 'Show less' : 'Show details'}
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
};

export default BrowseJobs;
