import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { errorMessage } from '../../api/axios';
import { AppLayout } from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import PipelineProgress from '../../components/PipelineProgress';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Alert, Button, Card, EmptyState, PageHeader, PageLoader, inputClass } from '../../components/ui';
import { formatStatus } from '../../utils/pipeline';

const FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'ACTIVE', label: 'In progress' },
  { key: 'HIRED', label: 'Hired' },
  { key: 'REJECTED', label: 'Rejected' },
];

const matchesFilter = (app, f) => {
  if (f === 'ALL') return true;
  if (f === 'ACTIVE') return !app.isLocked;
  return app.status === f;
};

const minDateTime = () => {
  const d = new Date(Date.now() + 5 * 60 * 1000);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const ApplicantCard = ({ app, onChangeStatus, onSchedule, onInterviewResult, busy }) => {
  const forward = app.allowedTransitions.filter((s) => s !== 'REJECTED');
  const [nextStatus, setNextStatus] = useState(forward[0] || '');
  const [scheduling, setScheduling] = useState(false);
  const [date, setDate] = useState('');
  const [round, setRound] = useState((app.interviews?.length || 0) + 1);

  const c = app.candidate;
  const skills = (c?.skillsCsv || '').split(/[,\n]/).map((s) => s.trim()).filter(Boolean);

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
            {c?.user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{c?.user?.name}</h3>
            <p className="text-sm text-slate-500">{c?.user?.email}</p>
            <p className="mt-1 text-xs text-slate-400">Applied {new Date(app.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <StatusBadge status={app.status} />
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
        {c?.experience && <p><span className="text-slate-400">Experience:</span> {c.experience}</p>}
        {c?.education && <p><span className="text-slate-400">Education:</span> {c.education}</p>}
      </div>
      {skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skills.map((s) => (
            <span key={s} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{s}</span>
          ))}
        </div>
      )}
      {(c?.resumeUrl || c?.linkedin || c?.portfolio) && (
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          {c.resumeUrl && <a href={c.resumeUrl} target="_blank" rel="noreferrer" className="font-medium text-indigo-600 hover:underline">Resume ↗</a>}
          {c.linkedin && <a href={c.linkedin} target="_blank" rel="noreferrer" className="font-medium text-indigo-600 hover:underline">LinkedIn ↗</a>}
          {c.portfolio && <a href={c.portfolio} target="_blank" rel="noreferrer" className="font-medium text-indigo-600 hover:underline">Portfolio ↗</a>}
        </div>
      )}

      <PipelineProgress status={app.status} />

      {app.interviews?.length > 0 && (
        <div className="mt-4 rounded-xl bg-slate-50 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Interviews</p>
          <div className="space-y-2">
            {app.interviews.map((iv) => (
              <div key={iv.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-slate-700">
                  Round {iv.round} · {new Date(iv.scheduledAt).toLocaleString()}
                </span>
                <div className="flex items-center gap-2">
                  <StatusBadge status={iv.result} />
                  {iv.result === 'PENDING' && !app.isLocked && (
                    <>
                      <Button size="sm" variant="success-soft" disabled={busy} onClick={() => onInterviewResult(iv.id, 'PASSED')}>Pass</Button>
                      <Button size="sm" variant="danger-soft" disabled={busy} onClick={() => onInterviewResult(iv.id, 'FAILED')}>Fail</Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 border-t border-slate-100 pt-4">
        {app.isLocked ? (
          <div
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
              app.status === 'HIRED' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
            }`}
          >
            <span aria-hidden>🔒</span>
            Final decision: <strong>{formatStatus(app.status)}</strong>. This status is locked and cannot be changed.
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {forward.length > 0 && (
              <>
                <select
                  aria-label="Next stage"
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  {forward.map((s) => (
                    <option key={s} value={s}>Move to: {formatStatus(s)}</option>
                  ))}
                </select>
                <Button size="sm" disabled={busy || !nextStatus} onClick={() => onChangeStatus(app, nextStatus)}>
                  Update
                </Button>
              </>
            )}
            {app.canScheduleInterview && !scheduling && (
              <Button size="sm" variant="secondary" onClick={() => setScheduling(true)}>
                📅 Schedule interview
              </Button>
            )}
            <Button size="sm" variant="danger-soft" className="ml-auto" disabled={busy} onClick={() => onChangeStatus(app, 'REJECTED')}>
              Reject
            </Button>
          </div>
        )}

        {scheduling && !app.isLocked && (
          <form
            className="mt-4 flex flex-wrap items-end gap-3 rounded-xl bg-indigo-50/60 p-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await onSchedule(app.id, round, date);
              if (ok) setScheduling(false);
            }}
          >
            <label className="text-xs text-slate-600">
              Round
              <input type="number" min="1" value={round} onChange={(e) => setRound(Number(e.target.value))} className={`${inputClass} w-20 py-1.5`} />
            </label>
            <label className="text-xs text-slate-600">
              Date &amp; time
              <input type="datetime-local" required min={minDateTime()} value={date} onChange={(e) => setDate(e.target.value)} className={`${inputClass} py-1.5`} />
            </label>
            <Button size="sm" type="submit" disabled={busy}>Confirm</Button>
            <Button size="sm" type="button" variant="ghost" onClick={() => setScheduling(false)}>Cancel</Button>
          </form>
        )}
      </div>
    </Card>
  );
};

const Applicants = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [flash, setFlash] = useState({ type: 'info', text: '' });
  const [confirm, setConfirm] = useState(null); // { app, status }

  const fetchApplicants = useCallback(async () => {
    try {
      const res = await api.get(`/applications/job/${jobId}`);
      setJob(res.data.job);
      setApplicants(res.data.applications);
    } catch (err) {
      setFlash({ type: 'error', text: errorMessage(err, 'Failed to load applicants') });
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const doUpdateStatus = async (app, status) => {
    setBusy(true);
    try {
      await api.patch(`/applications/${app.id}/status`, { status });
      setFlash({ type: 'success', text: `${app.candidate?.user?.name} moved to ${formatStatus(status)}.` });
      await fetchApplicants();
    } catch (err) {
      setFlash({ type: 'error', text: errorMessage(err, 'Failed to update status') });
      await fetchApplicants();
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  };

  // Final decisions (Reject / Hire) need an explicit confirmation because they cannot be undone.
  const handleChangeStatus = (app, status) => {
    if (status === 'REJECTED' || status === 'HIRED') setConfirm({ app, status });
    else doUpdateStatus(app, status);
  };

  const handleSchedule = async (applicationId, round, scheduledAt) => {
    setBusy(true);
    try {
      await api.post('/interviews', {
        applicationId,
        round,
        scheduledAt: new Date(scheduledAt).toISOString(),
      });
      setFlash({ type: 'success', text: 'Interview scheduled and candidate notified.' });
      await fetchApplicants();
      return true;
    } catch (err) {
      setFlash({ type: 'error', text: errorMessage(err, 'Failed to schedule interview') });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleInterviewResult = async (interviewId, result) => {
    setBusy(true);
    try {
      await api.patch(`/interviews/${interviewId}`, { result });
      await fetchApplicants();
    } catch (err) {
      setFlash({ type: 'error', text: errorMessage(err, 'Failed to update interview') });
    } finally {
      setBusy(false);
    }
  };

  const counts = useMemo(
    () => Object.fromEntries(FILTERS.map((f) => [f.key, applicants.filter((a) => matchesFilter(a, f.key)).length])),
    [applicants]
  );
  const visible = applicants.filter((a) => matchesFilter(a, filter));

  return (
    <AppLayout width="max-w-5xl">
      <Link to="/recruiter/dashboard" className="mb-4 inline-block text-sm font-medium text-indigo-600 hover:underline">
        ← Back to jobs
      </Link>
      <PageHeader
        title={job ? `Applicants · ${job.title}` : 'Applicants'}
        subtitle="Move candidates forward through the pipeline. Reject and Hire are final decisions."
      />

      <Alert type={flash.type} onClose={() => setFlash({ ...flash, text: '' })}>{flash.text}</Alert>

      {loading ? (
        <PageLoader label="Loading applicants…" />
      ) : applicants.length === 0 ? (
        <EmptyState title="No applicants yet" description="When candidates apply to this job they will show up here." />
      ) : (
        <>
          <div className="mb-5 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  filter === f.key ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                }`}
              >
                {f.label} <span className="opacity-70">({counts[f.key]})</span>
              </button>
            ))}
          </div>
          {visible.length === 0 ? (
            <EmptyState title="Nothing here" description="No applicants match this filter." />
          ) : (
            <div className="space-y-4">
              {visible.map((app) => (
                <ApplicantCard
                  // Re-mount when status/interviews change so the card's form state resets.
                  key={`${app.id}-${app.status}-${app.interviews?.length || 0}`}
                  app={app}
                  busy={busy}
                  onChangeStatus={handleChangeStatus}
                  onSchedule={handleSchedule}
                  onInterviewResult={handleInterviewResult}
                />
              ))}
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.status === 'REJECTED' ? 'Reject this candidate?' : 'Mark this candidate as hired?'}
        message={
          <>
            <strong>{confirm?.app?.candidate?.user?.name}</strong> will be marked{' '}
            <strong>{formatStatus(confirm?.status)}</strong> and notified. This is a final decision and{' '}
            <strong>cannot be changed later</strong>.
          </>
        }
        confirmLabel={confirm?.status === 'REJECTED' ? 'Yes, reject' : 'Yes, hire'}
        variant={confirm?.status === 'REJECTED' ? 'danger' : 'success'}
        loading={busy}
        onConfirm={() => doUpdateStatus(confirm.app, confirm.status)}
        onCancel={() => setConfirm(null)}
      />
    </AppLayout>
  );
};

export default Applicants;
