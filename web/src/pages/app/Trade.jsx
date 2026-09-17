import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { TrendingUp, TrendingDown, ChevronDown, Info } from 'lucide-react'
import { api } from '../../lib/api'
import { fmtMoney, fmtPct } from '../../lib/format'

const COMMISSION_BPS = 15 // backend varsayılanıyla aynı (%0,15) — yaklaşık önizleme
const MIN_COMMISSION = 1

function estimateCommission(total) {
  return Math.max(MIN_COMMISSION, total * COMMISSION_BPS / 10000)
}

export default function Trade() {
  const { symbol } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [stocks, setStocks] = useState([])
  const [selected, setSelected] = useState(symbol || '')
  const [side, setSide] = useState(location.state?.side === 'sell' ? 'sell' : 'buy')
  const [orderType, setOrderType] = useState('market')
  const [qty, setQty] = useState(1)
  const [limitPrice, setLimitPrice] = useState('')
  const [marketOpen, setMarketOpen] = useState(true)
  const [portfolio, setPortfolio] = useState(null)
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.stocks().then(d => {
      setStocks(d.stocks)
      if (!selected && d.stocks[0]) setSelected(d.stocks[0].symbol)
    }).catch(() => {})
    api.marketStatus().then(d => setMarketOpen(d.open)).catch(() => {})
    api.portfolio().then(setPortfolio).catch(() => {})
  }, []) // eslint-disable-line

  useEffect(() => { if (symbol) setSelected(symbol) }, [symbol])
  useEffect(() => { if (!marketOpen) setOrderType('limit') }, [marketOpen])

  const stock = stocks.find(s => s.symbol === selected)
  useEffect(() => { if (stock) setLimitPrice(stock.price) }, [stock?.symbol]) // eslint-disable-line

  const effectivePrice = orderType === 'limit' && limitPrice ? Number(limitPrice) : (stock?.price || 0)
  const total = stock ? effectivePrice * qty : 0
  const commission = estimateCommission(total)
  const grandTotal = side === 'buy' ? total + commission : total - commission

  const ownedQty = portfolio?.positions?.find(p => p.symbol === selected)?.qty || 0
  const availableCash = portfolio?.available_cash || 0

  const applyPercent = (pct) => {
    if (!stock) return
    if (side === 'buy') {
      const budget = availableCash * (pct / 100)
      const q = Math.floor(budget / (effectivePrice * (1 + COMMISSION_BPS / 10000)))
      setQty(Math.max(0, q))
    } else {
      setQty(Math.max(0, Math.floor(ownedQty * (pct / 100))))
    }
  }

  const submit = async () => {
    setMsg(null); setBusy(true)
    try {
      const body = { symbol: selected, side, qty: Number(qty), order_type: orderType }
      if (orderType === 'limit') body.limit_price = Number(limitPrice)
      const res = await api.trade(body)
      const settleTxt = res?.settle_date ? ` Valör tarihi: ${res.settle_date} (T+2).` : ''
      setMsg({ ok: true, text: `${side === 'buy' ? 'Alım' : 'Satım'} emri gerçekleşti: ${qty} adet ${selected} @ ${fmtMoney(res.fill_price)}. Komisyon: ${fmtMoney(res.commission)}.${settleTxt}` })
      setQty(1)
      api.portfolio().then(setPortfolio).catch(() => {})
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
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <SideBtn active={side === 'buy'} color="var(--up-green)" bg="var(--up-green-bg)" onClick={() => setSide('buy')}>Al</SideBtn>
          <SideBtn active={side === 'sell'} color="var(--down-red)" bg="var(--down-red-bg)" onClick={() => setSide('sell')}>Sat</SideBtn>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <SideBtn active={orderType === 'market'} disabled={!marketOpen} color="var(--brand-blue)" bg="rgba(59,108,255,0.1)" onClick={() => marketOpen && setOrderType('market')}>Piyasa</SideBtn>
          <SideBtn active={orderType === 'limit'} color="var(--brand-blue)" bg="rgba(59,108,255,0.1)" onClick={() => setOrderType('limit')}>Limit</SideBtn>
        </div>
        {!marketOpen && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#B45309', background: '#FEF3C7', padding: '8px 10px', borderRadius: 10, marginBottom: 12 }}>
            <Info size={13} /> Piyasa kapalı · sadece limit emir girilebilir.
          </div>
        )}

        {orderType === 'limit' && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 600 }}>Limit Fiyat</label>
            <input type="number" min={0} step="0.01" value={limitPrice} onChange={e => setLimitPrice(e.target.value)}
              style={{ width: '100%', marginTop: 8, padding: '13px 14px', borderRadius: 12, border: '1.5px solid var(--border-subtle)', fontSize: 16, fontWeight: 700 }} />
          </div>
        )}

        <label style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 600 }}>Adet</label>
        <input type="number" min={1} value={qty} onChange={e => setQty(e.target.value)}
          style={{ width: '100%', marginTop: 8, padding: '13px 14px', borderRadius: 12, border: '1.5px solid var(--border-subtle)', fontSize: 16, fontWeight: 700 }} />

        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          {[25, 50, 75, 100].map(p => (
            <button key={p} type="button" onClick={() => applyPercent(p)} className="pill" style={{ flex: 1, justifyContent: 'center', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontWeight: 700 }}>
              %{p}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 6 }}>
          {side === 'buy' ? `Kullanılabilir: ${fmtMoney(availableCash)}` : `Elinde: ${ownedQty} adet`}
        </div>

        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Row label="Tutar" value={fmtMoney(total)} />
          <Row label="Tahmini Komisyon" value={fmtMoney(commission)} muted />
          <Row label={side === 'buy' ? 'Ödenecek Toplam' : 'Net Gelir'} value={fmtMoney(grandTotal)} bold />
        </div>

        {msg && (
          <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 10, fontSize: 13.5, background: msg.ok ? 'var(--up-green-bg)' : 'var(--down-red-bg)', color: msg.ok ? 'var(--up-green)' : 'var(--down-red)' }}>
            {msg.text}
          </div>
        )}

        <button className="btn btn-block btn-lg" disabled={busy || !stock || qty <= 0} onClick={submit}
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

function Row({ label, value, muted, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: bold ? 15 : 13.5 }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontWeight: bold ? 800 : 600, color: muted ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{value}</span>
    </div>
  )
}

function SideBtn({ active, color, bg, onClick, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled} className="btn" style={{ flex: 1, background: active ? bg : 'var(--bg-app)', color: active ? color : 'var(--text-secondary)', fontWeight: 800, opacity: disabled ? 0.4 : 1 }}>
      {children}
    </button>
  )
}
