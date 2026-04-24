import { useEffect, useState } from 'react';
import { inventoryAPI } from '../../../api';
import Modal from '../../../components/common/Modal';
import toast from 'react-hot-toast';

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [stockModal, setStockModal] = useState(null);
  const [addQty, setAddQty] = useState('');
  const [form, setForm] = useState({ name: '', unit: 'kg', quantity: 0, minQuantity: 0, costPerUnit: 0, category: '' });

  const load = () => {
    setLoading(true);
    inventoryAPI.getAll().then(res => setItems(res.data)).catch(() => toast.error('Yuklanmadi')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await inventoryAPI.create(form); toast.success('Qo\'shildi'); setModal(false); load(); }
    catch (err) { toast.error(err?.message || 'Xatolik'); }
  };

  const handleAddStock = async () => {
    if (!addQty) return;
    try { await inventoryAPI.addStock(stockModal.id, { quantity: parseFloat(addQty) }); toast.success('Qo\'shildi'); setStockModal(null); setAddQty(''); load(); }
    catch { toast.error('Xatolik'); }
  };

  const isLow = (item) => parseFloat(item.quantity) <= parseFloat(item.minQuantity);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Ombor boshqaruvi</h1><p className="text-gray-500 text-sm">{items.filter(isLow).length} ta mahsulot kam</p></div>
        <button onClick={() => setModal(true)} className="btn-primary">+ Qo'shish</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <div className="col-span-3 text-center py-16 text-gray-400">Yuklanmoqda...</div>
        : items.map(item => (
          <div key={item.id} className={`card border-2 ${isLow(item) ? 'border-red-200 bg-red-50' : 'border-gray-100'}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500">{item.category || 'Umumiy'}</p>
              </div>
              {isLow(item) && <span className="badge-red">⚠️ Kam</span>}
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{item.quantity} <span className="text-sm font-normal text-gray-500">{item.unit}</span></p>
                <p className="text-xs text-gray-400">Min: {item.minQuantity} {item.unit}</p>
              </div>
              <button onClick={() => { setStockModal(item); setAddQty(''); }} className="btn-primary text-sm py-1.5 px-3">+ Qo'shish</button>
            </div>
          </div>
        ))}
        {!loading && items.length === 0 && <div className="col-span-3 text-center py-16 text-gray-400">Ombor bo'sh</div>}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Yangi mahsulot qo'shish">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nomi *</label><input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input" required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">O'lchov birligi</label>
              <select value={form.unit} onChange={(e) => setForm({...form, unit: e.target.value})} className="input">
                {['kg', 'g', 'L', 'ml', 'dona', 'quti', 'xalta'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Kategoriya</label><input value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="input" placeholder="Masalan: Go'sht" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Boshlang'ich miqdor</label><input type="number" value={form.quantity} onChange={(e) => setForm({...form, quantity: e.target.value})} className="input" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Minimal miqdor</label><input type="number" value={form.minQuantity} onChange={(e) => setForm({...form, minQuantity: e.target.value})} className="input" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Birlik narxi (so'm)</label><input type="number" value={form.costPerUnit} onChange={(e) => setForm({...form, costPerUnit: e.target.value})} className="input" /></div>
          <div className="flex gap-3 pt-2"><button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Bekor</button><button type="submit" className="btn-primary flex-1">Qo'shish</button></div>
        </form>
      </Modal>

      <Modal isOpen={!!stockModal} onClose={() => setStockModal(null)} title={`${stockModal?.name} — Qo'shish`} size="sm">
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">Hozirgi: <strong>{stockModal?.quantity} {stockModal?.unit}</strong></p>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Qo'shimcha miqdor ({stockModal?.unit})</label>
            <input type="number" value={addQty} onChange={(e) => setAddQty(e.target.value)} className="input" placeholder="0" autoFocus />
          </div>
          <div className="flex gap-3"><button onClick={() => setStockModal(null)} className="btn-secondary flex-1">Bekor</button><button onClick={handleAddStock} className="btn-primary flex-1">Qo'shish</button></div>
        </div>
      </Modal>
    </div>
  );
}
