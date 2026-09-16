import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar } from 'lucide-react'
import { api } from '../../lib/api'

export default function BlogPost() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    setPost(null); setError(null)
    api.blogPost(slug).then(d => setPost(d.post)).catch(e => setError(e.message))
  }, [slug])

  if (error) return <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>Yazı bulunamadı.</div>
  if (!post) return <div className="container" style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>Yükleniyor…</div>

  return (
    <div className="container" style={{ padding: '48px 24px 100px', maxWidth: 760 }}>
      <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--brand-blue)', fontWeight: 600, fontSize: 14, marginBottom: 24 }}>
        <ArrowLeft size={16} /> Bloga Dön
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
        <Calendar size={14} /> {post.date}
      </div>
      <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.25, marginBottom: 24 }}>{post.title}</h1>
      <div style={{ height: 240, borderRadius: 20, background: post.cover || 'linear-gradient(135deg,#3B6CFF,#7FA0FF)', marginBottom: 32 }} />
      <div style={{ fontSize: 16.5, lineHeight: 1.9, color: '#1E293B', whiteSpace: 'pre-line' }}>
        {post.content}
      </div>
    </div>
  )
}
