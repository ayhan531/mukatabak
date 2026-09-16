import { Mail, MapPin, Phone } from 'lucide-react'

export default function Contact() {
  return (
    <div className="container" style={{ padding: '64px 24px 100px', maxWidth: 720 }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div className="pill" style={{ background: 'rgba(59,108,255,0.1)', color: 'var(--brand-blue)', marginBottom: 16 }}>İletişim</div>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 14 }}>Bize Ulaşın</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Sorularınız için buradayız.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }} id="contact-grid">
        <InfoCard icon={Mail} title="E-posta" value="destek@mukatabak.app" />
        <InfoCard icon={Phone} title="Telefon" value="0850 000 00 00" />
        <InfoCard icon={MapPin} title="Adres" value="İstanbul, Türkiye" />
      </div>
      <style>{`@media (max-width: 700px) { #contact-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}

function InfoCard({ icon: Icon, title, value }) {
  return (
    <div className="card" style={{ padding: 24, textAlign: 'center' }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59,108,255,0.1)', display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>
        <Icon size={20} color="var(--brand-blue)" />
      </div>
      <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 14 }}>{title}</div>
      <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{value}</div>
    </div>
  )
}
