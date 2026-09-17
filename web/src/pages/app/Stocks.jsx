import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, TrendingUp, TrendingDown } from 'lucide-react'
import { api } from '../../lib/api'
import { fmtMoney, fmtPct } from '../../lib/format'
import Sparkline from '../../components/Sparkline.jsx'

export default function Stocks() {
  const [stocks, setStocks] = useState([])
  const [histories, setHistories] = useState({})
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.stocks().then(async d => {
      setStocks(d.stocks)
      const entries = await Promise.all(d.stocks.map(async s => {
        try {
          const h = await api.stockHistory(s.symbol)
          return [s.symbol, h.points.map(p => p.price)]
        } catch { return [s.symbol, null] }
      }))
      setHistories(Object.fromEntries(entries))
    }).catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return []
    return stocks.filter(s => s.symbol.toLowerCase().includes(term) || s.name.toLowerCase().includes(term))
  }, [stocks, q])

  const gainers = useMemo(() => [...stocks].filter(s => s.change_pct >= 0).sort((a, b) => b.change_pct - a.change_pct), [stocks])
  const losers = useMemo(() => [...stocks].filter(s => s.change_pct < 0).sort((a, b) => a.change_pct - b.change_pct), [stocks])

  return (
    <div style={{ paddingTop: 8 }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Hisseler</h1>

      <div style={{ position: 'relative', marginBottom: 18 }}>
        <Search size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Hisse ara"
          style={{ width: '100%', padding: '13px 14px 13px 42px', borderRadius: 14, border: '1.5px solid var(--border-subtle)', fontSize: 14.5, outline: 'none', background: '#fff' }}
        />
      </div>

      {q ? (
        <>
          <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 10 }}>Arama Sonuçları</div>
          <div className="card" style={{ padding: 8 }}>
            {filtered.map(s => (
              <div key={s.symbol} style={{ padding: '10px 8px', borderBottom: '1px solid var(--border-subtle)' }}>
                <StockRow s={s} history={histories[s.symbol]} onClick={() => navigate(`/app/hisse/${s.symbol}`)} />
              </div>
            ))}
            {filtered.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13.5 }}>Sonuç bulunamadı.</div>}
          </div>
        </>
      ) : (
        <>
          {gainers.length > 0 && (
            <div className="card" style={{ padding: 16, marginBottom: 18, background: 'var(--bg-card-gradient)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 14.5 }}>
                  <TrendingUp size={16} color="var(--up-green)" /> En Çok Yükselenler
                </div>
                <span className="pill pill-up">{gainers.length} pay</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {gainers.map(s => (
                  <StockRow key={s.symbol} s={s} history={histories[s.symbol]} onClick={() => navigate(`/app/hisse/${s.symbol}`)} />
                ))}
              </div>
            </div>
          )}

          {losers.length > 0 && (
            <div className="card" style={{ padding: 16, background: 'linear-gradient(135deg, #FEF2F2, #FFFFFF)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 14.5 }}>
                  <TrendingDown size={16} color="var(--down-red)" /> En Çok Düşenler
                </div>
                <span className="pill pill-down">{losers.length} pay</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {losers.map(s => (
                  <StockRow key={s.symbol} s={s} history={histories[s.symbol]} onClick={() => navigate(`/app/hisse/${s.symbol}`)} />
                ))}
              </div>
            </div>
          )}

          {stocks.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13.5 }}>Yükleniyor…</div>}
        </>
      )}
    </div>
  )
}

function StockRow({ s, history, onClick }) {
  const up = s.change_pct >= 0
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 14, padding: '10px 12px', cursor: 'pointer' }}>
      <img src={`/stocks/logo_${s.symbol.toLowerCase()}.png`} width={34} height={34} style={{ borderRadius: 9, flexShrink: 0 }} alt="" onError={e => e.currentTarget.style.visibility = 'hidden'} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{s.symbol}</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{fmtMoney(s.price)}</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: up ? 'var(--up-green)' : 'var(--down-red)', display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
          {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {fmtPct(s.change_pct)}
        </div>
      </div>
      {history && <Sparkline points={history} up={up} width={56} height={30} />}
    </div>
  )
}
