import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Newspaper, HelpCircle, LogOut, Home } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const LINKS = [
  { to: '/admin', label: 'Genel Bakış', icon: LayoutDashboard, end: true },
  { to: '/admin/kullanicilar', label: 'Kullanıcılar', icon: Users },
  { to: '/admin/blog', label: 'Blog Yönetimi', icon: Newspaper },
  { to: '/admin/sss', label: 'S.S.S. Yönetimi', icon: HelpCircle },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-app)' }}>
      <aside style={{ width: 260, background: 'var(--bg-dark)', color: '#fff', padding: '24px 16px', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px 24px', fontWeight: 700, fontSize: 18 }}>
          <img src="/brand/appicon.png" width={32} height={32} alt="" style={{ borderRadius: 8 }} />
          Mukatabak Admin
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {LINKS.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12,
              fontSize: 14.5, fontWeight: 600,
              background: isActive ? 'rgba(59,108,255,0.18)' : 'transparent',
              color: isActive ? '#7FA0FF' : '#CBD5E1',
            })}>
              <l.icon size={18} /> {l.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ borderTop: '1px solid #1E293B', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button onClick={() => navigate('/app')} style={navBtn}><Home size={18} /> Platforma Dön</button>
          <button onClick={async () => { await logout(); navigate('/') }} style={navBtn}><LogOut size={18} /> Çıkış Yap</button>
          <div style={{ fontSize: 12, color: '#64748B', padding: '10px 14px 0' }}>{user?.email}</div>
        </div>
      </aside>
      <main style={{ flex: 1, padding: '32px 40px', minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  )
}

const navBtn = {
  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12,
  fontSize: 14, fontWeight: 600, background: 'transparent', border: 'none', color: '#CBD5E1', textAlign: 'left',
}
