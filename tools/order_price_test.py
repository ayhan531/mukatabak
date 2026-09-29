# -*- coding: utf-8 -*-
"""Piyasa emri ekrandaki sapmali fiyattan gerceklesiyor mu, ve makul
tolerans disindaki fiyat manipulasyonu engelleniyor mu?"""
import sys, io, os, json, time, subprocess, urllib.request, urllib.error, http.cookiejar
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

KOK = "http://127.0.0.1:8794"
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


db = os.path.join(os.getcwd(), "test_emir.db")
for ek in ("", "-wal", "-shm"):
    try:
        os.remove(db + ek)
    except OSError:
        pass
ortam = dict(os.environ, PORT="8794", DATABASE_PATH=db, ADMIN_TC=ADMIN_TC,
             ADMIN_PASSWORD=ADMIN_SIFRE, REQUIRE_LIVE_MARKET_FOR_TRADING="0")
sunucu = subprocess.Popen([sys.executable, "backend_server.py"], env=ortam,
                          stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
time.sleep(9)
hata = 0


def bekle(ad, kosul, ek=""):
    global hata
    print(("TAMAM " if kosul else "SORUN ") + ad + ((" — " + str(ek)) if ek else ""))
    if not kosul:
        hata += 1


try:
    bekle("admin girisi", cagir(admin, "/api/login", {"tc": ADMIN_TC, "password": ADMIN_SIFRE})[0] == 200)
    bekle("step-up", cagir(admin, "/api/admin/step-up", {"password": ADMIN_SIFRE})[0] == 200)
    kod, veri = cagir(admin, "/api/admin/create-user", {
        "tc": MUSTERI_TC, "full_name": "Deniz Aksoy", "phone": "05321112233",
        "city": "Istanbul", "district": "Kadikoy", "password": MUSTERI_SIFRE,
        "status": "approved", "opening_balance": 0})
    uid = veri.get("id")
    bekle("musteri acildi", kod == 201, veri.get("error"))
    cagir(admin, "/api/admin/balances", {"user_id": uid, "amount": 500000, "action": "add",
                                         "note": "Test acilis bakiyesi"})
    bekle("musteri girisi", cagir(musteri, "/api/login", {"tc": MUSTERI_TC, "password": MUSTERI_SIFRE})[0] == 200)

    # gercek kotasyon
    kotalar = cagir(musteri, "/api/market")[1].get("quotes", [])
    hisse = next((q for q in kotalar if q["symbol"] == "THYAO"), None) or next(
        (q for q in kotalar if q.get("asset_class") == "stock"), None)
    if not hisse:
        raise SystemExit("piyasa verisi yok")
    sembol, gercek = hisse["symbol"], float(hisse["price"])
    print(f"kotasyon: {sembol} = {gercek}")

    # 1) Ekrandaki sapmali fiyat (tolerans icinde) baz alinmali
    ekran = round(gercek + 0.07, 2)
    kod, veri = cagir(musteri, "/api/orders", {"symbol": sembol, "side": "buy", "quantity": 10,
                                               "order_type": "market", "price": ekran})
    emir = veri.get("order") or veri
    bekle("sapmali fiyatla emir gecti", kod == 201, veri.get("error"))
    bekle("emir ekrandaki fiyattan gerceklesti",
          abs(float(emir.get("limit_price") or emir.get("price") or 0) - ekran) < 0.011,
          f"{emir.get('limit_price')} vs {ekran}")

    # 2) Tolerans disindaki fiyat gercek kotasyona cekilmeli (manipulasyon korumasi)
    sahte = round(gercek * 0.5, 2)
    kod, veri = cagir(musteri, "/api/orders", {"symbol": sembol, "side": "buy", "quantity": 5,
                                               "order_type": "market", "price": sahte})
    emir2 = veri.get("order") or veri
    uygulanan = float(emir2.get("limit_price") or emir2.get("price") or 0)
    bekle("asiri dusuk fiyat kabul edilmedi", kod == 201 and abs(uygulanan - sahte) > 0.01,
          f"uygulanan {uygulanan} · istenen {sahte}")
    bekle("gercek kotasyona cekildi", abs(uygulanan - gercek) <= max(1.5, gercek * 0.05) + 0.01,
          f"{uygulanan} vs {gercek}")

    # 3) Fiyatsiz piyasa emri gercek kotasyonu kullanir
    kod, veri = cagir(musteri, "/api/orders", {"symbol": sembol, "side": "buy", "quantity": 3,
                                               "order_type": "market"})
    emir3 = veri.get("order") or veri
    bekle("fiyatsiz emir gercek kotasyonu kullandi",
          abs(float(emir3.get("limit_price") or emir3.get("price") or 0) - gercek) < 0.011,
          emir3.get("limit_price"))

    # 4) Limit emir kullanicinin verdigi fiyati aynen korur
    limit = round(gercek * 0.8, 2)
    kod, veri = cagir(musteri, "/api/orders", {"symbol": sembol, "side": "buy", "quantity": 5,
                                               "order_type": "limit", "limit_price": limit})
    emir4 = veri.get("order") or veri
    bekle("limit emir fiyati korundu",
          abs(float(emir4.get("limit_price") or 0) - limit) < 0.011, emir4.get("limit_price"))
finally:
    sunucu.terminate()
    try:
        sunucu.wait(timeout=6)
    except Exception:
        sunucu.kill()

print("SONUC: " + ("TAMAM" if hata == 0 else f"SORUN {hata}"))
sys.exit(1 if hata else 0)
