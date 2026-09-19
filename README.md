# Mukatabak — Web + E-Şube

Mukatabak 2.5.1 mobil uygulamasının **birebir web karşılığı** olan e-şube, kurumsal tanıtım sitesi ve
admin paneli. Mimari, backend ve çalışma mantığı Ottoman projesiyle aynıdır; e-şube arayüzü ise
depodaki `Mukatabak-2.5.1.apk` dosyasının ekranlarından bire bir çıkarılmıştır.

> **Not:** Bu platform gerçek bir yatırım kuruluşu değildir. Bakiyeler ve emirler simülasyondur.

## Yapı

```
index.html            Vite giriş noktası
src/                  React arayüz
  CorporateLanding.jsx  kurumsal tanıtım sitesi (8 sayfa)
  AdminConsole.jsx      admin paneli
  legacy.jsx            giriş / kayıt ekranı
  esube/                e-şube (APK ile birebir)
    App.jsx               kabuk, gezinme, katmanlar
    Home.jsx              Ana Sayfa (piyasa şeridi, takip listesi, haberler)
    Stocks.jsx            Hisseler (arama, en çok yükselen/düşen)
    Portfolio.jsx         Portföyüm (varlıklar, geçmiş, emirler, performans)
    Account.jsx           Hesap (bakiye, para işlemleri, menü)
    Trade.jsx             Al/Sat alt paneli
    Subpages.jsx          Ayarlar, Güvenlik, Sözleşmeler
    theme.css / skin.css  APK'nın görsel dili
public/               PWA ikonları, manifest, servis worker
tools/backend_server.py  Python (yalnızca standart kütüphane) API + SQLite
dist/                 Üretim derlemesi (Render bunu servis eder)
```

## Yerel geliştirme

```bash
npm install
npm run dev                  # http://localhost:5173 (API /api -> 127.0.0.1:8008)
python tools/backend_server.py   # http://localhost:8008
```

Üretim gibi çalıştırmak için:

```bash
npm run build
python tools/backend_server.py
```

## Ortam değişkenleri

- `ADMIN_TC`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` — ilk açılışta admin kullanıcı bu bilgilerle oluşturulur.
- `SESSION_SECRET` — oturum çerezlerini imzalar.
- `STARTING_CASH` — yeni kullanıcıların başlangıç bakiyesi (varsayılan 100000).
- `DATA_DIR` — SQLite veritabanı klasörü (varsayılan `./data`).
- `PORT` — sunucu portu (varsayılan 8008; Render otomatik verir).

## Render

`render.yaml` Python web servisi olarak yapılandırılmıştır. `dist/` önceden derlenip depoya dahil
edildiği için Render tarafında ayrı bir Node.js derleme adımına gerek yoktur.
Sağlık kontrolü: `/api/health`.
