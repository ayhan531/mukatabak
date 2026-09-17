import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { api } from '../../../lib/api'
import { fmtMoney } from '../../../lib/format'

const QUICK_AMOUNTS = [1000, 5000, 10000, 25000]

export default function Wallet() {
  const navigate = useNavigate()
  const location = useLocation()
  const [portfolio, setPortfolio] = useState(null)
  const [tx, setTx] = useState([])
  const [mode, setMode] = useState(location.state?.mode === 'withdraw' ? 'withdraw' : 'deposit')
  const [amount, setAmount] = useState('')
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = () => {
    api.portfolio().then(setPortfolio).catch(() => {})
    api.walletTransactions().then(d => setTx(d.transactions)).catch(() => {})
  }
  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    setMsg(null); setBusy(true)
    try {
      const amt = Number(amount)
      if (mode === 'deposit') await api.walletDeposit(amt)
      else await api.walletWithdraw(amt)
      setMsg({ ok: true, text: mode === 'deposit' ? 'Sanal bakiye yüklendi.' : 'Tutar çekildi.' })
      setAmount('')
      load()
    } catch (err) {
      setMsg({ ok: false, text: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ paddingTop: 8 }}>
      <button onClick={() => navigate('/app/hesap')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--brand-blue)', fontWeight: 600, fontSize: 13.5, marginBottom: 16, padding: 0 }}>
        <ArrowLeft size={16} /> Hesap
      </button>
      <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Sanal Bakiye</h1>

      <div className="card" style={{ padding: 20, marginBottom: 16, background: 'var(--bg-card-gradient)' }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Kullanılabilir Bakiye</div>
        <div style={{ fontSize: 26, fontWeight: 800 }}>{portfolio ? fmtMoney(portfolio.available_cash) : '—'}</div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <ModeBtn active={mode === 'deposit'} icon={ArrowDownCircle} label="Bakiye Yükle" onClick={() => setMode('deposit')} />
        <ModeBtn active={mode === 'withdraw'} icon={ArrowUpCircle} label="Bakiye Çek" onClick={() => setMode('withdraw')} />
      </div>

      <form onSubmit={submit} className="card" style={{ padding: 20, marginBottom: 16 }}>
        <label style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 600 }}>Tutar (₺)</label>
        <input value={amount} onChange={e => setAmount(e.target.value)} type="number" min={1} required
          style={{ width: '100%', marginTop: 8, padding: '13px 14px', borderRadius: 12, border: '1.5px solid var(--border-subtle)', fontSize: 16, fontWeight: 700 }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {QUICK_AMOUNTS.map(a => (
            <button type="button" key={a} onClick={() => setAmount(String(a))} className="pill" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontWeight: 700 }}>
              +{a.toLocaleString('tr-TR')}
            </button>
          ))}
        </div>

        {msg && (
          <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 10, fontSize: 13.5, background: msg.ok ? 'var(--up-green-bg)' : 'var(--down-red-bg)', color: msg.ok ? 'var(--up-green)' : 'var(--down-red)' }}>
            {msg.text}
          </div>
        )}

        <button className="btn btn-block btn-lg" disabled={busy} type="submit"
          style={{ marginTop: 16, background: mode === 'deposit' ? 'var(--up-green)' : 'var(--down-red)', color: '#fff' }}>
          {busy ? 'İşleniyor…' : mode === 'deposit' ? 'Sanal Bakiye Yükle' : 'Bakiye Çek'}
        </button>
      </form>

      <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 24, lineHeight: 1.6 }}>
        Bu ekran tamamen sanaldır. Gerçek banka hesabı, IBAN veya kart bilgisi talep edilmez;
        hiçbir gerçek para hareketi gerçekleşmez.
      </p>

      <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 10 }}>İşlem Geçmişi</div>
      <div className="card" style={{ padding: 8 }}>
        {tx.map(t => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: t.type === 'deposit' ? 'var(--up-green-bg)' : 'var(--down-red-bg)', display: 'grid', placeItems: 'center', color: t.type === 'deposit' ? 'var(--up-green)' : 'var(--down-red)' }}>
              {t.type === 'deposit' ? <ArrowDownCircle size={17} /> : <ArrowUpCircle size={17} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>{t.type === 'deposit' ? 'Bakiye Yükleme' : 'Bakiye Çekme'}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>{t.created_at}</div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: t.type === 'deposit' ? 'var(--up-green)' : 'var(--down-red)' }}>
              {t.type === 'deposit' ? '+' : '-'}{fmtMoney(t.amount)}
            </div>
          </div>
        ))}
        {tx.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13.5 }}>Henüz işlem yok.</div>}
      </div>
    </div>
  )
}

function ModeBtn({ active, icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className="btn" style={{ flex: 1, background: active ? 'var(--brand-blue)' : 'var(--bg-card)', color: active ? '#fff' : 'var(--text-secondary)', border: '1px solid var(--border-subtle)', fontWeight: 700, gap: 6 }}>
      <Icon size={16} /> {label}
    </button>
  )
}
