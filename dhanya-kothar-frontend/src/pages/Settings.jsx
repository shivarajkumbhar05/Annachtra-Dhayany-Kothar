import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { PageHead, Spinner, useToast, fmtDateTime } from '../ui.jsx';

const FIELDS = [
  ['organizationName', 'संस्थेचे नाव'], ['trustNumber', 'ट्रस्ट क्रमांक'], ['address', 'पत्ता'], ['phone', 'फोन'],
  ['email', 'ईमेल'], ['receiptHeaderTop', 'पावतीवरील वरची ओळ'], ['receiptTitle', 'पावतीचे शीर्षक'], ['receiptPrefix', 'पावती क्रमांक उपसर्ग (Prefix)'],
];

export default function Settings() {
  const { can } = useAuth();
  const toast = useToast();
  const admin = can('admin');
  const [s, setS] = useState(null);
  const [logs, setLogs] = useState(null);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });

  useEffect(() => {
    api('/settings').then((r) => setS(r.settings));
    if (admin) api('/audit-logs', { params: { limit: 50 } }).then((r) => setLogs(r.logs));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    try { const r = await api('/settings', { method: 'PUT', body: s }); setS(r.settings); toast('सेटिंग्ज जतन केल्या'); }
    catch (ex) { toast(ex.message, 'err'); }
  };
  const changePw = async (e) => {
    e.preventDefault();
    try { await api('/auth/change-password', { method: 'PUT', body: pw }); setPw({ currentPassword: '', newPassword: '' }); toast('पासवर्ड बदलला'); }
    catch (ex) { toast(ex.message, 'err'); }
  };

  if (!s) return <Spinner />;
  return (
    <>
      <PageHead title="सेटिंग्ज" sub="संस्था, पावती आणि खाते" />
      {admin && (
        <form className="panel" onSubmit={save}>
          <h3>संस्था व पावती सेटिंग्ज</h3>
          <div className="grid2">
            {FIELDS.map(([k, l]) => <label className="field" key={k}>{l}<input value={s[k] || ''} onChange={(e) => setS({ ...s, [k]: e.target.value })} /></label>)}
            <label className="field">कागदाचा आकार (Paper size)
              <select value={s.paperSize} onChange={(e) => setS({ ...s, paperSize: e.target.value })}>
                {['A4', 'A5', 'THERMAL58', 'THERMAL80'].map((p) => <option key={p}>{p}</option>)}
              </select>
            </label>
          </div>
          <button className="btn pri">जतन करा</button>
        </form>
      )}
      <form className="panel" onSubmit={changePw}>
        <h3>पासवर्ड बदला</h3>
        <div className="grid2">
          <label className="field">सध्याचा पासवर्ड<input type="password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required /></label>
          <label className="field">नवीन पासवर्ड<input type="password" minLength={6} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required /></label>
        </div>
        <button className="btn pri">पासवर्ड बदला</button>
      </form>
      {admin && (
        <section className="panel">
          <h3>ऑडिट लॉग (अलीकडील ५०)</h3>
          {!logs ? <Spinner /> : (
            <div className="scroll"><table className="tbl">
              <thead><tr><th>वेळ</th><th>वापरकर्ता</th><th>क्रिया</th><th>तपशील</th></tr></thead>
              <tbody>{logs.map((l) => (
                <tr key={l._id}><td className="nowrap">{fmtDateTime(l.timestamp)}</td><td>{l.userId?.username || '—'}</td><td className="mono">{l.action}</td><td>{l.description}</td></tr>
              ))}</tbody>
            </table></div>
          )}
        </section>
      )}
    </>
  );
}
