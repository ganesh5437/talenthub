import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { errorMessage } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { AppLayout } from '../../components/Navbar';
import { Alert, Button, Card, Field, PageHeader, PageLoader, inputClass } from '../../components/ui';

const EMPTY = {
  title: '', description: '', skillsCsv: '', salaryMin: '', salaryMax: '',
  experience: '', type: 'ONSITE', status: 'PUBLISHED',
};

const companyBlocker = (me) => {
  if (!me) return null;
  if (!me.companyId) {
    return me.role === 'COMPANY_ADMIN' ? (
      <>You need to <Link to="/company/dashboard" className="font-semibold underline">register your company</Link> before posting jobs.</>
    ) : (
      <>Your recruiter account is not linked to a company yet. Ask your Company Admin to add you (Company dashboard → Recruiters).</>
    );
  }
  if (me.company && me.company.status !== 'APPROVED') {
    return (
      <>Your company <strong>{me.company.name}</strong> is <strong>{me.company.status.toLowerCase()}</strong>. Jobs can be posted once the platform admin approves it.</>
    );
  }
  return null;
};

const PostJob = () => {
  const { refreshUser } = useAuth();
  const [me, setMe] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    refreshUser().then(setMe).catch(() => setMe({}));
  }, [refreshUser]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.salaryMin && form.salaryMax && Number(form.salaryMin) > Number(form.salaryMax)) {
      setError('Min salary cannot be greater than max salary');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        salaryMin: form.salaryMin === '' ? null : Number(form.salaryMin),
        salaryMax: form.salaryMax === '' ? null : Number(form.salaryMax),
      };
      await api.post('/jobs', payload);
      navigate('/recruiter/dashboard');
    } catch (err) {
      setError(errorMessage(err, 'Failed to post job'));
      setLoading(false);
    }
  };

  if (!me) {
    return (
      <AppLayout width="max-w-3xl">
        <PageLoader />
      </AppLayout>
    );
  }

  const blocker = companyBlocker(me);

  return (
    <AppLayout width="max-w-3xl">
      <PageHeader title="Post a new job" subtitle="Fill in the details below. You can save it as a draft and publish later." />
      {blocker && <Alert type="warning">{blocker}</Alert>}
      <Card className="p-6 sm:p-8">
        <Alert type="error" onClose={() => setError('')}>{error}</Alert>
        <form onSubmit={handleSubmit} className="space-y-5">
          <fieldset disabled={!!blocker} className="space-y-5 disabled:opacity-60">
            <Field label="Job title">
              <input type="text" name="title" required value={form.title} onChange={handleChange} className={inputClass} placeholder="e.g. Frontend Developer" />
            </Field>
            <Field label="Description">
              <textarea name="description" required rows={5} value={form.description} onChange={handleChange} className={inputClass} placeholder="Responsibilities, requirements, benefits…" />
            </Field>
            <Field label="Skills" hint="Separate skills with commas, e.g. React, Node.js, SQL">
              <input type="text" name="skillsCsv" value={form.skillsCsv} onChange={handleChange} className={inputClass} placeholder="React, Node.js, SQL" />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Min salary (₹ / year)">
                <input type="number" min="0" name="salaryMin" value={form.salaryMin} onChange={handleChange} className={inputClass} placeholder="300000" />
              </Field>
              <Field label="Max salary (₹ / year)">
                <input type="number" min="0" name="salaryMax" value={form.salaryMax} onChange={handleChange} className={inputClass} placeholder="600000" />
              </Field>
            </div>
            <Field label="Experience">
              <input type="text" name="experience" value={form.experience} onChange={handleChange} className={inputClass} placeholder="e.g. 2-4 years" />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Work type">
                <select name="type" value={form.type} onChange={handleChange} className={inputClass}>
                  <option value="ONSITE">Onsite</option>
                  <option value="REMOTE">Remote</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </Field>
              <Field label="Visibility">
                <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                  <option value="PUBLISHED">Publish now</option>
                  <option value="DRAFT">Save as draft</option>
                </select>
              </Field>
            </div>
          </fieldset>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/recruiter/dashboard')}>Cancel</Button>
            <Button type="submit" loading={loading} disabled={!!blocker}>
              {form.status === 'DRAFT' ? 'Save draft' : 'Publish job'}
            </Button>
          </div>
        </form>
      </Card>
    </AppLayout>
  );
};

export default PostJob;
