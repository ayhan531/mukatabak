import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Mail } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext.jsx'
import { api } from '../../../lib/api'

export default function PersonalInfo() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setMsg(null); setBusy(true)
    try {
      const res = await api.updateProfile({ name, email })
      setUser(res.user)
      setMsg({ ok: true, text: 'Bilgilerin güncellendi.' })
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
      <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Kişisel Bilgiler</h1>

      <form onSubmit={submit} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field icon={User} label="Ad Soyad" value={name} onChange={setName} />
        <Field icon={Mail} label="E-posta" value={email} onChange={setEmail} type="email" />
        {msg && (
          <div style={{ padding: '10px 12px', borderRadius: 10, fontSize: 13.5, background: msg.ok ? 'var(--up-green-bg)' : 'var(--down-red-bg)', color: msg.ok ? 'var(--up-green)' : 'var(--down-red)' }}>
            {msg.text}
          </div>
        )}
        <button className="btn btn-primary btn-block" disabled={busy} type="submit">{busy ? 'Kaydediliyor…' : 'Kaydet'}</button>
      </form>
    </div>
  )
}

function Field({ icon: Icon, label, value, onChange, type = 'text' }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon size={14} /> {label}
      </div>
      <input value={value} onChange={e => onChange(e.target.value)} type={type} required
        style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid var(--border-subtle)', fontSize: 14.5 }} />
    </label>
  )
}
