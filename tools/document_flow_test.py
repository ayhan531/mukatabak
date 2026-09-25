# -*- coding: utf-8 -*-
"""Kimlik belgesi akisi: musteri yukler -> admin gorur (gorsel acilir) -> onaylar."""
import sys, io, os, json, time, uuid, subprocess, urllib.request, urllib.error, http.cookiejar, struct, zlib
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

KOK = "http://127.0.0.1:8795"
ADMIN_TC, ADMIN_SIFRE = "11111111110", "Admin12345"
MUSTERI_TC, MUSTERI_SIFRE = "62601815964", "Musteri12345"
admin_cj, musteri_cj = http.cookiejar.CookieJar(), http.cookiejar.CookieJar()
admin = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(admin_cj))
musteri = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(musteri_cj))


def cagir(acici, yol, veri=None, yontem=None, ham=False):
    govde = json.dumps(veri).encode("utf-8") if veri is not None else None
    r = urllib.request.Request(KOK + yol, data=govde, method=yontem or ("POST" if veri is not None else "GET"))
    if govde:
        r.add_header("Content-Type", "application/json")
    try:
        with acici.open(r, timeout=40) as y:
            icerik = y.read()
            if ham:
                return y.status, icerik, y.headers.get("Content-Type", "")
            return y.status, json.loads(icerik.decode("utf-8") or "{}")
    except urllib.error.HTTPError as e:
        g = e.read()
        if ham:
            return e.code, g, ""
        try:
            return e.code, json.loads(g.decode("utf-8") or "{}")
        except Exception:
            return e.code, {"raw": g.decode("utf-8", "replace")[:200]}


def kucuk_png():
    """Kutuphanesiz gecerli 2x2 PNG uretir."""
    ham = b"".join(b"\x00" + bytes([200, 40, 40, 40, 200, 40]) for _ in range(2))
    def parca(tip, veri):
        return struct.pack(">I", len(veri)) + tip + veri + struct.pack(">I", zlib.crc32(tip + veri) & 0xFFFFFFFF)
    return (b"\x89PNG\r\n\x1a\n"
            + parca(b"IHDR", struct.pack(">IIBBBBB", 2, 2, 8, 2, 0, 0, 0))
            + parca(b"IDAT", zlib.compress(ham))
            + parca(b"IEND", b""))


def cok_parcali(acici, yol, dosyalar):
    sinir = "----mk" + uuid.uuid4().hex
    govde = b""
    for ad, (dosya_adi, icerik, tur) in dosyalar.items():
        govde += (f"--{sinir}\r\nContent-Disposition: form-data; name=\"{ad}\"; filename=\"{dosya_adi}\"\r\n"
                  f"Content-Type: {tur}\r\n\r\n").encode()
        govde += icerik + b"\r\n"
    govde += f"--{sinir}--\r\n".encode()
    r = urllib.request.Request(KOK + yol, data=govde, method="POST")
    r.add_header("Content-Type", f"multipart/form-data; boundary={sinir}")
    try:
        with acici.open(r, timeout=60) as y:
            return y.status, json.loads(y.read().decode("utf-8") or "{}")
    except urllib.error.HTTPError as e:
        g = e.read().decode("utf-8", "replace")
        try:
            return e.code, json.loads(g or "{}")
        except Exception:
            return e.code, {"raw": g[:200]}


db = os.path.join(os.getcwd(), "test_belge.db")
for ek in ("", "-wal", "-shm"):
    try:
        os.remove(db + ek)
    except OSError:
        pass
ortam = dict(os.environ, PORT="8795", DATABASE_PATH=db, ADMIN_TC=ADMIN_TC,
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


try:
    bekle("admin girisi", cagir(admin, "/api/login", {"tc": ADMIN_TC, "password": ADMIN_SIFRE})[0] == 200)
    bekle("step-up", cagir(admin, "/api/admin/step-up", {"password": ADMIN_SIFRE})[0] == 200)
    kod, veri = cagir(admin, "/api/admin/create-user", {
        "tc": MUSTERI_TC, "full_name": "Deniz Aksoy", "phone": "05321112233",
        "city": "Istanbul", "district": "Kadikoy", "password": MUSTERI_SIFRE, "status": "pending"})
    bekle("musteri acildi", kod == 201, veri.get("error"))

    bekle("musteri girisi", cagir(musteri, "/api/login", {"tc": MUSTERI_TC, "password": MUSTERI_SIFRE})[0] == 200)

    png = kucuk_png()
    # eksik dosya reddedilmeli
    kod, _ = cok_parcali(musteri, "/api/profile/documents", {"identity_front": ("on.png", png, "image/png")})
    bekle("eksik belge reddedildi", kod >= 400, kod)

    kod, veri = cok_parcali(musteri, "/api/profile/documents", {
        "identity_front": ("on.png", png, "image/png"),
        "identity_back": ("arka.png", png, "image/png"),
        "selfie": ("yuz.png", png, "image/png")})
    bekle("uc belge yuklendi", kod == 201, veri.get("error"))
    belgeler = veri.get("documents", [])
    bekle("belge kayitlari dondu", len(belgeler) == 3, len(belgeler))
    bekle("her belgenin adresi var", all(b.get("url", "").startswith("/uploads/") for b in belgeler))

    # musteri kendi portfoyunde de goruyor
    pbelge = cagir(musteri, "/api/portfolio")[1].get("documents", [])
    bekle("portfoyde belgeler gorunuyor", len(pbelge) == 3, len(pbelge))

    # admin listesi
    kod, veri = cagir(admin, "/api/admin/documents")
    liste = veri.get("documents", [])
    bekle("admin listesinde belgeler var", kod == 200 and len(liste) == 3, len(liste))
    bekle("tur etiketleri turkce", all(b.get("type_label") in
          ("Kimlik Ön Yüz", "Kimlik Arka Yüz", "Yüz Doğrulama") for b in liste),
          [b.get("type_label") for b in liste])
    bekle("musteri adi ve hesap no var", all(b.get("full_name") and b.get("account_no") for b in liste))

    # ADMIN GORSELI ACABILIYOR MU — asil mesele
    ilk = liste[0]
    kod, icerik, tur = cagir(admin, ilk["url"], ham=True)
    bekle("admin fotografi acabiliyor", kod == 200 and icerik[:8] == b"\x89PNG\r\n\x1a\n",
          f"{kod} · {tur} · {len(icerik)} bayt")

    # baska musteri baskasinin belgesini goremez
    kod2, veri2 = cagir(admin, "/api/admin/create-user", {
        "tc": "18301661332", "full_name": "Elif Yilmaz", "phone": "05322223344",
        "city": "Istanbul", "district": "Kadikoy", "password": MUSTERI_SIFRE, "status": "approved"})
    if kod2 == 201:
        yabanci = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
        cagir(yabanci, "/api/login", {"tc": "18301661332", "password": MUSTERI_SIFRE})
        kod3, _, _ = cagir(yabanci, ilk["url"], ham=True)
        bekle("baskasinin belgesi korunuyor", kod3 == 403, kod3)

    # onay / ret
    kod, veri = cagir(admin, f"/api/admin/documents/{ilk['id']}/reject", {"note": "kisa"})
    bekle("gerekcesiz ret reddedildi", kod == 422, kod)
    kod, veri = cagir(admin, f"/api/admin/documents/{ilk['id']}/reject", {"note": "Fotograf bulanik, tekrar cek"})
    bekle("ret calisiyor", kod == 200, veri.get("error"))
    for b in liste:
        cagir(admin, f"/api/admin/documents/{b['id']}/approve", {"note": "Gorsel dogrulandi"})
    son = cagir(admin, "/api/admin/documents")[1].get("documents", [])
    bekle("hepsi onaylandi", all(b["status"] == "approved" for b in son), [b["status"] for b in son])

    # belgeler onaylaninca kullanici onaylanabiliyor
    uid = liste[0]["user_id"]
    kod, veri = cagir(admin, f"/api/admin/users/{uid}/approve", {"reason": "Kimlik dogrulandi"})
    bekle("belgeler onaylaninca kullanici onaylandi", kod == 200, veri.get("error"))
finally:
    sunucu.terminate()
    try:
        sunucu.wait(timeout=6)
    except Exception:
        sunucu.kill()

print("SONUC: " + ("TAMAM" if hata == 0 else f"SORUN {hata}"))
sys.exit(1 if hata else 0)
