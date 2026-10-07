import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { PageHead, Spinner, Empty, useToast, fmtDate, fmtQty } from '../ui.jsx';

export default function Dashboard() {
  const [d, setD] = useState(null);
  const { user, can } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  useEffect(() => { api('/dashboard').then(setD).catch((e) => toast(e.message, 'err')); }, []);
  if (!d) return <Spinner />;

  const stats = [
    ['आजच्या पावत्या', d.todayReceipts, 'Receipts today'],
    ['आजचे एकूण प्रमाण', fmtQty(d.todayQuantity), 'Quantity today'],
    ['एकूण पावत्या', d.totalReceipts, 'All receipts'],
    ['सक्रिय वस्तू', d.totalMaterials, 'Active materials'],
  ];
  return (
    <>
      <PageHead title={`नमस्कार, ${user.name}`} sub="आजचा धान्य कोठार आढावा">
        {can('admin', 'operator') && <Link className="btn pri" to="/receipts/new">+ नवीन पावती</Link>}
      </PageHead>
      <div className="strip">
        {stats.map(([mr, v, en]) => (
          <div key={en}><b>{v}</b><span>{mr}</span><small>{en}</small></div>
        ))}
      </div>
      <section className="panel">
        <h3>अलीकडील पावत्या</h3>
        {d.recentReceipts.length === 0 ? <Empty>अजून एकही पावती तयार केलेली नाही.</Empty> : (
          <div className="scroll"><table className="tbl">
            <thead><tr><th>पावती क्र.</th><th>दिनांक</th><th>दाता</th><th className="r">प्रमाण</th></tr></thead>
            <tbody>
              {d.recentReceipts.map((r) => (
                <tr key={r._id} className="click" onClick={() => nav(`/receipts/${r._id}`)}>
                  <td className="mono">{r.receiptNumber}</td><td>{fmtDate(r.date)}</td>
                  <td>{r.donor?.name}</td><td className="r">{fmtQty(r.totalQuantity)}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </section>
    </>
  );
}
