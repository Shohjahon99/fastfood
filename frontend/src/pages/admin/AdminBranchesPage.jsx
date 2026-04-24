import { useEffect, useState } from 'react';
import { adminAPI, reportAPI } from '../../api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const fmt = (n) => new Intl.NumberFormat('uz-UZ').format(Math.round(n || 0));

const emptyForm = {
  name: '', address: '', city: '', phone: '',
  openTime: '08:00', closeTime: '23:00', monthlyTarget: '', isActive: true,
};

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];

  const load = async () => {
    setLoading(true);
    try {
      const [br, sr] = await Promise.all([
        adminAPI.getBranches(),
        reportAPI.getBranchComparison({ startDate, endDate }).catch(() => ({ data: { branches: [] } })),
      ]);
      setBranches(br.data.branches || []);
      setStats(sr.data.branches || []);
    } catch { toast.error('Yuklanmadi'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (b) => {
    setEditing(b);
    setForm({
      name: b.name, address: b.address || '', city: b.city || '',
      phone: b.phone || '', openTime: b.openTime?.slice(0,5) || '08:00',
      closeTime: b.closeTime?.slice(0,5) || '23:00',
      monthlyTarget: b.monthlyTarget || '', isActive: b.isActive,
    });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Filial nomi kiritilishi shart');
    setSaving(true);
    try {
      if (editing) await adminAPI.updateBranch(editing.id, form);
      else await adminAPI.createBranch(form);
      toast.success(editing ? 'Filial yangilandi' : 'Yangi filial qo\'shildi');
      setModal(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Xatolik');
    } finally { setSaving(false); }
  };

  const handleDelete = async (b) => {
    if (!confirm(`"${b.name}" filialini o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await adminAPI.deleteBranch(b.id);
      toast.success('Filial o\'chirildi');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Xatolik');
    }
  };

  const getRevenue = (branchId) => {
    const s = stats.find(b => b.id === branchId);
    return parseFloat(s?.dataValues?.revenue || 0);
  };
  const getOrders = (branchId) => {
    const s = stats.find(b => b.id === branchId);
    return parseInt(s?.dataValues?.orderCount || 0);
  };
  const maxRevenue = Math.max(...branches.map(b => getRevenue(b.id)), 1);

  return (
    <div className="p-7 space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">🏪 Filiallarim</h1>
          <p className="page-subtitle">{branches.length} ta filial • {startDate} — {endDate}</p>
        </div>
        <button onClick={openCreate} className="btn-primary">+ Filial qo'shish</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : branches.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-3">🏪</p>
          <p className="font-medium mb-4">Filiallar topilmadi</p>
          <button onClick={openCreate} className="btn-primary text-sm">+ Birinchi filialni qo'shing</button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Top filial */}
          {branches[0] && (
            <div className="card bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">🏆</div>
                <div className="flex-1">
                  <p className="text-orange-100 text-sm font-medium">Bu oyning eng yaxshi filiali</p>
                  <p className="text-2xl font-bold">{branches[0].name}</p>
                  <p className="text-orange-100 text-sm">{branches[0].city}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{fmt(getRevenue(branches[0].id))}</p>
                  <p className="text-orange-100 text-sm">so'm daromad</p>
                  <p className="text-orange-100 text-sm">{getOrders(branches[0].id)} ta buyurtma</p>
                </div>
              </div>
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {branches.map((b, i) => {
              const revenue = getRevenue(b.id);
              const orders = getOrders(b.id);
              const pct = Math.round((revenue / maxRevenue) * 100);
              return (
                <div key={b.id} className="card hover:shadow-md transition-all group">
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                      i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-600'
                    }`}>{i + 1}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-gray-900">{b.name}</p>
                        <div className="flex items-center gap-1">
                          <span className={`badge ${b.isActive ? 'badge-green' : 'badge-red'}`}>{b.isActive ? '● Faol' : '○ Yopiq'}</span>
                          <button onClick={() => openEdit(b)} className="opacity-0 group-hover:opacity-100 w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-sm hover:bg-blue-100 transition-all">✏️</button>
                          <button onClick={() => handleDelete(b)} className="opacity-0 group-hover:opacity-100 w-7 h-7 bg-red-50 text-red-500 rounded-lg flex items-center justify-center text-sm hover:bg-red-100 transition-all">🗑️</button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">{b.city}{b.address ? ` • ${b.address}` : ''}</p>
                      {b.phone && <p className="text-xs text-gray-400">{b.phone}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: 'Daromad', value: fmt(revenue) + ' so\'m', color: 'text-green-600' },
                      { label: 'Buyurtmalar', value: orders + ' ta', color: 'text-blue-600' },
                      { label: 'Xodimlar', value: (b.stats?.activeStaff || 0) + ' ta', color: 'text-orange-600' },
                    ].map(s => (
                      <div key={s.label} className="bg-gray-50 rounded-xl p-2.5 text-center">
                        <p className={`font-bold text-sm ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-gray-400">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Umumiy daromaddan ulush</span><span>{pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? '✏️ Filialni tahrirlash' : '+ Yangi filial qo\'shish'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Filial nomi *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" placeholder="Fastfoot - Chilonzor" required />
            </div>
            <div>
              <label className="label">Shahar</label>
              <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="input" placeholder="Toshkent" />
            </div>
            <div>
              <label className="label">Telefon</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input" placeholder="+998711234567" />
            </div>
            <div className="col-span-2">
              <label className="label">Manzil</label>
              <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="input" placeholder="Ko'cha, uy raqami..." />
            </div>
            <div>
              <label className="label">Ochilish vaqti</label>
              <input type="time" value={form.openTime} onChange={e => setForm({ ...form, openTime: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Yopilish vaqti</label>
              <input type="time" value={form.closeTime} onChange={e => setForm({ ...form, closeTime: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Oylik maqsad (so'm)</label>
              <input type="number" value={form.monthlyTarget} onChange={e => setForm({ ...form, monthlyTarget: e.target.value })} className="input" placeholder="50000000" min="0" />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <input type="checkbox" id="branchActive" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="w-5 h-5 accent-orange-500 rounded" />
              <label htmlFor="branchActive" className="font-semibold text-gray-700 cursor-pointer">Faol filial</label>
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
    </div>
  );
}
