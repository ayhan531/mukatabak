import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight, ArrowUpRight, Landmark, PieChart, ArrowLeftRight, Users, Check, Menu, X,
  ShieldCheck, Smartphone, Headphones, TrendingUp, Wallet, LineChart, Lock, Clock,
  FileText, Download, BarChart3, Building2, Mail, Phone, MapPin, Bell, Eye, Zap, Search,
} from 'lucide-react';
import './corporate.css';

/* ============================================================
   İçerik
   ============================================================ */

const services = [
  [Landmark, 'Pay Piyasası', 'Borsa İstanbul’da hisse senedi alım satımı.',
    'BIST’te işlem gören payları canlı fiyatlarla izleyin, piyasa ve limit emir verin, gerçekleşen işlemlerinizi ve T+2 takas sürecinizi e-şubeden adım adım takip edin. Takip listenizle ilgilendiğiniz payları tek ekranda tutun.',
    ['Canlı BIST fiyatları', 'Piyasa ve limit emir', 'T+2 valör takibi', 'Takip listesi ve fiyat alarmı']],
  [PieChart, 'Yatırım Fonları', 'Profesyonel yönetilen fonlarla portföy çeşitlendirme.',
    'Farklı varlık sınıflarına yatırım yapan fonları risk düzeyi, yatırım süresi ve yönetim yaklaşımıyla değerlendirin. Fon işlemleri ve uygunluk bilgileri için müşteri temsilcinizle iletişime geçebilirsiniz.',
    ['Risk düzeyine göre fon seçimi', 'Fon karşılaştırma', 'Uygunluk ve yerindelik testi', 'Portföy dağılım raporu']],
  [ArrowLeftRight, 'Vadeli İşlemler', 'VİOP’ta vadeli ve opsiyon sözleşmeleri.',
    'Vadeli işlemler teminat ve kaldıraç içerir. Sözleşme büyüklüğü, vade, teminat gereksinimi ve riskleri değerlendirerek müşteri temsilcinizden işlem koşullarını öğrenebilirsiniz.',
    ['Endeks ve pay vadeli işlemleri', 'Teminat takibi', 'Pozisyon ve kâr/zarar izleme', 'Risk bildirimleri']],
  [Users, 'Portföy Yönetimi', 'Hedeflerinize uygun bir portföy yaklaşımı.',
    'Varlık dağılımınızı, maliyetlerinizi ve kâr/zararınızı birlikte değerlendirin. Yatırım süreniz, likidite ihtiyacınız ve risk tercihiniz portföy kararlarının temelini oluşturur.',
    ['Varlık dağılımı analizi', 'Getiri ve maliyet raporu', 'Risk profili değerlendirmesi', 'Dönemsel portföy gözden geçirme']],
];

const features = [
  [LineChart, 'Canlı piyasa verisi', 'BIST payları, endeksler ve döviz kurları gün boyu güncellenir; fiyat, günlük değişim ve trend tek satırda görünür.'],
  [Wallet, 'Portföy ve T+2 bakiye', 'Toplam portföy değeriniz, kullanılabilir bakiyeniz ve T+2 takas bakiyeniz ayrı ayrı, net biçimde gösterilir.'],
  [Zap, 'Hızlı emir paneli', 'Her ekrandan tek dokunuşla açılan Al/Sat panelinde adet ya da tutar girin, %25–%100 kısayollarıyla hızlıca emir oluşturun.'],
  [ShieldCheck, 'İki adımlı güvenlik', 'Şifre, işlem onayı ve aktif cihaz yönetimi ile hesabınızı koruyun; şüpheli girişleri e-şubeden kapatın.'],
  [Bell, 'Anlık bildirimler', 'Emir gerçekleşmeleri, para transferleri ve piyasa gelişmeleri için tarayıcı ve telefon bildirimleri.'],
  [Smartphone, 'Her cihazda aynı deneyim', 'E-şube telefona uygulama gibi kurulabilir; masaüstü, tablet ve mobilde aynı ekranlarla çalışır.'],
];

const steps = [
  ['Başvurunuzu oluşturun', 'Kimlik bilgilerinizi girin, risk profili anketini doldurun ve sözleşmeleri onaylayın.'],
  ['Hesabınız doğrulansın', 'Belgeleriniz kontrol edildikten sonra yatırım hesabınız kullanıma açılır.'],
  ['Bakiye yükleyin', 'Kayıtlı banka hesabınızdan transfer talebi oluşturun; tutar onaylandığında hesabınıza geçer.'],
  ['Yatırıma başlayın', 'Payları inceleyin, emrinizi verin, portföyünüzü ve emirlerinizi e-şubeden izleyin.'],
];

const fees = [
  ['Pay piyasası (e-şube)', '%0,10', 'İşlem hacmi üzerinden, alış ve satışta ayrı ayrı'],
  ['Pay piyasası (telefon emri)', '%0,20', 'Çağrı merkezi aracılığıyla iletilen emirler'],
  ['Para yatırma (EFT/Havale)', 'Ücretsiz', 'Kendi hesabınızdan yapılan transferler'],
  ['Para çekme', 'Ücretsiz', 'Kayıtlı IBAN’ınıza, iş günü içinde'],
  ['Menkul kıymet virmanı', 'Kurum tarifesi', 'Diğer kuruluşlara transferlerde'],
  ['Hesap işletim ücreti', 'Yok', 'E-şube hesapları için alınmaz'],
];

const faqGroups = [
  ['Hesap işlemleri', [
    ['Nasıl hesap açabilirim?', 'E-Şube Giriş bağlantısındaki Kayıt bölümünden başvurunuzu başlatabilirsiniz. Kimlik bilgilerinizi, iletişim bilgilerinizi ve risk profili anketini tamamladıktan sonra başvurunuz değerlendirilir.'],
    ['Hesap açmak ücretli mi?', 'Hayır. Hesap açılışı ve e-şube kullanımı için ücret alınmaz. Yalnızca gerçekleşen işlemlerde komisyon uygulanır.'],
    ['Hesabımı nasıl kapatırım?', 'Açık emirlerinizin, devam eden takas işlemlerinizin ve varsa yükümlülüklerinizin tamamlanmasının ardından hesap kapatma talebinizi iletebilirsiniz.'],
  ]],
  ['Para transferleri', [
    ['Para yatırma talebimi nasıl takip ederim?', 'E-şubede Hesap bölümündeki Para Yatır alanından talep oluşturabilir, işlem geçmişinden durumunu takip edebilirsiniz. Transfer öncesinde güncel alıcı ve hesap bilgilerini kontrol edin.'],
    ['Para çekme ne kadar sürer?', 'Talebiniz iş günü içinde alındığında kayıtlı IBAN’ınıza aynı gün gönderilir. Hafta sonu ve resmi tatillerde işlem bir sonraki iş gününde gerçekleşir.'],
    ['Başkasının hesabına transfer yapabilir miyim?', 'Hayır. Mevzuat gereği para çekme işlemleri yalnızca hesap sahibinin kendi adına kayıtlı IBAN’ına yapılabilir.'],
  ]],
  ['İşlem ve emirler', [
    ['Emirlerimi nereden görebilirim?', 'Portföyüm ekranındaki Emirler sekmesi bekleyen emirlerinizi, Geçmiş sekmesi ise gerçekleşen alış ve satışlarınızı gösterir.'],
    ['T+2 bakiye ne anlama gelir?', 'Pay piyasasında işlem tarihinden sonraki ikinci iş gününde gerçekleşen takası ifade eder. Satış sonrası nakdiniz T+2’de kullanılabilir hale gelir; e-şubede kullanılabilir ve T+2 bakiye ayrı gösterilir.'],
    ['Piyasa kapalıyken emir verebilir miyim?', 'Seans dışında yalnızca limit emir iletebilirsiniz. Emriniz seans açıldığında sıraya girer.'],
    ['Emrimi iptal edebilir miyim?', 'Gerçekleşmemiş emirlerinizi Portföyüm > Emirler sekmesinden iptal edebilirsiniz. Kısmen gerçekleşen emirlerde yalnızca kalan bölüm iptal edilir.'],
  ]],
  ['Güvenlik', [
    ['Hesabım ne kadar güvende?', 'Girişlerde şifre ve iki adımlı doğrulama, kritik işlemlerde ayrıca işlem onayı uygulanır. Aktif cihazlarınızı e-şubeden görüntüleyip dilediğiniz oturumu kapatabilirsiniz.'],
    ['Şifremi unuttum, ne yapmalıyım?', 'Giriş ekranındaki şifre yenileme bağlantısından kayıtlı e-posta adresinize sıfırlama bağlantısı gönderebilirsiniz.'],
    ['Yatırımda kazanç garanti edilir mi?', 'Hayır. Sermaye piyasası araçlarının değeri artabilir veya azalabilir; yatırılan tutarın tamamı kaybedilebilir. Karar vermeden önce riskleri ve işlem koşullarını inceleyin.'],
  ]],
];

const posts = [
  ['YATIRIMCI REHBERİ', 'T+2 valör nedir, portföyünüzü nasıl etkiler?', 'Pay piyasasında işlem gününüz ile paranızın kullanılabilir hale geldiği gün aynı değildir. Satış sonrası nakdin iki iş günü sonra serbest kalması, arka arkaya işlem yapan yatırımcılar için planlama gerektirir.'],
  ['TEMEL KAVRAMLAR', 'Piyasa emri ile limit emir arasındaki fark', 'Piyasa emri anlık en iyi fiyattan gerçekleşir; hız önceliklidir. Limit emirde ise fiyatı siz belirlersiniz, gerçekleşme garantisi yoktur. Hangi durumda hangisinin uygun olduğunu örneklerle inceliyoruz.'],
  ['RİSK YÖNETİMİ', 'Portföy çeşitlendirmesi neden önemli?', 'Tek bir paya ya da sektöre yoğunlaşan portföyler, o alandaki olumsuz gelişmelerden orantısız etkilenir. Varlık dağılımı, riski azaltmanın en bilinen yollarından biridir.'],
  ['MALİYETLER', 'İşlem maliyetlerinizi hesaplamayı öğrenin', 'Komisyon, borsa payı ve diğer yasal kesintiler net getirinizi doğrudan etkiler. Alış ve satışta oluşan toplam maliyeti işlem öncesinde görmek, beklentinizi gerçekçi tutar.'],
  ['PİYASA OKURYAZARLIĞI', 'Endeksler ne anlatır: BIST 100 ve BIST 30', 'Endeksler piyasanın genel yönü hakkında fikir verir. Hangi payların endekse girdiğini ve ağırlıkların nasıl belirlendiğini bilmek, haberleri doğru okumayı kolaylaştırır.'],
  ['GÜVENLİK', 'Hesap güvenliği için beş pratik alışkanlık', 'Güçlü şifre, iki adımlı doğrulama, bilinmeyen cihazların kapatılması, resmi kanalların kullanılması ve bildirimlerin açık tutulması hesabınızı korur.'],
];

const routes = {
  'Ana Sayfa': '/',
  'Hakkımızda': '/kurumsal',
  'Hizmetlerimiz': '/hizmetler',
  'Komisyon & Ücretler': '/ucretler',
  'Blog': '/blog',
  'SSS': '/sss',
  'İletişim': '/iletisim',
  'Sözleşmeler': '/sozlesmeler',
};

/* ============================================================
   Küçük bileşenler
   ============================================================ */

function useOnScreen(threshold = 0.2) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') { setSeen(true); return undefined; }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) { setSeen(true); observer.disconnect(); }
    }, { threshold });
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, seen];
}

const Reveal = ({ children, delay = 0, as: Tag = 'div', className = '' }) => {
  const [ref, seen] = useOnScreen(0.12);
  return (
    <Tag ref={ref} className={`reveal${seen ? ' in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
};

function AnimatedMetric({ target, label, prefix = '', suffix = '' }) {
  const [ref, seen] = useOnScreen(0.4);
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!seen) return undefined;
    const duration = 1400;
    const startedAt = performance.now();
    let frame;
    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, seen]);
  return (
    <article ref={ref}>
      <strong>{prefix}{value.toLocaleString('tr-TR')}{suffix}</strong>
      <p>{label}</p>
    </article>
  );
}

/* ---------- canlı piyasa verisi ---------- */

const TICKERS = [
  ['XU100', 'BIST 100'], ['XU030', 'BIST 30'], ['USDTRY', 'Dolar'],
  ['EURTRY', 'Euro'], ['THYAO', 'THYAO'], ['ASELS', 'ASELS'], ['TUPRS', 'TUPRS'],
];

function useMarket() {
  const [quotes, setQuotes] = useState([]);
  useEffect(() => {
    let alive = true;
    const load = () => fetch('/api/market', { credentials: 'include' })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => { if (alive && data) setQuotes(data.quotes || []); })
      .catch(() => { /* tanıtım sayfası veri olmadan da çalışır */ });
    load();
    const timer = setInterval(load, 60000);
    return () => { alive = false; clearInterval(timer); };
  }, []);
  return quotes;
}

const fmt = (value, digits = 2) =>
  Number(value || 0).toLocaleString('tr-TR', { minimumFractionDigits: digits, maximumFractionDigits: digits });

function LiveTicker({ quotes }) {
  const by = new Map(quotes.map((quote) => [quote.symbol, quote]));
  const rows = TICKERS.map(([code, label]) => [label, by.get(code)]).filter(([, quote]) => quote);
  if (!rows.length) return null;
  return (
    <div className="corporate-ticker-wrap">
      <div className="corporate-ticker">
        {rows.map(([label, quote]) => {
          const up = Number(quote.change_pct || 0) >= 0;
          return (
            <article key={label}>
              <span>{label}</span>
              <strong>{fmt(quote.price)}</strong>
              <em className={up ? 'up' : 'down'}>
                {(up ? '▲ +' : '▼ ')}%{fmt(Math.abs(Number(quote.change_pct || 0)))}
              </em>
            </article>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- hero'daki telefon maketi ---------- */

function PhoneMock({ quotes }) {
  const by = new Map(quotes.map((quote) => [quote.symbol, quote]));
  const fallback = [
    { symbol: 'THYAO', name: 'Türk Hava Yolları', price: 295, change_pct: 2.26 },
    { symbol: 'ASELS', name: 'Aselsan', price: 59.35, change_pct: 2.06 },
    { symbol: 'TUPRS', name: 'Tüpraş', price: 159.7, change_pct: 1.78 },
  ];
  const rows = ['THYAO', 'ASELS', 'TUPRS']
    .map((code, index) => by.get(code) || fallback[index])
    .map((quote, index) => ({ ...quote, name: fallback[index].name }));
  const index100 = by.get('XU100');
  const index30 = by.get('XU030');

  return (
    <div className="phone-mock" aria-hidden="true">
      <div className="phone-frame">
        <div className="phone-notch" />
        <div className="phone-screen">
          <div className="pm-head">
            <span className="pm-word">Mukatabak<i>+</i></span>
            <span className="pm-ava">İS</span>
          </div>
          <div className="pm-strip">
            <div className="pm-tile">
              <span>BIST 100</span>
              <strong>{fmt(index100?.price || 9758.23)}</strong>
              <em className={Number(index100?.change_pct ?? 1.7) >= 0 ? 'up' : 'down'}>
                ▲ %{fmt(Math.abs(Number(index100?.change_pct ?? 1.7)))}
              </em>
            </div>
            <div className="pm-tile">
              <span>BIST 30</span>
              <strong>{fmt(index30?.price || 10612.4)}</strong>
              <em className={Number(index30?.change_pct ?? 1.75) >= 0 ? 'up' : 'down'}>
                ▲ %{fmt(Math.abs(Number(index30?.change_pct ?? 1.75)))}
              </em>
            </div>
          </div>
          <div className="pm-search"><Search size={14} /> Hisse ara</div>
          <div className="pm-card">
            <div className="pm-card-head"><span className="pm-star">★</span> Takip Listem</div>
            {rows.map((row) => {
              const up = Number(row.change_pct || 0) >= 0;
              return (
                <div className="pm-row" key={row.symbol}>
                  <span className="pm-dot" />
                  <span className="pm-sym"><b>{row.symbol}</b><s>{row.name}</s></span>
                  <span className="pm-price">
                    <b>{fmt(row.price)}</b>
                    <em className={up ? 'up' : 'down'}>{up ? '▲' : '▼'} %{fmt(Math.abs(Number(row.change_pct || 0)))}</em>
                  </span>
                </div>
              );
            })}
          </div>
          <div className="pm-nav">
            <span className="on">Ana Sayfa</span>
            <span>Hisseler</span>
            <span className="pm-fab"><ArrowLeftRight size={16} /></span>
            <span>Portföy</span>
            <span>Hesap</span>
          </div>
        </div>
      </div>
      <div className="phone-glow" />
    </div>
  );
}

/* ============================================================
   Sayfa
   ============================================================ */

export default function CorporateLanding({ openAuth }) {
  const [page, setPage] = useState(() => Object.keys(routes).find((key) => routes[key] === window.location.pathname) || 'Ana Sayfa');
  const [menu, setMenu] = useState(false);
  const [service, setService] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const quotes = useMarket();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onPop = () => setPage(Object.keys(routes).find((key) => routes[key] === window.location.pathname) || 'Ana Sayfa');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const go = (next, serviceIndex = null) => {
    setPage(next);
    setService(serviceIndex);
    setMenu(false);
    window.history.pushState({}, '', routes[next] || '/');
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  };

  const link = (title) => (
    <a href={routes[title]} onClick={(event) => { event.preventDefault(); go(title); }}>{title}</a>
  );

  const heading = (title, description) => (
    <Reveal className="corporate-heading">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </Reveal>
  );

  const servicesGrid = (
    <div className="corporate-services">
      {services.map(([Ikon, title, short], index) => (
        <Reveal key={title} delay={index * 70}>
          <article>
            <Ikon size={22} />
            <h3>{title}</h3>
            <p>{short}</p>
            <button onClick={() => go('Hizmetlerimiz', index)}>Detaylı bilgi <ArrowRight size={15} /></button>
          </article>
        </Reveal>
      ))}
    </div>
  );

  return (
    <div className="corporate">
      <header className={`corporate-nav${scrolled ? ' solid' : ''}`}>
        <a className="brand" href="/" onClick={(event) => { event.preventDefault(); go('Ana Sayfa'); }}>
          Mukatabak<i>+</i>
        </a>
        <nav className={menu ? 'open' : ''} aria-label="Kurumsal menü">
          {Object.keys(routes).filter((key) => key !== 'Sözleşmeler').map((key) => (
            <a
              key={key}
              aria-current={page === key ? 'page' : undefined}
              href={routes[key]}
              onClick={(event) => { event.preventDefault(); go(key); }}
            >{key}</a>
          ))}
        </nav>
        <button className="corporate-login" onClick={openAuth}>E-Şube Giriş <ArrowUpRight size={16} /></button>
        <button className="corporate-menu" aria-label="Menü" aria-expanded={menu} onClick={() => setMenu(!menu)}>
          {menu ? <X /> : <Menu />}
        </button>
      </header>

      <main>
        {page === 'Ana Sayfa' ? (
          <>
            {/* ---------- hero ---------- */}
            <section className="corporate-hero">
              <div className="hero-grid">
                <div className="hero-copy">
                  <span className="corporate-eyebrow"><span className="live-dot" /> CANLI BIST · PORTFÖY · E-ŞUBE</span>
                  <h1>Yatırımın<br />sade hâli</h1>
                  <p className="hero-lead">
                    Canlı BIST fiyatlarını izleyin, hisse alıp satın, portföyünüzü ve T+2 bakiyenizi
                    tek ekrandan yönetin. Telefonunuzda da tarayıcıda da aynı deneyim.
                  </p>
                  <div className="corporate-actions">
                    <button onClick={openAuth}>E-Şube’ye Giriş <ArrowRight size={18} /></button>
                    <button className="outline" onClick={() => go('Hizmetlerimiz')}>Hizmetlerimiz</button>
                  </div>
                  <div className="corporate-trust">
                    <span><ShieldCheck size={16} /> İki adımlı güvenlik</span>
                    <span><Smartphone size={16} /> Telefona kurulabilir</span>
                    <span><Headphones size={16} /> Yatırımcı desteği</span>
                  </div>
                  {/* SPK lisans şeridi: kurumsal güven satırının hemen altında. */}
                  <div className="corporate-licence">
                    <ShieldCheck size={16} />
                    <span>SPK Lisanslı Güvenilir Aracı Kurum</span>
                  </div>
                </div>
                <div className="hero-visual">
                  <PhoneMock quotes={quotes} />
                </div>
              </div>
            </section>

            <LiveTicker quotes={quotes} />

            {/* ---------- düzenleyici kurumlar ---------- */}
            <section className="corporate-regulators">
              <h2>Düzenleyici kurumlar ve piyasa kuruluşları</h2>
              <div>
                {[['Sermaye Piyasası Kurulu', 'https://spk.gov.tr'], ['Borsa İstanbul', 'https://www.borsaistanbul.com'],
                  ['Takasbank', 'https://www.takasbank.com.tr'], ['MKK', 'https://www.mkk.com.tr'],
                  ['TSPB', 'https://tspb.org.tr']].map(([title, url]) => (
                  <a key={title} href={url} target="_blank" rel="noopener noreferrer">
                    <Building2 size={17} /> {title}
                  </a>
                ))}
              </div>
            </section>

            {/* ---------- özellikler ---------- */}
            <section className="corporate-section">
              {heading('E-şubede neler var?', 'Yatırım hesabınızla ilgili her şey tek yerde, anlaşılır bir düzende.')}
              <div className="corporate-features">
                {features.map(([Ikon, title, text], index) => (
                  <Reveal key={title} delay={index * 60}>
                    <article>
                      <span className="ficon"><Ikon size={20} /></span>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </article>
                  </Reveal>
                ))}
              </div>
            </section>

            {/* ---------- hizmetler ---------- */}
            <section className="corporate-section alt">
              {heading('Yatırım hizmetlerimiz', 'Geniş ürün yelpazemizle yatırım hedeflerinize ulaşmanız için yanınızdayız.')}
              {servicesGrid}
              <div className="corporate-center">
                <button className="text-link" onClick={() => go('Hizmetlerimiz')}>
                  Tüm hizmetlerimizi görüntüleyin <ArrowRight size={16} />
                </button>
              </div>
            </section>

            {/* ---------- adımlar ---------- */}
            <section className="corporate-section">
              {heading('Dört adımda başlayın', 'Hesap açılışından ilk emrinize kadar tüm süreç dijital.')}
              <div className="corporate-steps">
                {steps.map(([title, text], index) => (
                  <Reveal key={title} delay={index * 70}>
                    <article>
                      <span className="num">{index + 1}</span>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </article>
                  </Reveal>
                ))}
              </div>
              <div className="corporate-center">
                <button className="corporate-primary" onClick={openAuth}>Hesap başvurusu başlat <ArrowRight size={17} /></button>
              </div>
            </section>

            {/* ---------- rakamlar ---------- */}
            <section className="corporate-numbers">
              <div className="corporate-heading">
                <h2>Rakamlarla Mukatabak Yatırım</h2>
                <p>Dijital yatırım deneyimini ölçeklendiriyoruz.</p>
              </div>
              <div>
                <AnimatedMetric target={250000} suffix="+" label="Aktif yatırım hesabı" />
                <AnimatedMetric target={125} prefix="₺" suffix=" Mr+" label="Yıllık işlem hacmi" />
                <AnimatedMetric target={500} suffix="+" label="İşlem gören pay" />
                <AnimatedMetric target={24} prefix="7/" label="Dijital erişim" />
              </div>
            </section>

            {/* ---------- güvenlik ---------- */}
            <section className="corporate-section corporate-split">
              <div>
                {heading('Güvenlik en baştan tasarlandı')}
                <ul className="corporate-list">
                  {[
                    'Girişte şifre ve iki adımlı doğrulama',
                    'Kritik işlemlerde ayrıca işlem onayı',
                    'Aktif cihaz listesi ve tek dokunuşla oturum kapatma',
                    'Emir ve transferlerde anlık bildirim',
                    'Varlıklar MKK ve Takasbank nezdinde izlenir',
                  ].map((item) => (
                    <li key={item}><Check size={18} /> {item}</li>
                  ))}
                </ul>
                <button className="text-link" onClick={() => go('SSS')}>Güvenlikle ilgili sorular <ArrowRight size={16} /></button>
              </div>
              <Reveal className="security-card">
                <div className="sec-badges">
                  <span><Lock size={18} /> TLS 1.3</span>
                  <span><ShieldCheck size={18} /> 2FA</span>
                  <span><Eye size={18} /> Cihaz takibi</span>
                  <span><Bell size={18} /> Anlık uyarı</span>
                </div>
                <h3>Hesabınıza yalnızca siz erişirsiniz</h3>
                <p>
                  Kurum çalışanları şifrenizi ya da tek kullanımlık doğrulama kodunuzu hiçbir koşulda
                  talep etmez. Tanımadığınız bir cihaz gördüğünüzde oturumu e-şubeden kapatabilirsiniz.
                </p>
              </Reveal>
            </section>

            {/* ---------- mobil ---------- */}
            <section className="corporate-app">
              <div>
                <span className="corporate-eyebrow light">MOBİL</span>
                <h2>E-şubeyi telefonunuza kurun</h2>
                <p>
                  Mukatabak e-şubesi telefonunuzun ana ekranına uygulama gibi eklenir; bildirimler
                  açık olduğunda emir ve transfer gelişmelerini anında görürsünüz. Android için
                  uygulama dosyasını da indirebilirsiniz.
                </p>
                <div className="corporate-actions">
                  <button onClick={openAuth}>E-Şube’yi aç <ArrowRight size={17} /></button>
                  <a className="outline" href="/api/app/download">
                    <Download size={17} /> Android uygulaması
                  </a>
                </div>
                <div className="app-points">
                  {[[Clock, 'Kurulum 10 saniye'], [Wallet, 'Portföy ve bakiye'], [TrendingUp, 'Canlı fiyat'], [Bell, 'Anlık bildirim']].map(([Ikon, title]) => (
                    <span key={title}><Ikon size={16} /> {title}</span>
                  ))}
                </div>
              </div>
              <div className="app-visual"><PhoneMock quotes={quotes} /></div>
            </section>

            {/* ---------- ücretler ---------- */}
            <section className="corporate-section alt">
              {heading('Şeffaf komisyon', 'İşlem öncesinde maliyetinizi bilin; sürpriz kesinti yok.')}
              <Reveal className="fee-table">
                <table>
                  <thead>
                    <tr><th>İşlem</th><th>Oran</th><th>Açıklama</th></tr>
                  </thead>
                  <tbody>
                    {fees.map(([title, rate, note]) => (
                      <tr key={title}><td>{title}</td><td><strong>{rate}</strong></td><td>{note}</td></tr>
                    ))}
                  </tbody>
                </table>
                <p className="fee-note">
                  Tabloda yer alan oranlar örnek niteliğindedir; hesabınıza uygulanacak güncel tarife
                  sözleşmenizde ve e-şubede yer alır. Borsa payı, BSMV ve diğer yasal kesintiler ayrıca yansıtılır.
                </p>
              </Reveal>
            </section>

            {/* ---------- blog ---------- */}
            <section className="corporate-section">
              {heading('Yatırımcı rehberi', 'Piyasayı ve kendi hesabınızı daha iyi okumanız için kısa yazılar.')}
              <div className="corporate-posts">
                {posts.slice(0, 3).map(([tag, title, text], index) => (
                  <Reveal key={title} delay={index * 70}>
                    <article>
                      <span className="tag">{tag}</span>
                      <h3>{title}</h3>
                      <p>{text}</p>
                      <button className="text-link" onClick={() => go('Blog')}>Devamını oku <ArrowRight size={15} /></button>
                    </article>
                  </Reveal>
                ))}
              </div>
            </section>

            {/* ---------- sss ---------- */}
            <section className="corporate-section alt">
              {heading('Sık sorulan sorular')}
              <div className="corporate-faq">
                {faqGroups[2][1].concat(faqGroups[0][1].slice(0, 2)).map(([question, answer]) => (
                  <details key={question}>
                    <summary>{question}</summary>
                    <p>{answer}</p>
                  </details>
                ))}
              </div>
              <div className="corporate-center">
                <button className="text-link" onClick={() => go('SSS')}>Tüm soruları görüntüleyin <ArrowRight size={16} /></button>
              </div>
            </section>

            {/* ---------- cta ---------- */}
            <section className="corporate-cta">
              <h2>Yatırım yolculuğunuza bugün başlayın</h2>
              <p>Hesap başvurunuzu birkaç dakikada tamamlayın, piyasayı ve portföyünüzü e-şubeden takip edin.</p>
              <div className="corporate-actions">
                <button className="corporate-primary" onClick={openAuth}>Ücretsiz hesap aç <ArrowRight size={17} /></button>
                <button className="outline" onClick={() => go('İletişim')}>Bize ulaşın</button>
              </div>
            </section>
          </>
        ) : (
          <section className="corporate-section corporate-page">
            <div className="corporate-breadcrumb">{link('Ana Sayfa')} <span>/</span> {page}</div>
            <h1>{service !== null ? services[service][1] : page}</h1>

            {page === 'Hizmetlerimiz' && (service !== null ? (
              <>
                <p className="lead">{services[service][2]}</p>
                <p>{services[service][3]}</p>
                <ul className="corporate-list">
                  {services[service][4].map((item) => <li key={item}><Check size={18} /> {item}</li>)}
                </ul>
                <div className="page-actions">
                  <button className="corporate-primary" onClick={openAuth}>E-Şube’ye git <ArrowRight size={17} /></button>
                  <button className="text-link" onClick={() => go('Hizmetlerimiz')}>Tüm hizmetler</button>
                </div>
              </>
            ) : (
              <>
                <p className="lead">Hedeflerinize ve risk tercihinize uygun yatırım seçeneklerini keşfedin.</p>
                {servicesGrid}
              </>
            ))}

            {page === 'Hakkımızda' && (
              <>
                <p className="lead">Yatırım dünyasına açılan dijital şubeniz.</p>
                <p>
                  Mukatabak Yatırım, sermaye piyasası işlemlerini herkes için anlaşılır kılmak üzere
                  kurulmuş bir dijital yatırım platformudur. Piyasa verisi, portföy takibi, emir iletimi
                  ve hesap işlemleri tek bir e-şubede, sade bir arayüzde buluşur.
                </p>
                <div className="value-grid">
                  {[
                    [Eye, 'Şeffaflık', 'Komisyon, valör ve bakiye bilgilerini işlemden önce açıkça gösteririz.'],
                    [ShieldCheck, 'Güven', 'Hesap güvenliğini ürünün merkezine koyar, her kritik işlemde doğrulama isteriz.'],
                    [BarChart3, 'Sadelik', 'Karmaşık finansal ekranlar yerine, ihtiyacınız olan bilgiyi öne çıkarırız.'],
                    [Headphones, 'Destek', 'Yatırımcı destek ekibimiz hesap ve işlem sorularınızda yanınızdadır.'],
                  ].map(([Ikon, title, text]) => (
                    <article key={title}><Ikon size={20} /><h3>{title}</h3><p>{text}</p></article>
                  ))}
                </div>
                <h2>Yatırımcı odaklı yaklaşım</h2>
                <p>
                  Varlık dağılımınızı, maliyetlerinizi ve kâr/zararınızı aynı ekranda görebilmeniz için
                  portföy ekranını sadeleştirdik. Emir verirken adet yerine tutar girebilmeniz, bakiyenizin
                  ne kadarını kullandığınızı yüzde kısayollarıyla görebilmeniz bu yaklaşımın sonucudur.
                </p>
                <h2>Teknoloji</h2>
                <p>
                  Piyasa verisi gün boyu güncellenir, fiyat geçmişi ve portföy performansı geriye dönük
                  hesaplanır. E-şube tarayıcıda çalışır, telefona uygulama gibi kurulabilir ve
                  bildirim gönderebilir.
                </p>
                <div className="corporate-notice">
                  Mukatabak Yatırım bir tanıtım ve demo platformudur. Ekranlardaki bakiye ve işlemler
                  simülasyondur; gerçek para transferi yapılmaz.
                </div>
              </>
            )}

            {page === 'Komisyon & Ücretler' && (
              <>
                <p className="lead">İşlem öncesinde maliyetlerinizi öğrenin.</p>
                <div className="fee-table">
                  <table>
                    <thead><tr><th>İşlem</th><th>Oran</th><th>Açıklama</th></tr></thead>
                    <tbody>
                      {fees.map(([title, rate, note]) => (
                        <tr key={title}><td>{title}</td><td><strong>{rate}</strong></td><td>{note}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <h2>Maliyet nasıl hesaplanır?</h2>
                <p>
                  Bir alış işleminde toplam maliyetiniz, işlem tutarına komisyonun eklenmesiyle bulunur.
                  Satışta ise komisyon işlem tutarından düşülür. Örneğin 10.000 ₺’lik bir alışta %0,10
                  komisyon 10 ₺’dir ve hesabınızdan 10.010 ₺ çıkar.
                </p>
                <h2>Yasal kesintiler</h2>
                <p>
                  Borsa payı, BSMV ve mevzuattan kaynaklanan diğer kesintiler ilgili işlemlere ayrıca
                  yansıtılır. Bu kalemler komisyon oranından bağımsızdır ve kurum tarafından belirlenmez.
                </p>
                <div className="page-actions">
                  <button className="corporate-primary" onClick={openAuth}>Hesabımı aç <ArrowRight size={17} /></button>
                </div>
              </>
            )}

            {page === 'Blog' && (
              <>
                <p className="lead">Piyasa okuryazarlığı ve hesabınızı daha iyi yönetmek için rehber yazılar.</p>
                <div className="corporate-posts wide">
                  {posts.map(([tag, title, text]) => (
                    <article key={title}>
                      <span className="tag">{tag}</span>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </article>
                  ))}
                </div>
                <div className="page-actions">
                  <button className="corporate-primary" onClick={openAuth}>Güncel piyasa haberleri için e-şube <ArrowRight size={17} /></button>
                </div>
              </>
            )}

            {page === 'SSS' && (
              <>
                <p className="lead">Merak edilenleri başlıklar altında topladık.</p>
                {faqGroups.map(([group, items]) => (
                  <div key={group} className="faq-group">
                    <h2>{group}</h2>
                    <div className="corporate-faq">
                      {items.map(([question, answer]) => (
                        <details key={question}>
                          <summary>{question}</summary>
                          <p>{answer}</p>
                        </details>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}

            {page === 'Sözleşmeler' && (
              <>
                <p className="lead">Sözleşmeler, aydınlatma metinleri ve risk bildirimleri</p>
                <p>
                  Hesabınıza ait güncel sözleşmelere e-şubede <strong>Hesap → Güvenlik Politikası ve
                  Sözleşmeler</strong> alanından ulaşabilirsiniz. İşlem yapmadan önce metinleri ve
                  kabul durumlarınızı kontrol edin.
                </p>
                <div className="doc-list">
                  {[
                    ['Yatırım Hizmetleri Çerçeve Sözleşmesi', 'Aracılık hizmetinin genel koşulları'],
                    ['Genel Risk Bildirim Formu', 'Sermaye piyasası işlemlerinin riskleri'],
                    ['KVKK Aydınlatma Metni', 'Kişisel verilerin işlenmesi'],
                    ['Gizlilik Politikası', 'Hesap ve veri güvenliği ilkeleri'],
                    ['Elektronik İşlem ve Mobil Uygulama Esasları', 'Uygulamanın kullanım kuralları'],
                    ['Ücret ve Komisyon Bilgilendirmesi', 'Uygulanan tarifeler'],
                  ].map(([title, note]) => (
                    <article key={title}>
                      <FileText size={19} />
                      <span><strong>{title}</strong><em>{note}</em></span>
                      <ArrowRight size={16} />
                    </article>
                  ))}
                </div>
                <div className="page-actions">
                  <button className="corporate-primary" onClick={openAuth}>Sözleşmelerime git <ArrowRight size={17} /></button>
                </div>
              </>
            )}

            {page === 'İletişim' && (
              <>
                <p className="lead">Yatırımcı destek ve hesap işlemleri</p>
                <div className="contact-grid">
                  {[
                    [Phone, 'Yatırımcı Destek Hattı', '0850 888 70 00', 'Hafta içi 09:00 – 18:00'],
                    [Mail, 'E-posta', 'destek@mukatabak.app', 'Aynı iş günü içinde yanıt'],
                    [MapPin, 'Merkez', 'Levent, İstanbul', 'Randevu ile ziyaret'],
                    [Headphones, 'E-şube içi destek', 'Hesap → Destek', 'Hesabınıza özel talepler'],
                  ].map(([Ikon, title, value, note]) => (
                    <article key={title}>
                      <span className="cicon"><Ikon size={19} /></span>
                      <h3>{title}</h3>
                      <strong>{value}</strong>
                      <em>{note}</em>
                    </article>
                  ))}
                </div>
                <h2>Hesabınıza özel talepler</h2>
                <p>
                  Başvuru durumu, banka hesapları, para transferi ve emir durumlarını e-şubeye giriş
                  yaparak takip edebilirsiniz. Güvenliğiniz için hesap bilgilerinizi e-posta ya da
                  telefonla paylaşmayın; kurum çalışanları şifrenizi talep etmez.
                </p>
                <div className="page-actions">
                  <button className="corporate-primary" onClick={openAuth}>E-Şube’ye giriş <ArrowRight size={17} /></button>
                </div>
              </>
            )}
          </section>
        )}
      </main>

      <footer className="corporate-footer">
        <div>
          <a className="brand" href="/" onClick={(event) => { event.preventDefault(); go('Ana Sayfa'); }}>
            Mukatabak<i>+</i>
          </a>
          <p>
            Piyasalar, portföyünüz ve hesap işlemleriniz tek e-şubede.<br />
            Sade, hızlı ve güvenli dijital yatırım deneyimi.
          </p>
          <div className="foot-social">
            {['SPK', 'BIST', 'Takasbank', 'MKK'].map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
        <div>
          <h3>Kurumsal</h3>
          {['Hakkımızda', 'Hizmetlerimiz', 'Komisyon & Ücretler', 'Blog'].map((title) => (
            <React.Fragment key={title}>{link(title)}</React.Fragment>
          ))}
        </div>
        <div>
          <h3>Hizmetler</h3>
          {services.map(([, title], index) => (
            <button key={title} onClick={() => go('Hizmetlerimiz', index)}>{title}</button>
          ))}
        </div>
        <div>
          <h3>Yatırımcı</h3>
          <button onClick={openAuth}>E-Şube Giriş</button>
          {link('SSS')}
          {link('Sözleşmeler')}
          {link('İletişim')}
        </div>
        <small>
          <span className="risk">
            <strong>Yasal uyarı:</strong> Burada yer alan bilgiler yatırım danışmanlığı kapsamında değildir.
            Yatırım danışmanlığı hizmeti; yetkili kuruluşlar ile yatırımcı arasında imzalanacak sözleşme
            çerçevesinde, kişilerin risk ve getiri tercihleri dikkate alınarak sunulur. Burada yer alan
            yorum ve tavsiyeler genel niteliktedir; mali durumunuz ile risk ve getiri tercihlerinize uygun
            olmayabilir. Sermaye piyasası araçlarının değeri artabilir veya azalabilir; yatırılan anapara
            kısmen ya da tamamen kaybedilebilir. Geçmiş dönem performansı gelecekteki getirinin göstergesi değildir.
          </span>
          <span className="copy">© {new Date().getFullYear()} Mukatabak Yatırım. Tüm hakları saklıdır. · Bu platform bir demo/tanıtım projesidir.</span>
        </small>
      </footer>
    </div>
  );
}
