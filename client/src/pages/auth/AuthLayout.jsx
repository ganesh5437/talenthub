import { Logo } from '../../components/Navbar';

const points = [
  'Post jobs and track every applicant in one pipeline',
  'Schedule interviews and notify candidates instantly',
  'Role-based portals for admins, companies, recruiters and candidates',
];

const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="grid min-h-screen lg:grid-cols-2">
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-violet-400/20 blur-3xl" />
      <div className="relative text-xl font-bold">TalentHub</div>
      <div className="relative">
        <h2 className="text-4xl font-bold leading-tight">Hire smarter.<br />Get hired faster.</h2>
        <ul className="mt-8 space-y-4 text-indigo-100">
          {points.map((p) => (
            <li key={p} className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs">✓</span>
              {p}
            </li>
          ))}
        </ul>
      </div>
      <p className="relative text-sm text-indigo-200">© {new Date().getFullYear()} TalentHub · Applicant Tracking System</p>
    </div>

    <div className="flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-slate-500">{subtitle}</p>}
        <div className="mt-8">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
      </div>
    </div>
  </div>
);

export default AuthLayout;
