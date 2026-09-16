import { useEffect, useState } from 'react'
import { Users, Newspaper, Wallet, Activity } from 'lucide-react'
import { api } from '../../lib/api'
import { fmtMoney } from '../../lib/format'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => { api.adminStats().then(setStats).catch(() => {}) }, [])

  const cards = [
    { icon: Users, label: 'Toplam Kullanıcı', value: stats?.total_users ?? '—' },
    { icon: Activity, label: 'Toplam İşlem', value: stats?.total_orders ?? '—' },
    { icon: Wallet, label: 'Toplam Sanal Bakiye', value: stats ? fmtMoney(stats.total_virtual_cash) : '—' },
    { icon: Newspaper, label: 'Blog Yazısı', value: stats?.total_posts ?? '—' },
  ]

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Genel Bakış</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Platform kullanım özetini buradan takip edebilirsin.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
        {cards.map(c => (
          <div key={c.label} className="card" style={{ padding: 22 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(59,108,255,0.1)', display: 'grid', placeItems: 'center', marginBottom: 14 }}>
              <c.icon size={19} color="var(--brand-blue)" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{c.value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 24, marginTop: 24 }}>
        <div style={{ fontWeight: 700, marginBottom: 14 }}>Son Kayıt Olan Kullanıcılar</div>
        {stats?.recent_users?.map(u => (
          <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: 14 }}>
            <span style={{ fontWeight: 600 }}>{u.name}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{u.email}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{u.created_at}</span>
          </div>
        ))}
        {(!stats?.recent_users || stats.recent_users.length === 0) && <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Henüz kayıt yok.</p>}
      </div>
    </div>
  )
}
