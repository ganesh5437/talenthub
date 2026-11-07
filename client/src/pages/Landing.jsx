import { Link } from 'react-router-dom';
import { Logo } from '../components/Navbar';
import { formatStatus } from '../utils/pipeline';

const features = [
  { icon: '🏢', title: 'Company portal', text: 'Register your company, get approved by the platform admin and add your recruiters.' },
  { icon: '📝', title: 'Job posting', text: 'Create drafts, publish when ready and close roles once they are filled.' },
  { icon: '📊', title: 'ATS pipeline', text: 'Move applicants forward stage by stage. Rejections and hires are final and locked.' },
  { icon: '📅', title: 'Interviews', text: 'Schedule multiple rounds and record pass / fail results for every candidate.' },
  { icon: '🔔', title: 'Notifications', text: 'Candidates and recruiters are notified the moment something changes.' },
  { icon: '🔐', title: 'Secure by role', text: 'JWT authentication with strict role and company-level access control.' },
];

const stages = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'SELECTED', 'OFFER_RELEASED', 'HIRED'];

const Landing = () => (
  <div className="min-h-screen bg-white">
    <header className="border-b border-slate-100">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-2">
          <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Log in</Link>
          <Link to="/register" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">Get started</Link>
        </div>
      </div>
    </header>

    <section className="relative overflow-hidden">
      <div className="absolute inset-x-0 -top-40 -z-10 flex justify-center blur-3xl">
        <div className="h-[30rem] w-[60rem] rounded-full bg-gradient-to-tr from-indigo-200 to-violet-200 opacity-60" />
      </div>
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200">
          Applicant Tracking System
        </span>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
          Recruitment, from job post <span className="text-indigo-600">to hire</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          TalentHub connects companies, recruiters and candidates on one platform with a clear,
          auditable hiring pipeline.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/register" className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-indigo-700">
            Create free account
          </Link>
          <Link to="/login" className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50">
            I already have an account
          </Link>
        </div>
      </div>
    </section>

    <section className="border-y border-slate-100 bg-slate-50 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-slate-900">The hiring pipeline</h2>
        <p className="mt-2 text-center text-slate-500">Every application moves forward through these stages — or is rejected. Final decisions cannot be reversed.</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {stages.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
                {i + 1}. {formatStatus(s)}
              </span>
              {i < stages.length - 1 && <span className="text-slate-300">→</span>}
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-slate-900">Everything you need to hire</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-200 p-6 transition hover:shadow-md">
              <div className="text-2xl">{f.icon}</div>
              <h3 className="mt-4 font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-500">
      © {new Date().getFullYear()} TalentHub · Built with React, Node.js, Express, Prisma &amp; PostgreSQL
    </footer>
  </div>
);

export default Landing;
