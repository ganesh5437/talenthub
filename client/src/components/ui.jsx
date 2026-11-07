// Small shared UI building blocks so every page looks consistent.

export const Spinner = ({ className = 'h-5 w-5' }) => (
  <svg className={`animate-spin text-indigo-600 ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);

export const PageLoader = ({ label = 'Loading…' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500">
    <Spinner className="h-8 w-8" />
    <p className="text-sm">{label}</p>
  </div>
);

export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-slate-500">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>
);

export const Card = ({ children, className = '' }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>
);

export const StatCard = ({ label, value, accent = 'text-slate-900', hint }) => (
  <Card className="p-5">
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <p className={`mt-2 text-3xl font-bold ${accent}`}>{value ?? 0}</p>
    {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
  </Card>
);

const alertStyles = {
  error: 'border-red-200 bg-red-50 text-red-700',
  success: 'border-green-200 bg-green-50 text-green-700',
  info: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
};

export const Alert = ({ type = 'info', children, onClose }) => {
  const isEmpty = (c) => c === null || c === undefined || c === false || c === '';
  if (isEmpty(children) || (Array.isArray(children) && children.every(isEmpty))) return null;
  return (
    <div role={type === 'error' ? 'alert' : 'status'} className={`mb-4 flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${alertStyles[type]}`}>
      <div>{children}</div>
      {onClose && (
        <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100" aria-label="Dismiss">
          ✕
        </button>
      )}
    </div>
  );
};

export const EmptyState = ({ title, description, action }) => (
  <Card className="px-6 py-14 text-center">
    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-2xl">📭</div>
    <h3 className="font-semibold text-slate-800">{title}</h3>
    {description && <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </Card>
);

const buttonVariants = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
  secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  'danger-soft': 'bg-red-50 text-red-700 hover:bg-red-100',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
  'success-soft': 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  ghost: 'text-slate-600 hover:bg-slate-100',
};

export const Button = ({ variant = 'primary', size = 'md', loading, children, className = '', ...props }) => (
  <button
    {...props}
    disabled={loading || props.disabled}
    className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
      size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2.5 text-sm'
    } ${buttonVariants[variant]} ${className}`}
  >
    {loading && <Spinner className="h-4 w-4 text-current" />}
    {children}
  </button>
);

export const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30';

export const Field = ({ label, hint, children }) => (
  <label className="block">
    <span className="text-sm font-medium text-slate-700">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
  </label>
);
