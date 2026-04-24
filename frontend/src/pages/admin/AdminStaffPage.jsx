import { useEffect, useState } from 'react';
import { adminAPI } from '../../api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const ROLES = {
  manager: { label: 'Menejer', color: 'badge-blue', icon: '👔' },
  cashier: { label: 'Kassir', color: 'badge-green', icon: '💳' },
  waiter: { label: 'Ofitsiant', color: 'badge-yellow', icon: '🍽️' },
  cook: { label: 'Oshpaz', color: 'badge-orange', icon: '👨‍🍳' },
  courier: { label: 'Kuryer', color: 'badge-purple', icon: '🚴' },
  director: { label: 'Direktor', color: 'badge-red', icon: '🏢' },
};

const emptyForm = { name: '', email: '', password: '', phone: '', role: 'cashier', branchId: '' };

export default function AdminStaffPage() {
  const [staff, setStaff] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pwModal, setPwModal] = useState(null);
  const [newPw, setNewPw] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    setLoading(true);
    Promise.all([
      adminAPI.getStaff({ search, role: roleFilter, branchId: branchFilter }),
      adminAPI.getBranches(),
    ]).then(([sr, br]) => {
      setStaff(sr.data.users || []);
      setBranches(br.data.branches || []);
    }).catch(() => toast.error('Yuklanmadi'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, roleFilter, branchFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModal(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: '', phone: u.phone || '', role: u.role, branchId: u.branchId || '' });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Ism kiritilishi shart');
    if (!editing && !form.password) return toast.error('Parol kiritilishi shart');
    setSaving(true);
    try {
      const data = { ...form };
      if (!data.password) delete data.password;
      if (!data.branchId) delete data.branchId;

      if (editing) await adminAPI.updateStaff(editing.id, data);
      else await adminAPI.createStaff(data);

      toast.success(editing ? 'Yangilandi' : 'Xodim qo\'shildi');
      setModal(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Xatolik');
    } finally { setSaving(false); }
  };

  const handleToggle = async (u) => {
    try {
      await adminAPI.toggleStaff(u.id);
      toast.success(u.isActive ? 'Bloklandi' : 'Faollashtirildi');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Xatolik');
    }
  };

  const handleResetPw = async () => {
    if (!newPw || newPw.length < 6) return toast.error('Parol kamida 6 belgi');
    try {
      await adminAPI.resetStaffPassword(pwModal.id, { newPassword: newPw });
      toast.success('Parol o\'zgartirildi');
      setPwModal(null); setNewPw('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Xatolik');
    }
  };

  const active = staff.filter(u => u.isActive).length;
  const blocked = staff.filter(u => !u.isActive).length;

  return (
    <div className="p-7 space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">👥 Xodimlar boshqaruvi</h1>
          <p className="page-subtitle">{staff.length} ta xodim • {active} faol • {blocked} bloklangan</p>
        </div>
        <button onClick={openCreate} className="btn-primary">+ Xodim qo'shish</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {Object.entries(ROLES).filter(([r]) => r !== 'director').map(([role, info]) => {
          const count = staff.filter(u => u.role === role).length;
          return (
            <div key={role} className="card p-3 flex items-center gap-3">
              <span className="text-2xl">{info.icon}</span>
              <div>
                <p className="font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-400">{info.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <input className="input max-w-xs text-sm" placeholder="🔍 Qidirish..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input w-auto text-sm" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">Barcha lavozimlar</option>
          {Object.entries(ROLES).filter(([r]) => r !== 'director').map(([r, info]) => (
            <option key={r} value={r}>{info.icon} {info.label}</option>
          ))}
        </select>
        <select className="input w-auto text-sm" value={branchFilter} onChange={e => setBranchFilter(e.target.value)}>
          <option value="">Barcha filiallar</option>
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : staff.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-3">👥</p>
          <p className="font-medium">Xodimlar topilmadi</p>
          <button onClick={openCreate} className="btn-primary mt-4 text-sm">+ Birinchi xodimni qo'shing</button>
        </div>
      ) : (
        <div className="table-container">
          <table className="w-full text-sm">
            <thead className="table-head">
              <tr>
                {['Xodim', 'Filial', 'Lavozim', 'Telefon', 'Holat', 'Qo\'shilgan', ''].map(h => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map(u => {
                const role = ROLES[u.role] || { label: u.role, color: 'badge-blue', icon: '👤' };
                return (
                  <tr key={u.id} className="table-row">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td text-gray-600">{u.branch?.name || <span className="text-gray-300">—</span>}</td>
                    <td className="table-td">
                      <span className={`badge ${role.color}`}>{role.icon} {role.label}</span>
                    </td>
                    <td className="table-td font-mono text-gray-500 text-xs">{u.phone || '—'}</td>
                    <td className="table-td">
                      <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                        {u.isActive ? '● Faol' : '○ Bloklangan'}
                      </span>
                    </td>
                    <td className="table-td text-gray-400 text-xs">
                      {new Date(u.createdAt).toLocaleDateString('uz-UZ')}
                    </td>
                    <td className="table-td">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(u)} className="w-8 h-8 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg flex items-center justify-center text-sm" title="Tahrirlash">✏️</button>
                        <button onClick={() => handleToggle(u)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${u.isActive ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                          title={u.isActive ? 'Bloklash' : 'Faollashtirish'}>
                          {u.isActive ? '🔒' : '🔓'}
                        </button>
                        <button onClick={() => { setPwModal(u); setNewPw(''); }} className="w-8 h-8 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg flex items-center justify-center text-sm" title="Parolni yangilash">🔑</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? '✏️ Xodimni tahrirlash' : '+ Yangi xodim qo\'shish'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">To'liq ism *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" placeholder="Abdullayev Alisher" required />
            </div>
            <div>
              <label className="label">Email *</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input" placeholder="alisher@email.com" required />
            </div>
            <div>
              <label className="label">Telefon</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input" placeholder="+998901234567" />
            </div>
            <div>
              <label className="label">{editing ? 'Yangi parol (bo\'sh qoldirsa o\'zgarmaydi)' : 'Parol *'}</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input" placeholder={editing ? '••••••' : 'Kamida 6 belgi'} required={!editing} minLength={editing ? 0 : 6} />
            </div>
            <div>
              <label className="label">Lavozim</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="input">
                {Object.entries(ROLES).filter(([r]) => r !== 'director').map(([r, info]) => (
                  <option key={r} value={r}>{info.icon} {info.label}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Filial</label>
              <select value={form.branchId} onChange={e => setForm({ ...form, branchId: e.target.value })} className="input">
                <option value="">Filial tanlanmagan</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name} — {b.city}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Bekor</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? '⏳ Saqlanmoqda...' : editing ? '✅ Saqlash' : '➕ Qo\'shish'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal isOpen={!!pwModal} onClose={() => setPwModal(null)} title="🔑 Parolni yangilash" size="sm">
        <div className="space-y-4">
          <p className="text-gray-600 text-sm"><strong>{pwModal?.name}</strong> uchun yangi parol kiriting.</p>
          <div>
            <label className="label">Yangi parol</label>
            <input type="text" value={newPw} onChange={e => setNewPw(e.target.value)} className="input font-mono" placeholder="Kamida 6 belgi" minLength={6} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setPwModal(null)} className="btn-secondary flex-1">Bekor</button>
            <button onClick={handleResetPw} className="btn-primary flex-1">Saqlash</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
