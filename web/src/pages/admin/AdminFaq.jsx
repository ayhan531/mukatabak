import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { api } from '../../lib/api'

const EMPTY = { id: null, q: '', a: '' }

export default function AdminFaq() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = () => api.faq().then(d => setItems(d.items)).catch(() => {})
  useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.adminFaqSave(form)
      setForm(EMPTY)
      await load()
    } finally { setSaving(false) }
  }

  const remove = async (id) => { await api.adminFaqDelete(id); await load() }

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>S.S.S. Yönetimi</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Sıkça sorulan soruları düzenle.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 24, alignItems: 'start' }}>
        <div className="card" style={{ padding: 8 }}>
          {items.map(it => (
            <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ flex: 1, minWidth: 0, fontWeight: 700, fontSize: 14 }}>{it.q}</div>
              <button className="icon-btn-sm" onClick={() => setForm(it)}><Pencil size={14} /></button>
              <button className="icon-btn-sm" onClick={() => remove(it.id)}><Trash2 size={14} color="var(--down-red)" /></button>
            </div>
          ))}
          {items.length === 0 && <div style={{ padding: 20, color: 'var(--text-secondary)', fontSize: 14 }}>Henüz soru yok.</div>}
        </div>

        <form onSubmit={save} className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={16} /> {form.id ? 'Soruyu Düzenle' : 'Yeni Soru'}</div>
          <input placeholder="Soru" value={form.q} onChange={e => setForm({ ...form, q: e.target.value })} style={inp} required />
          <textarea placeholder="Cevap" value={form.a} onChange={e => setForm({ ...form, a: e.target.value })} style={{ ...inp, minHeight: 120 }} required />
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" disabled={saving} type="submit">{saving ? 'Kaydediliyor…' : 'Kaydet'}</button>
            {form.id && <button type="button" className="btn btn-outline" onClick={() => setForm(EMPTY)}>Vazgeç</button>}
          </div>
        </form>
      </div>
      <style>{`.icon-btn-sm{ width:30px;height:30px;border-radius:8px;border:1px solid var(--border-subtle);background:#fff;display:grid;place-items:center; }`}</style>
    </div>
  )
}

const inp = { padding: '11px 13px', borderRadius: 10, border: '1.5px solid var(--border-subtle)', fontSize: 14, fontFamily: 'inherit' }
