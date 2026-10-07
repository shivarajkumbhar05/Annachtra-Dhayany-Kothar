import { useState } from 'react';
import { Routes, Route, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import { Spinner } from './ui.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NewReceipt from './pages/NewReceipt.jsx';
import Receipts from './pages/Receipts.jsx';
import ReceiptView from './pages/ReceiptView.jsx';
import Reports from './pages/Reports.jsx';
import Materials from './pages/Materials.jsx';
import Users from './pages/Users.jsx';
import Settings from './pages/Settings.jsx';

const ALL = ['admin', 'operator', 'viewer'];
const NAV = [
  ['/', 'डॅशबोर्ड', 'Dashboard', ALL],
  ['/receipts/new', 'नवीन पावती', 'New receipt', ['admin', 'operator']],
  ['/receipts', 'पावत्या', 'Receipts', ALL],
  ['/reports', 'अहवाल', 'Reports', ['admin', 'viewer']],
  ['/materials', 'वस्तू', 'Materials', ['admin']],
  ['/users', 'वापरकर्ते', 'Users', ['admin']],
  ['/settings', 'सेटिंग्ज', 'Settings', ALL],
];
const ROLE_MR = { admin: 'प्रशासक', operator: 'ऑपरेटर', viewer: 'दर्शक' };

function Layout() {
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  if (loading) return <div className="center"><Spinner /></div>;
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return (
    <div className="shell">
      <aside className={`side no-print ${open ? 'open' : ''}`}>
        <div className="brand">
          <span className="om">॥ श्री स्वामी समर्थ ॥</span>
          <strong>धान्य कोठार</strong>
          <small>पावती व्यवस्थापन</small>
        </div>
        <nav onClick={() => setOpen(false)}>
          {NAV.filter((n) => n[3].includes(user.role)).map(([to, mr, en]) => (
            <NavLink key={to} to={to} end>
              <span>{mr}</span><small>{en}</small>
            </NavLink>
          ))}
        </nav>
        <div className="me">
          <b>{user.name}</b>
          <small>{ROLE_MR[user.role]} · {user.username}</small>
          <button className="btn ghost sm" onClick={logout}>बाहेर पडा (Logout)</button>
        </div>
      </aside>
      <div className="main">
        <header className="top no-print">
          <button className="btn ghost sm" onClick={() => setOpen(!open)} aria-label="Menu">☰</button>
          <strong>धान्य कोठार पावती</strong>
        </header>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
}

const Guard = ({ roles, children }) => {
  const { user } = useAuth();
  return roles.includes(user.role) ? children : <Navigate to="/" replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/receipts/new" element={<Guard roles={['admin', 'operator']}><NewReceipt /></Guard>} />
        <Route path="/receipts" element={<Receipts />} />
        <Route path="/receipts/:id" element={<ReceiptView />} />
        <Route path="/reports" element={<Guard roles={['admin', 'viewer']}><Reports /></Guard>} />
        <Route path="/materials" element={<Guard roles={['admin']}><Materials /></Guard>} />
        <Route path="/users" element={<Guard roles={['admin']}><Users /></Guard>} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
