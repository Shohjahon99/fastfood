import { useEffect, useState } from 'react';
import { orderAPI } from '../../../api';
import toast from 'react-hot-toast';

const STATUS = { pending: ['badge-yellow', 'Kutmoqda'], preparing: ['badge-blue', 'Tayyorlanmoqda'], ready: ['badge-green', 'Tayyor'], delivered: ['badge-green', 'Yetkazildi'], cancelled: ['badge-red', 'Bekor'] };
const TYPE = { dine_in: '🪑 Zal', takeaway: '🥡 Olib ketish', delivery: '🛵 Yetkazish' };
const PAY = { cash: '💵 Naqd', card: '💳 Karta', payme: '📱 Payme', click: '📱 Click', uzum: '📱 Uzum' };

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selected, setSelected] = useState(null);
  const fmt = (n) => new Intl.NumberFormat('uz-UZ').format(Math.round(n || 0));

  const load = () => {
    setLoading(true);
    orderAPI.getAll({ status: statusFilter, date, limit: 50 })
      .then(res => setOrders(res.data))
      .catch(() => toast.error('Yuklanmadi'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [statusFilter, date]);

  const updateStatus = async (id, status) => {
    try {
      await orderAPI.updateStatus(id, { status });
      toast.success('Holat yangilandi');
      load();
      if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
    } catch { toast.error('Xatolik'); }
  };

  const nextStatus = { pending: 'preparing', preparing: 'ready', ready: 'delivered' };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-gray-900">Buyurtmalar</h1><p className="text-gray-500 text-sm">{orders.length} ta buyurtma</p></div>
        </div>

        <div className="flex gap-3">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input max-w-[160px]" />
          <select className="input max-w-[200px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Barcha holatlar</option>
            {Object.entries(STATUS).map(([v, [, l]]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>
          : <div className="grid grid-cols-1 gap-3">
              {orders.map(o => (
                <div key={o.id} onClick={() => setSelected(o)} className={`card cursor-pointer hover:shadow-md transition-all ${selected?.id === o.id ? 'ring-2 ring-orange-500' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{o.orderNumber}</p>
                        <p className="text-sm text-gray-500">{TYPE[o.type]} {o.tableNumber ? `• Stol ${o.tableNumber}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={STATUS[o.status]?.[0]}>{STATUS[o.status]?.[1]}</span>
                      <div className="text-right">
                        <p className="font-bold text-orange-500">{fmt(o.total)} so'm</p>
                        <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      {nextStatus[o.status] && (
                        <button onClick={(e) => { e.stopPropagation(); updateStatus(o.id, nextStatus[o.status]); }}
                          className="btn-primary text-xs py-1 px-3">
                          {nextStatus[o.status] === 'preparing' ? '🍳 Boshla' : nextStatus[o.status] === 'ready' ? '✅ Tayyor' : '🚀 Yetkazildi'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {orders.length === 0 && <p className="text-center py-12 text-gray-400">Buyurtmalar topilmadi</p>}
            </div>
          }
        </div>
      </div>

      {selected && (
        <div className="w-80 bg-white border-l border-gray-100 p-5 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">{selected.orderNumber}</h2>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Tur:</span><span>{TYPE[selected.type]}</span></div>
            {selected.tableNumber && <div className="flex justify-between"><span className="text-gray-500">Stol:</span><span>{selected.tableNumber}</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">To'lov:</span><span>{PAY[selected.paymentMethod]}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Kassir:</span><span>{selected.cashier?.name}</span></div>
            {selected.customer && <div className="flex justify-between"><span className="text-gray-500">Mijoz:</span><span>{selected.customer.name}</span></div>}
          </div>
          <hr className="my-4" />
          <div className="space-y-2">
            {selected.items?.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-700">{item.product?.name} × {item.quantity}</span>
                <span className="font-medium">{fmt(item.total)} so'm</span>
              </div>
            ))}
          </div>
          <hr className="my-4" />
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600"><span>Jami:</span><span>{fmt(selected.subtotal)} so'm</span></div>
            <div className="flex justify-between text-gray-600"><span>QQS:</span><span>{fmt(selected.tax)} so'm</span></div>
            <div className="flex justify-between font-bold text-base text-orange-500"><span>To'lov:</span><span>{fmt(selected.total)} so'm</span></div>
          </div>
          {nextStatus[selected.status] && (
            <button onClick={() => updateStatus(selected.id, nextStatus[selected.status])} className="btn-primary w-full mt-4">
              Holatni yangilash
            </button>
          )}
        </div>
      )}
    </div>
  );
}
