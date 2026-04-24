import { useEffect, useState } from 'react';
import { superAdminAPI } from '../../api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const STATUS = {
  pending:  { label: 'Kutmoqda', cls: 'badge-yellow', icon: '⏳' },
  approved: { label: 'Tasdiqlangan', cls: 'badge-green', icon: '✅' },
  rejected: { label: 'Rad etilgan', cls: 'badge-red', icon: '❌' },
};

export default function ApplicationsPage() {
  const [apps, setApps] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [detail, setDetail] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approvedInfo, setApprovedInfo] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      superAdminAPI.getApplications({ status: filter, limit: 50 }),
      superAdminAPI.getApplicationStats(),
    ]).then(([appsRes, statsRes]) => {
      setApps(appsRes.data);
      setStats(statsRes.data);
    }).catch(() => toast.error('Yuklanmadi'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleApprove = async (id) => {
    if (!confirm('Arizani tasdiqlaysizmi? Director hisobi yaratiladi.')) return;
    try {
      const res = await superAdminAPI.approveApplication(id);
      toast.success('Ariza tasdiqlandi!');
      setApprovedInfo(res.data);
      setDetail(null);
      load();
    } catch (err) {
      toast.error(err?.message || 'Xatolik');
    }
  };

  const handleReject = async () => {
    try {
      await superAdminAPI.rejectApplication(rejectModal.id, { reason: rejectReason });
      toast.success('Ariza rad etildi');
      setRejectModal(null); setRejectReason('');
      load();
    } catch {
      toast.error('Xatolik');
    }
  };

  return (
    <div className="p-7 space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">📋 Arizalar boshqaruvi</h1>
          <p className="page-subtitle">Fastfoot markazlarining ulash arizalari</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Jami arizalar', value: stats.total || 0, icon: '📋', color: 'bg-blue-50 text-blue-600' },
          { label: 'Kutmoqda', value: stats.pending || 0, icon: '⏳', color: 'bg-yellow-50 text-yellow-600' },
          { label: 'Tasdiqlangan', value: stats.approved || 0, icon: '✅', color: 'bg-green-50 text-green-600' },
          { label: 'Rad etilgan', value: stats.rejected || 0, icon: '❌', color: 'bg-red-50 text-red-600' },
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${s.color}`}>{s.icon}</div>
            <div><p className="text-xs text-gray-500">{s.label}</p><p className="text-2xl font-bold text-gray-900">{s.value}</p></div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[['', 'Hammasi'], ['pending', '⏳ Kutmoqda'], ['approved', '✅ Tasdiqlangan'], ['rejected', '❌ Rad etilgan']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === v ? 'bg-orange-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="w-full text-sm">
          <thead className="table-head">
            <tr>{['Kompaniya', 'Aloqa', 'Telefon', 'Shahar', 'Filiallar', 'Sana', 'Holat', ''].map(h => <th key={h} className="table-th">{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="8" className="text-center py-12 text-gray-400">Yuklanmoqda...</td></tr>
            : apps.length === 0 ? <tr><td colSpan="8" className="text-center py-12 text-gray-400">Arizalar yo'q</td></tr>
            : apps.map(a => (
              <tr key={a.id} className="table-row">
                <td className="table-td"><p className="font-semibold text-gray-900">{a.companyName}</p></td>
                <td className="table-td">{a.contactName}</td>
                <td className="table-td font-mono text-gray-600">{a.phone}</td>
                <td className="table-td text-gray-500">{a.city || '—'}</td>
                <td className="table-td"><span className="badge badge-blue">{a.branchCount} ta</span></td>
                <td className="table-td text-gray-400 text-xs">{new Date(a.createdAt).toLocaleDateString('uz-UZ')}</td>
                <td className="table-td">
                  <span className={`badge ${STATUS[a.status]?.cls}`}>{STATUS[a.status]?.icon} {STATUS[a.status]?.label}</span>
                </td>
                <td className="table-td">
                  <div className="flex gap-1">
                    <button onClick={() => setDetail(a)} className="btn-ghost text-xs py-1 px-2">Ko'rish</button>
                    {a.status === 'pending' && <>
                      <button onClick={() => handleApprove(a.id)} className="px-2 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-xs font-medium">✅</button>
                      <button onClick={() => { setRejectModal(a); setRejectReason(''); }} className="px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-medium">❌</button>
                    </>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title="Ariza tafsilotlari" size="md">
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                ['Kompaniya', detail.companyName], ['Aloqa shaxsi', detail.contactName],
                ['Telefon', detail.phone], ['Email', detail.email],
                ['Shahar', detail.city], ['Filial soni', detail.branchCount + ' ta'],
              ].map(([k, v]) => (
                <div key={k} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{k}</p>
                  <p className="font-semibold text-gray-900">{v || '—'}</p>
                </div>
              ))}
            </div>
            {detail.message && <div className="bg-blue-50 rounded-xl p-4"><p className="text-xs text-blue-400 mb-1">Xabar</p><p className="text-sm text-blue-800">{detail.message}</p></div>}
            {detail.status === 'approved' && detail.directorEmail && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
                <p className="font-semibold text-green-800">✅ Director login ma'lumotlari:</p>
                <div className="font-mono text-sm bg-white rounded-lg p-3 space-y-1">
                  <p>📧 {detail.directorEmail}</p>
                  <p>🔑 {detail.directorPassword}</p>
                </div>
              </div>
            )}
            {detail.status === 'rejected' && <div className="bg-red-50 rounded-xl p-4"><p className="text-xs text-red-400 mb-1">Rad etish sababi</p><p className="text-sm text-red-700">{detail.rejectedReason}</p></div>}
            {detail.status === 'pending' && (
              <div className="flex gap-3 pt-2">
                <button onClick={() => handleApprove(detail.id)} className="btn-primary flex-1">✅ Tasdiqlash</button>
                <button onClick={() => { setRejectModal(detail); setDetail(null); }} className="btn-danger flex-1">❌ Rad etish</button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={!!rejectModal} onClose={() => setRejectModal(null)} title="Arizani rad etish" size="sm">
        <div className="space-y-4">
          <p className="text-gray-600 text-sm"><strong>{rejectModal?.companyName}</strong> arizasini rad etmoqchisiz.</p>
          <div><label className="label">Rad etish sababi</label><textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="input" rows={3} placeholder="Masalan: Hujjatlar to'liq emas..." /></div>
          <div className="flex gap-3"><button onClick={() => setRejectModal(null)} className="btn-secondary flex-1">Bekor</button><button onClick={handleReject} className="btn-danger flex-1">Rad etish</button></div>
        </div>
      </Modal>

      {/* Approved Info Modal */}
      <Modal isOpen={!!approvedInfo} onClose={() => setApprovedInfo(null)} title="✅ Ariza tasdiqlandi!" size="sm">
        {approvedInfo && (
          <div className="space-y-4">
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5">
              <p className="font-bold text-green-800 text-center mb-4">Director login ma'lumotlari</p>
              <div className="space-y-3">
                <div className="bg-white rounded-xl p-3 flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Email:</span>
                  <span className="font-mono font-bold text-gray-900">{approvedInfo.director?.email}</span>
                </div>
                <div className="bg-white rounded-xl p-3 flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Parol:</span>
                  <span className="font-mono font-bold text-orange-600">{approvedInfo.director?.password}</span>
                </div>
              </div>
              <p className="text-xs text-green-600 mt-3 text-center">Bu ma'lumotlarni direktorga yuboring!</p>
            </div>
            <button onClick={() => setApprovedInfo(null)} className="btn-primary w-full">Yopish</button>
          </div>
        )}
      </Modal>
    </div>
  );
}
