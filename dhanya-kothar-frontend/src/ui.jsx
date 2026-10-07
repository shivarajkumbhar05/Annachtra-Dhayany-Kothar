import { createContext, useCallback, useContext, useState } from 'react';

export const UNIT_LABELS = { Kg: 'कि.ग्रॅ.', Quintal: 'क्विंटल', Ton: 'टन', Gram: 'ग्रॅम', Litre: 'लि.', Bag: 'पोते', Packet: 'पॅकेट', Tin: 'डबा', Piece: 'नग' };
export const fmtDate = (d) => (d ? String(d).slice(0, 10).split('-').reverse().join('/') : '');
export const fmtQty = (n) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 3 });
export const unitText = (t) => `${fmtQty(t.quantity)} ${t.unitLabel || UNIT_LABELS[t.unit] || t.unit}`;
export const totalsText = (arr = []) => arr.map(unitText).join(' + ') || '—';
export const todayIST = () => new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
export const fmtDateTime = (d) => new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }) {
  const [t, setT] = useState(null);
  const show = useCallback((msg, type = 'ok') => {
    setT({ msg, type });
    setTimeout(() => setT(null), 3500);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {t && <div className={`toast ${t.type}`} role="status">{t.msg}</div>}
    </ToastCtx.Provider>
  );
}

export const Spinner = () => <div className="spin" aria-label="Loading" />;
export const PageHead = ({ title, sub, children }) => (
  <div className="phead no-print">
    <div><h1>{title}</h1>{sub && <p>{sub}</p>}</div>
    <div className="row">{children}</div>
  </div>
);
export const Empty = ({ children }) => <div className="empty">{children}</div>;
export function Modal({ title, onClose, children }) {
  return (
    <div className="overlay" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="mhead"><h3>{title}</h3><button className="btn ghost sm" onClick={onClose}>✕</button></div>
        {children}
      </div>
    </div>
  );
}
