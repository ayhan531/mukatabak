# Mukatabak — Demo Dijital Yatırım Platformu

Mukatabak mobil uygulamasıyla aynı marka kimliğine sahip, **web + admin panelli** bir demo/portföy
projesidir. Hisse takibi, sanal bakiye ile alım-satım, kurumsal sayfalar (landing, hakkımızda, blog,
S.S.S.) ve admin panelini içerir.

> **Not:** Bu platform gerçek bir yatırım kuruluşu değildir. Tüm bakiyeler ve işlemler simülasyondur;
> gerçek para transferi veya kimlik doğrulamalı para çekme akışı içermez.

## Yapı

```
web/       React + Vite frontend (landing, kurumsal sayfalar, uygulama ekranları, admin panel)
backend/   Python (yalnızca standart kütüphane) API sunucusu + SQLite
```

## Yerel geliştirme

```bash
cd web && npm install && npm run dev      # http://localhost:5173 (backend'e proxy: /api)
python backend/server.py                  # http://localhost:8000 (API + build edilmiş dist/)
```

Üretime benzer şekilde çalıştırmak için:

```bash
cd web && npm run build
python backend/server.py
```

## Ortam değişkenleri

- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — ilk açılışta admin kullanıcı bu bilgilerle oluşturulur.
- `SESSION_SECRET` — oturum çerezlerini imzalamak için kullanılır.
- `STARTING_CASH` — yeni kayıt olan kullanıcıların başlangıç sanal bakiyesi (varsayılan 100000).
- `DATA_DIR` — SQLite veritabanının tutulacağı klasör (varsayılan `./data`).

## Render

`render.yaml` Python web servisi olarak yapılandırıldı; `web/dist` önceden build edilip repoya dahil
edildiği için Render tarafında ekstra bir Node.js build adımına gerek yoktur.
