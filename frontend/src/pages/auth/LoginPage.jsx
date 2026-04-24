import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.svg';

function ApplyModal({ onClose }) {
  const [form, setForm] = useState({ contactName: '', phone: '', companyName: '', address: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.contactName.trim() || !form.phone.trim() || !form.companyName.trim()) {
      return toast.error('Barcha majburiy maydonlarni to\'ldiring');
    }
    setLoading(true);
    try {
      await authAPI.apply({ ...form, city: form.address });
      setSent(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Xatolik yuz berdi');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-slide-up">
        {sent ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-4xl">✅</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Ariza yuborildi!</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Arizangiz ko'rib chiqilib sizga tez orada login va parol taqdim qilinadi.
              Iltimos, telefon raqamingizni kuzatib boring.
            </p>
            <button onClick={onClose} className="btn-primary mt-6 w-full">Yopish</button>
          </div>
        ) : (
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Ariza yuborish</h3>
                <p className="text-gray-500 text-sm mt-0.5">Fastfoot ERP tizimiga ulaning</p>
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-lg transition-colors">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">F.I.O. *</label>
                <input value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })}
                  className="input" placeholder="Abdullayev Jasur Baxtiyorovich" required />
              </div>
              <div>
                <label className="label">Telefon raqam *</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="input" placeholder="+998 90 123 45 67" required />
              </div>
              <div>
                <label className="label">Fastfoot markazi nomi *</label>
                <input value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })}
                  className="input" placeholder="Fastfoot - Toshkent" required />
              </div>
              <div>
                <label className="label">Joylashgan manzil</label>
                <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                  className="input" placeholder="Toshkent sh., Chilonzor tumani, ..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-secondary flex-1">Bekor</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? '⏳ Yuborilmoqda...' : '📤 Yuborish'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [applyModal, setApplyModal] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return toast.error('Barcha maydonlarni to\'ldiring');
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      toast.success(`Xush kelibsiz, ${user.name}!`);
      if (user.role === 'superadmin') navigate('/superadmin');
      else if (user.role === 'director') navigate('/admin');
      else navigate('/erp');
    } catch (err) {
      toast.error(err?.message || 'Email yoki parol noto\'g\'ri');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { role: 'Super Admin', email: 'admin@fastfoot.uz', pass: 'Admin@123', color: 'bg-red-50 border-red-200 text-red-700' },
    { role: 'Direktor', email: 'director@fastfoot.uz', pass: 'Director@123', color: 'bg-orange-50 border-orange-200 text-orange-700' },
    { role: 'Kassir', email: 'cashier@fastfoot.uz', pass: 'Cashier@123', color: 'bg-green-50 border-green-200 text-green-700' },
  ];

  return (
    <>
      {applyModal && <ApplyModal onClose={() => setApplyModal(false)} />}

      <div className="min-h-screen flex">
        {/* Left panel */}
        <div className="hidden lg:flex w-1/2 bg-navy-900 flex-col items-center justify-center p-12 relative overflow-hidden"
             style={{ background: 'linear-gradient(135deg, #0f1a2e 0%, #1a2744 50%, #0f1a2e 100%)' }}>
          <div className="absolute inset-0 opacity-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="absolute border border-orange-400 rounded-full"
                style={{ width: `${(i+1)*120}px`, height: `${(i+1)*120}px`, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
            ))}
          </div>
          <img src={logo} alt="Fastfoot ERP" className="w-56 h-56 mb-8 drop-shadow-2xl animate-fade-in" />
          <h1 className="text-4xl font-bold text-white text-center mb-3">Fastfoot ERP</h1>
          <p className="text-blue-300 text-center text-lg mb-10">Professional restoran boshqaruv tizimi</p>
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
            {[
              { icon: '🏪', label: 'Ko\'p filial', desc: 'Markazlashgan boshqaruv' },
              { icon: '🖥️', label: 'POS Kassa', desc: 'Tezkor buyurtma' },
              { icon: '📊', label: 'Hisobotlar', desc: 'Real-vaqt statistika' },
              { icon: '🔐', label: 'Xavfsizlik', desc: 'JWT + rol boshqaruvi' },
            ].map(f => (
              <div key={f.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-2xl mb-1">{f.icon}</div>
                <p className="text-white font-semibold text-sm">{f.label}</p>
                <p className="text-blue-300 text-xs">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">
          <div className="w-full max-w-md animate-slide-up flex-1 flex flex-col justify-center">
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <img src={logo} alt="Fastfoot ERP" className="w-20 h-20 mx-auto mb-3" />
              <h1 className="text-2xl font-bold text-gray-900">Fastfoot ERP</h1>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Tizimga kirish</h2>
                <p className="text-gray-500 mt-1 text-sm">Hisob ma'lumotlaringizni kiriting</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="label">Email manzil</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">✉️</span>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      className="input pl-11" placeholder="email@fastfoot.uz" autoComplete="email" required />
                  </div>
                </div>
                <div>
                  <label className="label">Parol</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                    <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      className="input pl-11 pr-12" placeholder="••••••••" autoComplete="current-password" required />
                    <button type="button" onClick={() => setShowPass(p => !p)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Kirish...
                    </span>
                  ) : '🚀 Kirish'}
                </button>
              </form>

              {/* Demo accounts */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Demo hisoblar</p>
                <div className="space-y-2">
                  {demoAccounts.map(acc => (
                    <button key={acc.role} type="button"
                      onClick={() => { setEmail(acc.email); setPassword(acc.pass); }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-medium transition-all hover:shadow-sm ${acc.color}`}>
                      <span className="font-semibold">{acc.role}</span>
                      <span className="font-mono opacity-80">{acc.email}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="w-full max-w-md mt-6">
            <div className="flex items-center justify-center gap-6">
              <button onClick={() => setApplyModal(true)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors font-medium">
                <span className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">📋</span>
                Ariza yuborish
              </button>
              <div className="w-px h-6 bg-gray-200" />
              <a href="tel:+998934292599"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-500 transition-colors font-medium">
                <span className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">📞</span>
                Qo'llab-quvvatlash
              </a>
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">
              © 2025 Fastfoot ERP • Barcha huquqlar himoyalangan
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
