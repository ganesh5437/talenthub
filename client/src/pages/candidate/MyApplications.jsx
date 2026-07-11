import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';

const navLinks = [
  { path: '/candidate/dashboard', label: 'Browse Jobs' },
  { path: '/candidate/applications', label: 'My Applications' },
];

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications/my');
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar links={navLinks} />
      <div className="max-w-5xl mx-auto py-10 px-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">My Applications</h1>

        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center text-slate-500">
            You haven't applied to any jobs yet.
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-800">{app.job?.title}</h3>
                    <p className="text-sm text-slate-500">{app.job?.company?.name}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Applied on {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
                {app.interviews?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-sm font-medium text-slate-700 mb-1">Interviews:</p>
                    {app.interviews.map((iv) => (
                      <p key={iv.id} className="text-sm text-slate-500">
                        Round {iv.round} — {new Date(iv.scheduledAt).toLocaleString()} — {iv.result}
                      </p>
                    ))}
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

export default MyApplications;