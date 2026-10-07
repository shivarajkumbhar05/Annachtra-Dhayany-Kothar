import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { PageHead, Spinner, Empty, useToast, UNIT_LABELS } from '../ui.jsx';

export default function Materials() {
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('Kg');

  const load = () => api('/materials', { params: { status: 'all' } }).then((r) => setRows(r.materials)).catch((e) => toast(e.message, 'err'));
  useEffect(() => { load(); }, []);

  const act = async (fn, msg) => { try { await fn(); toast(msg); load(); } catch (e) { toast(e.message, 'err'); } };
  const add = (e) => { e.preventDefault(); act(async () => { await api('/materials', { method: 'POST', body: { name, unit } }); setName(''); }, 'वस्तू जोडली'); };
  const upd = (m, body) => act(() => api(`/materials/${m._id}`, { method: 'PUT', body }), 'अद्यतनित केले');

  return (
    <>
      <PageHead title="वस्तू व्यवस्थापन" sub="जुन्या पावत्या सुरक्षित राहाव्यात म्हणून वस्तू हटवल्या जात नाहीत, फक्त बंद होतात" />
      <form className="panel row wrap end-align" onSubmit={add}>
        <label className="field grow">नवीन वस्तूचे नाव<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
        <label className="field">एकक<select value={unit} onChange={(e) => setUnit(e.target.value)}>{Object.entries(UNIT_LABELS).map(([k, v]) => <option key={k} value={k}>{v} ({k})</option>)}</select></label>
        <button className="btn pri">+ जोडा</button>
      </form>
      <section className="panel">
        {!rows ? <Spinner /> : rows.length === 0 ? <Empty>अजून वस्तू नाहीत.</Empty> : (
          <div className="scroll"><table className="tbl">
            <thead><tr><th>वस्तू</th><th>एकक</th><th>स्थिती</th><th /></tr></thead>
            <tbody>{rows.map((m) => (
              <tr key={m._id} className={m.status === 'disabled' ? 'dim' : ''}>
                <td>{m.name}</td>
                <td><select value={m.unit} onChange={(e) => upd(m, { unit: e.target.value })}>{Object.entries(UNIT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></td>
                <td><span className={`badge ${m.status}`}>{m.status === 'active' ? 'सक्रिय' : 'बंद'}</span></td>
                <td className="r"><button className="btn sm" onClick={() => upd(m, { status: m.status === 'active' ? 'disabled' : 'active' })}>{m.status === 'active' ? 'बंद करा' : 'सुरू करा'}</button></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </section>
    </>
  );
}
