import { useEffect, useState } from 'react';
import { customerAPI } from '../../../api';
import Modal from '../../../components/common/Modal';
import toast from 'react-hot-toast';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', birthDate: '' });
  const fmt = (n) => new Intl.NumberFormat('uz-UZ').format(Math.round(n || 0));

  const load = () => {
    setLoading(true);
    customerAPI.getAll({ search }).then(res => setCustomers(res.data)).catch(() => toast.error('Yuklanmadi')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await customerAPI.create(form); toast.success('Mijoz qo\'shildi'); setModal(false); load(); }
    catch (err) { toast.error(err?.message || 'Xatolik'); }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Mijozlar (CRM)</h1><p className="text-gray-500 text-sm">{customers.length} ta mijoz</p></div>
        <button onClick={() => { setForm({ name: '', phone: '', email: '', birthDate: '' }); setModal(true); }} className="btn-primary">+ Mijoz qo'shish</button>
      </div>

      <input className="input max-w-xs" placeholder="🔍 Ism yoki telefon..." value={search} onChange={(e) => setSearch(e.target.value)} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <div className="col-span-3 text-center py-16 text-gray-400">Yuklanmoqda...</div>
        : customers.map(c => (
          <div key={c.id} className="card hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-xl font-bold text-orange-600">{c.name?.charAt(0)}</div>
              <div><p className="font-semibold text-gray-900">{c.name}</p><p className="text-sm text-gray-500">{c.phone}</p></div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-sm bg-gray-50 rounded-xl p-3">
              <div><p className="font-bold text-orange-500">{c.totalOrders}</p><p className="text-xs text-gray-400">Buyurtma</p></div>
              <div><p className="font-bold text-green-600">{fmt(c.totalSpent)}</p><p className="text-xs text-gray-400">Sarflagan</p></div>
              <div><p className="font-bold text-purple-600">{c.bonusPoints}</p><p className="text-xs text-gray-400">Bonus</p></div>
            </div>
          </div>
        ))}
        {!loading && customers.length === 0 && <div className="col-span-3 text-center py-16 text-gray-400">Mijozlar topilmadi</div>}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Yangi mijoz" size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Ism *</label><input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label><input type="tel" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="input" placeholder="+998901234567" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="input" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Tug'ilgan kun</label><input type="date" value={form.birthDate} onChange={(e) => setForm({...form, birthDate: e.target.value})} className="input" /></div>
          <div className="flex gap-3"><button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Bekor</button><button type="submit" className="btn-primary flex-1">Qo'shish</button></div>
        </form>
      </Modal>
    </div>
  );
}
