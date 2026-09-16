import { useEffect, useState } from 'react'
import { Newspaper } from 'lucide-react'
import { api } from '../../lib/api'

export default function News() {
  const [news, setNews] = useState([])
  const [live, setLive] = useState(false)

  useEffect(() => {
    api.news().then(d => { setNews(d.items); setLive(d.live) }).catch(() => {})
  }, [])

  return (
    <div style={{ paddingTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>Piyasa Haberleri</h1>
        {live && <span className="pill pill-up"><Newspaper size={12} /> Canlı kaynak</span>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {news.map((n, i) => (
          <a key={i} href={n.link || undefined} target={n.link ? '_blank' : undefined} rel="noreferrer" className="card" style={{ padding: 14, display: 'block' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{n.title}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 6 }}>{n.summary}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--brand-blue)', fontWeight: 700 }}>
              <span>{n.source}</span>
              {n.pubDate && <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{n.pubDate}</span>}
            </div>
          </a>
        ))}
        {news.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>Yükleniyor…</div>}
      </div>
    </div>
  )
}
