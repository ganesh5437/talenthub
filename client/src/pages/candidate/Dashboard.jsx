import { useAuth } from '../../context/AuthContext';

const CandidateDashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Welcome, {user?.name}</h1>
        <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded-lg">Logout</button>
      </div>
      <p className="text-slate-600">Candidate dashboard — jobs, applications, profile coming here.</p>
    </div>
  );
};
export default CandidateDashboard;