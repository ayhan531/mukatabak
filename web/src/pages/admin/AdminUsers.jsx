import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { fmtMoney } from '../../lib/format'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [busyId, setBusyId] = useState(null)

  const load = () => api.adminUsers().then(d => setUsers(d.users)).catch(() => {})
  useEffect(() => { load() }, [])

  const toggleRole = async (u) => {
    setBusyId(u.id)
    try {
      await api.adminUserUpdate(u.id, { role: u.role === 'admin' ? 'user' : 'admin' })
      await load()
    } finally { setBusyId(null) }
  }

  const toggleActive = async (u) => {
    setBusyId(u.id)
    try {
      await api.adminUserUpdate(u.id, { active: !u.active })
      await load()
    } finally { setBusyId(null) }
  }

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Kullanıcılar</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{users.length} kayıtlı kullanıcı</p>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: 'var(--bg-app)', textAlign: 'left' }}>
              {['Ad Soyad', 'E-posta', 'Sanal Bakiye', 'Rol', 'Durum', 'Kayıt Tarihi', ''].map(h => (
                <th key={h} style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>{u.name}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{u.email}</td>
                <td style={{ padding: '12px 16px' }}>{fmtMoney(u.cash)}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span className="pill" style={{ background: u.role === 'admin' ? 'rgba(59,108,255,0.1)' : 'var(--bg-app)', color: u.role === 'admin' ? 'var(--brand-blue)' : 'var(--text-secondary)' }}>{u.role}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span className={`pill ${u.active ? 'pill-up' : 'pill-down'}`}>{u.active ? 'Aktif' : 'Pasif'}</span>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{u.created_at}</td>
                <td style={{ padding: '12px 16px', display: 'flex', gap: 6 }}>
                  <button disabled={busyId === u.id} onClick={() => toggleRole(u)} className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 12 }}>
                    {u.role === 'admin' ? 'Admin Kaldır' : 'Admin Yap'}
                  </button>
                  <button disabled={busyId === u.id} onClick={() => toggleActive(u)} className="btn btn-outline" style={{ padding: '6px 10px', fontSize: 12 }}>
                    {u.active ? 'Pasifleştir' : 'Aktifleştir'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>Kayıtlı kullanıcı yok.</div>}
      </div>
    </div>
  )
}
