# -*- coding: utf-8 -*-
"""Yonetim ve kullanici panellerini dolu gormek icin ornek veri uretir.
Yalnizca yerel gelistirme icindir; uretim veritabaninda calistirilmaz."""
import sys, io, os, json, urllib.request, urllib.error, http.cookiejar
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

KOK = os.environ.get("KOK", "http://127.0.0.1:8099")
ADMIN_TC = os.environ.get("ADMIN_TC", "11111111110")
ADMIN_SIFRE = os.environ.get("ADMIN_PASSWORD", "Admin12345")
MUSTERI_SIFRE = "Musteri12345"
cj = http.cookiejar.CookieJar()
acici = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))


def iste(yol, veri=None, yontem=None):
    govde = json.dumps(veri).encode("utf-8") if veri is not None else None
    r = urllib.request.Request(KOK + yol, data=govde, method=yontem or ("POST" if veri is not None else "GET"))
    if govde:
        r.add_header("Content-Type", "application/json")
    try:
        with acici.open(r, timeout=40) as y:
            return y.status, json.loads(y.read().decode("utf-8") or "{}")
    except urllib.error.HTTPError as e:
        g = e.read().decode("utf-8", "replace")
        try:
            return e.code, json.loads(g or "{}")
        except Exception:
            return e.code, {"raw": g[:200]}


def yaz(etiket, sonuc):
    kod, veri = sonuc
    print(f"{etiket:34s} {kod} {veri.get('error') or 'tamam'}")


print("giris:", iste("/api/login", {"tc": ADMIN_TC, "password": ADMIN_SIFRE})[0])
yaz("step-up", iste("/api/admin/step-up", {"password": ADMIN_SIFRE}))

# 1) sistem banka hesabi (para yatirma icin sart)
yaz("banka hesabi", iste("/api/admin/bank-accounts", {
    "bank_name": "Ziraat Bankasi", "account_holder": "Mukatabak Yatirim A.S.",
    "iban": "TR330006100519786457841326", "branch_name": "Kadikoy",
    "description": "Ana transfer hesabi", "is_active": "1", "sort_order": 1,
}))

# 2) musteriler
MUSTERILER = [
    ("62601815964", "Deniz Aksoy", "05321112233"),
    ("18301661332", "Elif Yilmaz", "05322223344"),
    ("28609139020", "Mert Kaya", "05323334455"),
]
idler = []
for tc, ad, tel in MUSTERILER:
    kod, veri = iste("/api/admin/create-user", {
        "tc": tc, "full_name": ad, "phone": tel, "email": ad.split()[0].lower() + "@ornek.com",
        "city": "Istanbul", "district": "Kadikoy", "password": MUSTERI_SIFRE,
        "status": "approved", "opening_balance": 0,
    })
    print(f"musteri {ad:14s} {kod} {veri.get('id') or veri.get('error')}")
    if veri.get("id"):
        idler.append((veri["id"], tc, ad))

# 3) bakiye yukle
for i, (uid, _tc, ad) in enumerate(idler):
    yaz(f"bakiye {ad}", iste("/api/admin/balances", {
        "user_id": uid, "amount": 250000 + i * 75000, "action": "add",
        "note": "Demo acilis bakiyesi yuklendi",
    }))
# kredi limiti
if idler:
    yaz("kredi limiti", iste("/api/admin/balances", {
        "user_id": idler[0][0], "amount": 100000, "action": "credit",
        "note": "Demo kredi limiti tanimlandi",
    }))

# 4) bekleyen bir musteri (Onay Bekleyenler paneli dolsun)
yaz("onay bekleyen musteri", iste("/api/admin/create-user", {
    "tc": "70308246202", "full_name": "Sema Demir", "phone": "05324445566",
    "email": "sema@ornek.com", "city": "Ankara", "district": "Cankaya",
    "password": MUSTERI_SIFRE, "status": "pending",
}))

# 5) musteri tarafinda emir ve para talepleri
if idler:
    uid, tc, ad = idler[0]
    cj.clear()
    print("musteri giris:", iste("/api/login", {"tc": tc, "password": MUSTERI_SIFRE})[0])
    for sembol, adet in [("THYAO", 40), ("ASELS", 25), ("TUPRS", 15), ("GARAN", 60)]:
        yaz(f"emir {sembol}", iste("/api/orders", {"symbol": sembol, "side": "buy",
                                                   "quantity": adet, "order_type": "market"}))
    yaz("limit emir", iste("/api/orders", {"symbol": "SASA", "side": "buy", "quantity": 100,
                                           "order_type": "limit", "limit_price": 3.2}))
    yaz("para cekme talebi", iste("/api/money-requests", {
        "request_type": "withdraw", "amount": 12000, "account_holder": ad,
        "bank_name": "Ziraat Bankasi", "iban": "TR330006100519786457841326",
    }))
    yaz("para yatirma talebi", iste("/api/money-requests", {
        "request_type": "deposit", "amount": 50000,
        "account_ref": "TR330006100519786457841326",
    }))
    yaz("kredi talebi", iste("/api/money-requests", {
        "request_type": "credit", "amount": 100000, "note": "Limit yukseltme talebi",
    }))
print("BITTI")
