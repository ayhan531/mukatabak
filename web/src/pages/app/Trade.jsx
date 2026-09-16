import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { TrendingUp, TrendingDown, ChevronDown } from 'lucide-react'
import { api } from '../../lib/api'
import { fmtMoney, fmtPct } from '../../lib/format'

export default function Trade() {
  const { symbol } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [stocks, setStocks] = useState([])
  const [selected, setSelected] = useState(symbol || '')
  const [side, setSide] = useState(location.state?.side === 'sell' ? 'sell' : 'buy')
  const [qty, setQty] = useState(1)
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.stocks().then(d => {
      setStocks(d.stocks)
      if (!selected && d.stocks[0]) setSelected(d.stocks[0].symbol)
    }).catch(() => {})
  }, []) // eslint-disable-line

  useEffect(() => { if (symbol) setSelected(symbol) }, [symbol])

  const stock = stocks.find(s => s.symbol === selected)
  const total = stock ? stock.price * qty : 0

  const submit = async () => {
    setMsg(null); setBusy(true)
    try {
      const res = await api.trade({ symbol: selected, side, qty: Number(qty) })
      const settleTxt = res?.settle_date ? ` Valör tarihi: ${res.settle_date} (T+2).` : ''
      setMsg({ ok: true, text: `${side === 'buy' ? 'Alım' : 'Satım'} emri gerçekleşti: ${qty} adet ${selected}.${settleTxt}` })
      setQty(1)
    } catch (e) {
      setMsg({ ok: false, text: e.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ paddingTop: 8 }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Al / Sat</h1>

      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <label style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 600 }}>Hisse Seç</label>
        <div style={{ position: 'relative', marginTop: 8 }}>
          <select value={selected} onChange={e => navigate(`/app/al-sat/${e.target.value}`)} style={{ width: '100%', padding: '13px 36px 13px 14px', borderRadius: 12, border: '1.5px solid var(--border-subtle)', fontSize: 15, fontWeight: 700, appearance: 'none', background: '#fff' }}>
            {stocks.map(s => <option key={s.symbol} value={s.symbol}>{s.symbol} · {s.name}</option>)}
          </select>
          <ChevronDown size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }} />
        </div>

        {stock && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, padding: 14, background: 'var(--bg-app)', borderRadius: 12 }}>
            <img src={`/stocks/logo_${stock.symbol.toLowerCase()}.png`} width={40} height={40} style={{ borderRadius: 10 }} alt="" onError={e => e.currentTarget.style.visibility = 'hidden'} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{stock.symbol}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{stock.name}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{fmtMoney(stock.price)}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: stock.change_pct >= 0 ? 'var(--up-green)' : 'var(--down-red)', display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
                {stock.change_pct >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {fmtPct(stock.change_pct)}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <SideBtn active={side === 'buy'} color="var(--up-green)" bg="var(--up-green-bg)" onClick={() => setSide('buy')}>Al</SideBtn>
          <SideBtn active={side === 'sell'} color="var(--down-red)" bg="var(--down-red-bg)" onClick={() => setSide('sell')}>Sat</SideBtn>
        </div>

        <label style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 600 }}>Adet</label>
        <input type="number" min={1} value={qty} onChange={e => setQty(e.target.value)}
          style={{ width: '100%', marginTop: 8, padding: '13px 14px', borderRadius: 12, border: '1.5px solid var(--border-subtle)', fontSize: 16, fontWeight: 700 }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: 14 }}>
          <span style={{ color: 'var(--text-secondary)' }}>Toplam Tutar</span>
          <span style={{ fontWeight: 800 }}>{fmtMoney(total)}</span>
        </div>

        {msg && (
          <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 10, fontSize: 13.5, background: msg.ok ? 'var(--up-green-bg)' : 'var(--down-red-bg)', color: msg.ok ? 'var(--up-green)' : 'var(--down-red)' }}>
            {msg.text}
          </div>
        )}

        <button className="btn btn-block btn-lg" disabled={busy || !stock} onClick={submit}
          style={{ marginTop: 16, background: side === 'buy' ? 'var(--up-green)' : 'var(--down-red)', color: '#fff' }}>
          {busy ? 'İşleniyor…' : `${side === 'buy' ? 'Satın Al' : 'Sat'}`}
        </button>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.6 }}>
        Bu işlem demo/sanal bakiyen üzerinden gerçekleşir, gerçek para hareketi içermez. Nakit valörü
        gerçek BIST kuralına uygun şekilde T+2 (işlem tarihinden 2 iş günü sonra) uygulanır.
      </p>
    </div>
  )
}

function SideBtn({ active, color, bg, onClick, children }) {
  return (
    <button onClick={onClick} className="btn" style={{ flex: 1, background: active ? bg : 'var(--bg-app)', color: active ? color : 'var(--text-secondary)', fontWeight: 800 }}>
      {children}
    </button>
  )
}
