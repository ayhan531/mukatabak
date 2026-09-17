import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Moon, Sun, ShieldCheck, ArrowDownCircle, ArrowUpCircle, Wallet as WalletIcon,
  History, ListOrdered, Bell, Shield, Settings2, FileText, LogOut, ChevronRight, Settings as AdminIcon,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import { api } from '../../lib/api'
import { fmtMoney } from '../../lib/format'

export default function Account() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [portfolio, setPortfolio] = useState(null)

  useEffect(() => { api.portfolio().then(setPortfolio).catch(() => {}) }, [])

  const accountNo = user ? String(4470000000 + user.id * 137).slice(-8).replace(/(\d{4})(\d{4})/, '$1 $2') : ''

  const items = [
    { icon: History, label: 'Geçmiş İşlemler', desc: 'Valörü tamamlanan alış ve satışlar', onClick: () => navigate('/app/portfoy?tab=gecmis') },
    { icon: ListOrdered, label: 'Emirlerim', desc: 'Valör bekleyen (T+2) emirler', onClick: () => navigate('/app/portfoy?tab=emirler') },
    { icon: Bell, label: 'Bildirimler', desc: 'Fiyat alarmı ve haber bildirimleri', onClick: () => navigate('/app/hesap/bildirimler') },
    { icon: Shield, label: 'Güvenlik', desc: 'Şifre değiştir', onClick: () => navigate('/app/hesap/guvenlik') },
    { icon: Settings2, label: 'Ayarlar', desc: 'Dil, tema, görünüm', onClick: () => navigate('/app/hesap/ayarlar') },
    { icon: FileText, label: 'Güvenlik Politikası ve Sözleşmeler', desc: 'KVKK, çerçeve sözleşme, risk bildirimi', onClick: () => navigate('/app/hesap/sozlesmeler') },
  ]

  return (
    <div style={{ paddingTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>Hesap</h1>
        <button onClick={toggleTheme} className="icon-btn" title="Görünüm">
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>

      <div onClick={() => navigate('/app/hesap/kisisel')} className="card" style={{ padding: 20, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-blue), #5B86FF)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800, fontSize: 20, flexShrink: 0 }}>
          {(user?.name || '?').slice(0, 1).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{user?.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Hesap No · {accountNo}</div>
          <div className="pill pill-up" style={{ marginTop: 6 }}><ShieldCheck size={12} /> Doğrulanmış hesap</div>
        </div>
        {user?.role === 'admin' && (
          <button className="btn btn-ghost" onClick={e => { e.stopPropagation(); navigate('/admin') }} style={{ padding: '8px 10px', fontSize: 12 }}>
            <AdminIcon size={14} /> Admin
          </button>
        )}
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 16, background: 'var(--bg-card-gradient)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Kullanılabilir Bakiye</div>
            <div style={{ fontSize: 26, fontWeight: 800, marginTop: 2 }}>{portfolio ? fmtMoney(portfolio.available_cash) : '—'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>T+2 bakiye {portfolio ? fmtMoney(portfolio.cash) : '—'}</div>
          </div>
          <button onClick={() => navigate('/app/hesap/bakiye')} className="icon-btn" title="Sanal Bakiye">
            <WalletIcon size={17} />
          </button>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn" onClick={() => navigate('/app/hesap/bakiye', { state: { mode: 'deposit' } })} style={{ flex: 1, background: 'var(--up-green)', color: '#fff', fontWeight: 700 }}>
            <ArrowDownCircle size={16} /> Para Yatır
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/app/hesap/bakiye', { state: { mode: 'withdraw' } })} style={{ flex: 1, fontWeight: 700 }}>
            <ArrowUpCircle size={16} /> Para Çek
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 8, marginBottom: 18 }}>
        {items.map(it => (
          <button key={it.label} onClick={it.onClick} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 10px', background: 'none', border: 'none', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,108,255,0.08)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
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
