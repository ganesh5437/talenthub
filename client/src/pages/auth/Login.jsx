import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api, { errorMessage } from '../../api/axios';
import { useAuth, homePathForRole } from '../../context/AuthContext';
import { Alert, Button, Field, inputClass } from '../../components/ui';
import AuthLayout from './AuthLayout';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.user, res.data.token);
      navigate(homePathForRole(res.data.user.role), { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Login failed'));
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue to your dashboard."
      footer={<>Don't have an account? <Link to="/register" className="font-medium text-indigo-600 hover:underline">Create one</Link></>}
    >
      {params.get('expired') && <Alert type="warning">Your session expired. Please log in again.</Alert>}
      <Alert type="error">{error}</Alert>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email">
          <input type="email" name="email" required autoComplete="email" value={form.email} onChange={handleChange} className={inputClass} placeholder="you@example.com" />
        </Field>
        <Field label="Password">
          <input type="password" name="password" required autoComplete="current-password" value={form.password} onChange={handleChange} className={inputClass} placeholder="••••••••" />
        </Field>
        <Button type="submit" loading={loading} className="w-full">
          {loading ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
      <p className="mt-4 text-xs text-slate-400">
        Tip: each browser tab keeps its own login, so you can open a Recruiter and a Candidate side by side.
      </p>
    </AuthLayout>
  );
};

export default Login;
