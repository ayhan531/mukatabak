import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell, Newspaper } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext.jsx'
import { api } from '../../../lib/api'

export default function Notifications() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const [priceAlerts, setPriceAlerts] = useState(!!user?.notify_price_alerts)
  const [news, setNews] = useState(!!user?.notify_news)
  const [busy, setBusy] = useState(false)

  const toggle = async (key, value, setter) => {
    setter(value)
    setBusy(true)
    try {
      const res = await api.updateNotifications({ [key]: value })
      setUser(res.user)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ paddingTop: 8 }}>
      <button onClick={() => navigate('/app/hesap')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--brand-blue)', fontWeight: 600, fontSize: 13.5, marginBottom: 16, padding: 0 }}>
        <ArrowLeft size={16} /> Hesap
      </button>
      <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Bildirim Tercihleri</h1>

      <div className="card" style={{ padding: 8 }}>
        <ToggleRow icon={Bell} title="Fiyat Alarmları" desc="Takip ettiğin hisselerde büyük hareketlerde bildirim al" checked={priceAlerts} disabled={busy}
          onChange={v => toggle('notify_price_alerts', v, setPriceAlerts)} />
        <ToggleRow icon={Newspaper} title="Haber Bildirimleri" desc="Önemli piyasa haberlerinde bildirim al" checked={news} disabled={busy}
          onChange={v => toggle('notify_news', v, setNews)} last />
      </div>
    </div>
  )
}

function ToggleRow({ icon: Icon, title, desc, checked, onChange, disabled, last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 10px', borderBottom: last ? 'none' : '1px solid var(--border-subtle)' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,108,255,0.08)', display: 'grid', placeItems: 'center' }}>
        <Icon size={17} color="var(--brand-blue)" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>{desc}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        disabled={disabled}
        style={{
          width: 46, height: 27, borderRadius: 999, border: 'none', position: 'relative', flexShrink: 0,
          background: checked ? 'var(--brand-blue)' : '#CBD5E1', transition: 'background .2s',
        }}
      >
        <span style={{
          position: 'absolute', top: 3, left: checked ? 22 : 3, width: 21, height: 21, borderRadius: '50%',
          background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
        }} />
      </button>
    </div>
  )
}
