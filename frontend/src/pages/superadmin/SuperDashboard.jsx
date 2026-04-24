import { useEffect, useState } from 'react';
import { superAdminAPI } from '../../api';
import StatCard from '../../components/common/StatCard';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function SuperDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const fmt = (n) => new Intl.NumberFormat('uz-UZ').format(Math.round(n || 0));

  useEffect(() => {
    superAdminAPI.getDashboard()
      .then(res => setStats(res.data))
      .catch(() => toast.error('Dashboard ma\'lumotlari yuklanmadi'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 font-medium">Yuklanmoqda...</p>
      </div>
    </div>
  );

  return (
    <div className="p-7 space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Xush kelibsiz, {user?.name}! 👋</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-2xl px-5 py-3 text-center">
          <p className="text-xs text-orange-500 font-semibold uppercase tracking-wider">Bugungi savdo</p>
          <p className="text-2xl font-bold text-orange-600 mt-0.5">{fmt(stats?.todaySales)} <span className="text-sm font-normal">so'm</span></p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard title="Jami filiallar" value={stats?.totalBranches || 0} icon="🏪" color="blue" sub={`${stats?.activeBranches} ta faol`} />
        <StatCard title="Jami xodimlar" value={stats?.totalUsers || 0} icon="👥" color="purple" />
        <StatCard title="Bu oy savdo" value={fmt(stats?.monthSales) + ' so\'m'} icon="💰" color="green" />
        <StatCard title="Bu oy buyurtma" value={stats?.monthOrders || 0} icon="📋" color="orange" sub="ta buyurtma" />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Branch ranking */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">🏆 Filiallar reytingi</h2>
            <span className="badge badge-orange">Bu oy</span>
          </div>
          <div className="space-y-3">
            {stats?.branchStats?.slice(0, 5).map((b, i) => {
              const revenue = parseFloat(b.dataValues?.revenue || 0);
              const maxRevenue = parseFloat(stats.branchStats[0]?.dataValues?.revenue || 1);
              const pct = Math.round((revenue / maxRevenue) * 100);
              return (
                <div key={b.id} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-yellow-100 text-yellow-700' :
                    i === 1 ? 'bg-gray-100 text-gray-600' :
                    i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'
                  }`}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{b.name}</p>
                      <p className="text-sm font-bold text-green-600 ml-2 flex-shrink-0">{fmt(revenue)} so'm</p>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
            {(!stats?.branchStats?.length) && (
              <p className="text-center text-gray-400 py-6 text-sm">Hali buyurtmalar yo'q</p>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-5">⚡ Tezkor amallar</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/superadmin/branches', icon: '🏪', label: 'Filial qo\'shish', color: 'bg-blue-50 hover:bg-blue-100 border-blue-100 text-blue-700' },
              { href: '/superadmin/users', icon: '👤', label: 'Xodim qo\'shish', color: 'bg-purple-50 hover:bg-purple-100 border-purple-100 text-purple-700' },
              { href: '/superadmin/reports', icon: '📊', label: 'Hisobot ko\'rish', color: 'bg-green-50 hover:bg-green-100 border-green-100 text-green-700' },
              { href: '/erp/pos', icon: '🖥️', label: 'Kassaga o\'tish', color: 'bg-orange-50 hover:bg-orange-100 border-orange-100 text-orange-700' },
            ].map(a => (
              <a key={a.href} href={a.href}
                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${a.color}`}>
                <span className="text-2xl">{a.icon}</span>
                <span className="font-semibold text-sm">{a.label}</span>
              </a>
            ))}
          </div>

          <div className="mt-5 bg-gradient-to-r from-navy-900 to-navy-800 rounded-2xl p-5"
            style={{ background: 'linear-gradient(135deg, #1a2744, #0f1a2e)' }}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔐</span>
              <div>
                <p className="text-white font-bold text-sm">Xavfsizlik holati</p>
                <p className="text-blue-300 text-xs mt-0.5">Helmet + Rate Limit + JWT faol</p>
              </div>
              <span className="ml-auto badge badge-green">✓ Himoyalangan</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
