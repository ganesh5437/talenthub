// Login is stored per browser TAB (sessionStorage), not shared across tabs (localStorage).
//
// Why: with localStorage, logging in as a Candidate in tab B silently replaced the token
// used by a Recruiter in tab A. Tab A still *showed* the recruiter, but every request was
// sent as the candidate, so the server answered "Access denied for this role".
// With sessionStorage each tab keeps its own login, so you can demo several roles side by side.

const TOKEN_KEY = 'th_token';
const USER_KEY = 'th_user';

// Clean up the old shared keys from previous versions of the app.
try {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
} catch {
  /* storage unavailable */
}

const safe = (fn, fallback = null) => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

export const authStorage = {
  getToken: () => safe(() => sessionStorage.getItem(TOKEN_KEY)),
  setToken: (t) => safe(() => sessionStorage.setItem(TOKEN_KEY, t)),
  getUser: () => safe(() => JSON.parse(sessionStorage.getItem(USER_KEY))),
  setUser: (u) => safe(() => sessionStorage.setItem(USER_KEY, JSON.stringify(u))),
  clear: () =>
    safe(() => {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    }),
};
