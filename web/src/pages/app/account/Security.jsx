import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock } from 'lucide-react'
import { api } from '../../../lib/api'

export default function Security() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setMsg(null)
    if (next !== confirm) {
      setMsg({ ok: false, text: 'Yeni şifreler eşleşmiyor.' })
      return
    }
    setBusy(true)
    try {
      await api.changePassword({ current_password: current, new_password: next })
      setMsg({ ok: true, text: 'Şifren başarıyla güncellendi.' })
      setCurrent(''); setNext(''); setConfirm('')
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
      <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Güvenlik</h1>

      <form onSubmit={submit} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: -4 }}>Şifre Değiştir</div>
        <Field icon={Lock} label="Mevcut Şifre" value={current} onChange={setCurrent} />
        <Field icon={Lock} label="Yeni Şifre (min. 6 karakter)" value={next} onChange={setNext} minLength={6} />
        <Field icon={Lock} label="Yeni Şifre (Tekrar)" value={confirm} onChange={setConfirm} minLength={6} />
        {msg && (
          <div style={{ padding: '10px 12px', borderRadius: 10, fontSize: 13.5, background: msg.ok ? 'var(--up-green-bg)' : 'var(--down-red-bg)', color: msg.ok ? 'var(--up-green)' : 'var(--down-red)' }}>
            {msg.text}
          </div>
        )}
        <button className="btn btn-primary btn-block" disabled={busy} type="submit">{busy ? 'Güncelleniyor…' : 'Şifreyi Güncelle'}</button>
      </form>
    </div>
  )
}

function Field({ icon: Icon, label, value, onChange, minLength }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon size={14} /> {label}
      </div>
      <input value={value} onChange={e => onChange(e.target.value)} type="password" required minLength={minLength}
        style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid var(--border-subtle)', fontSize: 14.5 }} />
    </label>
  )
}
