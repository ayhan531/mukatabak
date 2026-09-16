import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { api } from '../../lib/api'

export default function FAQ() {
  const [items, setItems] = useState(null)
  const [openIdx, setOpenIdx] = useState(0)

  useEffect(() => { api.faq().then(d => setItems(d.items)).catch(() => setItems([])) }, [])

  return (
    <div className="container" style={{ padding: '64px 24px 100px', maxWidth: 780 }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div className="pill" style={{ background: 'rgba(59,108,255,0.1)', color: 'var(--brand-blue)', marginBottom: 16 }}>Yardım</div>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 14 }}>Sıkça Sorulan Sorular</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Aklınıza takılan sorulara hızlı yanıtlar.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items?.map((it, i) => (
          <div key={i} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <button onClick={() => setOpenIdx(openIdx === i ? -1 : i)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 22px', background: 'none', border: 'none', textAlign: 'left', fontWeight: 700, fontSize: 15.5 }}>
              {it.q}
              <ChevronDown size={18} style={{ transform: openIdx === i ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0, marginLeft: 12 }} />
            </button>
            {openIdx === i && (
              <div style={{ padding: '0 22px 22px', color: 'var(--text-secondary)', fontSize: 14.5, lineHeight: 1.7 }}>{it.a}</div>
            )}
          </div>
        ))}
        {items && items.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Henüz içerik eklenmedi.</p>}
      </div>
    </div>
  )
}
