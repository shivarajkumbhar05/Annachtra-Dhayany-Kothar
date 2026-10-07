import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken } from './api.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  useEffect(() => {
    if (getToken()) api('/auth/me').then((r) => setUser(r.user)).catch(() => {}).finally(() => setLoading(false));
    const out = () => setUser(null);
    window.addEventListener('dk-logout', out);
    return () => window.removeEventListener('dk-logout', out);
  }, []);

  const login = async (username, password) => {
    const r = await api('/auth/login', { method: 'POST', body: { username, password } });
    localStorage.setItem('dk_token', r.token);
    setUser(r.user);
  };
  const logout = async () => {
    try { await api('/auth/logout', { method: 'POST' }); } catch {}
    localStorage.removeItem('dk_token');
    setUser(null);
  };
  const can = (...roles) => !!user && roles.includes(user.role);

  return <Ctx.Provider value={{ user, loading, login, logout, can }}>{children}</Ctx.Provider>;
}
