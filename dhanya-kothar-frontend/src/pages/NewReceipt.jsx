import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { PageHead, useToast, todayIST, totalsText, UNIT_LABELS } from '../ui.jsx';

const blank = () => ({ material: '', materialId: '', quantity: '', unit: 'Kg' });

export default function NewReceipt() {
  const nav = useNavigate();
  const toast = useToast();
  const [mats, setMats] = useState([]);
  const [donor, setDonor] = useState({ name: '', mobile: '', address: '' });
  const [date, setDate] = useState(todayIST());
  const [items, setItems] = useState([blank()]);
  const [remarks, setRemarks] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { api('/materials').then((r) => setMats(r.materials)); }, []);

  const setItem = (i, patch) => setItems((a) => a.map((x, k) => (k === i ? { ...x, ...patch } : x)));
  const pick = (i, name) => {
    const m = mats.find((x) => x.name === name);
    setItem(i, m ? { material: name, materialId: m._id, unit: m.unit } : { material: name, materialId: '' });
  };
  const totals = useMemo(() => {
    const map = {};
    items.forEach((it) => { if (+it.quantity > 0) map[it.unit] = (map[it.unit] || 0) + +it.quantity; });
    return Object.entries(map).map(([unit, quantity]) => ({ unit, quantity }));
  }, [items]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { date, donor, remarks, items: items.map((i) => ({ ...i, quantity: Number(i.quantity), materialId: i.materialId || undefined })) };
      const r = await api('/receipts', { method: 'POST', body });
      toast(`पावती ${r.receipt.receiptNumber} तयार झाली`);
      nav(`/receipts/${r.receipt._id}?new=1`);
    } catch (ex) { toast(ex.message, 'err'); }
    finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit}>
      <PageHead title="नवीन पावती" sub="पावती क्रमांक आपोआप तयार होईल" />
      <section className="panel">
        <h3>दात्याची माहिती</h3>
        <div className="grid3">
          <label className="field">दाता नाव *<input value={donor.name} onChange={(e) => setDonor({ ...donor, name: e.target.value })} required /></label>
          <label className="field">मोबाईल<input inputMode="numeric" maxLength={14} value={donor.mobile} onChange={(e) => setDonor({ ...donor, mobile: e.target.value })} /></label>
          <label className="field">दिनांक<input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></label>
        </div>
        <label className="field">पत्ता<input value={donor.address} onChange={(e) => setDonor({ ...donor, address: e.target.value })} /></label>
      </section>

      <section className="panel">
        <h3>वस्तू</h3>
        <datalist id="mats">{mats.map((m) => <option key={m._id} value={m.name} />)}</datalist>
        <div className="items">
          {items.map((it, i) => (
            <div className="irow" key={i}>
              <label className="field">वस्तू<input list="mats" value={it.material} onChange={(e) => pick(i, e.target.value)} placeholder="निवडा किंवा लिहा" required /></label>
              <label className="field">प्रमाण<input type="number" step="any" min="0" value={it.quantity} onChange={(e) => setItem(i, { quantity: e.target.value })} required /></label>
              <label className="field">एकक
                <select value={it.unit} onChange={(e) => setItem(i, { unit: e.target.value })}>
                  {Object.entries(UNIT_LABELS).map(([k, v]) => <option key={k} value={k}>{v} ({k})</option>)}
                </select>
              </label>
              <button type="button" className="btn ghost sm" disabled={items.length === 1} onClick={() => setItems(items.filter((_, k) => k !== i))} aria-label="Remove">✕</button>
            </div>
          ))}
        </div>
        <button type="button" className="btn" onClick={() => setItems([...items, blank()])}>+ आणखी वस्तू</button>
        <div className="total">एकूण: <b>{totalsText(totals)}</b></div>
      </section>

      <section className="panel">
        <label className="field">शेरा (Remarks)<textarea rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} /></label>
      </section>
      <div className="row end">
        <button type="button" className="btn" onClick={() => nav(-1)}>रद्द करा</button>
        <button className="btn pri" disabled={busy}>{busy ? 'जतन होत आहे…' : 'पावती जतन करा'}</button>
      </div>
    </form>
  );
}
