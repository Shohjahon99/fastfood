import { useEffect, useState } from 'react';
import { superAdminAPI } from '../../api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export default function BranchesPage() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', address: '', city: 'Toshkent', phone: '', openTime: '08:00', closeTime: '23:00', monthlyTarget: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await superAdminAPI.getBranches({ search });
      setBranches(res.data);
    } catch { toast.error('Yuklanmadi'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search]);

  const openCreate = () => { setEditing(null); setForm({ name: '', address: '', city: 'Toshkent', phone: '', openTime: '08:00', closeTime: '23:00', monthlyTarget: '' }); setModal(true); };
  const openEdit = (b) => { setEditing(b); setForm({ name: b.name, address: b.address || '', city: b.city || '', phone: b.phone || '', openTime: b.openTime || '08:00', closeTime: b.closeTime || '23:00', monthlyTarget: b.monthlyTarget || '' }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await superAdminAPI.updateBranch(editing.id, form); toast.success('Filial yangilandi'); }
      else { await superAdminAPI.createBranch(form); toast.success('Filial yaratildi'); }
      setModal(false); load();
    } catch (err) { toast.error(err?.message || 'Xatolik'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Filialni o\'chirmoqchimisiz?')) return;
    try { await superAdminAPI.deleteBranch(id); toast.success('O\'chirildi'); load(); }
    catch { toast.error('Xatolik'); }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Filiallar</h1><p className="text-gray-500 text-sm mt-0.5">Barcha filiallarni boshqaring</p></div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">+ Yangi filial</button>
      </div>

      <div className="card p-4">
        <input className="input max-w-xs" placeholder="🔍 Qidirish..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['#', 'Filial nomi', 'Shahar', 'Telefon', 'Ish vaqti', 'Holat', 'Amallar'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="7" className="text-center py-10 text-gray-400">Yuklanmoqda...</td></tr>
            ) : branches.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-10 text-gray-400">Filiallar yo'q</td></tr>
            ) : branches.map((b, i) => (
              <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                <td className="px-4 py-3"><p className="font-medium text-gray-900">{b.name}</p><p className="text-xs text-gray-400">{b.address}</p></td>
                <td className="px-4 py-3 text-gray-600">{b.city}</td>
                <td className="px-4 py-3 text-gray-600">{b.phone}</td>
                <td className="px-4 py-3 text-gray-600">{b.openTime?.slice(0,5)} - {b.closeTime?.slice(0,5)}</td>
                <td className="px-4 py-3"><span className={b.isActive ? 'badge-green' : 'badge-red'}>{b.isActive ? 'Faol' : 'Nofaol'}</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(b)} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100">✏️</button>
                    <button onClick={() => handleDelete(b.id)} className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs hover:bg-red-100">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Filialni tahrirlash' : 'Yangi filial'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[['name', 'Filial nomi *', 'text', true], ['address', 'Manzil', 'text', false], ['city', 'Shahar', 'text', false], ['phone', 'Telefon', 'tel', false]].map(([key, label, type, req]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type={type} value={form[key]} onChange={(e) => setForm({...form, [key]: e.target.value})} className="input" required={req} />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Ochilish</label><input type="time" value={form.openTime} onChange={(e) => setForm({...form, openTime: e.target.value})} className="input" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Yopilish</label><input type="time" value={form.closeTime} onChange={(e) => setForm({...form, closeTime: e.target.value})} className="input" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Oylik maqsad (so'm)</label><input type="number" value={form.monthlyTarget} onChange={(e) => setForm({...form, monthlyTarget: e.target.value})} className="input" placeholder="0" /></div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Bekor</button>
            <button type="submit" className="btn-primary flex-1">{editing ? 'Saqlash' : 'Yaratish'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
