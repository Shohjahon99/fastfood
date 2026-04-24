import { useRef } from 'react';

const fmt = (n) => new Intl.NumberFormat('uz-UZ').format(Math.round(n || 0));
const PAY = { cash: 'Naqd pul', card: 'Plastik karta', payme: 'Payme', click: 'Click', uzum: 'Uzum' };
const TYPE = { dine_in: 'Zal', takeaway: 'Olib ketish', delivery: 'Yetkazish' };

export default function Receipt({ order, onClose }) {
  const printRef = useRef();

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=380,height=600');
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <title>Chek #${order.orderNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; font-size: 13px; color: #000; background: #fff; width: 80mm; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .big { font-size: 28px; font-weight: 900; letter-spacing: 2px; }
          .medium { font-size: 18px; font-weight: bold; }
          .line { border-top: 1px dashed #000; margin: 8px 0; }
          .row { display: flex; justify-content: space-between; padding: 2px 0; }
          .total-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; margin-top: 4px; }
          .footer { text-align: center; font-size: 11px; color: #555; margin-top: 8px; }
          p { margin: 2px 0; }
        </style>
      </head>
      <body>${content}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  if (!order) return null;

  const now = new Date();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up">

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg">🧾 Chek</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              🖨️ Chop etish
            </button>
            <button onClick={onClose} className="w-9 h-9 bg-gray-200 hover:bg-gray-300 rounded-xl flex items-center justify-center text-gray-600 transition-colors">✕</button>
          </div>
        </div>

        {/* Chek preview */}
        <div className="overflow-y-auto max-h-[70vh]">
          <div
            ref={printRef}
            className="p-5 font-mono text-sm"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            {/* Restoran nomi */}
            <div className="center">
              <p className="bold" style={{ fontSize: 16 }}>🍔 FASTFOOT</p>
              <p style={{ fontSize: 11, color: '#666' }}>Professional Tezkor Ovqatlanish</p>
            </div>

            <div className="line" style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

            {/* Buyurtma raqami — KATTA */}
            <div className="center" style={{ margin: '10px 0' }}>
              <p style={{ fontSize: 11, color: '#666' }}>BUYURTMA RAQAMI</p>
              <p className="big" style={{ fontSize: 40, fontWeight: 900, letterSpacing: 3, color: '#000', lineHeight: 1.1 }}>
                #{order.orderNumber?.split('-').pop() || order.id}
              </p>
              <p style={{ fontSize: 11, color: '#888', fontFamily: 'monospace' }}>{order.orderNumber}</p>
            </div>

            <div className="line" style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />

            {/* Ma'lumotlar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: 12 }}>
              <span>Sana:</span>
              <span className="bold">{now.toLocaleDateString('uz-UZ')} {now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: 12 }}>
              <span>Tur:</span>
              <span className="bold">{TYPE[order.type] || order.type}</span>
            </div>
            {order.tableNumber && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: 12 }}>
                <span>Stol:</span>
                <span className="bold">{order.tableNumber}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: 12 }}>
              <span>To'lov:</span>
              <span className="bold">{PAY[order.paymentMethod] || order.paymentMethod}</span>
            </div>
            {order.cashier?.name && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: 12 }}>
                <span>Kassir:</span>
                <span className="bold">{order.cashier.name}</span>
              </div>
            )}

            <div className="line" style={{ borderTop: '1px dashed #000', margin: '10px 0 6px' }} />

            {/* Mahsulotlar */}
            <div>
              {order.items?.map((item, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ fontWeight: 'bold', fontSize: 13 }}>{item.product?.name || item.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555', fontSize: 12 }}>
                    <span>{fmt(item.price)} × {item.quantity}</span>
                    <span style={{ fontWeight: 'bold', color: '#000' }}>{fmt(item.total)} so'm</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="line" style={{ borderTop: '1px dashed #000', margin: '10px 0 6px' }} />

            {/* Summa */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '2px 0' }}>
              <span>Mahsulotlar:</span>
              <span>{fmt(order.subtotal)} so'm</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '2px 0' }}>
              <span>QQS (12%):</span>
              <span>{fmt(order.tax)} so'm</span>
            </div>

            <div className="line" style={{ borderTop: '2px solid #000', margin: '8px 0 4px' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 900 }}>
              <span>JAMI:</span>
              <span>{fmt(order.total)} SO'M</span>
            </div>

            <div className="line" style={{ borderTop: '1px dashed #000', margin: '12px 0 8px' }} />

            {/* Footer */}
            <div className="center" style={{ textAlign: 'center', fontSize: 11, color: '#888' }}>
              <p>Xaridingiz uchun rahmat! 🙏</p>
              <p>Yana tashrif buyuring!</p>
            </div>
          </div>
        </div>

        {/* Alt tugmalar */}
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl text-sm transition-colors">
            Yopish
          </button>
          <button onClick={handlePrint} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
            🖨️ Chop etish
          </button>
        </div>
      </div>
    </div>
  );
}
