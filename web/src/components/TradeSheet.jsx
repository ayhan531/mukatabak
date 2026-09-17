import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown, Info, X, Search } from 'lucide-react'
import { api } from '../lib/api'
import { fmtMoney, fmtPct } from '../lib/format'
import { useTradeModal } from '../context/TradeModalContext.jsx'

const COMMISSION_BPS = 15
const MIN_COMMISSION = 1
const estimateCommission = (total) => Math.max(MIN_COMMISSION, total * COMMISSION_BPS / 10000)

export default function TradeSheet() {
  const { open, symbol, side: initialSide, closeTrade } = useTradeModal()
  const navigate = useNavigate()

  const [stocks, setStocks] = useState([])
  const [selected, setSelected] = useState(symbol || '')
  const [q, setQ] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [side, setSide] = useState(initialSide || 'buy')
  const [orderType, setOrderType] = useState('market')
  const [qty, setQty] = useState(1)
  const [limitPrice, setLimitPrice] = useState('')
  const [marketOpen, setMarketOpen] = useState(true)
  const [portfolio, setPortfolio] = useState(null)
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setSelected(symbol || '')
    setSide(initialSide || 'buy')
    setQty(1)
    setMsg(null)
    setPickerOpen(false)
    setQ('')
    api.stocks().then(d => {
      setStocks(d.stocks)
      if (!symbol && d.stocks[0]) setSelected(d.stocks[0].symbol)
    }).catch(() => {})
    api.marketStatus().then(d => setMarketOpen(d.open)).catch(() => {})
    api.portfolio().then(setPortfolio).catch(() => {})
  }, [open, symbol, initialSide])

  useEffect(() => { if (!marketOpen) setOrderType('limit') }, [marketOpen])

  const stock = stocks.find(s => s.symbol === selected)
  useEffect(() => { if (stock) setLimitPrice(stock.price) }, [stock?.symbol]) // eslint-disable-line

  if (!open) return null

  const effectivePrice = orderType === 'limit' && limitPrice ? Number(limitPrice) : (stock?.price || 0)
  const total = stock ? effectivePrice * qty : 0
  const commission = estimateCommission(total)
  const grandTotal = side === 'buy' ? total + commission : total - commission
  const ownedQty = portfolio?.positions?.find(p => p.symbol === selected)?.qty || 0
  const availableCash = portfolio?.available_cash || 0

  const filteredStocks = stocks.filter(s => {
    const term = q.trim().toLowerCase()
    return !term || s.symbol.toLowerCase().includes(term) || s.name.toLowerCase().includes(term)
  })

  const applyPercent = (pct) => {
    if (!stock) return
    if (side === 'buy') {
      const budget = availableCash * (pct / 100)
      setQty(Math.max(0, Math.floor(budget / (effectivePrice * (1 + COMMISSION_BPS / 10000)))))
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
      setMsg({ ok: true, text: `${side === 'buy' ? 'Alım' : 'Satım'} emri gerçekleşti: ${qty} adet ${selected} @ ${fmtMoney(res.fill_price)}. Komisyon: ${fmtMoney(res.commission)}. Valör: ${res.settle_date} (T+2).` })
      setQty(1)
      api.portfolio().then(setPortfolio).catch(() => {})
    } catch (e) {
      setMsg({ ok: false, text: e.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="trade-sheet-overlay" onClick={closeTrade}>
      <div className="trade-sheet" onClick={e => e.stopPropagation()}>
        <div className="trade-sheet-handle" />
        <button className="trade-sheet-close" onClick={closeTrade}><X size={18} /></button>

        <div className="trade-sheet-body">
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <SideBtn active={side === 'buy'} color="var(--up-green)" bg="var(--up-green-bg)" onClick={() => setSide('buy')}>Al</SideBtn>
            <SideBtn active={side === 'sell'} color="var(--down-red)" bg="var(--down-red-bg)" onClick={() => setSide('sell')}>Sat</SideBtn>
          </div>

          <div style={{ position: 'relative', marginBottom: 14 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              value={pickerOpen ? q : `${stock ? `${stock.symbol} · ${stock.name}` : ''}`}
              onFocus={() => { setPickerOpen(true); setQ('') }}
              onChange={e => setQ(e.target.value)}
              placeholder="Hisse ara"
              style={{ width: '100%', padding: '12px 14px 12px 38px', borderRadius: 12, border: '1.5px solid var(--border-subtle)', fontSize: 14.5, background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            />
            {pickerOpen && (
              <div className="trade-sheet-picker">
                {filteredStocks.map(s => (
                  <div key={s.symbol} onClick={() => { setSelected(s.symbol); setPickerOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border-subtle)' }}>
                    <img src={`/stocks/logo_${s.symbol.toLowerCase()}.png`} width={26} height={26} style={{ borderRadius: 7 }} alt="" onError={e => e.currentTarget.style.visibility = 'hidden'} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13.5 }}>{s.symbol}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{fmtMoney(s.price)}</div>
                  </div>
                ))}
                {filteredStocks.length === 0 && <div style={{ padding: 14, fontSize: 13, color: 'var(--text-secondary)' }}>Sonuç yok.</div>}
              </div>
            )}
          </div>

          {stock && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, padding: 12, background: 'var(--bg-app)', borderRadius: 12 }}>
              <img src={`/stocks/logo_${stock.symbol.toLowerCase()}.png`} width={36} height={36} style={{ borderRadius: 9 }} alt="" onError={e => e.currentTarget.style.visibility = 'hidden'} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{stock.symbol}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>{stock.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{fmtMoney(stock.price)}</div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: stock.change_pct >= 0 ? 'var(--up-green)' : 'var(--down-red)', display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
                  {stock.change_pct >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {fmtPct(stock.change_pct)}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
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
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Limit Fiyat</label>
              <input type="number" min={0} step="0.01" value={limitPrice} onChange={e => setLimitPrice(e.target.value)}
                style={{ width: '100%', marginTop: 6, padding: '12px 14px', borderRadius: 12, border: '1.5px solid var(--border-subtle)', fontSize: 15, fontWeight: 700, background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
            </div>
          )}

          <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Adet</label>
          <input type="number" min={1} value={qty} onChange={e => setQty(e.target.value)}
            style={{ width: '100%', marginTop: 6, padding: '12px 14px', borderRadius: 12, border: '1.5px solid var(--border-subtle)', fontSize: 15, fontWeight: 700, background: 'var(--bg-card)', color: 'var(--text-primary)' }} />

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

          <p style={{ fontSize: 11, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.6, marginTop: 12 }}>
            Demo/sanal bakiye üzerinden gerçekleşir, gerçek para hareketi içermez. Nakit valörü T+2 uygulanır.
          </p>

          {msg?.ok && (
            <button className="btn btn-outline btn-block" style={{ marginTop: 10 }} onClick={() => { closeTrade(); navigate('/app/portfoy') }}>
              Portföyü Görüntüle
            </button>
          )}
        </div>
      </div>

      <style>{`
        .trade-sheet-overlay {
          position: fixed; inset: 0; background: rgba(15,23,42,0.5); z-index: 100;
          display: flex; align-items: flex-end; justify-content: center;
          animation: fadeIn .18s ease;
        }
        .trade-sheet {
          position: relative; width: 100%; max-width: 480px; max-height: 88vh;
          background: var(--bg-app); border-radius: 24px 24px 0 0;
          box-shadow: 0 -12px 40px rgba(0,0,0,0.25);
          animation: slideUp .22s cubic-bezier(.16,.8,.3,1);
          display: flex; flex-direction: column;
        }
        .trade-sheet-handle {
          width: 40px; height: 5px; border-radius: 3px; background: var(--border-subtle);
          margin: 10px auto 4px;
        }
        .trade-sheet-close {
          position: absolute; top: 12px; right: 14px; width: 30px; height: 30px; border-radius: 50%;
          border: none; background: var(--bg-card); color: var(--text-secondary); display: grid; place-items: center;
        }
        .trade-sheet-body { padding: 8px 20px 24px; overflow-y: auto; }
        .trade-sheet-picker {
          position: absolute; top: 100%; left: 0; right: 0; margin-top: 6px; max-height: 240px; overflow-y: auto;
          background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px;
          box-shadow: var(--shadow-card-lg); z-index: 5;
        }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
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
    <button onClick={onClick} disabled={disabled} className="btn" style={{ flex: 1, background: active ? bg : 'var(--bg-card)', color: active ? color : 'var(--text-secondary)', fontWeight: 800, opacity: disabled ? 0.4 : 1, border: '1px solid var(--border-subtle)' }}>
      {children}
    </button>
  )
}
