import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth, homePathForRole } from '../context/AuthContext';
import api from '../api/axios';
import { formatStatus, timeAgo } from '../utils/pipeline';

const LINKS_BY_ROLE = {
  CANDIDATE: [
    { path: '/candidate/dashboard', label: 'Browse Jobs' },
    { path: '/candidate/applications', label: 'My Applications' },
    { path: '/candidate/profile', label: 'Profile' },
  ],
  RECRUITER: [
    { path: '/recruiter/dashboard', label: 'My Jobs' },
    { path: '/recruiter/post-job', label: 'Post Job' },
  ],
  COMPANY_ADMIN: [
    { path: '/company/dashboard', label: 'Company' },
    { path: '/recruiter/dashboard', label: 'Jobs' },
    { path: '/recruiter/post-job', label: 'Post Job' },
  ],
  SUPER_ADMIN: [{ path: '/admin/dashboard', label: 'Dashboard' }],
};

export const Logo = ({ to = '/' }) => (
  <Link to={to} className="flex items-center gap-2 text-lg font-bold text-slate-900">
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-black text-white shadow-sm">
      T
    </span>
    Talent<span className="-ml-2 text-indigo-600">Hub</span>
  </Link>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const links = LINKS_BY_ROLE[user?.role] || [];

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch {
      /* ignore polling errors */
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markRead = async (id) => {
    setNotifications((list) => list.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch {
      fetchNotifications();
    }
  };

  const markAllRead = async () => {
    setNotifications((list) => list.map((n) => ({ ...n, isRead: true })));
    try {
      await api.patch('/notifications/read-all');
    } catch {
      fetchNotifications();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Logo to={homePathForRole(user?.role)} />
          <div className="hidden gap-1 md:flex">
            {links.map((link) => (
              <NavLink key={link.path} to={link.path} end className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100"
              aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {open && (
              <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <span className="text-sm font-semibold text-slate-800">Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs font-medium text-indigo-600 hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-6 text-center text-sm text-slate-500">You're all caught up.</p>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className={`block w-full border-b border-slate-50 px-4 py-3 text-left text-sm hover:bg-slate-50 ${
                          !n.isRead ? 'bg-indigo-50/60' : ''
                        }`}
                      >
                        <p className="text-slate-700">{n.message}</p>
                        <p className="mt-1 text-xs text-slate-400">{timeAgo(n.createdAt)}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-tight text-slate-800">{user?.name}</p>
            <p className="text-xs leading-tight text-slate-500">{formatStatus(user?.role)}</p>
          </div>
          <button
            onClick={handleLogout}
            className="hidden rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-red-50 hover:text-red-600 sm:block"
          >
            Logout
          </button>
          <button
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeWidth={2} d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200 px-4 py-3 md:hidden">
          <p className="px-3 pb-2 text-xs text-slate-500">
            {user?.name} · {formatStatus(user?.role)}
          </p>
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink key={link.path} to={link.path} end className={linkClass} onClick={() => setMenuOpen(false)}>
                {link.label}
              </NavLink>
            ))}
            <button onClick={handleLogout} className="rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50">
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export const AppLayout = ({ children, width = 'max-w-6xl' }) => (
  <div className="min-h-screen bg-slate-50">
    <Navbar />
    <main className={`mx-auto ${width} px-4 py-8 sm:px-6 sm:py-10`}>{children}</main>
  </div>
);

export default Navbar;
