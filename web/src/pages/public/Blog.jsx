import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Calendar } from 'lucide-react'
import { api } from '../../lib/api'

export default function Blog() {
  const [posts, setPosts] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.blogList().then(d => setPosts(d.posts)).catch(e => setError(e.message))
  }, [])

  return (
    <div className="container" style={{ padding: '64px 24px 100px' }}>
      <div style={{ maxWidth: 620, margin: '0 auto 48px', textAlign: 'center' }}>
        <div className="pill" style={{ background: 'rgba(59,108,255,0.1)', color: 'var(--brand-blue)', marginBottom: 16 }}>Blog</div>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 14 }}>Piyasa Bilgisi ve Rehberler</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Yatırım okuryazarlığını artıracak içerikler.</p>
      </div>

      {error && <p style={{ textAlign: 'center', color: 'var(--down-red)' }}>{error}</p>}
      {!posts && !error && <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Yükleniyor…</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }} id="blog-grid">
        {posts?.map(p => (
          <Link key={p.slug} to={`/blog/${p.slug}`} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 150, background: p.cover || 'linear-gradient(135deg,#3B6CFF,#7FA0FF)' }} />
            <div style={{ padding: 22, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 10 }}>
                <Calendar size={13} /> {p.date}
              </div>
              <div style={{ fontWeight: 700, fontSize: 16.5, marginBottom: 10, lineHeight: 1.4 }}>{p.title}</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, flex: 1 }}>{p.excerpt}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--brand-blue)', fontWeight: 600, fontSize: 14, marginTop: 14 }}>
                Devamını oku <ArrowRight size={14} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) { #blog-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 600px) { #blog-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
