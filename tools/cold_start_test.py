# -*- coding: utf-8 -*-
"""Soğuk başlangıç: hiç hisse satırı yokken ilk /api/market çağrısı kaynağı hemen okumalı
(endeks/kur satırları taze olsa bile) ve açılış ısıtması hisseleri kendiliğinden getirmeli."""
import sys, io, os, json, time, subprocess, threading, urllib.request, tempfile
from http.server import BaseHTTPRequestHandler, HTTPServer
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

PAYLOAD = {"data": [{"symbol": "AKBNK", "name": "Akbank", "price": 70.5, "change": 1.2, "volume": 1000, "type": "stock"},
                    {"symbol": "THYAO", "name": "Turk Hava Yollari", "price": 300.1, "change": -0.4, "volume": 2000, "type": "stock"}]}

class H(BaseHTTPRequestHandler):
    def do_GET(self):
        b = json.dumps(PAYLOAD).encode()
        self.send_response(200); self.send_header("Content-Type", "application/json"); self.send_header("Content-Length", str(len(b))); self.end_headers(); self.wfile.write(b)
    def log_message(self, *a): pass

kaynak = HTTPServer(("127.0.0.1", 8795), H)
threading.Thread(target=kaynak.serve_forever, daemon=True).start()

hata = 0
def bekle(ad, kosul, ek=""):
    global hata
    print(("TAMAM " if kosul else "SORUN ") + ad + ((" — " + str(ek)) if ek else ""))
    if not kosul: hata += 1

def hisse_sayisi():
    with urllib.request.urlopen("http://127.0.0.1:8796/api/market", timeout=40) as y:
        d = json.loads(y.read().decode())
    return len([q for q in d["quotes"] if q["asset_class"] == "stock"]), d

db = os.path.join(tempfile.mkdtemp(), "soguk.db")
ortam = dict(os.environ, PORT="8796", DATABASE_PATH=db, MARKET_URL="http://127.0.0.1:8795/latest",
             ADMIN_TC="11111111110", ADMIN_PASSWORD="Admin12345", REQUIRE_LIVE_MARKET_FOR_TRADING="0")
ortam.pop("MUKATABAK_TEST_QUOTES", None)
# Canlıdaki durumu kur: endeks satırı taze (kaynaktan az önce okunmuş), hisse satırı yok.
os.environ["DATABASE_PATH"] = db
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import backend_server as b
b.init_db()
_c = b.connect_db()
_c.execute("DELETE FROM market_cache")
_c.execute("INSERT INTO market_cache (symbol, name, price, change_pct, volume, asset_class, updated_at) VALUES ('XU100','BIST 100',12000,0.5,0,'index',?)", (b.now(),))
_c.commit(); _c.close()
sunucu = subprocess.Popen([sys.executable, "backend_server.py"], env=ortam, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
try:
    for _ in range(40):
        try:
            urllib.request.urlopen("http://127.0.0.1:8796/api/health", timeout=3); break
        except Exception:
            time.sleep(0.5)
    time.sleep(2)  # açılış ısıtması
    n, d = hisse_sayisi()
    bekle("ilk istekte hisseler hazır (soğuk başlangıç)", n >= 2, f"hisse={n} kaynak_ok={d['meta'].get('ok')}")
finally:
    sunucu.terminate()
print("SONUC: " + ("TAMAM" if hata == 0 else f"SORUN {hata}"))
sys.exit(1 if hata else 0)
