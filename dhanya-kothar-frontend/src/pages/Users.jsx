import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { PageHead, Spinner, Modal, useToast } from '../ui.jsx';

const ROLES = [['admin', 'प्रशासक (Admin)'], ['operator', 'ऑपरेटर (Operator)'], ['viewer', 'दर्शक (Viewer)']];

export default function Users() {
  const toast = useToast();
  const { user: me } = useAuth();
  const [rows, setRows] = useState(null);
  const [modal, setModal] = useState(null); // {type:'new'} | {type:'pw', user}
  const [f, setF] = useState({ name: '', username: '', password: '', role: 'operator' });
  const [pw, setPw] = useState('');

  const load = () => api('/users').then((r) => setRows(r.users)).catch((e) => toast(e.message, 'err'));
  useEffect(() => { load(); }, []);
  const run = async (fn, msg) => { try { await fn(); toast(msg); setModal(null); load(); } catch (e) { toast(e.message, 'err'); } };
  const upd = (u, body) => run(() => api(`/users/${u._id}`, { method: 'PUT', body }), 'अद्यतनित केले');

  return (
    <>
      <PageHead title="वापरकर्ते" sub="प्रशासक · ऑपरेटर · दर्शक">
        <button className="btn pri" onClick={() => { setF({ name: '', username: '', password: '', role: 'operator' }); setModal({ type: 'new' }); }}>+ नवीन वापरकर्ता</button>
      </PageHead>
      <section className="panel">
        {!rows ? <Spinner /> : (
          <div className="scroll"><table className="tbl">
            <thead><tr><th>नाव</th><th>युजरनेम</th><th>भूमिका</th><th>स्थिती</th><th /></tr></thead>
            <tbody>{rows.map((u) => {
              const self = u._id === me.id;
              return (
                <tr key={u._id} className={u.status === 'disabled' ? 'dim' : ''}>
                  <td>{u.name}</td><td className="mono">{u.username}</td>
                  <td><select value={u.role} disabled={self} onChange={(e) => upd(u, { role: e.target.value })}>{ROLES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></td>
                  <td><span className={`badge ${u.status}`}>{u.status === 'active' ? 'सक्रिय' : 'बंद'}</span></td>
                  <td className="r nowrap">
                    <button className="btn sm" onClick={() => { setPw(''); setModal({ type: 'pw', user: u }); }}>पासवर्ड रीसेट</button>{' '}
                    <button className="btn sm" disabled={self} onClick={() => upd(u, { status: u.status === 'active' ? 'disabled' : 'active' })}>{u.status === 'active' ? 'बंद करा' : 'सुरू करा'}</button>
                  </td>
                </tr>
              );
            })}</tbody>
          </table></div>
        )}
      </section>

      {modal?.type === 'new' && (
        <Modal title="नवीन वापरकर्ता" onClose={() => setModal(null)}>
          <form onSubmit={(e) => { e.preventDefault(); run(() => api('/users', { method: 'POST', body: f }), 'वापरकर्ता तयार झाला'); }}>
            <label className="field">पूर्ण नाव<input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></label>
            <label className="field">युजरनेम<input value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} required /></label>
            <label className="field">पासवर्ड (किमान ६ अक्षरे)<input type="password" minLength={6} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required /></label>
            <label className="field">भूमिका<select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>{ROLES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
            <button className="btn pri">तयार करा</button>
          </form>
        </Modal>
      )}
      {modal?.type === 'pw' && (
        <Modal title={`पासवर्ड रीसेट: ${modal.user.username}`} onClose={() => setModal(null)}>
          <form onSubmit={(e) => { e.preventDefault(); run(() => api(`/users/${modal.user._id}/reset-password`, { method: 'PUT', body: { newPassword: pw } }), 'पासवर्ड बदलला'); }}>
            <label className="field">नवीन पासवर्ड<input type="password" minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} required autoFocus /></label>
            <button className="btn pri">रीसेट करा</button>
          </form>
        </Modal>
      )}
    </>
  );
}
