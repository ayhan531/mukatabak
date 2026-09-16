import { useNavigate } from 'react-router-dom'
import { User, Shield, Bell, FileText, HelpCircle, LogOut, ChevronRight, Settings2, Wallet as WalletIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Account() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const items = [
    { icon: User, label: 'Kişisel Bilgiler', desc: 'Ad, e-posta ve iletişim bilgilerin', onClick: () => navigate('/app/hesap/kisisel') },
    { icon: Shield, label: 'Güvenlik', desc: 'Şifre değiştir', onClick: () => navigate('/app/hesap/guvenlik') },
    { icon: Bell, label: 'Bildirim Tercihleri', desc: 'Fiyat alarmı ve haber bildirimleri', onClick: () => navigate('/app/hesap/bildirimler') },
    { icon: WalletIcon, label: 'Sanal Bakiye', desc: 'Bakiye yükle / çek, işlem geçmişi', onClick: () => navigate('/app/hesap/bakiye') },
    { icon: FileText, label: 'İşlem Geçmişi', desc: 'Tüm demo işlemlerini görüntüle', onClick: () => navigate('/app/portfoy') },
    { icon: HelpCircle, label: 'Yardım Merkezi', desc: 'S.S.S. ve destek', onClick: () => navigate('/sss') },
  ]

  return (
    <div style={{ paddingTop: 8 }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Hesap</h1>

      <div className="card" style={{ padding: 20, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-blue), #5B86FF)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800, fontSize: 20 }}>
          {(user?.name || '?').slice(0, 1).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{user?.name}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
        </div>
        {user?.role === 'admin' && (
          <button className="btn btn-ghost" onClick={() => navigate('/admin')} style={{ padding: '8px 12px', fontSize: 12.5 }}>
            <Settings2 size={14} /> Admin
          </button>
        )}
      </div>

      <div className="card" style={{ padding: 8, marginBottom: 18 }}>
        {items.map(it => (
          <button key={it.label} onClick={it.onClick} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 10px', background: 'none', border: 'none', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,108,255,0.08)', display: 'grid', placeItems: 'center' }}>
              <it.icon size={17} color="var(--brand-blue)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{it.label}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>{it.desc}</div>
            </div>
            <ChevronRight size={16} color="var(--text-secondary)" />
          </button>
        ))}
      </div>

      <button className="btn btn-outline btn-block" onClick={async () => { await logout(); navigate('/') }} style={{ color: 'var(--down-red)', borderColor: 'var(--down-red-bg)' }}>
        <LogOut size={16} /> Çıkış Yap
      </button>

      <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', textAlign: 'center', marginTop: 24 }}>
        Mukatabak demo sürüm — sanal portföy simülasyonu.
      </p>
    </div>
  )
}
