import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { PageHead, Spinner, useToast, fmtDate, fmtQty, totalsText, fmtDateTime } from '../ui.jsx';

const PAGE = { A4: 'A4', A5: 'A5', THERMAL58: '58mm auto', THERMAL80: '80mm auto' };

export default function ReceiptView() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const { can } = useAuth();
  const toast = useToast();
  const [d, setD] = useState(null);
  const [first, setFirst] = useState(sp.get('new') === '1');

  useEffect(() => { api(`/receipts/${id}`).then(setD).catch((e) => toast(e.message, 'err')); }, [id]);
  if (!d) return <Spinner />;
  const { receipt: r, settings: s } = d;

  const print = async () => {
    // First print of a freshly created receipt is the original; later prints are logged as reprints.
    if (!first && can('admin', 'operator')) {
      try {
        const x = await api(`/receipts/${id}/reprint`, { method: 'POST' });
        setD((o) => ({ ...o, receipt: { ...o.receipt, reprintCount: x.receipt.reprintCount } }));
      } catch (e) { return toast(e.message, 'err'); }
    }
    setFirst(false);
    setTimeout(() => window.print(), 80);
  };

  return (
    <>
      <style>{`@media print{@page{size:${PAGE[s.paperSize] || 'A5'};margin:8mm}}`}</style>
      <PageHead title={r.receiptNumber} sub={r.reprintCount ? `पुनर्मुद्रण: ${r.reprintCount} वेळा` : 'मूळ पावती'}>
        <Link className="btn" to="/receipts">‹ यादी</Link>
        {can('admin', 'operator') && <button className="btn pri" onClick={print}>🖨 प्रिंट</button>}
        {can('admin', 'operator') && <Link className="btn" to="/receipts/new">+ नवीन</Link>}
      </PageHead>

      <article className={`sheet ${s.paperSize === 'THERMAL58' ? 't58' : s.paperSize === 'THERMAL80' ? 't80' : ''}`}>
        <div className="sh-top">{s.receiptHeaderTop}</div>
        <h2>{s.organizationName}</h2>
        <div className="sh-meta">{[s.trustNumber, s.address, s.phone].filter(Boolean).join(' | ')}</div>
        <div className="sh-title">{s.receiptTitle}</div>
        <div className="sh-row"><span>पावती क्र.: <b>{r.receiptNumber}</b></span><span>दिनांक: <b>{fmtDate(r.date)}</b></span></div>
        <div className="sh-donor">
          <div>दाता: <b>{r.donor.name}</b></div>
          {r.donor.mobile && <div>मोबाईल: {r.donor.mobile}</div>}
          {r.donor.address && <div>पत्ता: {r.donor.address}</div>}
        </div>
        <table className="sh-tbl">
          <thead><tr><th>अ.क्र.</th><th>वस्तू</th><th className="r">प्रमाण</th><th>एकक</th></tr></thead>
          <tbody>
            {r.items.map((it, i) => (
              <tr key={i}><td>{i + 1}</td><td>{it.material}</td><td className="r">{fmtQty(it.quantity)}</td><td>{it.unitLabel}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="sh-total">एकूण: <b>{totalsText(r.totalsByUnit)}</b></div>
        {r.remarks && <div className="sh-rem">शेरा: {r.remarks}</div>}
        <div className="sh-sign"><span>दात्याची सही</span><span>स्वीकारणाऱ्याची सही</span></div>
        <div className="sh-foot">धन्यवाद! ॥ श्री स्वामी समर्थ ॥</div>
      </article>

      <p className="muted no-print" style={{ marginTop: 12 }}>
        तयार केले: {r.createdBy?.name || '—'} · {fmtDateTime(r.createdAt)}
        {r.editHistory?.length > 0 && ` · दुरुस्त्या: ${r.editHistory.length}`}
      </p>
    </>
  );
}
