import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown, Newspaper, ArrowUpRight, ArrowDownRight, ArrowLeftRight } from 'lucide-react'
import { api } from '../../lib/api'
import { fmtMoney, fmtPct } from '../../lib/format'

export default function Home() {
  const [portfolio, setPortfolio] = useState(null)
  const [stocks, setStocks] = useState([])
  const [news, setNews] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    api.portfolio().then(setPortfolio).catch(() => {})
    api.stocks().then(d => setStocks(d.stocks.slice(0, 4))).catch(() => {})
    api.news().then(d => setNews(d.items.slice(0, 3))).catch(() => {})
  }, [])

  return (
    <div style={{ paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="card" style={{ padding: 22, background: 'linear-gradient(135deg, #1D2E63, #0F172A)', color: '#fff', border: 'none' }}>
        <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 6 }}>Toplam Portföy Değeri</div>
        <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 10 }}>
          {portfolio ? fmtMoney(portfolio.total_value) : '—'}
        </div>
        {portfolio && (
          <div className="pill" style={{ background: portfolio.day_change >= 0 ? 'rgba(74,222,128,0.16)' : 'rgba(239,68,68,0.18)', color: portfolio.day_change >= 0 ? '#4ADE80' : '#F87171' }}>
            {portfolio.day_change >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {fmtMoney(portfolio.day_change)} ({fmtPct(portfolio.day_change_pct)})
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
          <div>
            <div style={{ fontSize: 11.5, color: '#94A3B8' }}>T+2 Bakiye</div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{portfolio ? fmtMoney(portfolio.cash) : '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: '#94A3B8' }}>Kullanılabilir</div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{portfolio ? fmtMoney(portfolio.available_cash) : '—'}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <QuickAction icon={ArrowUpRight} label="Hisse Al" color="var(--up-green)" bg="var(--up-green-bg)" onClick={() => navigate('/app/al-sat')} />
        <QuickAction icon={ArrowLeftRight} label="Hisseler" color="var(--brand-blue)" bg="rgba(59,108,255,0.1)" onClick={() => navigate('/app/hisseler')} />
      </div>

      <div>
        <SectionHead title="Piyasa Özeti" onMore={() => navigate('/app/hisseler')} />
        <div className="card" style={{ padding: 8 }}>
          {stocks.map(s => (
            <div key={s.symbol} onClick={() => navigate(`/app/al-sat/${s.symbol}`)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 10px', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}>
              <img src={`/stocks/logo_${s.symbol.toLowerCase()}.png`} width={32} height={32} style={{ borderRadius: 8 }} alt="" onError={e => e.currentTarget.style.visibility = 'hidden'} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{s.symbol}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{fmtMoney(s.price)}</div>
                <div className={`pill ${s.change_pct >= 0 ? 'pill-up' : 'pill-down'}`} style={{ marginTop: 2 }}>
                  {s.change_pct >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />} {fmtPct(s.change_pct)}
                </div>
              </div>
            </div>
          ))}
          {stocks.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13.5 }}>Yükleniyor…</div>}
        </div>
      </div>

      <div>
        <SectionHead title="Piyasa Haberleri" icon={Newspaper} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {news.map((n, i) => (
            <div key={i} className="card" style={{ padding: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>{n.title}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{n.summary}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SectionHead({ title, onMore, icon: Icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 15 }}>
        {Icon && <Icon size={16} color="var(--brand-blue)" />} {title}
      </div>
      {onMore && <button onClick={onMore} style={{ background: 'none', border: 'none', color: 'var(--brand-blue)', fontWeight: 600, fontSize: 13 }}>Tümü</button>}
    </div>
  )
}

function QuickAction({ icon: Icon, label, color, bg, onClick }) {
  return (
    <button onClick={onClick} className="card" style={{ padding: '16px 14px', display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--border-subtle)' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: 'grid', placeItems: 'center' }}>
        <Icon size={18} color={color} />
      </div>
      <span style={{ fontWeight: 700, fontSize: 14 }}>{label}</span>
    </button>
  )
}
