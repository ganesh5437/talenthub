import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';

const navLinks = [
  { path: '/candidate/dashboard', label: 'Browse Jobs' },
  { path: '/candidate/applications', label: 'My Applications' },
];

const BrowseJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async (query = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/jobs${query ? `?search=${query}` : ''}`);
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs(search);
  };

  const applyToJob = async (jobId) => {
    setApplying(jobId);
    setMessage('');
    try {
      await api.post('/applications', { jobId });
      setMessage('Applied successfully!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(null);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar links={navLinks} />
      <div className="max-w-5xl mx-auto py-10 px-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Browse Jobs</h1>

        <form onSubmit={handleSearch} className="mb-6 flex gap-2">
          <input
            type="text"
            placeholder="Search by title or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Search
          </button>
        </form>

        {message && (
          <p className={`mb-4 p-3 rounded-lg text-sm ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </p>
        )}

        {loading ? (
          <p className="text-slate-500">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center text-slate-500">
            No jobs found. Try a different search.
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-800">{job.title}</h3>
                    <p className="text-sm text-slate-500">{job.company?.name}</p>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">{job.description}</p>
                    <div className="flex gap-3 mt-3 text-xs text-slate-500">
                      <span className="bg-slate-100 px-2 py-1 rounded">{job.type}</span>
                      {job.experience && <span className="bg-slate-100 px-2 py-1 rounded">{job.experience}</span>}
                      {job.salaryMin && (
                        <span className="bg-slate-100 px-2 py-1 rounded">
                          ₹{job.salaryMin} - ₹{job.salaryMax}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => applyToJob(job.id)}
                    disabled={applying === job.id}
                    className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 whitespace-nowrap"
                  >
                    {applying === job.id ? 'Applying...' : 'Apply Now'}
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

export default BrowseJobs;