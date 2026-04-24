import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.svg';

const ALL_ERP_NAV = [
  { key: 'dashboard', path: '/erp', label: 'Dashboard', icon: '📊', end: true },
  { key: 'pos',       path: '/erp/pos',       label: 'Kassa (POS)',  icon: '🖥️' },
  { key: 'orders',    path: '/erp/orders',    label: 'Buyurtmalar',  icon: '📋' },
  { key: 'products',  path: '/erp/products',  label: 'Menyu',        icon: '🍔' },
  { key: 'inventory', path: '/erp/inventory', label: 'Ombor',        icon: '📦' },
  { key: 'customers', path: '/erp/customers', label: 'Mijozlar',     icon: '👤' },
  { key: 'expenses',  path: '/erp/expenses',  label: 'Xarajatlar',   icon: '💸' },
  { key: 'reports',   path: '/erp/reports',   label: 'Hisobotlar',   icon: '📈' },
  { key: 'monitor',   path: '/erp/monitor',   label: 'Monitor',      icon: '📺' },
];

const SUPERADMIN_NAV = [
  { key: 'dashboard',    path: '/superadmin',              label: 'Dashboard',        icon: '📊', end: true },
  { key: 'applications', path: '/superadmin/applications', label: 'Arizalar',         icon: '📋' },
  { key: 'branches',     path: '/superadmin/branches',     label: 'Filiallar',        icon: '🏪' },
  { key: 'users',        path: '/superadmin/users',        label: 'Foydalanuvchilar', icon: '👥' },
];

const ADMIN_NAV = [
  { key: 'dashboard', path: '/admin',          label: 'Dashboard',  icon: '📊', end: true },
  { key: 'branches',  path: '/admin/branches', label: 'Filiallarim',icon: '🏪' },
  { key: 'staff',     path: '/admin/staff',    label: 'Xodimlar',   icon: '👥' },
  { key: 'navsettings',path: '/admin/nav-settings', label: 'Bo\'lim sozlamalari', icon: '⚙️' },
  { key: 'expenses',  path: '/admin/expenses', label: 'Xarajatlar', icon: '💸' },
  { key: 'reports',   path: '/admin/reports',  label: 'Hisobotlar', icon: '📈' },
  { key: 'orders',    path: '/erp/orders',     label: 'Buyurtmalar',icon: '📋' },
  { key: 'products',  path: '/erp/products',   label: 'Menyu',      icon: '🍔' },
  { key: 'inventory', path: '/erp/inventory',  label: 'Ombor',      icon: '📦' },
];

const roleLabels = {
  superadmin: 'Super Admin', director: 'Direktor', manager: 'Menejer',
  cashier: 'Kassir', waiter: 'Ofitsiant', cook: 'Oshpaz', courier: 'Kuryer',
};

export default function Sidebar({ basePath }) {
  const { user, logout, navPermissions } = useAuth();
  const navigate = useNavigate();
  const key = basePath === '/superadmin' ? 'superadmin' : basePath === '/admin' ? 'admin' : 'erp';

  let navItems;
  if (key === 'superadmin') {
    navItems = SUPERADMIN_NAV;
  } else if (key === 'admin') {
    navItems = ADMIN_NAV;
  } else {
    // ERP: director va superadmin hammani ko'radi, boshqalar filtrlangan
    if (['superadmin', 'director'].includes(user?.role)) {
      navItems = ALL_ERP_NAV;
    } else {
      const allowed = navPermissions?.[user?.role] || ['dashboard', 'orders'];
      navItems = ALL_ERP_NAV.filter(item => allowed.includes(item.key));
    }
  }

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col select-none"
      style={{ background: 'linear-gradient(180deg, #0f1a2e 0%, #1a2744 100%)' }}>

      {/* Logo */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img src={logo} alt="logo" className="w-10 h-10 flex-shrink-0" />
          <div>
            <p className="font-bold text-white text-sm">Fastfoot ERP</p>
            <p className="text-blue-300 text-xs">{roleLabels[user?.role] || user?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => (
          <NavLink key={item.path} to={item.path} end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}>
            <span className="w-5 text-center text-base flex-shrink-0">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Panel switch */}
      {(user?.role === 'superadmin' || user?.role === 'director') && (
        <div className="px-3 py-3 border-t border-white/10">
          {user?.role === 'superadmin' && key !== 'superadmin' && (
            <button onClick={() => navigate('/superadmin')} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-white/10 hover:text-white transition-all">
              <span>🔴</span> Super Admin panelga
            </button>
          )}
          {(user?.role === 'superadmin' || user?.role === 'director') && key !== 'erp' && (
            <button onClick={() => navigate('/erp')} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-white/10 hover:text-white transition-all">
              <span>🏪</span> ERP tizimiga
            </button>
          )}
          {(user?.role === 'superadmin' || user?.role === 'director') && key !== 'admin' && (
            <button onClick={() => navigate('/admin')} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-white/10 hover:text-white transition-all">
              <span>📊</span> Director paneliga
            </button>
          )}
        </div>
      )}

      {/* User */}
      <div className="px-3 py-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
            <p className="text-slate-400 text-xs truncate">{user?.branch?.name || 'Bosh ofis'}</p>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/login'); }}
          className="w-full flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl text-xs font-medium transition-all">
          <span>🚪</span> Chiqish
        </button>
      </div>
    </aside>
  );
}
