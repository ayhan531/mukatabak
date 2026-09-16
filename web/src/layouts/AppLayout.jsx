import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Home, LineChart, Wallet, User, ArrowLeftRight, Bell, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const TABS = [
  { to: '/app', label: 'Ana Sayfa', icon: Home, end: true },
  { to: '/app/hisseler', label: 'Hisseler', icon: LineChart },
  { to: '/app/al-sat', label: '', icon: ArrowLeftRight, isCenter: true },
  { to: '/app/portfoy', label: 'Portföy', icon: Wallet },
  { to: '/app/hesap', label: 'Hesap', icon: User },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="phone-shell">
      <div className="phone-frame">
        <div className="phone-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/brand/appicon.png" width={28} height={28} alt="" style={{ borderRadius: 8 }} />
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Hoş geldin</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{user?.name || 'Yatırımcı'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="icon-btn" title="Bildirimler"><Bell size={18} /></button>
            <button className="icon-btn" title="Çıkış" onClick={async () => { await logout(); navigate('/') }}><LogOut size={18} /></button>
          </div>
        </div>

        <div className="phone-content">
          <Outlet />
        </div>

        <nav className="phone-bottomnav">
          {TABS.map(t => {
            const Icon = t.icon
            if (t.isCenter) {
              return (
                <button key={t.to} className="tab-center" onClick={() => navigate(t.to)}>
                  <Icon size={22} color="#fff" />
                </button>
              )
            }
            const active = t.end ? location.pathname === t.to : location.pathname.startsWith(t.to)
            return (
              <NavLink key={t.to} to={t.to} end={t.end} className="tab-item" style={{ color: active ? 'var(--brand-blue)' : 'var(--text-secondary)' }}>
                <Icon size={20} />
                <span>{t.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>

      <style>{`
        .phone-shell {
          min-height: 100vh;
          background: linear-gradient(180deg, #EEF3FF 0%, #F4F7FE 40%);
          display: flex;
          justify-content: center;
          padding: 0;
        }
        .phone-frame {
          width: 100%;
          max-width: 480px;
          min-height: 100vh;
          background: var(--bg-app);
          display: flex;
          flex-direction: column;
          position: relative;
          box-shadow: 0 0 60px rgba(15,23,42,0.06);
        }
        @media (min-width: 640px) {
          .phone-shell { height: 100vh; overflow: hidden; padding: 28px 0 0; align-items: flex-start; }
          .phone-frame { height: calc(100vh - 28px); min-height: 0; border-radius: 32px 32px 0 0; overflow: hidden; border: 1px solid var(--border-subtle); }
        }
        .phone-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 20px 14px; background: var(--bg-app);
          position: sticky; top: 0; z-index: 5;
        }
        .icon-btn {
          width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--border-subtle);
          background: #fff; display: grid; place-items: center; color: var(--text-secondary);
        }
        .phone-content {
          flex: 1; overflow-y: auto; padding: 0 20px 100px;
          overscroll-behavior: contain;
        }
        .phone-shell { overscroll-behavior: contain; }
        .phone-bottomnav {
          position: sticky; bottom: 0; left: 0; right: 0;
          display: grid; grid-template-columns: 1fr 1fr 64px 1fr 1fr;
          align-items: center; gap: 4px;
          background: #fff; border-top: 1px solid var(--border-subtle);
          padding: 10px 10px calc(10px + env(safe-area-inset-bottom));
        }
        .tab-item {
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          font-size: 11px; font-weight: 600; padding: 6px 0;
        }
        .tab-center {
          width: 52px; height: 52px; border-radius: 50%; border: none;
          background: linear-gradient(135deg, var(--brand-blue), #5B86FF);
          display: grid; place-items: center; margin: 0 auto;
          box-shadow: 0 10px 24px rgba(59,108,255,0.35);
          transform: translateY(-14px);
        }
      `}</style>
    </div>
  )
}
