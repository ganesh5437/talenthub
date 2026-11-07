import { useState, useEffect } from 'react';
import api, { errorMessage } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { AppLayout } from '../../components/Navbar';
import { Alert, Button, Card, Field, PageHeader, PageLoader, inputClass } from '../../components/ui';

const FIELDS = ['skillsCsv', 'experience', 'education', 'resumeUrl', 'linkedin', 'portfolio'];

const Profile = () => {
  const { user } = useAuth();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState({ type: 'info', text: '' });

  useEffect(() => {
    api
      .get('/candidates/me')
      .then((res) => setForm(Object.fromEntries(FIELDS.map((f) => [f, res.data?.[f] || '']))))
      .catch((err) => {
        setForm(Object.fromEntries(FIELDS.map((f) => [f, ''])));
        setFlash({ type: 'error', text: errorMessage(err, 'Failed to load profile') });
      });
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/candidates/me', form);
      setFlash({ type: 'success', text: 'Profile saved. Recruiters will see this when you apply.' });
    } catch (err) {
      setFlash({ type: 'error', text: errorMessage(err, 'Failed to save profile') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout width="max-w-3xl">
      <PageHeader title="My profile" subtitle="A complete profile helps recruiters shortlist you faster." />
      <Alert type={flash.type} onClose={() => setFlash({ ...flash, text: '' })}>{flash.text}</Alert>
      {!form ? (
        <PageLoader />
      ) : (
        <Card className="p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-4 border-b border-slate-100 pb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-xl font-semibold text-indigo-700">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{user?.name}</p>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Skills" hint="Comma separated, e.g. React, Node.js, SQL">
              <input name="skillsCsv" value={form.skillsCsv} onChange={handleChange} className={inputClass} placeholder="React, Node.js, SQL" />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Experience">
                <input name="experience" value={form.experience} onChange={handleChange} className={inputClass} placeholder="e.g. 1 year / Fresher" />
              </Field>
              <Field label="Education">
                <input name="education" value={form.education} onChange={handleChange} className={inputClass} placeholder="e.g. B.Tech CSE, 2026" />
              </Field>
            </div>
            <Field label="Resume link" hint="Google Drive / Dropbox link with view access">
              <input type="url" name="resumeUrl" value={form.resumeUrl} onChange={handleChange} className={inputClass} placeholder="https://…" />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="LinkedIn">
                <input type="url" name="linkedin" value={form.linkedin} onChange={handleChange} className={inputClass} placeholder="https://linkedin.com/in/…" />
              </Field>
              <Field label="Portfolio / GitHub">
                <input type="url" name="portfolio" value={form.portfolio} onChange={handleChange} className={inputClass} placeholder="https://github.com/…" />
              </Field>
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={saving}>Save profile</Button>
            </div>
          </form>
        </Card>
      )}
    </AppLayout>
  );
};

export default Profile;
