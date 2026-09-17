import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Star, Newspaper, Clock } from 'lucide-react'
import { api } from '../../lib/api'
import { fmtMoney, fmtNum, fmtPct, relativeTime } from '../../lib/format'
import Sparkline from '../../components/Sparkline.jsx'

export default function Home() {
  const [indices, setIndices] = useState([])
  const [watchlist, setWatchlist] = useState([])
  const [histories, setHistories] = useState({})
  const [news, setNews] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    api.marketIndices().then(d => setIndices(d.items)).catch(() => {})
    api.news().then(d => setNews(d.items.slice(0, 4))).catch(() => {})
    api.watchlist().then(async d => {
      let list = d.stocks
      if (list.length === 0) {
        const all = await api.stocks()
        list = all.stocks.slice(0, 4)
      }
      setWatchlist(list)
      const entries = await Promise.all(list.map(async s => {
        try {
          const h = await api.stockHistory(s.symbol)
          return [s.symbol, h.points.map(p => p.price)]
        } catch { return [s.symbol, null] }
      }))
      setHistories(Object.fromEntries(entries))
    }).catch(() => {})
  }, [])

  return (
    <div style={{ paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="ticker-scroll">
        {indices.length === 0 && Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card ticker-card" style={{ opacity: 0.5 }} />
        ))}
        {indices.map(idx => {
          const up = idx.change_pct >= 0
          return (
            <div key={idx.key} className="card ticker-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8 }}>
                {idx.label}
              </div>
              <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 4 }}>
                {idx.prefix === '₺' ? fmtMoney(idx.price) : idx.prefix ? `${idx.prefix}${fmtNum(idx.price, idx.price < 100 ? 4 : 2)}` : fmtNum(idx.price)}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: up ? 'var(--up-green)' : 'var(--down-red)' }}>
                {fmtPct(idx.change_pct)}
              </div>
            </div>
          )
        })}
      </div>

      <div onClick={() => navigate('/app/hisseler')} style={{ position: 'relative', cursor: 'pointer' }}>
        <Search size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
        <input
          readOnly
          placeholder="Hisse ara"
          style={{ width: '100%', padding: '13px 14px 13px 42px', borderRadius: 14, border: '1.5px solid var(--border-subtle)', fontSize: 14.5, outline: 'none', background: 'var(--bg-card)', cursor: 'pointer' }}
        />
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
          <Star size={16} color="#F59E0B" fill="#F59E0B" /> Takip Listem
        </div>
        <div className="card" style={{ padding: 8 }}>
          {watchlist.map(s => {
            const up = s.change_pct >= 0
            return (
              <div key={s.symbol} onClick={() => navigate(`/app/hisse/${s.symbol}`)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 10px', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}>
                <img src={`/stocks/logo_${s.symbol.toLowerCase()}.png`} width={32} height={32} style={{ borderRadius: 8 }} alt="" onError={e => e.currentTarget.style.visibility = 'hidden'} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{s.symbol}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.name}</div>
                </div>
                <div style={{ textAlign: 'right', marginRight: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{fmtMoney(s.price)}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: up ? 'var(--up-green)' : 'var(--down-red)' }}>{fmtPct(s.change_pct)}</div>
                </div>
                {histories[s.symbol] && <Sparkline points={histories[s.symbol]} up={up} width={64} height={30} />}
              </div>
            )
          })}
          {watchlist.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13.5 }}>Yükleniyor…</div>}
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
          <Newspaper size={16} color="var(--brand-blue)" /> Piyasalardan Son Haberler
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {news.map((n, i) => (
            <a key={i} href={n.link || undefined} target={n.link ? '_blank' : undefined} rel="noreferrer" className="card" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, var(--brand-blue), #5B86FF)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Newspaper size={18} color="#fff" />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>{n.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: 'var(--text-secondary)' }}>
                  <Clock size={11} /> {relativeTime(n.pubDate)}
                </div>
              </div>
            </a>
          ))}
          {news.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13.5 }}>Yükleniyor…</div>}
        </div>
      </div>

      <style>{`
        .ticker-scroll {
          display: flex; gap: 12px; overflow-x: auto; margin: 0 -20px; padding: 0 20px 4px;
          scrollbar-width: none;
        }
        .ticker-scroll::-webkit-scrollbar { display: none; }
        .ticker-card {
          flex: 0 0 auto; width: 132px; padding: 14px; background: var(--bg-card-gradient);
        }
      `}</style>
    </div>
  )
}
