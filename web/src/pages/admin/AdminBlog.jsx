import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { api } from '../../lib/api'

const EMPTY = { id: null, title: '', slug: '', excerpt: '', content: '', date: '', cover: '' }

export default function AdminBlog() {
  const [posts, setPosts] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = () => api.blogList().then(d => setPosts(d.posts)).catch(() => {})
  useEffect(() => { load() }, [])

  const edit = (p) => setForm(p)
  const reset = () => setForm(EMPTY)

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.adminBlogSave(form)
      reset()
      await load()
    } finally { setSaving(false) }
  }

  const remove = async (id) => {
    await api.adminBlogDelete(id)
    await load()
  }

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Blog Yönetimi</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Kurumsal blog içeriklerini yönet.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 24, alignItems: 'start' }}>
        <div className="card" style={{ padding: 8 }}>
          {posts.map(p => (
            <div key={p.slug} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.date}</div>
              </div>
              <button className="icon-btn-sm" onClick={() => edit(p)}><Pencil size={14} /></button>
              <button className="icon-btn-sm" onClick={() => remove(p.id)}><Trash2 size={14} color="var(--down-red)" /></button>
            </div>
          ))}
          {posts.length === 0 && <div style={{ padding: 20, color: 'var(--text-secondary)', fontSize: 14 }}>Henüz yazı yok.</div>}
        </div>

        <form onSubmit={save} className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={16} /> {form.id ? 'Yazıyı Düzenle' : 'Yeni Yazı'}</div>
          <input placeholder="Başlık" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inp} required />
          <input placeholder="Slug (ör: piyasa-analizi)" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} style={inp} required />
          <input placeholder="Özet" value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} style={inp} />
          <textarea placeholder="İçerik" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} style={{ ...inp, minHeight: 140, resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" disabled={saving} type="submit">{saving ? 'Kaydediliyor…' : 'Kaydet'}</button>
            {form.id && <button type="button" className="btn btn-outline" onClick={reset}>Vazgeç</button>}
          </div>
        </form>
      </div>
      <style>{`.icon-btn-sm{ width:30px;height:30px;border-radius:8px;border:1px solid var(--border-subtle);background:#fff;display:grid;place-items:center; }`}</style>
    </div>
  )
}

const inp = { padding: '11px 13px', borderRadius: 10, border: '1.5px solid var(--border-subtle)', fontSize: 14, fontFamily: 'inherit' }
