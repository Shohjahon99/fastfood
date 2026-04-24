import { useEffect, useState, useRef } from 'react';
import { productAPI } from '../../../api';
import Modal from '../../../components/common/Modal';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5000';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [catModal, setCatModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileRef = useRef();
  const fmt = (n) => new Intl.NumberFormat('uz-UZ').format(Math.round(n || 0));

  const [form, setForm] = useState({ name: '', price: '', costPrice: '', categoryId: '', prepTime: 10, calories: '', description: '', isActive: true });
  const [catForm, setCatForm] = useState({ name: '', icon: '🍽️' });

  const load = () => {
    setLoading(true);
    Promise.all([
      productAPI.getAll({ search, categoryId: catFilter, limit: 200 }),
      productAPI.getCategories(),
    ]).then(([pr, cr]) => {
      setProducts(pr.data);
      setCategories(cr.data.categories);
    }).catch(() => toast.error('Yuklanmadi'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, catFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', price: '', costPrice: '', categoryId: '', prepTime: 10, calories: '', description: '', isActive: true });
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
    setModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, price: p.price, costPrice: p.costPrice, categoryId: p.categoryId || '', prepTime: p.prepTime || 10, calories: p.calories || '', description: p.description || '', isActive: p.isActive });
    setImagePreview(p.image ? `${API_BASE}${p.image}` : null);
    if (fileRef.current) fileRef.current.value = '';
    setModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { toast.error('Rasm 3MB dan kichik bo\'lishi kerak'); return; }
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Nomi kiritilishi shart');
    if (!form.price || isNaN(form.price)) return toast.error('Narx to\'g\'ri kiritilishi shart');

    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '' && v !== null && v !== undefined) fd.append(k, v); });
      if (fileRef.current?.files[0]) fd.append('image', fileRef.current.files[0]);

      if (editing) await productAPI.update(editing.id, fd);
      else await productAPI.create(fd);

      toast.success(editing ? 'Mahsulot yangilandi' : 'Mahsulot yaratildi');
      setModal(false);
      load();
    } catch (err) {
      toast.error(err?.message || 'Xatolik yuz berdi');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Mahsulotni o\'chirishni tasdiqlaysizmi?')) return;
    try { await productAPI.delete(id); toast.success('O\'chirildi'); load(); }
    catch { toast.error('Xatolik'); }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await productAPI.createCategory(catForm);
      toast.success('Kategoriya qo\'shildi');
      setCatModal(false); setCatForm({ name: '', icon: '🍽️' });
      load();
    } catch { toast.error('Xatolik'); }
  };

  const margin = (p) => {
    if (!p.costPrice || !p.price) return null;
    return Math.round(((p.price - p.costPrice) / p.price) * 100);
  };

  return (
    <div className="p-7 space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">🍔 Menyu boshqaruvi</h1>
          <p className="page-subtitle">{products.length} ta mahsulot</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setCatModal(true)} className="btn-secondary text-sm">+ Kategoriya</button>
          <button onClick={openCreate} className="btn-primary">+ Mahsulot qo'shish</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input className="input max-w-xs text-sm" placeholder="🔍 Mahsulot qidirish..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setCatFilter('')} className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${!catFilter ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>Hammasi</button>
          {categories.map(c => (
            <button key={c.id} onClick={() => setCatFilter(c.id)} className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${catFilter == c.id ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {c.icon} {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-3">🍽️</p>
          <p className="font-medium">Mahsulotlar topilmadi</p>
          <button onClick={openCreate} className="btn-primary mt-4 text-sm">+ Birinchi mahsulotni qo'shing</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group overflow-hidden">
              {/* Image */}
              <div className="relative w-full h-32 bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden">
                {p.image ? (
                  <img src={`${API_BASE}${p.image}`} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🍔</div>
                )}
                <span className={`absolute top-2 right-2 badge text-xs ${p.isActive ? 'badge-green' : 'badge-red'}`}>{p.isActive ? '●' : '○'}</span>
              </div>
              <div className="p-3">
                <p className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 mb-1">{p.name}</p>
                <p className="text-xs text-gray-400 mb-2">{p.category?.icon} {p.category?.name || '—'}</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-orange-500 font-bold text-base">{fmt(p.price)}<span className="text-xs font-normal text-gray-400"> so'm</span></p>
                    {margin(p) !== null && <p className="text-xs text-emerald-600 font-medium">Marja: {margin(p)}%</p>}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(p)} className="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-sm hover:bg-blue-100">✏️</button>
                    <button onClick={() => handleDelete(p.id)} className="w-7 h-7 bg-red-50 text-red-600 rounded-lg flex items-center justify-center text-sm hover:bg-red-100">🗑️</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? '✏️ Mahsulotni tahrirlash' : '+ Yangi mahsulot qo\'shish'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Image upload */}
          <div>
            <label className="label">Mahsulot rasmi</label>
            <div className="flex gap-4 items-start">
              <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center cursor-pointer hover:border-orange-400 transition-colors"
                onClick={() => fileRef.current?.click()}>
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center"><p className="text-3xl">📷</p><p className="text-xs text-gray-400 mt-1">Rasm tanlang</p></div>
                )}
              </div>
              <div className="flex-1">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary text-sm">📁 Fayl tanlash</button>
                <p className="text-xs text-gray-400 mt-2">JPG, PNG, WebP • max 3MB</p>
                {imagePreview && <button type="button" onClick={() => { setImagePreview(null); if (fileRef.current) fileRef.current.value = ''; }} className="text-xs text-red-500 hover:text-red-700 mt-1">✕ O'chirish</button>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Mahsulot nomi *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" placeholder="Masalan: Classic Burger" required />
            </div>
            <div>
              <label className="label">Narx (so'm) *</label>
              <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="input" placeholder="25000" required min="0" />
            </div>
            <div>
              <label className="label">Tannarx (so'm)</label>
              <input type="number" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: e.target.value })} className="input" placeholder="12000" min="0" />
            </div>
            <div>
              <label className="label">Kategoriya</label>
              <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="input">
                <option value="">Tanlang</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Tayyorlash vaqti (daqiqa)</label>
              <input type="number" value={form.prepTime} onChange={e => setForm({ ...form, prepTime: e.target.value })} className="input" min="1" max="120" />
            </div>
            <div>
              <label className="label">Kaloriya</label>
              <input type="number" value={form.calories} onChange={e => setForm({ ...form, calories: e.target.value })} className="input" placeholder="520" min="0" />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="w-5 h-5 accent-orange-500 rounded" />
              <label htmlFor="isActive" className="font-semibold text-gray-700 cursor-pointer">Faol (menyuda ko'rinsin)</label>
            </div>
            <div className="col-span-2">
              <label className="label">Tavsif</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input" rows={2} placeholder="Qisqacha tavsif..." />
            </div>
          </div>

          {/* Margin display */}
          {form.price && form.costPrice && parseFloat(form.price) > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-700">
              💰 Marja: <strong>{Math.round(((form.price - form.costPrice) / form.price) * 100)}%</strong> ({new Intl.NumberFormat('uz-UZ').format(form.price - form.costPrice)} so'm)
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Bekor</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? '⏳ Saqlanmoqda...' : editing ? '✅ Saqlash' : '➕ Qo\'shish'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Category Modal */}
      <Modal isOpen={catModal} onClose={() => setCatModal(false)} title="Yangi kategoriya" size="sm">
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div><label className="label">Kategoriya nomi *</label><input value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} className="input" placeholder="Burgerlar" required /></div>
          <div><label className="label">Emoji icon</label>
            <div className="grid grid-cols-8 gap-2 mb-2">
              {['🍔', '🍕', '🌮', '🍜', '🥗', '🍰', '🥤', '🍗', '🥩', '🍟', '🌯', '🍱'].map(em => (
                <button key={em} type="button" onClick={() => setCatForm({ ...catForm, icon: em })}
                  className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-all ${catForm.icon === em ? 'bg-orange-100 ring-2 ring-orange-400' : 'bg-gray-50 hover:bg-gray-100'}`}>{em}</button>
              ))}
            </div>
            <input value={catForm.icon} onChange={e => setCatForm({ ...catForm, icon: e.target.value })} className="input text-lg" placeholder="🍽️" maxLength={4} />
          </div>
          <div className="flex gap-3"><button type="button" onClick={() => setCatModal(false)} className="btn-secondary flex-1">Bekor</button><button type="submit" className="btn-primary flex-1">Qo'shish</button></div>
        </form>
      </Modal>
    </div>
  );
}
