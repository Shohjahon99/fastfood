import { useEffect, useState, useCallback } from 'react';
import { productAPI, orderAPI, customerAPI } from '../../../api';
import Receipt from '../../../components/common/Receipt';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5000';
const fmt = (n) => new Intl.NumberFormat('uz-UZ').format(Math.round(n || 0));

// Mahsulot kartasi
function ProductCard({ product, cartQty, onAdd }) {
  const imgSrc = product.image
    ? (product.image.startsWith('http') ? product.image : `${API_BASE}${product.image}`)
    : null;

  return (
    <button
      onClick={() => onAdd(product)}
      className="relative bg-white rounded-2xl border-2 border-gray-100 hover:border-orange-400 hover:shadow-lg transition-all text-left group overflow-hidden active:scale-95"
    >
      {/* Rasm */}
      <div className="relative w-full h-36 bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div
          className="w-full h-full flex items-center justify-center text-5xl"
          style={{ display: imgSrc ? 'none' : 'flex' }}
        >
          🍔
        </div>

        {/* Savatdagi soni */}
        {cartQty > 0 && (
          <div className="absolute top-2 right-2 w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
            {cartQty}
          </div>
        )}

        {/* Tayyorlash vaqti */}
        {product.prepTime && (
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
            ⏱ {product.prepTime} min
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-semibold text-sm text-gray-900 line-clamp-2 leading-tight mb-1 min-h-[2.5rem]">
          {product.name}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-orange-500 font-bold text-base">{fmt(product.price)}</p>
          <span className="text-xs text-gray-400">so'm</span>
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/5 transition-colors pointer-events-none rounded-2xl" />
    </button>
  );
}

// Savatdagi element
function CartItem({ item, onQtyChange, onRemove }) {
  const imgSrc = item.image
    ? (item.image.startsWith('http') ? item.image : `${API_BASE}${item.image}`)
    : null;

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      {/* Kichik rasm */}
      <div className="w-12 h-12 rounded-xl bg-orange-50 flex-shrink-0 overflow-hidden">
        {imgSrc ? (
          <img src={imgSrc} alt={item.name} className="w-full h-full object-cover"
            onError={e => { e.target.style.display='none'; }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl">🍔</div>
        )}
      </div>

      {/* Nomi va narxi */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
        <p className="text-xs text-orange-500">{fmt(item.price)} so'm × {item.quantity}</p>
      </div>

      {/* Miqdor boshqaruvi */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={() => onQtyChange(item.quantity - 1)}
          className="w-6 h-6 bg-gray-100 hover:bg-red-100 hover:text-red-600 rounded-lg text-sm font-bold flex items-center justify-center transition-colors"
        >−</button>
        <span className="w-5 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
        <button
          onClick={() => onQtyChange(item.quantity + 1)}
          className="w-6 h-6 bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-lg text-sm font-bold flex items-center justify-center transition-colors"
        >+</button>
      </div>

      {/* Jami */}
      <div className="text-right flex-shrink-0 w-16">
        <p className="text-sm font-bold text-gray-900">{fmt(item.total)}</p>
        <button onClick={onRemove} className="text-xs text-red-400 hover:text-red-600 transition-colors">✕ O'chirish</button>
      </div>
    </div>
  );
}

export default function POSPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('dine_in');
  const [table, setTable] = useState('');
  const [payMethod, setPayMethod] = useState('cash');
  const [phone, setPhone] = useState('');
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [placing, setPlacing] = useState(false);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      productAPI.getCategories(),
      productAPI.getAll({ limit: 300, isActive: true }),
    ]).then(([catRes, prodRes]) => {
      setCategories(catRes.data.categories || []);
      setProducts(prodRes.data || []);
    }).catch(() => toast.error('Mahsulotlar yuklanmadi'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p =>
    (!activeCategory || p.categoryId === activeCategory) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  const addToCart = useCallback((product) => {
    setCart(prev => {
      const ex = prev.find(i => i.productId === product.id);
      if (ex) return prev.map(i =>
        i.productId === product.id
          ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price }
          : i
      );
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.image || null,
        quantity: 1,
        total: parseFloat(product.price),
      }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart(prev => prev.filter(i => i.productId !== productId));
  }, []);

  const changeQty = useCallback((productId, qty) => {
    if (qty <= 0) return removeFromCart(productId);
    setCart(prev => prev.map(i =>
      i.productId === productId ? { ...i, quantity: qty, total: qty * i.price } : i
    ));
  }, [removeFromCart]);

  const cartQtyMap = cart.reduce((acc, i) => ({ ...acc, [i.productId]: i.quantity }), {});
  const subtotal = cart.reduce((s, i) => s + i.total, 0);
  const tax = subtotal * 0.12;
  const total = subtotal + tax;

  const searchCustomer = async () => {
    if (!phone.trim()) return;
    try {
      const res = await customerAPI.findByPhone(phone);
      setCustomer(res.data.customer);
      toast.success(`👤 ${res.data.customer.name} topildi`);
    } catch {
      setCustomer(null);
      toast.error('Mijoz topilmadi');
    }
  };

  const handleOrder = async () => {
    if (cart.length === 0) return toast.error('Savatcha bo\'sh');
    setPlacing(true);
    try {
      const res = await orderAPI.create({
        items: cart.map(i => ({ productId: i.productId, quantity: i.quantity })),
        type: orderType,
        tableNumber: table || null,
        paymentMethod: payMethod,
        customerId: customer?.id || null,
      });
      toast.success('✅ Buyurtma qabul qilindi!');
      // Chekni ko'rsatish — savatcha ma'lumotlarini ham biriktirish
      const fullOrder = {
        ...res.data.order,
        paymentMethod: payMethod,
        type: orderType,
        tableNumber: table || null,
        items: res.data.order.items || cart.map(i => ({
          product: { name: i.name },
          price: i.price,
          quantity: i.quantity,
          total: i.total,
        })),
      };
      setReceipt(fullOrder);
      setCart([]); setTable(''); setCustomer(null); setPhone('');
    } catch (err) {
      toast.error(err?.message || 'Xatolik yuz berdi');
    } finally { setPlacing(false); }
  };

  return (
    <>
    {receipt && <Receipt order={receipt} onClose={() => setReceipt(null)} />}
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* ─── MAHSULOTLAR PANELI ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-5 py-3 space-y-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-bold text-gray-900">🖥️ Kassa (POS)</h1>
              <p className="text-xs text-gray-400">{filtered.length} ta mahsulot</p>
            </div>
            <div className="flex-1 relative max-w-sm">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                className="input pl-9 text-sm w-full"
                placeholder="Mahsulot qidirish..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Kategoriyalar */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setActiveCategory(null)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                !activeCategory ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >Hammasi</button>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === c.id ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >{c.icon} {c.name}</button>
            ))}
          </div>
        </div>

        {/* Mahsulotlar grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-3">🍽️</p>
              <p className="font-medium">Mahsulot topilmadi</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filtered.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  cartQty={cartQtyMap[p.id] || 0}
                  onAdd={addToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── SAVATCHA PANELI ──────────────────────────────────────── */}
      <div className="w-96 bg-white border-l border-gray-100 flex flex-col shadow-xl">

        {/* Buyurtma turi */}
        <div className="p-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 text-base">🛒 Savatcha</h2>
            {cart.length > 0 && (
              <span className="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {cart.reduce((s, i) => s + i.quantity, 0)} ta
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {[
              ['dine_in',  '🪑', 'Zal'],
              ['takeaway', '🥡', 'Olib ketish'],
              ['delivery', '🛵', 'Yetkazish'],
            ].map(([v, icon, l]) => (
              <button
                key={v}
                onClick={() => setOrderType(v)}
                className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-0.5 ${
                  orderType === v
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-base">{icon}</span>
                <span>{l}</span>
              </button>
            ))}
          </div>

          {orderType === 'dine_in' && (
            <input
              className="input text-sm"
              placeholder="🪑 Stol raqami (masalan: 5)"
              value={table}
              onChange={e => setTable(e.target.value)}
            />
          )}
        </div>

        {/* Savatcha elementlari */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8">
              <span className="text-5xl mb-3">🛒</span>
              <p className="text-sm font-medium">Savatcha bo'sh</p>
              <p className="text-xs mt-1">Mahsulot tanlash uchun bosing</p>
            </div>
          ) : (
            cart.map(item => (
              <CartItem
                key={item.productId}
                item={item}
                onQtyChange={(qty) => changeQty(item.productId, qty)}
                onRemove={() => removeFromCart(item.productId)}
              />
            ))
          )}
        </div>

        {/* To'lov qismi */}
        <div className="p-4 border-t border-gray-100 space-y-3 flex-shrink-0">

          {/* Mijoz qidirish */}
          <div className="flex gap-2">
            <input
              className="input text-sm flex-1"
              placeholder="📞 Mijoz telefoni"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchCustomer()}
            />
            <button onClick={searchCustomer} className="btn-secondary text-xs px-3 flex-shrink-0">
              Topish
            </button>
          </div>
          {customer && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2 flex items-center gap-2">
              <span className="text-lg">👤</span>
              <div>
                <p className="text-sm font-semibold text-green-800">{customer.name}</p>
                <p className="text-xs text-green-600">{customer.bonusPoints || 0} bonus ball</p>
              </div>
            </div>
          )}

          {/* To'lov usuli */}
          <div className="grid grid-cols-5 gap-1.5">
            {[
              ['cash',  '💵', 'Naqd'],
              ['card',  '💳', 'Karta'],
              ['payme', '📱', 'Payme'],
              ['click', '📲', 'Click'],
              ['uzum',  '🛍️', 'Uzum'],
            ].map(([v, icon, l]) => (
              <button
                key={v}
                onClick={() => setPayMethod(v)}
                className={`py-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-0.5 ${
                  payMethod === v
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{icon}</span>
                <span>{l}</span>
              </button>
            ))}
          </div>

          {/* Hisob-kitob */}
          <div className="bg-gray-50 rounded-2xl p-3.5 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Mahsulotlar:</span>
              <span className="font-medium">{fmt(subtotal)} so'm</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>QQS (12%):</span>
              <span className="font-medium">{fmt(tax)} so'm</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
              <span className="font-bold text-gray-900">Jami to'lov:</span>
              <span className="text-xl font-bold text-orange-500">{fmt(total)} so'm</span>
            </div>
          </div>

          {/* Buyurtma tugmasi */}
          <button
            onClick={handleOrder}
            disabled={placing || cart.length === 0}
            className={`w-full py-3.5 rounded-2xl font-bold text-base transition-all ${
              cart.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.98]'
            }`}
          >
            {placing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Qabul qilinmoqda...
              </span>
            ) : `✅ Buyurtma qabul qilish — ${fmt(total)} so'm`}
          </button>

          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="w-full py-2 text-sm text-gray-400 hover:text-red-500 transition-colors font-medium"
            >
              🗑️ Savatchani tozalash
            </button>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
