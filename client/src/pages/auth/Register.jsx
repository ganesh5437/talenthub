import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { errorMessage } from '../../api/axios';
import { useAuth, homePathForRole } from '../../context/AuthContext';
import { Alert, Button, Field, inputClass } from '../../components/ui';
import AuthLayout from './AuthLayout';

const ROLES = [
  { value: 'CANDIDATE', title: 'Candidate', desc: 'Find jobs and track applications' },
  { value: 'COMPANY_ADMIN', title: 'Company', desc: 'Register a company and hire' },
];

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'CANDIDATE' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.user, res.data.token);
      navigate(homePathForRole(res.data.user.role), { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Registration failed'));
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join TalentHub in less than a minute."
      footer={<>Already have an account? <Link to="/login" className="font-medium text-indigo-600 hover:underline">Log in</Link></>}
    >
      <Alert type="error">{error}</Alert>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <span className="text-sm font-medium text-slate-700">I am a…</span>
          <div className="mt-1 grid grid-cols-2 gap-3">
            {ROLES.map((r) => (
              <button
                type="button"
                key={r.value}
                onClick={() => setForm({ ...form, role: r.value })}
                className={`rounded-xl border p-3 text-left transition ${
                  form.role === r.value
                    ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/30'
                    : 'border-slate-300 bg-white hover:border-slate-400'
                }`}
              >
                <p className="text-sm font-semibold text-slate-800">{r.title}</p>
                <p className="text-xs text-slate-500">{r.desc}</p>
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-400">Recruiters: ask your Company Admin to add you from the Company dashboard.</p>
        </div>
        <Field label="Full name">
          <input type="text" name="name" required autoComplete="name" value={form.name} onChange={handleChange} className={inputClass} placeholder="Your name" />
        </Field>
        <Field label="Email">
          <input type="email" name="email" required autoComplete="email" value={form.email} onChange={handleChange} className={inputClass} placeholder="you@example.com" />
        </Field>
        <Field label="Password" hint="At least 6 characters">
          <input type="password" name="password" required minLength={6} autoComplete="new-password" value={form.password} onChange={handleChange} className={inputClass} placeholder="••••••••" />
        </Field>
        <Button type="submit" loading={loading} className="w-full">
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default Register;
