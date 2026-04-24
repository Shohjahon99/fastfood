import { useEffect, useState } from 'react';
import { expenseAPI } from '../../../api';
import Modal from '../../../components/common/Modal';
import toast from 'react-hot-toast';

const CATS = { salary: '👥 Maosh', rent: '🏠 Ijara', utilities: '⚡ Kommunal', ingredients: '🛒 Xom ashyo', equipment: '🔧 Jihozlar', marketing: '📢 Reklama', other: '📌 Boshqa' };

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [catFilter, setCatFilter] = useState('');
  const [form, setForm] = useState({ title: '', amount: '', category: 'other', description: '', date: new Date().toISOString().split('T')[0] });
  const fmt = (n) => new Intl.NumberFormat('uz-UZ').format(Math.round(n || 0));

  const load = () => {
    setLoading(true);
    expenseAPI.getAll({ category: catFilter }).then(res => {
      setExpenses(res.data);
      setTotal(res.data.reduce((s, e) => s + parseFloat(e.amount), 0));
    }).catch(() => toast.error('Yuklanmadi')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [catFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await expenseAPI.create(form); toast.success('Xarajat qo\'shildi'); setModal(false); load(); }
    catch (err) { toast.error(err?.message || 'Xatolik'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('O\'chirishni tasdiqlaysizmi?')) return;
    try { await expenseAPI.delete(id); toast.success('O\'chirildi'); load(); }
    catch { toast.error('Xatolik'); }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Xarajatlar</h1><p className="text-gray-500 text-sm">Jami: <strong className="text-red-600">{fmt(total)} so'm</strong></p></div>
        <button onClick={() => { setForm({ title: '', amount: '', category: 'other', description: '', date: new Date().toISOString().split('T')[0] }); setModal(true); }} className="btn-primary">+ Xarajat qo'shish</button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setCatFilter('')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!catFilter ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}>Hammasi</button>
        {Object.entries(CATS).map(([v, l]) => (
          <button key={v} onClick={() => setCatFilter(v)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${catFilter === v ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{l}</button>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['Sana', 'Nomi', 'Kategoriya', 'Miqdor', ''].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? <tr><td colSpan="5" className="text-center py-10 text-gray-400">Yuklanmoqda...</td></tr>
            : expenses.length === 0 ? <tr><td colSpan="5" className="text-center py-10 text-gray-400">Xarajatlar yo'q</td></tr>
            : expenses.map(e => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{new Date(e.date).toLocaleDateString('uz-UZ')}</td>
                <td className="px-4 py-3"><p className="font-medium text-gray-900">{e.title}</p>{e.description && <p className="text-xs text-gray-400">{e.description}</p>}</td>
                <td className="px-4 py-3"><span className="badge-orange">{CATS[e.category]}</span></td>
                <td className="px-4 py-3 font-semibold text-red-600">{fmt(e.amount)} so'm</td>
                <td className="px-4 py-3"><button onClick={() => handleDelete(e.id)} className="px-2 py-1 bg-red-50 text-red-500 rounded text-xs hover:bg-red-100">🗑️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Yangi xarajat">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nomi *</label><input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="input" required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Miqdor (so'm) *</label><input type="number" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} className="input" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Sana *</label><input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="input" required /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Kategoriya</label>
            <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="input">
              {Object.entries(CATS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Izoh</label><textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="input" rows={2} /></div>
          <div className="flex gap-3 pt-2"><button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Bekor</button><button type="submit" className="btn-primary flex-1">Qo'shish</button></div>
        </form>
      </Modal>
    </div>
  );
}
