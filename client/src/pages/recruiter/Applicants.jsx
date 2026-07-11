import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';

const navLinks = [
  { path: '/recruiter/dashboard', label: 'My Jobs' },
  { path: '/recruiter/post-job', label: 'Post Job' },
];

const statusOptions = [
  'APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED',
  'SELECTED', 'OFFER_RELEASED', 'HIRED', 'REJECTED',
];

const Applicants = () => {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schedulingId, setSchedulingId] = useState(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewRound, setInterviewRound] = useState(1);

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const fetchApplicants = async () => {
    try {
      const res = await api.get(`/applications/job/${jobId}`);
      setApplicants(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId, status) => {
    try {
      await api.patch(`/applications/${applicationId}/status`, { status });
      fetchApplicants();
    } catch (err) {
      console.error(err);
    }
  };

  const openScheduleForm = (applicationId) => {
    setSchedulingId(applicationId);
    setInterviewDate('');
    setInterviewRound(1);
  };

  const cancelSchedule = () => {
    setSchedulingId(null);
  };

  const submitSchedule = async (applicationId) => {
    if (!interviewDate) {
      alert('Please pick a date and time');
      return;
    }
    try {
      await api.post('/interviews', {
        applicationId,
        round: interviewRound,
        scheduledAt: interviewDate,
      });
      setSchedulingId(null);
      fetchApplicants();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule interview');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar links={navLinks} />
      <div className="max-w-5xl mx-auto py-10 px-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Applicants</h1>
        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : applicants.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center text-slate-500">
            No applicants yet for this job.
          </div>
        ) : (
          <div className="space-y-4">
            {applicants.map((app) => (
              <div key={app.id} className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-800">{app.candidate?.user?.name}</h3>
                    <p className="text-sm text-slate-500">{app.candidate?.user?.email}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Skills: {app.candidate?.skillsCsv || 'Not specified'}
                    </p>
                    {app.interviews && app.interviews.length > 0 && (
                      <div className="mt-2 bg-indigo-50 rounded-lg p-2">
                        <p className="text-xs font-medium text-indigo-700">Interviews:</p>
                        {app.interviews.map((iv) => (
                          <p key={iv.id} className="text-xs text-indigo-600">
                            Round {iv.round} — {new Date(iv.scheduledAt).toLocaleString()} — {iv.result}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <StatusBadge status={app.status} />
                </div>
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-slate-500">Move to:</span>
                  <select
                    value={app.status}
                    onChange={(e) => updateStatus(app.id, e.target.value)}
                    className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                  {schedulingId !== app.id && (
                    <button
                      onClick={() => openScheduleForm(app.id)}
                      className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700"
                    >
                      Schedule Interview
                    </button>
                  )}
                </div>

                {schedulingId === app.id && (
                  <div className="mt-4 bg-slate-50 rounded-lg p-4 flex flex-wrap items-end gap-3">
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">Round</label>
                      <input
                        type="number" min="1" value={interviewRound}
                        onChange={(e) => setInterviewRound(Number(e.target.value))}
                        className="border rounded-lg px-3 py-1.5 text-sm w-20"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">Date & Time</label>
                      <input
                        type="datetime-local" value={interviewDate}
                        onChange={(e) => setInterviewDate(e.target.value)}
                        className="border rounded-lg px-3 py-1.5 text-sm"
                      />
                    </div>
                    <button
                      onClick={() => submitSchedule(app.id)}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={cancelSchedule}
                      className="bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Applicants;