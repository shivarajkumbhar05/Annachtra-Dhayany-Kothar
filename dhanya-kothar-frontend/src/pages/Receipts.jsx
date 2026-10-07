import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { PageHead, Spinner, Empty, useToast, fmtDate, totalsText } from '../ui.jsx';

const F0 = { receiptNumber: '', donorName: '', mobile: '', date: '' };

export default function Receipts() {
  const nav = useNavigate();
  const toast = useToast();
  const [f, setF] = useState(F0);
  const [q, setQ] = useState(F0);
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(null);
    api('/receipts', { params: { ...q, page, limit: 15 } }).then(setData).catch((e) => toast(e.message, 'err'));
  }, [q, page]);

  const search = (e) => { e.preventDefault(); setPage(1); setQ(f); };
  const reset = () => { setF(F0); setQ(F0); setPage(1); };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  return (
    <>
      <PageHead title="पावत्या" sub="पावती शोधा, पहा आणि प्रिंट करा" />
      <form className="panel filters" onSubmit={search}>
        <label className="field">पावती क्र.<input value={f.receiptNumber} onChange={set('receiptNumber')} placeholder="DK-2026-00001" /></label>
        <label className="field">दाता नाव<input value={f.donorName} onChange={set('donorName')} /></label>
        <label className="field">मोबाईल<input value={f.mobile} onChange={set('mobile')} /></label>
        <label className="field">दिनांक<input type="date" value={f.date} onChange={set('date')} /></label>
        <div className="row"><button className="btn pri">शोधा</button><button type="button" className="btn" onClick={reset}>साफ करा</button></div>
      </form>
      <section className="panel">
        {!data ? <Spinner /> : data.receipts.length === 0 ? <Empty>कोणतीही पावती सापडली नाही.</Empty> : (
          <>
            <div className="scroll"><table className="tbl">
              <thead><tr><th>पावती क्र.</th><th>दिनांक</th><th>दाता</th><th>मोबाईल</th><th className="r">एकूण</th></tr></thead>
              <tbody>
                {data.receipts.map((r) => (
                  <tr key={r._id} className="click" onClick={() => nav(`/receipts/${r._id}`)}>
                    <td className="mono">{r.receiptNumber}</td><td>{fmtDate(r.date)}</td>
                    <td>{r.donor?.name}</td><td>{r.donor?.mobile || '—'}</td>
                    <td className="r">{totalsText(r.totalsByUnit)}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
            <div className="pager">
              <button className="btn sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹ मागील</button>
              <span>पान {data.pagination.page} / {data.pagination.pages || 1} · एकूण {data.pagination.total}</span>
              <button className="btn sm" disabled={page >= data.pagination.pages} onClick={() => setPage(page + 1)}>पुढील ›</button>
            </div>
          </>
        )}
      </section>
    </>
  );
}
