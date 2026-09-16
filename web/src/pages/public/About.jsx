import { ShieldCheck, Target, Users, Rocket } from 'lucide-react'

const VALUES = [
  { icon: Target, title: 'Şeffaflık', desc: 'Sunduğumuz her veriyi ve özelliği açıkça tanımlarız; gizli koşul yoktur.' },
  { icon: ShieldCheck, title: 'Güvenlik', desc: 'Kullanıcı hesapları şifreli oturumlarla ve katmanlı erişim kontrolüyle korunur.' },
  { icon: Users, title: 'Erişilebilirlik', desc: 'Yatırım okuryazarlığını herkes için ücretsiz ve anlaşılır kılmayı hedefleriz.' },
  { icon: Rocket, title: 'Sürekli Gelişim', desc: 'Kullanıcı geri bildirimleriyle ürünümüzü her hafta bir adım ileri taşırız.' },
]

export default function About() {
  return (
    <div className="container" style={{ padding: '64px 24px 100px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto 56px', textAlign: 'center' }}>
        <div className="pill" style={{ background: 'rgba(59,108,255,0.1)', color: 'var(--brand-blue)', marginBottom: 16 }}>Kurumsal</div>
        <h1 style={{ fontSize: 38, fontWeight: 800, marginBottom: 16 }}>Mukatabak Hakkında</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.8 }}>
          Mukatabak, hisse senedi piyasalarını takip etmeyi ve yatırım kararlarını sanal bir ortamda
          pratik etmeyi herkes için erişilebilir kılmak amacıyla geliştirilmiş dijital bir platformdur.
          Mobil uygulamamızla aynı deneyimi web üzerinden sunarak kullanıcılarımızın istedikleri
          cihazdan kesintisiz erişim sağlamasını hedefliyoruz.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 72 }} id="values-grid">
        {VALUES.map(v => (
          <div key={v.title} className="card" style={{ padding: 26 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(59,108,255,0.1)', display: 'grid', placeItems: 'center', marginBottom: 16 }}>
              <v.icon size={22} color="var(--brand-blue)" />
            </div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>{v.title}</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{v.desc}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 40, background: 'var(--bg-card-gradient)' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Önemli Bilgilendirme</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 15 }}>
          Mukatabak bir yatırım kuruluşu, aracı kurum veya bankacılık hizmeti sağlayıcısı değildir;
          lisanslı bir finansal aracı olarak faaliyet göstermez. Platformda gösterilen bakiyeler,
          işlemler ve piyasa hareketleri simülasyon amaçlıdır. Herhangi bir gerçek para transferi,
          mevduat toplama veya yatırım danışmanlığı hizmeti sunulmaz. Gerçek yatırım kararları için
          Sermaye Piyasası Kurulu (SPK) lisanslı bir aracı kurumla iletişime geçmenizi öneririz.
        </p>
      </div>

      <style>{`
        @media (max-width: 900px) { #values-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 560px) { #values-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
