import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const NAV = [
  { to: '/', label: 'Ana Sayfa' },
  { to: '/kurumsal', label: 'Kurumsal' },
  { to: '/blog', label: 'Blog' },
  { to: '/sss', label: 'S.S.S.' },
  { to: '/iletisim', label: 'İletişim' },
]

export default function SiteLayout() {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'var(--bg-header-glass)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 20 }}>
            <img src="/brand/appicon.png" width={36} height={36} alt="Mukatabak" style={{ borderRadius: 10 }} />
            Mukatabak
          </Link>

          <nav style={{ display: 'flex', gap: 28 }} className="site-nav-desktop">
            {NAV.map(n => (
              <NavLink key={n.to} to={n.to} end={n.to === '/'} style={({ isActive }) => ({
                fontWeight: 600, fontSize: 15, color: isActive ? 'var(--brand-blue)' : 'var(--text-secondary)'
              })}>{n.label}</NavLink>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="site-nav-desktop">
            {user ? (
              <button className="btn btn-primary" onClick={() => navigate('/app')}>
                Platforma Git <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <button className="btn btn-ghost" onClick={() => navigate('/giris')}>Giriş Yap</button>
                <button className="btn btn-primary" onClick={() => navigate('/kayit')}>Ücretsiz Başla</button>
              </>
            )}
          </div>

          <button aria-label="menu" onClick={() => setOpen(o => !o)} className="site-nav-toggle" style={{ display: 'none', background: 'none', border: 'none' }}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {open && (
          <div className="container" style={{ paddingBottom: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {NAV.map(n => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} style={{ fontWeight: 600 }}>{n.label}</Link>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              {user ? (
                <button className="btn btn-primary btn-block" onClick={() => { setOpen(false); navigate('/app') }}>Platforma Git</button>
              ) : (
                <>
                  <button className="btn btn-outline btn-block" onClick={() => { setOpen(false); navigate('/giris') }}>Giriş Yap</button>
                  <button className="btn btn-primary btn-block" onClick={() => { setOpen(false); navigate('/kayit') }}>Kayıt Ol</button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer style={{ background: 'var(--bg-dark)', color: 'var(--text-inverse)', marginTop: 80 }}>
        <div className="container" style={{ padding: '56px 24px 28px', display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 20, marginBottom: 12 }}>
              <img src="/brand/appicon.png" width={32} height={32} alt="" style={{ borderRadius: 8 }} />
              Mukatabak
            </div>
            <p style={{ color: '#94A3B8', fontSize: 14, lineHeight: 1.7, maxWidth: 320 }}>
              Mukatabak; hisse senedi takibi, sanal portföy yönetimi ve piyasa haberlerini tek bir
              deneyimde birleştiren bir demo yatırım eğitim platformudur. Gerçek para transferi
              veya gerçek yatırım hizmeti içermez.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: 14, color: '#CBD5E1', marginBottom: 14 }}>Kurumsal</h4>
            <FootLink to="/kurumsal">Hakkımızda</FootLink>
            <FootLink to="/blog">Blog</FootLink>
            <FootLink to="/sss">Sıkça Sorulan Sorular</FootLink>
            <FootLink to="/iletisim">İletişim</FootLink>
          </div>
          <div>
            <h4 style={{ fontSize: 14, color: '#CBD5E1', marginBottom: 14 }}>Platform</h4>
            <FootLink to="/giris">Giriş Yap</FootLink>
            <FootLink to="/kayit">Kayıt Ol</FootLink>
            <FootLink to="/app">Uygulamaya Git</FootLink>
          </div>
          <div>
            <h4 style={{ fontSize: 14, color: '#CBD5E1', marginBottom: 14 }}>Yasal</h4>
            <p style={{ color: '#64748B', fontSize: 12.5, lineHeight: 1.7 }}>
              Bu platform demo/eğitim amaçlıdır, yatırım danışmanlığı veya aracı kurum hizmeti
              değildir. Gösterilen fiyat ve bakiyeler simülasyondur.
            </p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #1E293B', textAlign: 'center', padding: '18px 0', color: '#64748B', fontSize: 13 }}>
          © {new Date().getFullYear()} Mukatabak. Tüm hakları saklıdır.
        </div>
      </footer>

      <style>{`
        @media (max-width: 860px) {
          .site-nav-desktop { display: none !important; }
          .site-nav-toggle { display: block !important; }
        }
        @media (max-width: 720px) {
          footer .container { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function FootLink({ to, children }) {
  return <Link to={to} style={{ display: 'block', color: '#94A3B8', fontSize: 14, marginBottom: 10 }}>{children}</Link>
}
