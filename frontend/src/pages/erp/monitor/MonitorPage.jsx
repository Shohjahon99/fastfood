import { useEffect, useState, useCallback } from 'react';
import { orderAPI } from '../../../api';

const COLS = [
  { status: 'pending',   label: 'Qabul qilindi',  bg: '#f59e0b', light: '#fffbeb', text: '#92400e' },
  { status: 'preparing', label: 'Tayyorlanmoqda', bg: '#3b82f6', light: '#eff6ff', text: '#1e3a8a' },
  { status: 'ready',     label: '✓ Tayyor',        bg: '#22c55e', light: '#f0fdf4', text: '#14532d' },
];

export default function MonitorPage() {
  const [orders, setOrders] = useState([]);
  const today = new Date().toISOString().split('T')[0];

  const load = useCallback(async () => {
    try {
      const res = await orderAPI.getAll({ date: today, limit: 200 });
      const active = (res.data || []).filter(o =>
        ['pending', 'preparing', 'ready'].includes(o.status)
      );
      setOrders(active);
    } catch {}
  }, [today]);

  useEffect(() => {
    load();
    const t = setInterval(load, 6000);
    return () => clearInterval(t);
  }, [load]);

  const grouped = COLS.map(col => ({
    ...col,
    orders: orders
      .filter(o => o.status === col.status)
      .map(o => o.orderNumber?.split('-').pop() || String(o.id)),
  }));

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#f8fafc',
      fontFamily: 'system-ui, sans-serif',
      userSelect: 'none',
    }}>

      {/* Header */}
      <div style={{
        background: '#1e293b',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 28px',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 1 }}>
          🍔 FASTFOOT
        </div>
        <div style={{ fontSize: 15, color: '#94a3b8', fontWeight: 500 }}>
          Buyurtmalar holati
        </div>
        <div style={{ fontSize: 14, color: '#64748b' }}>
          {new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* 3 ustun */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {grouped.map((col, ci) => (
          <div key={col.status} style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            borderRight: ci < 2 ? '3px solid #e2e8f0' : 'none',
            overflow: 'hidden',
          }}>

            {/* Ustun sarlavhasi */}
            <div style={{
              background: col.bg,
              color: '#fff',
              textAlign: 'center',
              padding: '18px 12px',
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: 0.5,
              flexShrink: 0,
            }}>
              {col.label}
              <span style={{
                marginLeft: 12,
                background: 'rgba(255,255,255,0.25)',
                borderRadius: 20,
                padding: '2px 14px',
                fontSize: 18,
              }}>
                {col.orders.length}
              </span>
            </div>

            {/* Raqamlar */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              background: col.light,
              padding: '16px 12px',
              display: 'flex',
              flexWrap: 'wrap',
              alignContent: 'flex-start',
              gap: 12,
            }}>
              {col.orders.length === 0 ? (
                <div style={{
                  width: '100%',
                  textAlign: 'center',
                  paddingTop: 60,
                  color: '#cbd5e1',
                  fontSize: 48,
                }}>
                  —
                </div>
              ) : (
                col.orders.map((num, i) => (
                  <div key={i} style={{
                    background: '#fff',
                    border: `3px solid ${col.bg}`,
                    borderRadius: 16,
                    padding: '16px 24px',
                    fontSize: 52,
                    fontWeight: 900,
                    color: col.text,
                    lineHeight: 1,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    minWidth: 100,
                    textAlign: 'center',
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: -1,
                    animation: 'pop 0.3s ease',
                  }}>
                    {num}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        background: '#1e293b',
        color: '#475569',
        textAlign: 'center',
        padding: '8px',
        fontSize: 13,
        flexShrink: 0,
      }}>
        Buyurtmangiz tayyor bo'lganda chaqiramiz 🔔 &nbsp;|&nbsp; Har 6 soniyada yangilanadi
      </div>

      <style>{`
        @keyframes pop {
          0%   { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1);   opacity: 1; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>
    </div>
  );
}
