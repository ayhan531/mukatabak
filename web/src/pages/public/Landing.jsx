import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, LineChart, ShieldCheck, Sparkles, Wallet, Bell, TrendingUp, TrendingDown,
  Star, UserPlus, MousePointerClick, PiggyBank, CheckCircle2, Smartphone, Globe2, Zap,
} from 'lucide-react'
import { api } from '../../lib/api'
import { fmtMoney, fmtPct } from '../../lib/format'
import Reveal from '../../components/Reveal.jsx'
import { useReveal, useCountUp } from '../../lib/useReveal'

const FALLBACK_STOCKS = [
  { symbol: 'THYAO', name: 'Türk Hava Yolları', price: 295.0, change_pct: 2.26 },
  { symbol: 'ASELS', name: 'Aselsan', price: 59.35, change_pct: 2.06 },
  { symbol: 'TUPRS', name: 'Tüpraş', price: 159.7, change_pct: 1.78 },
  { symbol: 'SASA', name: 'Sasa Polyester', price: 44.18, change_pct: -0.94 },
  { symbol: 'AKBNK', name: 'Akbank', price: 62.15, change_pct: 1.55 },
  { symbol: 'GARAN', name: 'Garanti BBVA', price: 118.4, change_pct: 0.4 },
]

const FEATURES = [
  { icon: LineChart, title: 'Canlı Piyasa Görünümü', desc: 'BIST hisselerini anlık grafiklerle, en çok yükselen/düşenlerle takip et.' },
  { icon: Wallet, title: 'Sanal Portföy', desc: 'Gerçek para riski olmadan sanal bakiyenle alım-satım pratiği yap.' },
  { icon: Bell, title: 'Anlık Bildirimler', desc: 'Takip listendeki hisselerde önemli hareketler olduğunda haberdar ol.' },
  { icon: ShieldCheck, title: 'Güvenli Hesap', desc: 'Şifreli oturumlar ve rol tabanlı erişimle hesabın güvende.' },
]

const STEPS = [
  { icon: UserPlus, title: 'Ücretsiz Kayıt Ol', desc: 'Saniyeler içinde hesabını oluştur, ₺100.000 sanal bakiye hemen tanımlansın.' },
  { icon: MousePointerClick, title: 'Piyasayı Keşfet', desc: 'BIST hisselerini canlıya yakın verilerle incele, en çok yükselenleri takip et.' },
  { icon: PiggyBank, title: 'Portföyünü Yönet', desc: 'Sanal bakiyenle al-sat yap, performansını Portföy ekranından izle.' },
]

const WHY = [
  'Mobil uygulamayla bire bir aynı arayüz, artık web üzerinden de',
  'Gerçek para riski olmadan yatırım pratiği',
  'Admin panelli, ölçeklenebilir kurumsal altyapı',
  'Açık kaynaklı, şeffaf demo/eğitim amaçlı platform',
]

export default function Landing() {
  const [stocks, setStocks] = useState(FALLBACK_STOCKS)

  useEffect(() => {
    api.stocks().then(d => { if (d?.stocks?.length) setStocks(d.stocks) }).catch(() => {})
  }, [])

  const gainers = [...stocks].sort((a, b) => b.change_pct - a.change_pct).slice(0, 4)
  const tickerStocks = [...stocks, ...stocks]

  const [statsRef, statsVisible] = useReveal()
  const downloads = useCountUp(120, statsVisible)
  const trackedStocks = useCountUp(500, statsVisible)
  const rating = useCountUp(4.8, statsVisible)

  return (
    <div style={{ overflow: 'hidden' }}>
      <section style={{ position: 'relative', overflow: 'hidden', padding: '72px 0 0' }}>
        <div className="blob" style={{ width: 420, height: 420, top: -140, right: -80, background: 'radial-gradient(circle, rgba(59,108,255,0.28), transparent 70%)' }} />
        <div className="blob" style={{ width: 360, height: 360, bottom: -120, left: -100, background: 'radial-gradient(circle, rgba(74,222,128,0.22), transparent 70%)', animationDelay: '3s' }} />

        <div className="container" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 48, alignItems: 'center', paddingBottom: 40 }} id="hero-grid">
          <div>
            <div className="pill float-y" style={{ background: 'rgba(59,108,255,0.1)', color: 'var(--brand-blue)', marginBottom: 18 }}>
              <Sparkles size={14} /> Yeni nesil dijital yatırım deneyimi
            </div>
            <h1 style={{ fontSize: 48, lineHeight: 1.12, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 20px' }}>
              Piyasayı takip et,<br /> portföyünü <span style={{ backgroundImage: 'linear-gradient(90deg, var(--brand-blue), var(--brand-mint-dark))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>güvenle</span> yönet.
            </h1>
            <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 480, marginBottom: 32 }}>
              Mukatabak; BIST hisselerini gerçek zamanlıya yakın verilerle izlemeni, sanal bakiyenle
              alım-satım stratejilerini risksiz denemeni ve piyasa haberlerini tek ekrandan
              yönetmeni sağlayan profesyonel bir platformdur.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/kayit" className="btn btn-primary btn-lg cta-glow">Ücretsiz Hesap Aç <ArrowRight size={18} /></Link>
              <Link to="/kurumsal" className="btn btn-outline btn-lg">Kurumsal Bilgiler</Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 28 }}>
              <div style={{ display: 'flex' }}>
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={15} fill="#FBBF24" color="#FBBF24" style={{ marginLeft: i ? -4 : 0 }} />)}
              </div>
              <span style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>4.8/5 kullanıcı memnuniyeti</span>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <div className="card" style={{ padding: 22, background: 'var(--bg-card-gradient)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>En Çok Yükselenler</div>
                <span className="pill pill-up">{gainers.length} pay</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {gainers.map(st => (
                  <div key={st.symbol} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 14, padding: '10px 14px', border: '1px solid var(--border-subtle)' }}>
                    <img src={`/stocks/logo_${st.symbol.toLowerCase()}.png`} width={34} height={34} style={{ borderRadius: 8 }} alt="" onError={e => e.currentTarget.style.visibility = 'hidden'} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{st.symbol}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{st.name}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{fmtMoney(st.price)}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: st.change_pct >= 0 ? 'var(--up-green)' : 'var(--down-red)', display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
                        {st.change_pct >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {fmtPct(st.change_pct)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card float-y" style={{ position: 'absolute', bottom: -28, left: -28, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: 'var(--shadow-card-lg)', animationDelay: '1s' }} id="float-card">
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--up-green-bg)', display: 'grid', placeItems: 'center' }}>
                <TrendingUp size={20} color="var(--up-green)" />
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Toplam Portföy</div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>₺487.230,50</div>
              </div>
            </div>
            <div className="pill" style={{ position: 'absolute', top: 18, right: -14, background: '#0F172A', color: '#fff', boxShadow: 'var(--shadow-card-lg)' }} id="live-pill">
              <span className="live-dot" /> Canlı
            </div>
          </div>
        </div>

        <div className="marquee-wrap" style={{ borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', background: '#fff', overflow: 'hidden', padding: '16px 0' }}>
          <div className="marquee-track">
            {tickerStocks.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 28px', whiteSpace: 'nowrap' }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{s.symbol}</span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{fmtMoney(s.price)}</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: s.change_pct >= 0 ? 'var(--up-green)' : 'var(--down-red)' }}>{fmtPct(s.change_pct)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={statsRef} style={{ padding: '64px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} id="stats-grid">
          <StatCard n={`${downloads.toFixed(0)}K+`} l="Uygulama indirmesi" />
          <StatCard n={`${trackedStocks.toFixed(0)}+`} l="Takip edilen hisse" />
          <StatCard n={`${rating.toFixed(1)}/5`} l="Kullanıcı puanı" />
        </div>
      </section>

      <section style={{ padding: '40px 0 40px' }}>
        <div className="container">
          <Reveal style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 56px' }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 14 }}>Yatırım deneyimini yeniden tasarladık</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.7 }}>
              Mobil uygulamamızla bire bir aynı deneyimi artık web üzerinden de yaşayın.
            </p>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }} id="features-grid">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 90} className="feature-card card" style={{ padding: 26 }}>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(59,108,255,0.1)', display: 'grid', placeItems: 'center', marginBottom: 18 }}>
                  <f.icon size={22} color="var(--brand-blue)" />
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '56px 0' }}>
        <div className="container">
          <Reveal style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 56px' }}>
            <div className="pill" style={{ background: 'rgba(74,222,128,0.14)', color: 'var(--up-green)', marginBottom: 16 }}>3 Adımda Başla</div>
            <h2 style={{ fontSize: 32, fontWeight: 800 }}>Nasıl Çalışır?</h2>
          </Reveal>
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }} id="steps-grid">
            <div className="steps-line" />
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 120} style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-blue), #5B86FF)', display: 'grid', placeItems: 'center', margin: '0 auto 18px', boxShadow: 'var(--shadow-card-lg)', position: 'relative', zIndex: 1 }}>
                  <s.icon size={26} color="#fff" />
                </div>
                <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--brand-blue)', marginBottom: 8 }}>ADIM {i + 1}</div>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 10 }}>{s.title}</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.65, maxWidth: 280, margin: '0 auto' }}>{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '56px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '0.85fr 1.15fr', gap: 56, alignItems: 'center' }} id="showcase-grid">
          <Reveal style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="phone-mock">
              <div className="phone-mock-notch" />
              <div style={{ padding: '30px 16px 16px' }}>
                <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>Toplam Portföy Değeri</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 8 }}>₺487.230,50</div>
                <div className="pill" style={{ background: 'rgba(74,222,128,0.16)', color: '#4ADE80', marginBottom: 16 }}>
                  <TrendingUp size={12} /> +₺4.210,00 (+0,87%)
                </div>
                {gainers.slice(0, 3).map(s => (
                  <div key={s.symbol} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '9px 10px', marginBottom: 8 }}>
                    <img src={`/stocks/logo_${s.symbol.toLowerCase()}.png`} width={26} height={26} style={{ borderRadius: 7 }} alt="" onError={e => e.currentTarget.style.visibility = 'hidden'} />
                    <div style={{ flex: 1, color: '#E2E8F0', fontSize: 12.5, fontWeight: 700 }}>{s.symbol}</div>
                    <div style={{ color: '#4ADE80', fontSize: 12, fontWeight: 700 }}>{fmtPct(s.change_pct)}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="pill" style={{ background: 'rgba(59,108,255,0.1)', color: 'var(--brand-blue)', marginBottom: 16 }}>Web + Mobil</div>
            <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 18 }}>Nerede olursan ol, portföyün elinin altında</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15.5, lineHeight: 1.75, marginBottom: 28, maxWidth: 480 }}>
              Mukatabak mobil uygulamasıyla aynı tasarım dilini paylaşan web platformumuz sayesinde
              masaüstünde, tablette veya telefonda kesintisiz bir deneyim yaşarsın.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <ShowcaseRow icon={Smartphone} title="Mobil ile birebir aynı" desc="Aynı ekranlar, aynı renkler, aynı akış — platform fark etmeksizin." />
              <ShowcaseRow icon={Globe2} title="Her yerden erişim" desc="Kurulum gerektirmeden tarayıcı üzerinden anında kullan." />
              <ShowcaseRow icon={Zap} title="Hızlı ve akıcı" desc="Modern altyapı sayesinde gecikmesiz, akıcı bir deneyim." />
            </div>
          </Reveal>
        </div>
      </section>

      <section style={{ padding: '56px 0' }}>
        <div className="container">
          <div className="card" style={{ padding: '48px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center', background: 'var(--bg-card-gradient)' }} id="why-grid">
            <Reveal>
              <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>Neden Mukatabak?</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7 }}>
                Yatırım okuryazarlığını herkes için erişilebilir kılmak amacıyla tasarlanmış,
                şeffaf ve modern bir demo platform.
              </p>
            </Reveal>
            <Reveal delay={120} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {WHY.map(w => (
                <div key={w} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <CheckCircle2 size={19} color="var(--up-green)" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 14.5, fontWeight: 600 }}>{w}</span>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      <section style={{ padding: '40px 0 100px' }}>
        <div className="container">
          <Reveal style={{ background: 'linear-gradient(135deg, #1D2E63, #0F172A)', borderRadius: 32, padding: '64px 48px', textAlign: 'center', color: '#fff', position: 'relative', overflow: 'hidden' }}>
            <div className="blob" style={{ width: 300, height: 300, top: '10%', left: '10%', background: 'radial-gradient(circle, rgba(59,108,255,0.45), transparent 70%)' }} />
            <div className="blob" style={{ width: 300, height: 300, bottom: '5%', right: '10%', background: 'radial-gradient(circle, rgba(74,222,128,0.35), transparent 70%)', animationDelay: '4s' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 18 }}>
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={18} fill="#FBBF24" color="#FBBF24" />)}
              </div>
              <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 14 }}>Hemen ücretsiz hesabını oluştur</h2>
              <p style={{ color: '#CBD5E1', maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.7 }}>
                Saniyeler içinde kayıt ol, sanal bakiyenle piyasayı keşfetmeye başla.
              </p>
              <Link to="/kayit" className="btn btn-primary btn-lg cta-glow">Ücretsiz Başla <ArrowRight size={18} /></Link>
            </div>
          </Reveal>
        </div>
      </section>

      <style>{`
        .live-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #4ADE80; display: inline-block;
          animation: pulseRing 1.8s ease-out infinite;
        }
        .cta-glow { position: relative; }
        .cta-glow::after {
          content: ''; position: absolute; inset: -3px; border-radius: 999px;
          background: linear-gradient(90deg, var(--brand-blue), var(--brand-mint-dark), var(--brand-blue));
          background-size: 200% 100%; z-index: -1; opacity: 0; transition: opacity .25s;
          animation: shimmer 3s linear infinite;
        }
        .cta-glow:hover::after { opacity: .55; }

        .feature-card { transition: transform .25s ease, box-shadow .25s ease; }
        .feature-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-card-lg); }

        .steps-line {
          position: absolute; top: 32px; left: 16.5%; right: 16.5%; height: 2px;
          background: repeating-linear-gradient(90deg, var(--border-subtle) 0 8px, transparent 8px 16px);
          z-index: 0;
        }

        .phone-mock {
          width: 240px; height: 480px; border-radius: 36px; padding: 10px;
          background: linear-gradient(160deg, #1D2E63, #0F172A);
          box-shadow: 0 30px 60px rgba(15,23,42,0.35);
          position: relative;
        }
        .phone-mock-notch {
          position: absolute; top: 10px; left: 50%; transform: translateX(-50%);
          width: 90px; height: 18px; border-radius: 10px; background: #000;
        }

        @media (max-width: 900px) {
          #hero-grid { grid-template-columns: 1fr !important; }
          #features-grid { grid-template-columns: repeat(2, 1fr) !important; }
          #float-card, #live-pill { display: none !important; }
          #steps-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .steps-line { display: none; }
          #showcase-grid { grid-template-columns: 1fr !important; }
          #why-grid { grid-template-columns: 1fr !important; }
          #stats-grid { grid-template-columns: 1fr !important; gap: 14px !important; }
          h1 { font-size: 36px !important; }
        }
        @media (max-width: 560px) {
          #features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function StatCard({ n, l }) {
  return (
    <div className="card" style={{ padding: '28px 24px', textAlign: 'center' }}>
      <div style={{ fontWeight: 800, fontSize: 32, backgroundImage: 'linear-gradient(90deg, var(--brand-blue), var(--brand-mint-dark))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>{n}</div>
      <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 6, fontWeight: 600 }}>{l}</div>
    </div>
  )
}

function ShowcaseRow({ icon: Icon, title, desc }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(59,108,255,0.1)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <Icon size={18} color="var(--brand-blue)" />
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</div>
      </div>
    </div>
  )
}
