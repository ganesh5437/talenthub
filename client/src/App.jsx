import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import BrowseJobs from './pages/candidate/BrowseJobs';
import MyApplications from './pages/candidate/MyApplications';
import CompanyDashboard from './pages/company/Dashboard';
import RecruiterDashboard from './pages/recruiter/Dashboard';
import PostJob from './pages/recruiter/PostJob';
import Applicants from './pages/recruiter/Applicants';
import AdminDashboard from './pages/admin/Dashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/candidate/dashboard" element={
        <ProtectedRoute allowedRoles={['CANDIDATE']}><BrowseJobs /></ProtectedRoute>
      } />
      <Route path="/candidate/applications" element={
        <ProtectedRoute allowedRoles={['CANDIDATE']}><MyApplications /></ProtectedRoute>
      } />

      <Route path="/company/dashboard" element={
        <ProtectedRoute allowedRoles={['COMPANY_ADMIN']}><CompanyDashboard /></ProtectedRoute>
      } />

      <Route path="/recruiter/dashboard" element={
        <ProtectedRoute allowedRoles={['RECRUITER', 'COMPANY_ADMIN']}><RecruiterDashboard /></ProtectedRoute>
      } />
      <Route path="/recruiter/post-job" element={
        <ProtectedRoute allowedRoles={['RECRUITER', 'COMPANY_ADMIN']}><PostJob /></ProtectedRoute>
      } />
      <Route path="/recruiter/jobs/:jobId/applicants" element={
        <ProtectedRoute allowedRoles={['RECRUITER', 'COMPANY_ADMIN']}><Applicants /></ProtectedRoute>
      } />

      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminDashboard /></ProtectedRoute>
      } />
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