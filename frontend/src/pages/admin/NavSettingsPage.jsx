import { useEffect, useState } from 'react';
import { adminAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ALL_SECTIONS = [
  { key: 'dashboard',  label: 'Dashboard',    icon: '📊', desc: 'Asosiy statistika sahifasi' },
  { key: 'pos',        label: 'Kassa (POS)',   icon: '🖥️', desc: 'Buyurtma qabul qilish' },
  { key: 'orders',     label: 'Buyurtmalar',   icon: '📋', desc: 'Barcha buyurtmalar ro\'yxati' },
  { key: 'products',   label: 'Menyu',         icon: '🍔', desc: 'Mahsulotlar boshqaruvi' },
  { key: 'inventory',  label: 'Ombor',         icon: '📦', desc: 'Inventarizatsiya' },
  { key: 'customers',  label: 'Mijozlar',      icon: '👤', desc: 'Mijozlar bazasi' },
  { key: 'expenses',   label: 'Xarajatlar',    icon: '💸', desc: 'Xarajatlar kiritish' },
  { key: 'reports',    label: 'Hisobotlar',    icon: '📈', desc: 'Sotuvlar va foyda hisoboti' },
];

const ROLES = [
  { key: 'manager',  label: 'Menejer',    icon: '👔' },
  { key: 'cashier',  label: 'Kassir',     icon: '💳' },
  { key: 'waiter',   label: 'Ofitsiant',  icon: '🍽️' },
  { key: 'cook',     label: 'Oshpaz',     icon: '👨‍🍳' },
  { key: 'courier',  label: 'Kuryer',     icon: '🚴' },
];

const DEFAULT_NAV = {
  manager:  ['dashboard','pos','orders','products','inventory','customers','expenses','reports'],
  cashier:  ['dashboard','pos','orders','customers'],
  waiter:   ['dashboard','pos','orders'],
  cook:     ['dashboard','orders'],
  courier:  ['dashboard','orders'],
};

export default function NavSettingsPage() {
  const { refreshNavPermissions } = useAuth();
  const [nav, setNav] = useState(DEFAULT_NAV);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeRole, setActiveRole] = useState('manager');

  useEffect(() => {
    adminAPI.getNavSettings()
      .then(res => setNav(res.data.nav || DEFAULT_NAV))
      .catch(() => toast.error('Yuklanmadi'))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (roleKey, sectionKey) => {
    setNav(prev => {
      const current = prev[roleKey] || [];
      const updated = current.includes(sectionKey)
        ? current.filter(k => k !== sectionKey)
        : [...current, sectionKey];
      return { ...prev, [roleKey]: updated };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminAPI.updateNavSettings({ nav });
      await refreshNavPermissions();
      toast.success('Sozlamalar saqlandi');
    } catch {
      toast.error('Xatolik');
    } finally { setSaving(false); }
  };

  const resetRole = (roleKey) => {
    setNav(prev => ({ ...prev, [roleKey]: DEFAULT_NAV[roleKey] || [] }));
    toast.success('Asl sozlamalarga qaytarildi');
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

  const currentAllowed = nav[activeRole] || [];

  return (
    <div className="p-7 space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ Bo'lim sozlamalari</h1>
          <p className="page-subtitle">Har bir lavozim uchun ko'rinadigan bo'limlarni belgilang</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? '⏳ Saqlanmoqda...' : '✅ Saqlash'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rol tanlash */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Lavozimlar</p>
          {ROLES.map(role => {
            const count = (nav[role.key] || []).length;
            return (
              <button key={role.key} onClick={() => setActiveRole(role.key)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left ${
                  activeRole === role.key
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{role.icon}</span>
                  <span className="font-semibold text-gray-800">{role.label}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                  activeRole === role.key ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}>{count} ta</span>
              </button>
            );
          })}
        </div>

        {/* Bo'limlar */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {ROLES.find(r => r.key === activeRole)?.icon} {ROLES.find(r => r.key === activeRole)?.label} ko'radigan bo'limlar
            </p>
            <button onClick={() => resetRole(activeRole)} className="text-xs text-gray-400 hover:text-orange-500 transition-colors">
              ↺ Aslga qaytarish
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ALL_SECTIONS.map(section => {
              const isOn = currentAllowed.includes(section.key);
              return (
                <button key={section.key} onClick={() => toggle(activeRole, section.key)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                    isOn
                      ? 'border-orange-400 bg-orange-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300 opacity-60'
                  }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                    isOn ? 'bg-orange-500' : 'bg-gray-100'
                  }`}>
                    {section.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${isOn ? 'text-gray-900' : 'text-gray-400'}`}>{section.label}</p>
                    <p className="text-xs text-gray-400 truncate">{section.desc}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isOn ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
                  }`}>
                    {isOn && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Preview */}
          {currentAllowed.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <p className="text-xs font-bold text-gray-500 mb-2">SIDEBAR KO'RINISHI:</p>
              <div className="flex flex-wrap gap-2">
                {ALL_SECTIONS.filter(s => currentAllowed.includes(s.key)).map(s => (
                  <span key={s.key} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 shadow-sm">
                    {s.icon} {s.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
