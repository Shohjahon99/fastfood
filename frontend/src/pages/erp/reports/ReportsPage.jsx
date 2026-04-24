import { useEffect, useState } from 'react';
import { reportAPI } from '../../../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [sales, setSales] = useState([]);
  const [profit, setProfit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0]; });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const fmt = (n) => new Intl.NumberFormat('uz-UZ').format(Math.round(n || 0));

  const load = () => {
    setLoading(true);
    Promise.all([reportAPI.getSales({ startDate, endDate }), reportAPI.getProfit({ startDate, endDate })])
      .then(([sRes, pRes]) => { setSales(sRes.data); setProfit(pRes.data); })
      .catch(() => toast.error('Yuklanmadi'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [startDate, endDate]);

  const chartData = sales.orders?.map(o => ({
    date: new Date(o.dataValues.date).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' }),
    daromad: Math.round(parseFloat(o.dataValues.revenue || 0) / 1000),
    buyurtma: parseInt(o.dataValues.orderCount || 0),
  })) || [];

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Hisobotlar</h1></div>

      <div className="flex gap-3 items-end">
        <div><label className="block text-xs text-gray-500 mb-1">Boshlanish</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input" /></div>
        <div><label className="block text-xs text-gray-500 mb-1">Tugash</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input" /></div>
        <button onClick={load} className="btn-primary">Yangilash</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Jami daromad', value: fmt(profit?.revenue) + ' so\'m', icon: '💰', color: 'text-green-600' },
          { label: 'Jami xarajat', value: fmt(profit?.expenses) + ' so\'m', icon: '💸', color: 'text-red-600' },
          { label: 'Sof foyda', value: fmt(profit?.profit) + ' so\'m', icon: '📈', color: 'text-orange-600' },
          { label: 'Foyda %', value: (profit?.margin || 0) + '%', icon: '📊', color: 'text-purple-600' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="card text-center">
            <p className="text-2xl mb-2">{icon}</p>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Kunlik daromad (ming so'm)</h2>
          {loading ? <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>
          : <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [v + ' ming so\'m', 'Daromad']} />
                <Bar dataKey="daromad" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          }
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Kunlik buyurtmalar soni</h2>
          {loading ? <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>
          : <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [v + ' ta', 'Buyurtmalar']} />
                <Line type="monotone" dataKey="buyurtma" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          }
        </div>
      </div>

      {sales.topProducts?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Top 10 mahsulotlar</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">{['#', 'Mahsulot', 'Miqdor', 'Daromad'].map(h => <th key={h} className="py-2 px-3 text-left text-xs font-medium text-gray-500">{h}</th>)}</tr></thead>
              <tbody>{sales.topProducts.map((p, i) => (
                <tr key={p.productId} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-400">{i + 1}</td>
                  <td className="py-2 px-3 font-medium">{p.product?.name}</td>
                  <td className="py-2 px-3 text-gray-600">{p.dataValues?.totalQty} ta</td>
                  <td className="py-2 px-3 font-semibold text-green-600">{fmt(p.dataValues?.totalRevenue)} so'm</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
