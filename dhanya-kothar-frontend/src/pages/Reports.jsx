import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { PageHead, Spinner, Empty, useToast, todayIST, fmtDate, fmtQty, UNIT_LABELS } from '../ui.jsx';

const MONTHS = ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'];

function Materials({ rows }) {
  if (!rows.length) return <Empty>या कालावधीत कोणतीही नोंद नाही.</Empty>;
  return (
    <div className="scroll"><table className="tbl">
      <thead><tr><th>वस्तू</th><th className="r">एकूण प्रमाण</th><th>एकक</th><th className="r">पावत्या</th></tr></thead>
      <tbody>{rows.map((m, i) => (
        <tr key={i}><td>{m.material}</td><td className="r">{fmtQty(m.totalQuantity)}</td><td>{m.unitLabel || UNIT_LABELS[m.unit]}</td><td className="r">{m.receiptCount}</td></tr>
      ))}</tbody>
    </table></div>
  );
}

export default function Reports() {
  const toast = useToast();
  const t = todayIST();
  const [tab, setTab] = useState('daily');
  const [date, setDate] = useState(t);
  const [weekDate, setWeekDate] = useState(t);
  const [year, setYear] = useState(+t.slice(0, 4));
  const [month, setMonth] = useState(+t.slice(5, 7));
  const [from, setFrom] = useState(t.slice(0, 8) + '01');
  const [to, setTo] = useState(t);
  const [d, setD] = useState(null);

  useEffect(() => {
    setD(null);
    const req = tab === 'daily' ? api('/reports/daily', { params: { date } })
      : tab === 'weekly' ? api('/reports/weekly', { params: { date: weekDate } })
      : tab === 'monthly' ? api('/reports/monthly', { params: { year, month } })
      : api('/reports/material-wise', { params: { from, to } });
    req.then(setD).catch((e) => toast(e.message, 'err'));
  }, [tab, date, weekDate, year, month, from, to]);

  const perDay = d?.perDay || [];
  const materials = d?.materials || [];
  const receipts = d?.receipts || [];
  const max = perDay.length ? Math.max(1, ...perDay.map((x) => x.quantity)) : 1;
  return (
    <>
      <PageHead title="अहवाल" sub="दैनिक, मासिक आणि वस्तूनिहाय">
        <button className="btn" onClick={() => window.print()}>🖨 प्रिंट</button>
      </PageHead>
      <div className="tabs no-print">
        {[['daily', 'दैनिक'], ['weekly', 'साप्ताहिक'], ['monthly', 'मासिक'], ['material', 'वस्तूनिहाय']].map(([k, l]) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      <section className="panel">
        <div className="row wrap no-print">
          {tab === 'daily' && <label className="field">दिनांक<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>}
          {tab === 'weekly' && <label className="field">साप्ताहिकStartingDay<input type="date" value={weekDate} onChange={(e) => setWeekDate(e.target.value)} /></label>}
          {tab === 'monthly' && <>
            <label className="field">महिना<select value={month} onChange={(e) => setMonth(+e.target.value)}>{MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}</select></label>
            <label className="field">वर्ष<input type="number" value={year} onChange={(e) => setYear(+e.target.value)} /></label>
          </>}
          {tab === 'material' && <>
            <label className="field">पासून<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
            <label className="field">पर्यंत<input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
          </>}
        </div>
        {!d ? <Spinner /> : (
          <>
            {tab !== 'material' && <div className="strip slim"><div><b>{d.totalReceipts}</b><span>एकूण पावत्या</span></div><div><b>{fmtQty(d.totalQuantity)}</b><span>एकूण प्रमाण</span></div></div>}
            {(tab === 'weekly' || tab === 'monthly') && perDay.length > 0 && (
              <>
                <p className="sub">कालावधी: {fmtDate(d.from)} – {fmtDate(d.to)}</p>
                <div className="bars" aria-label="Per day quantity">
                  {perDay.map((x) => (
                    <div key={x.date} title={`${fmtDate(x.date)}: ${fmtQty(x.quantity)} (${x.receipts} पावत्या)`}>
                      <i style={{ height: `${(x.quantity / max) * 100}%` }} /><span>{x.date.slice(8)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            <h3>वस्तूनिहाय तपशील</h3>
            <Materials rows={materials} />
            {tab === 'daily' && receipts.length > 0 && (<>
              <h3>पावत्या</h3>
              <div className="scroll"><table className="tbl"><thead><tr><th>पावती क्र.</th><th>दाता</th><th className="r">प्रमाण</th></tr></thead>
                <tbody>{receipts.map((r) => <tr key={r._id}><td className="mono">{r.receiptNumber}</td><td>{r.donor?.name}</td><td className="r">{fmtQty(r.totalQuantity)}</td></tr>)}</tbody>
              </table></div>
            </>)}
          </>
        )}
      </section>
    </>
  );
}
