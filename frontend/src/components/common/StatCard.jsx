export default function StatCard({ title, value, icon, color = 'orange', change, changeType = 'up', sub }) {
  const styles = {
    orange: { bg: 'bg-orange-50', icon: 'text-orange-500', border: 'border-orange-100' },
    green:  { bg: 'bg-emerald-50', icon: 'text-emerald-500', border: 'border-emerald-100' },
    blue:   { bg: 'bg-blue-50', icon: 'text-blue-500', border: 'border-blue-100' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-500', border: 'border-purple-100' },
    red:    { bg: 'bg-red-50', icon: 'text-red-500', border: 'border-red-100' },
  };
  const s = styles[color] || styles.orange;
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${s.bg} ${s.border} border flex items-center justify-center text-2xl`}>
          {icon}
        </div>
        {change && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${changeType === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {changeType === 'up' ? '↑' : '↓'} {change}
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}
