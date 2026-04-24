import { useEffect, useState } from 'react';
import { orderAPI, reportAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../../components/common/StatCard';
import toast from 'react-hot-toast';

export default function ERPDashboard() {
  const { user } = useAuth();
  const [todayOrders, setTodayOrders] = useState([]);
  const [profit, setProfit] = useState(null);
  const [loading, setLoading] = useState(true);
  const fmt = (n) => new Intl.NumberFormat('uz-UZ').format(Math.round(n || 0));
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    Promise.all([
      orderAPI.getAll({ date: today, limit: 10 }),
      reportAPI.getProfit(),
    ]).then(([ordersRes, profitRes]) => {
      setTodayOrders(ordersRes.data);
      setProfit(profitRes.data);
    }).catch(() => toast.error('Yuklanmadi'))
      .finally(() => setLoading(false));
  }, []);

  const statusColors = { pending: 'badge-yellow', preparing: 'badge-blue', ready: 'badge-green', delivered: 'badge-green', cancelled: 'badge-red' };
  const statusLabels = { pending: 'Kutmoqda', preparing: 'Tayyorlanmoqda', ready: 'Tayyor', delivered: 'Yetkazildi', cancelled: 'Bekor' };
  const todaySales = todayOrders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + parseFloat(o.total), 0);

  if (loading) return <div className="flex items-center justify-center h-full"><div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Xush kelibsiz, {user?.name}!</h1>
        <p className="text-gray-500 text-sm mt-0.5">{new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Bugungi buyurtmalar" value={todayOrders.length + ' ta'} icon="📋" color="blue" />
        <StatCard title="Bugungi savdo" value={fmt(todaySales) + ' so\'m'} icon="💰" color="green" />
        <StatCard title="Bu oy daromad" value={fmt(profit?.revenue) + ' so\'m'} icon="📈" color="orange" />
        <StatCard title="Sof foyda" value={fmt(profit?.profit) + ' so\'m'} icon="💎" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Bugungi buyurtmalar</h2>
            <a href="/erp/pos" className="text-sm text-orange-500 hover:text-orange-600 font-medium">+ Yangi buyurtma</a>
          </div>
          {todayOrders.length === 0 ? <p className="text-gray-400 text-center py-6">Buyurtma yo'q</p>
          : <div className="space-y-2">
              {todayOrders.slice(0, 6).map(o => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{o.orderNumber}</p>
                    <p className="text-xs text-gray-400">{o.type === 'dine_in' ? '🪑 Zalda' : o.type === 'takeaway' ? '🥡 Olib ketish' : '🛵 Yetkazish'}</p>
                  </div>
                  <span className={statusColors[o.status] || 'badge-blue'}>{statusLabels[o.status]}</span>
                  <span className="font-semibold text-sm text-gray-900">{fmt(o.total)} so'm</span>
                </div>
              ))}
            </div>
          }
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Tezkor havolalar</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/erp/pos', icon: '🖥️', label: 'Kassa (POS)', color: 'bg-orange-50 hover:bg-orange-100 text-orange-700' },
              { href: '/erp/orders', icon: '📋', label: 'Buyurtmalar', color: 'bg-blue-50 hover:bg-blue-100 text-blue-700' },
              { href: '/erp/products', icon: '🍔', label: 'Menyu', color: 'bg-green-50 hover:bg-green-100 text-green-700' },
              { href: '/erp/inventory', icon: '📦', label: 'Ombor', color: 'bg-purple-50 hover:bg-purple-100 text-purple-700' },
              { href: '/erp/customers', icon: '👤', label: 'Mijozlar', color: 'bg-pink-50 hover:bg-pink-100 text-pink-700' },
              { href: '/erp/reports', icon: '📊', label: 'Hisobotlar', color: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700' },
            ].map(({ href, icon, label, color }) => (
              <a key={href} href={href} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${color}`}>
                <span className="text-2xl">{icon}</span>
                <span className="font-medium text-sm">{label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
