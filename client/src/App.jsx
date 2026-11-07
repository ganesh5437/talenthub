import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth, homePathForRole } from './context/AuthContext';
import { PageLoader } from './components/ui';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import BrowseJobs from './pages/candidate/BrowseJobs';
import MyApplications from './pages/candidate/MyApplications';
import Profile from './pages/candidate/Profile';
import CompanyDashboard from './pages/company/Dashboard';
import RecruiterDashboard from './pages/recruiter/Dashboard';
import PostJob from './pages/recruiter/PostJob';
import Applicants from './pages/recruiter/Applicants';
import AdminDashboard from './pages/admin/Dashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader label="Checking your session…" />;
  if (!user) return <Navigate to="/login" replace />;
  // Logged in but wrong role: send them to their own home instead of the login page.
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }
  return children;
};

const GuestOnly = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user) return <Navigate to={homePathForRole(user.role)} replace />;
  return children;
};

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center">
    <p className="text-6xl font-black text-indigo-600">404</p>
    <h1 className="text-xl font-semibold text-slate-800">Page not found</h1>
    <p className="text-slate-500">The page you are looking for does not exist.</p>
    <Link to="/" className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
      Go home
    </Link>
  </div>
);

const RECRUITING = ['RECRUITER', 'COMPANY_ADMIN'];

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<GuestOnly><Landing /></GuestOnly>} />
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />

      <Route path="/candidate/dashboard" element={<ProtectedRoute allowedRoles={['CANDIDATE']}><BrowseJobs /></ProtectedRoute>} />
      <Route path="/candidate/applications" element={<ProtectedRoute allowedRoles={['CANDIDATE']}><MyApplications /></ProtectedRoute>} />
      <Route path="/candidate/profile" element={<ProtectedRoute allowedRoles={['CANDIDATE']}><Profile /></ProtectedRoute>} />

      <Route path="/company/dashboard" element={<ProtectedRoute allowedRoles={['COMPANY_ADMIN']}><CompanyDashboard /></ProtectedRoute>} />

      <Route path="/recruiter/dashboard" element={<ProtectedRoute allowedRoles={RECRUITING}><RecruiterDashboard /></ProtectedRoute>} />
      <Route path="/recruiter/post-job" element={<ProtectedRoute allowedRoles={RECRUITING}><PostJob /></ProtectedRoute>} />
      <Route path="/recruiter/jobs/:jobId/applicants" element={<ProtectedRoute allowedRoles={RECRUITING}><Applicants /></ProtectedRoute>} />

      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminDashboard /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
