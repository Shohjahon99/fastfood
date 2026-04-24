import { useEffect, useState } from 'react';
import { superAdminAPI } from '../../api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const ROLES = ['superadmin', 'director', 'manager', 'cashier', 'waiter', 'cook', 'courier'];
const roleLabels = { superadmin: 'Super Admin', director: 'Direktor', manager: 'Menejer', cashier: 'Kassir', waiter: 'Ofitsiant', cook: 'Oshpaz', courier: 'Kuryer' };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'cashier', branchId: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [usersRes, branchRes] = await Promise.all([
        superAdminAPI.getUsers({ search, role: roleFilter }),
        superAdminAPI.getBranches({ limit: 100 }),
      ]);
      setUsers(usersRes.data);
      setBranches(branchRes.data);
    } catch { toast.error('Yuklanmadi'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, roleFilter]);

  const openCreate = () => { setEditing(null); setForm({ name: '', email: '', password: '', phone: '', role: 'cashier', branchId: '' }); setModal(true); };
  const openEdit = (u) => { setEditing(u); setForm({ name: u.name, email: u.email, password: '', phone: u.phone || '', role: u.role, branchId: u.branchId || '' }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await superAdminAPI.updateUser(editing.id, form);
      else await superAdminAPI.createUser(form);
      toast.success(editing ? 'Yangilandi' : 'Yaratildi');
      setModal(false); load();
    } catch (err) { toast.error(err?.message || 'Xatolik'); }
  };

  const handleToggle = async (id) => {
    try { await superAdminAPI.toggleUser(id); load(); }
    catch { toast.error('Xatolik'); }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Foydalanuvchilar</h1><p className="text-gray-500 text-sm mt-0.5">Barcha xodimlar va adminlar</p></div>
        <button onClick={openCreate} className="btn-primary">+ Yangi foydalanuvchi</button>
      </div>

      <div className="card p-4 flex gap-3">
        <input className="input max-w-xs" placeholder="🔍 Qidirish..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input max-w-[180px]" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">Barcha rollar</option>
          {ROLES.map(r => <option key={r} value={r}>{roleLabels[r]}</option>)}
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['Xodim', 'Email', 'Rol', 'Filial', 'So\'nggi kirish', 'Holat', ''].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? <tr><td colSpan="7" className="text-center py-10 text-gray-400">Yuklanmoqda...</td></tr>
            : users.length === 0 ? <tr><td colSpan="7" className="text-center py-10 text-gray-400">Foydalanuvchilar yo'q</td></tr>
            : users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-xs">{u.name?.charAt(0)}</div>
                    <div><p className="font-medium">{u.name}</p><p className="text-xs text-gray-400">{u.phone}</p></div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3"><span className="badge-orange">{roleLabels[u.role]}</span></td>
                <td className="px-4 py-3 text-gray-600">{u.branch?.name || '—'}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{u.lastLogin ? new Date(u.lastLogin).toLocaleString('uz-UZ') : '—'}</td>
                <td className="px-4 py-3"><span className={u.isActive ? 'badge-green' : 'badge-red'}>{u.isActive ? 'Faol' : 'Bloklangan'}</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(u)} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100">✏️</button>
                    <button onClick={() => handleToggle(u.id)} className={`px-2 py-1 rounded text-xs ${u.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>{u.isActive ? '🚫' : '✅'}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Foydalanuvchini tahrirlash' : 'Yangi foydalanuvchi'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Ism *</label><input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label><input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="input" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Parol {editing ? '(o\'zgartirish uchun)' : '*'}</label><input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="input" required={!editing} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label><input type="tel" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="input" placeholder="+998901234567" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
            <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} className="input">
              {ROLES.map(r => <option key={r} value={r}>{roleLabels[r]}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Filial</label>
            <select value={form.branchId} onChange={(e) => setForm({...form, branchId: e.target.value})} className="input">
              <option value="">Tanlang</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Bekor</button>
            <button type="submit" className="btn-primary flex-1">{editing ? 'Saqlash' : 'Yaratish'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
