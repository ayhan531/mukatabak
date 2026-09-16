import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react'
import { api } from '../../lib/api'
import { fmtMoney, fmtPct } from '../../lib/format'

export default function StockDetail() {
  const { symbol } = useParams()
  const navigate = useNavigate()
  const [stock, setStock] = useState(null)
  const [history, setHistory] = useState([])

  useEffect(() => {
    let alive = true
    api.stock(symbol).then(d => alive && setStock(d.stock)).catch(() => {})
    api.stockHistory(symbol).then(d => alive && setHistory(d.points || [])).catch(() => {})
    return () => { alive = false }
  }, [symbol])

  if (!stock) {
    return <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>Yükleniyor…</div>
  }

  const up = stock.change_pct >= 0
  const prices = history.map(h => h.price)
  const min = Math.min(...prices, stock.price)
  const max = Math.max(...prices, stock.price)
  const range = max - min || 1
  const W = 320, H = 100
  const path = history.map((h, i) => {
    const x = (i / Math.max(1, history.length - 1)) * W
    const y = H - ((h.price - min) / range) * H
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  const areaPath = history.length ? `${path} L${W},${H} L0,${H} Z` : ''

  return (
    <div style={{ paddingTop: 8 }}>
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--brand-blue)', fontWeight: 600, fontSize: 13.5, marginBottom: 16, padding: 0 }}>
        <ArrowLeft size={16} /> Geri
      </button>

      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <img src={`/stocks/logo_${stock.symbol.toLowerCase()}.png`} width={44} height={44} style={{ borderRadius: 12 }} alt="" onError={e => e.currentTarget.style.visibility = 'hidden'} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{stock.symbol}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{stock.name}</div>
          </div>
        </div>

        <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 6 }}>{fmtMoney(stock.price)}</div>
        <div className={`pill ${up ? 'pill-up' : 'pill-down'}`} style={{ marginBottom: 16 }}>
          {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />} {fmtPct(stock.change_pct)} (bugün)
        </div>

        {history.length > 1 && (
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="110" preserveAspectRatio="none">
            <defs>
              <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={up ? 'var(--up-green)' : 'var(--down-red)'} stopOpacity="0.25" />
                <stop offset="100%" stopColor={up ? 'var(--up-green)' : 'var(--down-red)'} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#sparkFill)" />
            <path d={path} fill="none" stroke={up ? 'var(--up-green)' : 'var(--down-red)'} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
          <Stat label="Gün İçi Düşük" value={fmtMoney(Math.min(...prices, stock.price))} />
          <Stat label="Gün İçi Yüksek" value={fmtMoney(Math.max(...prices, stock.price))} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-block btn-lg" style={{ background: 'var(--up-green)', color: '#fff' }} onClick={() => navigate(`/app/al-sat/${stock.symbol}`, { state: { side: 'buy' } })}>
          Al
        </button>
        <button className="btn btn-block btn-lg" style={{ background: 'var(--down-red)', color: '#fff' }} onClick={() => navigate(`/app/al-sat/${stock.symbol}`, { state: { side: 'sell' } })}>
          Sat
        </button>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 14.5 }}>{value}</div>
    </div>
  )
}
