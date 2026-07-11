import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';

const navLinks = [
  { path: '/recruiter/dashboard', label: 'My Jobs' },
  { path: '/recruiter/post-job', label: 'Post Job' },
];

const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs/my-jobs');
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (job) => {
    const newStatus = job.status === 'PUBLISHED' ? 'CLOSED' : 'PUBLISHED';
    try {
      await api.patch(`/jobs/${job.id}`, { status: newStatus });
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar links={navLinks} />
      <div className="max-w-5xl mx-auto py-10 px-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">My Job Postings</h1>
          <Link
            to="/recruiter/post-job"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            + Post New Job
          </Link>
        </div>

        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center text-slate-500">
            No jobs posted yet. Click "Post New Job" to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl shadow-sm p-5 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-slate-800">{job.title}</h3>
                    <StatusBadge status={job.status} />
                  </div>
                  <p className="text-sm text-slate-500">
                    {job.type} • {job.experience || 'Any experience'} • {job.applications?.length || 0} applicants
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/recruiter/jobs/${job.id}/applicants`}
                    className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
                  >
                    View Applicants
                  </Link>
                  <button
                    onClick={() => togglePublish(job)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      job.status === 'PUBLISHED'
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {job.status === 'PUBLISHED' ? 'Close' : 'Publish'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;