# -*- coding: utf-8 -*-
"""Para akisi uctan uca: yatirma/cekme/kredi talebi -> admin onayi -> bakiye.
Ayrica limit emir onayi ve reddinin portfoye/bakiyeye etkisini dogrular."""
import sys, io, os, json, time, subprocess, urllib.request, urllib.error, http.cookiejar
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

KOK = "http://127.0.0.1:8796"
ADMIN_TC, ADMIN_SIFRE = "11111111110", "Admin12345"
MUSTERI_TC, MUSTERI_SIFRE = "62601815964", "Musteri12345"

admin_cj, musteri_cj = http.cookiejar.CookieJar(), http.cookiejar.CookieJar()
admin = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(admin_cj))
musteri = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(musteri_cj))


def cagir(acici, yol, veri=None, yontem=None):
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


db = os.path.join(os.getcwd(), "test_para.db")
for ek in ("", "-wal", "-shm"):
    try:
        os.remove(db + ek)
    except OSError:
        pass
ortam = dict(os.environ, PORT="8796", DATABASE_PATH=db, ADMIN_TC=ADMIN_TC,
             ADMIN_PASSWORD=ADMIN_SIFRE, REQUIRE_LIVE_MARKET_FOR_TRADING="0")
sunucu = subprocess.Popen([sys.executable, "backend_server.py"], env=ortam,
                          stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
time.sleep(8)
hata = 0


def bekle(ad, kosul, ek=""):
    global hata
    print(("TAMAM " if kosul else "SORUN ") + ad + ((" — " + str(ek)) if ek else ""))
    if not kosul:
        hata += 1


def nakit():
    return float(cagir(musteri, "/api/portfolio")[1].get("account", {}).get("cash_balance", 0))


try:
    bekle("admin girisi", cagir(admin, "/api/login", {"tc": ADMIN_TC, "password": ADMIN_SIFRE})[0] == 200)
    bekle("step-up", cagir(admin, "/api/admin/step-up", {"password": ADMIN_SIFRE})[0] == 200)

    kod, veri = cagir(admin, "/api/admin/bank-accounts", {
        "bank_name": "Ziraat Bankasi", "account_holder": "Mukatabak Yatirim A.S.",
        "iban": "TR330006100519786457841326", "is_active": "1"})
    bekle("kurum banka hesabi", kod == 200, veri.get("error"))

    kod, veri = cagir(admin, "/api/admin/create-user", {
        "tc": MUSTERI_TC, "full_name": "Deniz Aksoy", "phone": "05321112233",
        "city": "Istanbul", "district": "Kadikoy", "password": MUSTERI_SIFRE,
        "status": "approved", "opening_balance": 0})
    uid = veri.get("id")
    bekle("musteri acildi", kod == 201, veri.get("error"))

    bekle("bakiye yukleme", cagir(admin, "/api/admin/balances", {
        "user_id": uid, "amount": 100000, "action": "add", "note": "Test acilis bakiyesi"})[0] == 200)

    bekle("musteri girisi", cagir(musteri, "/api/login", {"tc": MUSTERI_TC, "password": MUSTERI_SIFRE})[0] == 200)
    baslangic = nakit()
    bekle("baslangic bakiyesi", abs(baslangic - 100000) < 0.01, baslangic)

    # --- 1) Para yatirma talebi -> onay -> bakiye artar
    kod, veri = cagir(musteri, "/api/money-requests", {
        "request_type": "deposit", "amount": 25000, "account_ref": "TR330006100519786457841326"})
    dep = veri.get("id") or veri.get("request", {}).get("id")
    bekle("yatirma talebi", kod == 201, veri.get("error"))
    if dep:
        kod, veri = cagir(admin, f"/api/admin/money/{dep}/approve", {"reason": "Dekont dogrulandi"})
        bekle("yatirma onayi", kod == 200, veri.get("error"))
        bekle("yatirma bakiyeye islendi", abs(nakit() - (baslangic + 25000)) < 0.01, nakit())

    # --- 2) Gerekcesiz onay reddedilmeli
    kod, veri = cagir(musteri, "/api/money-requests", {
        "request_type": "deposit", "amount": 1000, "account_ref": "TR330006100519786457841326"})
    dep2 = veri.get("id") or veri.get("request", {}).get("id")
    if dep2:
        kod, _ = cagir(admin, f"/api/admin/money/{dep2}/approve", {"reason": "kisa"})
        bekle("gerekcesiz onay reddedildi", kod == 422, kod)
        cagir(admin, f"/api/admin/money/{dep2}/reject", {"reason": "Test kaydi kapatildi"})

    # --- 3) Para cekme talebi -> onay -> bakiye azalir, IBAN kaydedilir
    once = nakit()
    kod, veri = cagir(musteri, "/api/money-requests", {
        "request_type": "withdraw", "amount": 12000, "account_holder": "Deniz Aksoy",
        "bank_name": "Ziraat Bankasi", "iban": "TR330006100519786457841326"})
    wid = veri.get("id") or veri.get("request", {}).get("id")
    bekle("cekme talebi", kod == 201, veri.get("error"))
    hesaplar = cagir(musteri, "/api/portfolio")[1].get("bank_accounts", [])
    bekle("IBAN musteriye kaydedildi", len(hesaplar) >= 1, len(hesaplar))
    if wid:
        kod, veri = cagir(admin, f"/api/admin/money/{wid}/approve", {"reason": "IBAN dogrulandi"})
        bekle("cekme onayi", kod == 200, veri.get("error"))
        bekle("cekme bakiyeden dustu", abs(nakit() - (once - 12000)) < 0.01, nakit())

    # --- 4) Cekilebilir bakiyeden fazlasi reddedilmeli
    kod, veri = cagir(musteri, "/api/money-requests", {
        "request_type": "withdraw", "amount": 9_000_000, "account_holder": "Deniz Aksoy",
        "bank_name": "Ziraat Bankasi", "iban": "TR330006100519786457841326"})
    bekle("asiri cekim reddedildi", kod >= 400, kod)

    # --- 5) Limit emir: onaylaninca portfoye girer
    kod, veri = cagir(musteri, "/api/orders", {"symbol": "THYAO", "side": "buy", "quantity": 10,
                                               "order_type": "limit", "limit_price": 100})
    oid = veri.get("id") or veri.get("order", {}).get("id")
    bekle("limit emir olustu", kod == 201, veri.get("error"))
    if oid:
        kod, veri = cagir(admin, f"/api/admin/orders/{oid}/approve", {"reason": "Fiyat uygun"})
        bekle("limit emir onaylandi", kod == 200, veri.get("error"))
        poz = cagir(musteri, "/api/portfolio")[1].get("positions", [])
        bekle("pozisyon olustu", any(p["symbol"] == "THYAO" for p in poz), [p["symbol"] for p in poz])

    # --- 6) Limit emir reddedilince blokaj cozulur
    oncesi = nakit()
    kod, veri = cagir(musteri, "/api/orders", {"symbol": "ASELS", "side": "buy", "quantity": 5,
                                               "order_type": "limit", "limit_price": 50})
    oid2 = veri.get("id") or veri.get("order", {}).get("id")
    if oid2:
        cagir(admin, f"/api/admin/orders/{oid2}/reject", {"reason": "Musteri talebiyle iptal"})
        p = cagir(musteri, "/api/portfolio")[1]
        bloke = float(p.get("account", {}).get("blocked_balance", 0))
        bekle("red sonrasi blokaj cozuldu", bloke < 0.01, bloke)

    # --- 7) Kredi talebi -> onay -> limit artar
    kod, veri = cagir(musteri, "/api/money-requests", {"request_type": "credit", "amount": 50000,
                                                       "note": "Limit talebi"})
    cid = veri.get("id") or veri.get("request", {}).get("id")
    bekle("kredi talebi", kod == 201, veri.get("error"))
    if cid:
        kod, veri = cagir(admin, f"/api/admin/money/{cid}/approve", {"reason": "Limit uygun bulundu"})
        bekle("kredi onayi", kod == 200, veri.get("error"))

    # --- 8) Denetim kaydi butun islemleri yazdi mi
    kayit = cagir(admin, "/api/admin/audit")[1].get("audit", [])
    bekle("denetim kaydi dolu", len(kayit) >= 6, len(kayit))
finally:
    sunucu.terminate()
    try:
        sunucu.wait(timeout=6)
    except Exception:
        sunucu.kill()

print("SONUC: " + ("TAMAM" if hata == 0 else f"SORUN {hata}"))
sys.exit(1 if hata else 0)
