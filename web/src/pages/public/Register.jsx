import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { Field } from './Login.jsx'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await register({ name, email, password })
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
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Hesap Oluştur</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>Saniyeler içinde ücretsiz kayıt ol.</p>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field icon={User} type="text" placeholder="Ad Soyad" value={name} onChange={setName} required />
          <Field icon={Mail} type="email" placeholder="E-posta adresin" value={email} onChange={setEmail} required />
          <Field icon={Lock} type="password" placeholder="Şifre oluştur (min. 6 karakter)" value={password} onChange={setPassword} required minLength={6} />
          {error && <div style={{ color: 'var(--down-red)', fontSize: 13.5, background: 'var(--down-red-bg)', padding: '10px 12px', borderRadius: 10 }}>{error}</div>}
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Kayıt olarak, bu platformun sanal/demo bir portföy simülasyonu olduğunu ve gerçek
            para transferi içermediğini kabul etmiş olursunuz.
          </p>
          <button className="btn btn-primary btn-block btn-lg" disabled={loading} type="submit">
            {loading ? 'Hesap oluşturuluyor…' : <>Kayıt Ol <ArrowRight size={18} /></>}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)', marginTop: 24 }}>
          Zaten hesabın var mı? <Link to="/giris" style={{ color: 'var(--brand-blue)', fontWeight: 700 }}>Giriş Yap</Link>
        </p>
      </div>
    </div>
  )
}
