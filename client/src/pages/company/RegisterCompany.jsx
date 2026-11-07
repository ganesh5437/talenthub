import { useState } from 'react';
import api, { errorMessage } from '../../api/axios';
import { Alert, Button, Card, Field, PageHeader, inputClass } from '../../components/ui';

const RegisterCompany = ({ onRegistered }) => {
  const [form, setForm] = useState({ name: '', description: '', website: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/companies', form);
      await onRegistered();
    } catch (err) {
      setError(errorMessage(err, 'Failed to register company'));
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Register your company" subtitle="Set up your company profile. The platform admin will review and approve it." />
      <Card className="p-6 sm:p-8">
        <Alert type="error">{error}</Alert>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Company name">
            <input type="text" name="name" required value={form.name} onChange={handleChange} className={inputClass} placeholder="e.g. TechCorp Solutions" />
          </Field>
          <Field label="Description">
            <textarea name="description" rows={3} value={form.description} onChange={handleChange} className={inputClass} placeholder="What does your company do?" />
          </Field>
          <Field label="Website">
            <input type="url" name="website" value={form.website} onChange={handleChange} className={inputClass} placeholder="https://yourcompany.com" />
          </Field>
          <Button type="submit" loading={loading} className="w-full">Register company</Button>
        </form>
      </Card>
    </>
  );
};

export default RegisterCompany;
