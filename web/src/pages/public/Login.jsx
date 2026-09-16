import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await login(email, password)
      navigate('/app')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
      <div className="card" style={{ width: '100%', maxWidth: 420, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img src="/brand/appicon.png" width={48} height={48} style={{ borderRadius: 14, margin: '0 auto 16px' }} alt="" />
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Tekrar Hoş Geldin</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>Hesabına giriş yap ve devam et.</p>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field icon={Mail} type="email" placeholder="E-posta adresin" value={email} onChange={setEmail} required />
          <Field icon={Lock} type="password" placeholder="Şifren" value={password} onChange={setPassword} required />
          {error && <div style={{ color: 'var(--down-red)', fontSize: 13.5, background: 'var(--down-red-bg)', padding: '10px 12px', borderRadius: 10 }}>{error}</div>}
          <button className="btn btn-primary btn-block btn-lg" disabled={loading} type="submit" style={{ marginTop: 6 }}>
            {loading ? 'Giriş yapılıyor…' : <>Giriş Yap <ArrowRight size={18} /></>}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)', marginTop: 24 }}>
          Hesabın yok mu? <Link to="/kayit" style={{ color: 'var(--brand-blue)', fontWeight: 700 }}>Kayıt Ol</Link>
        </p>
      </div>
    </div>
  )
}

export function Field({ icon: Icon, ...props }) {
  return (
    <div style={{ position: 'relative' }}>
      <Icon size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
      <input
        {...props}
        onChange={e => props.onChange(e.target.value)}
        style={{ width: '100%', padding: '13px 14px 13px 40px', borderRadius: 12, border: '1.5px solid var(--border-subtle)', fontSize: 14.5, outline: 'none' }}
      />
    </div>
  )
}
