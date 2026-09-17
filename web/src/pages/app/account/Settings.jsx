import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Moon, Sun, Globe, Type } from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext.jsx'

export default function Settings() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  return (
    <div style={{ paddingTop: 8 }}>
      <button onClick={() => navigate('/app/hesap')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--brand-blue)', fontWeight: 600, fontSize: 13.5, marginBottom: 16, padding: 0 }}>
        <ArrowLeft size={16} /> Hesap
      </button>
      <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Ayarlar</h1>

      <div className="card" style={{ padding: 8 }}>
        <Row icon={theme === 'dark' ? Sun : Moon} title="Görünüm" desc={theme === 'dark' ? 'Karanlık mod açık' : 'Aydınlık mod açık'}>
          <button onClick={toggleTheme} style={{
            width: 46, height: 27, borderRadius: 999, border: 'none', position: 'relative', flexShrink: 0,
            background: theme === 'dark' ? 'var(--brand-blue)' : '#CBD5E1', transition: 'background .2s',
          }}>
            <span style={{
              position: 'absolute', top: 3, left: theme === 'dark' ? 22 : 3, width: 21, height: 21, borderRadius: '50%',
              background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
            }} />
          </button>
        </Row>
        <Row icon={Globe} title="Dil" desc="Uygulama dili" last>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-secondary)' }}>Türkçe</span>
        </Row>
      </div>

      <div className="card" style={{ padding: 16, marginTop: 16, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <Type size={18} color="var(--text-secondary)" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          Yazı boyutu ve ek dil seçenekleri yakında eklenecek.
        </p>
      </div>
    </div>
  )
}

function Row({ icon: Icon, title, desc, children, last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 10px', borderBottom: last ? 'none' : '1px solid var(--border-subtle)' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,108,255,0.08)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <Icon size={17} color="var(--brand-blue)" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>{desc}</div>
      </div>
      {children}
    </div>
  )
}
