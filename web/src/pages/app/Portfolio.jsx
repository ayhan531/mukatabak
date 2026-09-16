import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { api } from '../../lib/api'
import { fmtMoney, fmtPct } from '../../lib/format'

const TABS = ['Varlıklarım', 'Geçmiş', 'Emirler']

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState(null)
  const [orders, setOrders] = useState([])
  const [tab, setTab] = useState('Varlıklarım')
  const navigate = useNavigate()

  useEffect(() => {
    api.portfolio().then(setPortfolio).catch(() => {})
    api.orders().then(d => setOrders(d.orders)).catch(() => {})
  }, [])

  const positions = portfolio?.positions || []
  const filled = orders.filter(o => o.status === 'filled')
  const openOrders = orders.filter(o => o.status !== 'filled')

  return (
    <div style={{ paddingTop: 8 }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Portföyüm</h1>

      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Toplam Portföy Değeri</div>
        <div style={{ fontSize: 28, fontWeight: 800, margin: '6px 0 10px' }}>{portfolio ? fmtMoney(portfolio.total_value) : '—'}</div>
        {portfolio && (
          <div className={`pill ${portfolio.day_change >= 0 ? 'pill-up' : 'pill-down'}`}>
            {portfolio.day_change >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {fmtMoney(portfolio.day_change)} (Günlük {fmtPct(portfolio.day_change_pct)})
          </div>
        )}
        <div style={{ display: 'flex', gap: 24, marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>T+2 Bakiye</div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{portfolio ? fmtMoney(portfolio.cash) : '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>Kullanılabilir</div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{portfolio ? fmtMoney(portfolio.available_cash) : '—'}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 4, marginBottom: 16 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '9px 0', borderRadius: 9, border: 'none', fontWeight: 700, fontSize: 13,
            background: tab === t ? 'var(--brand-blue)' : 'transparent',
            color: tab === t ? '#fff' : 'var(--text-secondary)',
          }}>{t}</button>
        ))}
      </div>

      {tab === 'Varlıklarım' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.8fr 1fr', padding: '10px 14px', fontSize: 11.5, color: 'var(--text-secondary)', fontWeight: 700, borderBottom: '1px solid var(--border-subtle)' }}>
            <span>Sembol</span><span style={{ textAlign: 'right' }}>Adet</span><span style={{ textAlign: 'right' }}>Güncel Değer</span>
          </div>
          {positions.map(p => (
            <div key={p.symbol} onClick={() => navigate(`/app/al-sat/${p.symbol}`)} style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.8fr 1fr', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src={`/stocks/logo_${p.symbol.toLowerCase()}.png`} width={28} height={28} style={{ borderRadius: 8 }} alt="" onError={e => e.currentTarget.style.visibility = 'hidden'} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{p.symbol}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{p.name}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontWeight: 600, fontSize: 13.5 }}>{p.qty}</div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{fmtMoney(p.value)}</div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: p.day_change >= 0 ? 'var(--up-green)' : 'var(--down-red)' }}>
                  {p.day_change >= 0 ? '+' : ''}{fmtMoney(p.day_change)}
                </div>
              </div>
            </div>
          ))}
          {positions.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13.5 }}>Henüz varlığın yok. Hisseler sekmesinden alım yapabilirsin.</div>}
        </div>
      )}

      {tab === 'Geçmiş' && (
        <div className="card" style={{ padding: 8 }}>
          {filled.map(o => <OrderRow key={o.id} o={o} />)}
          {filled.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13.5 }}>İşlem geçmişin boş.</div>}
        </div>
      )}

      {tab === 'Emirler' && (
        <div className="card" style={{ padding: 8 }}>
          {openOrders.map(o => <OrderRow key={o.id} o={o} />)}
          {openOrders.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13.5 }}>Bekleyen emrin yok.</div>}
        </div>
      )}
    </div>
  )
}

function OrderRow({ o }) {
  const up = o.side === 'buy'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: up ? 'var(--up-green-bg)' : 'var(--down-red-bg)', display: 'grid', placeItems: 'center', color: up ? 'var(--up-green)' : 'var(--down-red)', fontWeight: 800, fontSize: 12 }}>
        {up ? 'AL' : 'SAT'}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 13.5 }}>{o.symbol} · {o.qty} adet</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>{o.date}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 700, fontSize: 13.5 }}>{fmtMoney(o.total)}</div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{o.status === 'filled' ? 'Gerçekleşti' : 'Bekliyor'}</div>
      </div>
    </div>
  )
}
