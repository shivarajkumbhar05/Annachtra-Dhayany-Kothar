import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [f, setF] = useState({ username: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try { await login(f.username, f.password); nav(loc.state?.from || '/', { replace: true }); }
    catch (ex) { setErr(ex.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="login">
      <section className="login-art">
        <span className="om">॥ श्री स्वामी समर्थ ॥</span>
        <h1>श्री स्वामी समर्थ<br />अन्नछत्र मंडळ</h1>
        <p>अक्कलकोट · ट्रस्ट एफ-२२७९</p>
        <div className="grain" aria-hidden="true" />
      </section>
      <form className="login-form" onSubmit={submit}>
        <h2>धान्य कोठार पावती</h2>
        <p className="muted">पुढे जाण्यासाठी लॉगिन करा · Sign in to continue</p>
        <label className="field">वापरकर्ता नाव (Username)
          <input value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} autoFocus required />
        </label>
        <label className="field">पासवर्ड (Password)
          <input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required />
        </label>
        {err && <div className="alert">{err}</div>}
        <button className="btn pri" disabled={busy}>{busy ? 'कृपया थांबा…' : 'लॉगिन (Login)'}</button>
      </form>
    </div>
  );
}
