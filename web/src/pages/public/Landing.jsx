import { Link } from 'react-router-dom'
import { ArrowRight, LineChart, ShieldCheck, Sparkles, Wallet, Bell, TrendingUp, TrendingDown, Star } from 'lucide-react'

const STOCKS = [
  { s: 'THYAO', n: 'Türk Hava Yolları', p: '295,00', c: '+2,26', up: true, logo: 'logo_thyao.png' },
  { s: 'ASELS', n: 'Aselsan', p: '59,35', c: '+2,06', up: true, logo: 'logo_asels.png' },
  { s: 'TUPRS', n: 'Tüpraş', p: '159,70', c: '+1,78', up: true, logo: 'logo_tuprs.png' },
  { s: 'SASA', n: 'Sasa Polyester', p: '44,18', c: '-0,94', up: false, logo: 'logo_sasa.png' },
]

const FEATURES = [
  { icon: LineChart, title: 'Canlı Piyasa Görünümü', desc: 'BIST hisselerini anlık grafiklerle, en çok yükselen/düşenlerle takip et.' },
  { icon: Wallet, title: 'Sanal Portföy', desc: 'Gerçek para riski olmadan sanal bakiyenle alım-satım pratiği yap.' },
  { icon: Bell, title: 'Anlık Bildirimler', desc: 'Takip listendeki hisselerde önemli hareketler olduğunda haberdar ol.' },
  { icon: ShieldCheck, title: 'Güvenli Hesap', desc: 'Şifreli oturumlar ve rol tabanlı erişimle hesabın güvende.' },
]

export default function Landing() {
  return (
    <div>
      <section style={{ position: 'relative', overflow: 'hidden', padding: '72px 0 40px' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 48, alignItems: 'center' }} id="hero-grid">
          <div>
            <div className="pill" style={{ background: 'rgba(59,108,255,0.1)', color: 'var(--brand-blue)', marginBottom: 18 }}>
              <Sparkles size={14} /> Yeni nesil dijital yatırım deneyimi
            </div>
            <h1 style={{ fontSize: 48, lineHeight: 1.12, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 20px' }}>
              Piyasayı takip et,<br /> portföyünü <span style={{ color: 'var(--brand-blue)' }}>güvenle</span> yönet.
            </h1>
            <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 480, marginBottom: 32 }}>
              Mukatabak; BIST hisselerini gerçek zamanlıya yakın verilerle izlemeni, sanal bakiyenle
              alım-satım stratejilerini risksiz denemeni ve piyasa haberlerini tek ekrandan
              yönetmeni sağlayan profesyonel bir platformdur.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/kayit" className="btn btn-primary btn-lg">Ücretsiz Hesap Aç <ArrowRight size={18} /></Link>
              <Link to="/kurumsal" className="btn btn-outline btn-lg">Kurumsal Bilgiler</Link>
            </div>
            <div style={{ display: 'flex', gap: 32, marginTop: 44 }}>
              <Stat n="120K+" l="Uygulama indirmesi" />
              <Stat n="500+" l="Takip edilen hisse" />
              <Stat n="4.8/5" l="Kullanıcı puanı" />
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <div className="card" style={{ padding: 22, background: 'var(--bg-card-gradient)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>En Çok Yükselenler</div>
                <span className="pill pill-up">7 pay</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {STOCKS.map(st => (
                  <div key={st.s} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 14, padding: '10px 14px', border: '1px solid var(--border-subtle)' }}>
                    <img src={`/stocks/${st.logo}`} width={34} height={34} style={{ borderRadius: 8 }} alt="" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{st.s}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{st.n}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>₺{st.p}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: st.up ? 'var(--up-green)' : 'var(--down-red)', display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
                        {st.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} %{st.c}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ position: 'absolute', bottom: -28, left: -28, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: 'var(--shadow-card-lg)' }} id="float-card">
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--up-green-bg)', display: 'grid', placeItems: 'center' }}>
                <TrendingUp size={20} color="var(--up-green)" />
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Toplam Portföy</div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>₺487.230,50</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '96px 0 40px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 56px' }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 14 }}>Yatırım deneyimini yeniden tasarladık</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.7 }}>
              Mobil uygulamamızla bire bir aynı deneyimi artık web üzerinden de yaşayın.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }} id="features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="card" style={{ padding: 26 }}>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(59,108,255,0.1)', display: 'grid', placeItems: 'center', marginBottom: 18 }}>
                  <f.icon size={22} color="var(--brand-blue)" />
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '40px 0 100px' }}>
        <div className="container">
          <div style={{ background: 'linear-gradient(135deg, #1D2E63, #0F172A)', borderRadius: 32, padding: '64px 48px', textAlign: 'center', color: '#fff', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 20%, rgba(59,108,255,0.35), transparent 45%), radial-gradient(circle at 80% 80%, rgba(74,222,128,0.25), transparent 45%)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 18 }}>
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={18} fill="#FBBF24" color="#FBBF24" />)}
              </div>
              <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 14 }}>Hemen ücretsiz hesabını oluştur</h2>
              <p style={{ color: '#CBD5E1', maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.7 }}>
                Saniyeler içinde kayıt ol, sanal bakiyenle piyasayı keşfetmeye başla.
              </p>
              <Link to="/kayit" className="btn btn-primary btn-lg">Ücretsiz Başla <ArrowRight size={18} /></Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          #hero-grid { grid-template-columns: 1fr !important; }
          #features-grid { grid-template-columns: repeat(2, 1fr) !important; }
          #float-card { display: none !important; }
          h1 { font-size: 36px !important; }
        }
        @media (max-width: 560px) {
          #features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function Stat({ n, l }) {
  return (
    <div>
      <div style={{ fontWeight: 800, fontSize: 22 }}>{n}</div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{l}</div>
    </div>
  )
}
