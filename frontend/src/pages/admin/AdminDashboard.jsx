import { useEffect, useState } from 'react';
import { reportAPI, orderAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../../components/common/StatCard';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [profit, setProfit] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const fmt = (n) => new Intl.NumberFormat('uz-UZ').format(Math.round(n || 0)) + ' so\'m';

  useEffect(() => {
    Promise.all([
      reportAPI.getProfit(),
      orderAPI.getAll({ limit: 5 }),
    ]).then(([profitRes, ordersRes]) => {
      setProfit(profitRes.data);
      setRecentOrders(ordersRes.data);
    }).catch(() => toast.error('Yuklanmadi'))
      .finally(() => setLoading(false));
  }, []);

  const statusColors = { pending: 'badge-yellow', preparing: 'badge-blue', ready: 'badge-green', delivered: 'badge-green', cancelled: 'badge-red' };
  const statusLabels = { pending: 'Kutmoqda', preparing: 'Tayyorlanmoqda', ready: 'Tayyor', delivered: 'Yetkazildi', cancelled: 'Bekor' };

  if (loading) return <div className="flex items-center justify-center h-full"><div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Xush kelibsiz, {user?.name}!</h1>
        <p className="text-gray-500 text-sm mt-0.5">Filial boshqaruv paneli • {user?.branch?.name}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Bu oy daromad" value={fmt(profit?.revenue)} icon="💰" color="green" />
        <StatCard title="Bu oy xarajat" value={fmt(profit?.expenses)} icon="💸" color="red" />
        <StatCard title="Sof foyda" value={fmt(profit?.profit)} icon="📈" color="orange" />
        <StatCard title="Foyda foizi" value={(profit?.margin || 0) + '%'} icon="📊" color="purple" />
      </div>

      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-4">So'nggi buyurtmalar</h2>
        {recentOrders.length === 0 ? (
          <p className="text-gray-400 text-center py-6">Buyurtmalar yo'q</p>
        ) : (
          <div className="space-y-2">
            {recentOrders.map(o => (
              <div key={o.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-sm">{o.orderNumber}</p>
                  <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleString('uz-UZ')}</p>
                </div>
                <span className={statusColors[o.status]}>{statusLabels[o.status]}</span>
                <span className="font-semibold text-sm">{fmt(o.total)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
