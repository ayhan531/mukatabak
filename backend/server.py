"""Mukatabak demo backend.

Sadece Python standart kütüphanesi kullanılır (harici bağımlılık yok).
Kimlik dogrulama + sanal/demo hisse alim-satim + admin paneli + blog/SSS CMS saglar.
Gercek para transferi, IBAN toplama veya kimlik dogrulamali para cekme YOKTUR.
"""

from datetime import date, datetime, timedelta, time as dtime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse, parse_qs
import base64
import hashlib
import hmac
import http.cookies
import json
import math
import mimetypes
import os
import re
import secrets
import sqlite3
import time
import urllib.request
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = Path(os.environ.get("DATA_DIR", ROOT / "data"))
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DATA_DIR / "mukatabak.db"
DIST_DIR = ROOT / "web" / "dist"

SECRET = os.environ.get("SESSION_SECRET") or secrets.token_hex(32)
STARTING_CASH = float(os.environ.get("STARTING_CASH", "100000"))
SESSION_MAX_AGE = 60 * 60 * 24 * 30  # 30 gun
COMMISSION_BPS = float(os.environ.get("COMMISSION_BPS", "15"))  # %0,15
MIN_COMMISSION = float(os.environ.get("MIN_COMMISSION", "1"))
MARKET_API_URL = "https://trrealapi-market.onrender.com/latest"

STOCKS = [
    {"symbol": "THYAO", "name": "Türk Hava Yolları", "base": 295.00, "seed": 1.1},
    {"symbol": "ASELS", "name": "Aselsan", "base": 59.35, "seed": 2.3},
    {"symbol": "TUPRS", "name": "Tüpraş", "base": 159.70, "seed": 3.7},
    {"symbol": "AKBNK", "name": "Akbank", "base": 62.15, "seed": 4.2},
    {"symbol": "SASA", "name": "Sasa Polyester", "base": 44.18, "seed": 5.9},
    {"symbol": "GARAN", "name": "Garanti BBVA", "base": 118.40, "seed": 0.4},
    {"symbol": "BIMAS", "name": "BİM Mağazalar", "base": 542.00, "seed": 6.6},
    {"symbol": "EREGL", "name": "Ereğli Demir Çelik", "base": 41.22, "seed": 2.9},
    {"symbol": "KCHOL", "name": "Koç Holding", "base": 187.30, "seed": 1.8},
    {"symbol": "SISE", "name": "Şişecam", "base": 44.90, "seed": 3.3},
]

FALLBACK_NEWS = [
    {"title": "BIST 100 endeksinde güne yükselişle başlandı", "summary": "Bankacılık ve sanayi hisselerindeki alımlar endeksi yukarı taşıdı.", "source": "Mukatabak", "link": "", "image": ""},
    {"title": "Merkez Bankası faiz kararı yaklaşıyor", "summary": "Piyasa katılımcıları bu hafta açıklanacak karara odaklandı.", "source": "Mukatabak", "link": "", "image": ""},
    {"title": "Teknoloji hisselerinde yatırımcı ilgisi sürüyor", "summary": "Küresel piyasalardaki olumlu hava yerel teknoloji hisselerine de yansıdı.", "source": "Mukatabak", "link": "", "image": ""},
    {"title": "Enerji sektöründe volatilite arttı", "summary": "Uluslararası petrol fiyatlarındaki dalgalanma enerji hisselerini etkiliyor.", "source": "Mukatabak", "link": "", "image": ""},
]

NEWS_FEEDS = [
    ("BloombergHT", "https://www.bloomberght.com/rss"),
    ("Dünya Gazetesi", "https://www.dunya.com/rss"),
]

_news_cache = {"ts": 0, "items": []}
NEWS_CACHE_TTL = 600  # 10 dakika


def _strip_html(text: str) -> str:
    return re.sub(r"<[^>]+>", "", text or "").strip()


def fetch_news():
    """Gercek RSS kaynaklarindan haber ceker, basarisiz olursa onbellegi/varsayilani kullanir."""
    if _news_cache["items"] and time.time() - _news_cache["ts"] < NEWS_CACHE_TTL:
        return _news_cache["items"]

    collected = []
    for source_name, url in NEWS_FEEDS:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (MukatabakBot)"})
            with urllib.request.urlopen(req, timeout=6) as resp:
                raw = resp.read(2_000_000)
            # DOCTYPE/ENTITY bildirimi olan besleme XXE/entity-expansion riski tasir; atla.
            if b"<!ENTITY" in raw[:2000] or b"<!DOCTYPE" in raw[:2000]:
                continue
            root = ET.fromstring(raw)
            items = root.findall(".//item")
            for it in items[:8]:
                title = _strip_html(it.findtext("title") or "")
                desc = _strip_html(it.findtext("description") or "")
                link = (it.findtext("link") or "").strip()
                pub = (it.findtext("pubDate") or "").strip()
                if not title:
                    continue
                collected.append({
                    "title": title,
                    "summary": (desc[:220] + "…") if len(desc) > 220 else desc,
                    "source": source_name,
                    "link": link,
                    "pubDate": pub,
                })
        except Exception:
            continue
        if len(collected) >= 8:
            break

    if collected:
        _news_cache["items"] = collected
        _news_cache["ts"] = time.time()
        return collected

    return FALLBACK_NEWS

DEFAULT_FAQ = [
    ("Mukatabak gerçek bir yatırım/aracılık hizmeti mi?", "Hayır. Mukatabak; hisse takibi ve alım-satımı sanal bir bakiye üzerinden simüle eden bir demo/eğitim platformudur. Gerçek para transferi, mevduat toplama veya yatırım danışmanlığı sunmaz."),
    ("Kayıt olurken gerçek kimlik bilgisi vermem gerekiyor mu?", "Hayır, sadece ad, e-posta ve şifre yeterlidir. Gerçek kimlik belgesi talep edilmez."),
    ("Sanal bakiyem ne kadar ile başlıyor?", "Her yeni hesap, alım-satım pratiği yapman için varsayılan olarak ₺100.000 sanal bakiye ile başlar."),
    ("Fiyatlar gerçek piyasa fiyatları mı?", "Gösterilen fiyatlar gerçek BIST verilerine yakın görünüm için simüle edilmiştir, yatırım kararı için kullanılmamalıdır."),
    ("Hesabımı nasıl silebilirim?", "destek@mukatabak.app adresinden bizimle iletişime geçerek hesabının silinmesini talep edebilirsin."),
    ("Admin paneline kim erişebilir?", "Sadece 'admin' rolüne sahip kullanıcılar platform yönetim paneline erişebilir."),
]

DEFAULT_POSTS = [
    {
        "slug": "yatirima-baslarken-bilmeniz-gerekenler",
        "title": "Yatırıma Başlarken Bilmeniz Gereken 5 Temel Kavram",
        "excerpt": "Hisse senedi, temettü, piyasa değeri gibi temel kavramları basitçe açıklıyoruz.",
        "content": "Yatırıma başlamadan önce hisse senedi, temettü, piyasa değeri, likidite ve risk yönetimi gibi temel kavramları anlamak önemlidir.\n\nHisse senedi, bir şirketteki ortaklık payını temsil eder. Temettü, şirketin karından hissedarlara dağıttığı paydır. Piyasa değeri ise şirketin toplam hisselerinin güncel piyasa fiyatı üzerinden değeridir.\n\nMukatabak üzerinde sanal bakiyenle bu kavramları risk almadan deneyimleyebilirsin.",
        "date": "2026-01-12",
        "cover": "linear-gradient(135deg,#3B6CFF,#7FA0FF)",
    },
    {
        "slug": "portfoy-cesitlendirme-neden-onemli",
        "title": "Portföy Çeşitlendirmesi Neden Önemlidir?",
        "excerpt": "Tüm yumurtaları aynı sepete koymamanın yatırımdaki karşılığı.",
        "content": "Portföy çeşitlendirmesi, yatırımlarını farklı sektör ve varlıklara dağıtarak riski azaltma stratejisidir.\n\nTek bir hisseye yoğunlaşmak yerine farklı sektörlerden hisseler bulundurmak, herhangi bir şirkete veya sektöre özgü olumsuz gelişmelerin portföyün tamamını etkilemesini engeller.\n\nMukatabak'ın sanal portföy ekranında farklı sektörlerden hisselerle bu stratejiyi risksiz deneyebilirsin.",
        "date": "2026-02-03",
        "cover": "linear-gradient(135deg,#22C55E,#4ADE80)",
    },
    {
        "slug": "piyasa-haberlerini-takip-etmenin-onemi",
        "title": "Piyasa Haberlerini Takip Etmenin Önemi",
        "excerpt": "Güncel gelişmelerin hisse fiyatlarına etkisini anlamak.",
        "content": "Merkez bankası kararları, şirket bilançoları ve küresel gelişmeler hisse senedi fiyatlarını doğrudan etkiler.\n\nDüzenli olarak piyasa haberlerini takip etmek, yatırım kararlarını daha bilinçli vermene yardımcı olur.\n\nMukatabak ana sayfasında güncel piyasa özetini ve haber akışını takip edebilirsin.",
        "date": "2026-02-21",
        "cover": "linear-gradient(135deg,#F59E0B,#FBBF24)",
    },
]


# ── Veritabani ────────────────────────────────────────────────────────────

def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    conn = db()
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            active INTEGER NOT NULL DEFAULT 1,
            cash REAL NOT NULL DEFAULT 0,
            notify_price_alerts INTEGER NOT NULL DEFAULT 1,
            notify_news INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS positions (
            user_id INTEGER NOT NULL,
            symbol TEXT NOT NULL,
            qty REAL NOT NULL,
            PRIMARY KEY (user_id, symbol),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            symbol TEXT NOT NULL,
            side TEXT NOT NULL,
            qty REAL NOT NULL,
            price REAL NOT NULL,
            total REAL NOT NULL,
            commission REAL NOT NULL DEFAULT 0,
            order_type TEXT NOT NULL DEFAULT 'market',
            status TEXT NOT NULL DEFAULT 'filled',
            settle_date TEXT NOT NULL DEFAULT '',
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS watchlist (
            user_id INTEGER NOT NULL,
            symbol TEXT NOT NULL,
            created_at TEXT NOT NULL,
            PRIMARY KEY (user_id, symbol),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS wallet_transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            amount REAL NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS blog_posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            excerpt TEXT,
            content TEXT,
            date TEXT,
            cover TEXT,
            created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS faq (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            q TEXT NOT NULL,
            a TEXT NOT NULL,
            created_at TEXT NOT NULL
        );
        """
    )
    conn.commit()

    for stmt in (
        "ALTER TABLE users ADD COLUMN notify_price_alerts INTEGER NOT NULL DEFAULT 1",
        "ALTER TABLE users ADD COLUMN notify_news INTEGER NOT NULL DEFAULT 1",
        "ALTER TABLE orders ADD COLUMN settle_date TEXT NOT NULL DEFAULT ''",
        "ALTER TABLE orders ADD COLUMN commission REAL NOT NULL DEFAULT 0",
        "ALTER TABLE orders ADD COLUMN order_type TEXT NOT NULL DEFAULT 'market'",
    ):
        try:
            conn.execute(stmt)
            conn.commit()
        except sqlite3.OperationalError:
            pass

    if conn.execute("SELECT COUNT(*) c FROM blog_posts").fetchone()["c"] == 0:
        for p in DEFAULT_POSTS:
            conn.execute(
                "INSERT INTO blog_posts (slug,title,excerpt,content,date,cover,created_at) VALUES (?,?,?,?,?,?,?)",
                (p["slug"], p["title"], p["excerpt"], p["content"], p["date"], p["cover"], now()),
            )
        conn.commit()

    if conn.execute("SELECT COUNT(*) c FROM faq").fetchone()["c"] == 0:
        for q, a in DEFAULT_FAQ:
            conn.execute("INSERT INTO faq (q,a,created_at) VALUES (?,?,?)", (q, a, now()))
        conn.commit()

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@mukatabak.app")
    admin_password = os.environ.get("ADMIN_PASSWORD")
    existing = conn.execute("SELECT id FROM users WHERE email = ?", (admin_email,)).fetchone()
    if not existing:
        if not admin_password:
            admin_password = secrets.token_urlsafe(9)
            try:
                (DATA_DIR / "bootstrap_admin.txt").write_text(
                    f"email: {admin_email}\npassword: {admin_password}\n", encoding="utf-8"
                )
            except OSError:
                pass
        salt, pw_hash = hash_password(admin_password)
        conn.execute(
            "INSERT INTO users (name,email,password_hash,salt,role,active,cash,created_at) VALUES (?,?,?,?,?,?,?,?)",
            ("Mukatabak Admin", admin_email, pw_hash, salt, "admin", 1, STARTING_CASH, now()),
        )
        conn.commit()
    conn.close()


def now():
    return time.strftime("%Y-%m-%d %H:%M:%S")


def today_str():
    return date.today().isoformat()


def add_business_days(d: date, n: int) -> date:
    """T+n valor tarihi: hafta sonlarini atlayarak n is gunu ekler."""
    added = 0
    cur = d
    while added < n:
        cur += timedelta(days=1)
        if cur.weekday() < 5:  # 0=Pazartesi ... 4=Cuma
            added += 1
    return cur


def settle_date_for(trade_date: date) -> str:
    return add_business_days(trade_date, 2).isoformat()


def unsettled_sell_total(conn, user_id: int) -> float:
    row = conn.execute(
        "SELECT COALESCE(SUM(total - commission),0) s FROM orders WHERE user_id=? AND side='sell' AND settle_date > ?",
        (user_id, today_str()),
    ).fetchone()
    return round(row["s"], 2)


def available_cash_for(conn, user_row) -> float:
    return round(user_row["cash"] - unsettled_sell_total(conn, user_row["id"]), 2)


# ── Sifreleme / Oturum ───────────────────────────────────────────────────

def hash_password(password: str, salt: str | None = None):
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 120_000)
    return salt, digest.hex()


def verify_password(password: str, salt: str, expected_hash: str) -> bool:
    _, computed = hash_password(password, salt)
    return hmac.compare_digest(computed, expected_hash)


def make_session_token(user_id: int) -> str:
    payload = json.dumps({"uid": user_id, "exp": int(time.time()) + SESSION_MAX_AGE}).encode()
    payload_b64 = base64.urlsafe_b64encode(payload).decode().rstrip("=")
    sig = hmac.new(SECRET.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{sig}"


def read_session_token(token: str):
    try:
        payload_b64, sig = token.split(".", 1)
        expected = hmac.new(SECRET.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected):
            return None
        padded = payload_b64 + "=" * (-len(payload_b64) % 4)
        payload = json.loads(base64.urlsafe_b64decode(padded))
        if payload.get("exp", 0) < time.time():
            return None
        return payload.get("uid")
    except Exception:
        return None


# ── Gercek piyasa verisi (trrealapi-market) + yedek simulasyon ──────────

_market_cache = {"ts": 0, "by_symbol": {}, "market_closed": None}
MARKET_CACHE_TTL = 45


def fetch_market_snapshot():
    """trrealapi-market.onrender.com'dan gercek BIST anlik verisini ceker ve onbeller.
    Kaynak ulasilamazsa onbellekteki (varsa eski) veriyi dondurur; hic veri yoksa bos doner."""
    if _market_cache["by_symbol"] and time.time() - _market_cache["ts"] < MARKET_CACHE_TTL:
        return _market_cache
    try:
        req = urllib.request.Request(MARKET_API_URL, headers={"User-Agent": "Mozilla/5.0 (MukatabakBot)"})
        with urllib.request.urlopen(req, timeout=6) as resp:
            raw = resp.read(8_000_000)
        data = json.loads(raw)
        items = (data.get("last") or {}).get("data") or []
        by_symbol = {}
        market_closed = None
        for it in items:
            sym = (it.get("s") or "").split(":")[-1]
            d = it.get("d") or []
            if not sym or len(d) < 7:
                continue
            price, change_pct, change_abs, high, low, opn = d[1], d[2], d[3], d[4], d[5], d[6]
            if price is None:
                continue
            by_symbol[sym] = {
                "price": price, "change_pct": change_pct or 0, "change_abs": change_abs or 0,
                "high": high, "low": low, "open": opn,
            }
            if market_closed is None and "isMarketClosed" in it:
                market_closed = it["isMarketClosed"]
        if by_symbol:
            _market_cache["by_symbol"] = by_symbol
            _market_cache["ts"] = time.time()
            _market_cache["market_closed"] = market_closed
    except Exception:
        pass
    return _market_cache


def is_market_open():
    snap = fetch_market_snapshot()
    if snap.get("market_closed") is not None:
        return not snap["market_closed"]
    now = datetime.utcnow() + timedelta(hours=3)  # Europe/Istanbul (UTC+3, DST yaklasik)
    if now.weekday() >= 5:
        return False
    return dtime(10, 0) <= now.time() <= dtime(18, 0)


def live_stock(stock, at_time=None):
    real = fetch_market_snapshot()["by_symbol"].get(stock["symbol"]) if at_time is None else None
    if real:
        return {
            "symbol": stock["symbol"], "name": stock["name"],
            "price": round(real["price"], 2), "change_pct": round(real["change_pct"], 2),
            "high": round(real["high"], 2) if real.get("high") is not None else None,
            "low": round(real["low"], 2) if real.get("low") is not None else None,
            "open": round(real["open"], 2) if real.get("open") is not None else None,
            "source": "live",
        }
    # Yedek: gercek veri kaynagina ulasilamadiginda dalgali simulasyon
    t = (at_time if at_time is not None else time.time()) / 60.0
    wave = math.sin(t * 0.11 + stock["seed"]) * 0.009 + math.sin(t * 0.033 + stock["seed"] * 2) * 0.004
    price = round(stock["base"] * (1 + wave), 2)
    change_pct = round(wave * 100, 2)
    return {"symbol": stock["symbol"], "name": stock["name"], "price": price, "change_pct": change_pct, "source": "simulated"}


def find_stock(symbol):
    for s in STOCKS:
        if s["symbol"] == symbol.upper():
            return s
    return None


def get_stock(symbol):
    s = find_stock(symbol)
    return live_stock(s) if s else None


def all_stocks():
    return [live_stock(s) for s in STOCKS]


def stock_history(stock, points=24, step_minutes=5):
    live = live_stock(stock)
    if live.get("source") == "live" and None not in (live.get("open"), live.get("low"), live.get("high")):
        # Gercek gun ici degerlerden (acilis/dusuk/yuksek/guncel) olusan, uydurma ara nokta icermeyen seri.
        up_day = live["price"] >= live["open"]
        order = [("Açılış", live["open"]), ("Düşük", live["low"]), ("Yüksek", live["high"]), ("Güncel", live["price"])]
        if not up_day:
            order = [("Açılış", live["open"]), ("Yüksek", live["high"]), ("Düşük", live["low"]), ("Güncel", live["price"])]
        return [{"t": label, "price": round(p, 2)} for label, p in order]

    now_ts = time.time()
    series = []
    for i in range(points, -1, -1):
        ts = now_ts - i * step_minutes * 60
        snap = live_stock(stock, at_time=ts)
        series.append({"t": time.strftime("%H:%M", time.localtime(ts)), "price": snap["price"]})
    return series


def fetch_market_indices():
    by = fetch_market_snapshot()["by_symbol"]
    xau_usd = by.get("XAUUSD1!")
    usdtry = by.get("USDTRY1!")
    eurtry = by.get("EURTRY1!")
    xu100 = by.get("XU100")

    indices = []
    if xau_usd:
        indices.append({
            "key": "ons_altin", "label": "Ons Altın", "prefix": "$",
            "price": round(xau_usd["price"], 2), "change_pct": round(xau_usd["change_pct"], 2),
        })
    if xau_usd and usdtry:
        gram = xau_usd["price"] * usdtry["price"] / 31.1034768
        indices.append({
            "key": "gram_altin", "label": "Gram Altın", "prefix": "₺",
            "price": round(gram, 2), "change_pct": round(xau_usd["change_pct"], 2),
        })
    if xu100:
        indices.append({
            "key": "bist100", "label": "BIST 100", "prefix": "",
            "price": round(xu100["price"], 2), "change_pct": round(xu100["change_pct"], 2),
        })
    if usdtry:
        indices.append({
            "key": "usdtry", "label": "USD/TRY", "prefix": "₺",
            "price": round(usdtry["price"], 4), "change_pct": round(usdtry["change_pct"], 2),
        })
    if eurtry:
        indices.append({
            "key": "eurtry", "label": "EUR/TRY", "prefix": "₺",
            "price": round(eurtry["price"], 4), "change_pct": round(eurtry["change_pct"], 2),
        })
    return indices


def commission_for(total):
    return round(max(MIN_COMMISSION, total * COMMISSION_BPS / 10000), 2)


# ── HTTP Handler ─────────────────────────────────────────────────────────

class Handler(BaseHTTPRequestHandler):
    server_version = "MukatabakDemo/1.0"

    def log_message(self, fmt, *args):
        pass

    # -- yardimcilar --
    def send_json(self, data, status=200, cookie=None):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        if cookie:
            self.send_header("Set-Cookie", cookie)
        self.end_headers()
        self.wfile.write(body)

    def read_json(self):
        length = int(self.headers.get("Content-Length", 0) or 0)
        if length == 0:
            return {}
        raw = self.rfile.read(length)
        try:
            return json.loads(raw.decode("utf-8"))
        except Exception:
            return {}

    def current_user(self, conn):
        cookie_header = self.headers.get("Cookie", "")
        jar = http.cookies.SimpleCookie()
        jar.load(cookie_header)
        if "session" not in jar:
            return None
        uid = read_session_token(jar["session"].value)
        if not uid:
            return None
        row = conn.execute("SELECT * FROM users WHERE id = ?", (uid,)).fetchone()
        return row

    def require_user(self, conn):
        user = self.current_user(conn)
        if not user or not user["active"]:
            self.send_json({"error": "Oturum bulunamadı, lütfen giriş yapın."}, 401)
            return None
        return user

    def require_admin(self, conn):
        user = self.require_user(conn)
        if not user:
            return None
        if user["role"] != "admin":
            self.send_json({"error": "Bu işlem için yönetici yetkisi gerekir."}, 403)
            return None
        return user

    @staticmethod
    def user_public(row):
        return {
            "id": row["id"], "name": row["name"], "email": row["email"], "role": row["role"],
            "notify_price_alerts": bool(row["notify_price_alerts"]), "notify_news": bool(row["notify_news"]),
            "created_at": row["created_at"],
        }

    # -- yönlendirme --
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if path.startswith("/api/"):
            return self.handle_api("GET", path, parse_qs(parsed.query))
        return self.serve_static(path)

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/"):
            return self.handle_api("POST", parsed.path, {})
        self.send_response(404)
        self.end_headers()

    def do_PATCH(self):
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/"):
            return self.handle_api("PATCH", parsed.path, {})
        self.send_response(404)
        self.end_headers()

    def do_DELETE(self):
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/"):
            return self.handle_api("DELETE", parsed.path, {})
        self.send_response(404)
        self.end_headers()

    def serve_static(self, path):
        if path == "/" or path == "":
            path = "/index.html"
        safe = path.lstrip("/")
        file_path = (DIST_DIR / safe).resolve()
        if DIST_DIR not in file_path.parents and file_path != DIST_DIR:
            file_path = DIST_DIR / "index.html"
        if not file_path.exists() or file_path.is_dir():
            file_path = DIST_DIR / "index.html"
        if not file_path.exists():
            self.send_json({"error": "Frontend build bulunamadı. `npm run build` çalıştırın."}, 500)
            return
        ctype = mimetypes.guess_type(str(file_path))[0] or "application/octet-stream"
        data = file_path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        if file_path.suffix in (".js", ".css", ".png", ".jpg", ".svg", ".ttf", ".woff", ".woff2"):
            self.send_header("Cache-Control", "public, max-age=31536000, immutable")
        self.end_headers()
        self.wfile.write(data)

    # -- API --
    def handle_api(self, method, path, query):
        conn = db()
        try:
            route = path[len("/api"):]
            parts = [p for p in route.split("/") if p]

            if method == "GET" and route == "/me":
                user = self.current_user(conn)
                return self.send_json({"user": self.user_public(user) if user else None})

            if method == "POST" and route == "/auth/register":
                return self.api_register(conn)
            if method == "POST" and route == "/auth/login":
                return self.api_login(conn)
            if method == "POST" and route == "/auth/logout":
                return self.send_json({"ok": True}, cookie="session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax")

            if method == "GET" and route == "/stocks":
                return self.send_json({"stocks": all_stocks()})
            if method == "GET" and len(parts) == 2 and parts[0] == "stocks":
                st = get_stock(parts[1])
                if not st:
                    return self.send_json({"error": "Hisse bulunamadı."}, 404)
                return self.send_json({"stock": st})
            if method == "GET" and len(parts) == 3 and parts[0] == "stocks" and parts[2] == "history":
                raw = find_stock(parts[1])
                if not raw:
                    return self.send_json({"error": "Hisse bulunamadı."}, 404)
                return self.send_json({"points": stock_history(raw)})

            if method == "GET" and route == "/market/indices":
                return self.send_json({"items": fetch_market_indices()})
            if method == "GET" and route == "/market/status":
                return self.send_json({"open": is_market_open()})

            if method == "GET" and route == "/news":
                return self.send_json({"items": fetch_news(), "live": bool(_news_cache["items"])})

            if method == "GET" and route == "/watchlist":
                return self.api_watchlist_list(conn)
            if method == "POST" and route == "/watchlist":
                return self.api_watchlist_add(conn)
            if method == "DELETE" and len(parts) == 2 and parts[0] == "watchlist":
                return self.api_watchlist_remove(conn, parts[1])

            if method == "GET" and route == "/blog":
                rows = conn.execute("SELECT * FROM blog_posts ORDER BY date DESC").fetchall()
                return self.send_json({"posts": [dict(r) for r in rows]})
            if method == "GET" and len(parts) == 2 and parts[0] == "blog":
                row = conn.execute("SELECT * FROM blog_posts WHERE slug = ?", (parts[1],)).fetchone()
                if not row:
                    return self.send_json({"error": "Yazı bulunamadı."}, 404)
                return self.send_json({"post": dict(row)})

            if method == "GET" and route == "/faq":
                rows = conn.execute("SELECT * FROM faq ORDER BY id ASC").fetchall()
                return self.send_json({"items": [dict(r) for r in rows]})

            if method == "GET" and route == "/portfolio":
                return self.api_portfolio(conn)
            if method == "GET" and route == "/orders":
                return self.api_orders(conn)
            if method == "POST" and route == "/trade":
                return self.api_trade(conn)

            if method == "GET" and route == "/wallet/transactions":
                return self.api_wallet_transactions(conn)
            if method == "POST" and route == "/wallet/deposit":
                return self.api_wallet_deposit(conn)
            if method == "POST" and route == "/wallet/withdraw":
                return self.api_wallet_withdraw(conn)

            if method == "PATCH" and route == "/me":
                return self.api_me_update(conn)
            if method == "POST" and route == "/me/password":
                return self.api_me_password(conn)
            if method == "PATCH" and route == "/me/notifications":
                return self.api_me_notifications(conn)

            if method == "GET" and route == "/admin/stats":
                return self.api_admin_stats(conn)
            if method == "GET" and route == "/admin/users":
                return self.api_admin_users(conn)
            if method == "PATCH" and len(parts) == 3 and parts[0] == "admin" and parts[1] == "users":
                return self.api_admin_user_update(conn, int(parts[2]))
            if method == "POST" and route == "/admin/blog":
                return self.api_admin_blog_save(conn)
            if method == "DELETE" and len(parts) == 3 and parts[0] == "admin" and parts[1] == "blog":
                return self.api_admin_blog_delete(conn, int(parts[2]))
            if method == "POST" and route == "/admin/faq":
                return self.api_admin_faq_save(conn)
            if method == "DELETE" and len(parts) == 3 and parts[0] == "admin" and parts[1] == "faq":
                return self.api_admin_faq_delete(conn, int(parts[2]))

            return self.send_json({"error": "Bulunamadı."}, 404)
        finally:
            conn.close()

    # -- auth --
    def api_register(self, conn):
        body = self.read_json()
        name = (body.get("name") or "").strip()
        email = (body.get("email") or "").strip().lower()
        password = body.get("password") or ""
        if not name or not email or len(password) < 6:
            return self.send_json({"error": "Ad, e-posta ve en az 6 karakterli şifre gerekli."}, 400)
        if conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone():
            return self.send_json({"error": "Bu e-posta ile zaten bir hesap var."}, 409)
        salt, pw_hash = hash_password(password)
        cur = conn.execute(
            "INSERT INTO users (name,email,password_hash,salt,role,active,cash,created_at) VALUES (?,?,?,?,?,?,?,?)",
            (name, email, pw_hash, salt, "user", 1, STARTING_CASH, now()),
        )
        conn.commit()
        user = conn.execute("SELECT * FROM users WHERE id = ?", (cur.lastrowid,)).fetchone()
        token = make_session_token(user["id"])
        cookie = f"session={token}; HttpOnly; Path=/; Max-Age={SESSION_MAX_AGE}; SameSite=Lax"
        self.send_json({"user": self.user_public(user)}, cookie=cookie)

    def api_login(self, conn):
        body = self.read_json()
        email = (body.get("email") or "").strip().lower()
        password = body.get("password") or ""
        row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        if not row or not verify_password(password, row["salt"], row["password_hash"]):
            return self.send_json({"error": "E-posta veya şifre hatalı."}, 401)
        if not row["active"]:
            return self.send_json({"error": "Hesabın pasif durumda."}, 403)
        token = make_session_token(row["id"])
        cookie = f"session={token}; HttpOnly; Path=/; Max-Age={SESSION_MAX_AGE}; SameSite=Lax"
        self.send_json({"user": self.user_public(row)}, cookie=cookie)

    # -- portföy --
    def api_portfolio(self, conn):
        user = self.require_user(conn)
        if not user:
            return
        positions = conn.execute("SELECT * FROM positions WHERE user_id = ? AND qty > 0", (user["id"],)).fetchall()
        enriched = []
        holdings_value = 0.0
        day_change = 0.0
        for p in positions:
            st = get_stock(p["symbol"])
            if not st:
                continue
            value = round(st["price"] * p["qty"], 2)
            pos_day_change = round(value * st["change_pct"] / 100, 2)
            holdings_value += value
            day_change += pos_day_change
            enriched.append({
                "symbol": st["symbol"], "name": st["name"], "qty": p["qty"],
                "price": st["price"], "value": value, "day_change": pos_day_change,
                "change_pct": st["change_pct"],
            })
        total_value = round(user["cash"] + holdings_value, 2)
        day_change = round(day_change, 2)
        day_change_pct = round((day_change / total_value) * 100, 2) if total_value > 0 else 0
        pending_settlement = unsettled_sell_total(conn, user["id"])
        self.send_json({
            "cash": round(user["cash"], 2),
            "available_cash": available_cash_for(conn, user),
            "pending_settlement": pending_settlement,
            "holdings_value": round(holdings_value, 2),
            "total_value": total_value,
            "day_change": day_change,
            "day_change_pct": day_change_pct,
            "positions": enriched,
        })

    def api_orders(self, conn):
        user = self.require_user(conn)
        if not user:
            return
        rows = conn.execute(
            "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 100", (user["id"],)
        ).fetchall()
        today = today_str()
        orders = [{
            "id": r["id"], "symbol": r["symbol"], "side": r["side"], "qty": r["qty"],
            "price": r["price"], "total": r["total"], "commission": r["commission"], "order_type": r["order_type"],
            "status": r["status"], "date": r["created_at"],
            "settle_date": r["settle_date"], "settled": bool(r["settle_date"]) and r["settle_date"] <= today,
        } for r in rows]
        self.send_json({"orders": orders})

    def api_trade(self, conn):
        user = self.require_user(conn)
        if not user:
            return
        body = self.read_json()
        symbol = (body.get("symbol") or "").upper()
        side = body.get("side")
        order_type = body.get("order_type") or "market"
        if order_type not in ("market", "limit"):
            return self.send_json({"error": "Geçersiz emir tipi."}, 400)
        try:
            qty = float(body.get("qty") or 0)
        except (TypeError, ValueError):
            qty = 0
        if side not in ("buy", "sell") or qty <= 0:
            return self.send_json({"error": "Geçersiz emir."}, 400)
        stock = get_stock(symbol)
        if not stock:
            return self.send_json({"error": "Hisse bulunamadı."}, 404)

        market_open = is_market_open()
        if order_type == "market" and not market_open:
            return self.send_json({"error": "Piyasa şu anda kapalı, sadece limit emir girebilirsin."}, 400)

        fill_price = stock["price"]
        if order_type == "limit":
            try:
                limit_price = float(body.get("limit_price") or 0)
            except (TypeError, ValueError):
                limit_price = 0
            if limit_price <= 0:
                return self.send_json({"error": "Geçerli bir limit fiyat girmelisin."}, 400)
            if side == "buy" and limit_price < stock["price"]:
                return self.send_json({"error": f"Piyasa fiyatı ({stock['price']:.2f} TL) limit fiyatından yüksek, emir gerçekleşmedi."}, 400)
            if side == "sell" and limit_price > stock["price"]:
                return self.send_json({"error": f"Piyasa fiyatı ({stock['price']:.2f} TL) limit fiyatından düşük, emir gerçekleşmedi."}, 400)
            fill_price = stock["price"]  # emir tetiklendiginde gercek piyasa fiyatindan doldurulur

        total = round(fill_price * qty, 2)
        commission = commission_for(total)
        trade_date = date.today()
        settle = settle_date_for(trade_date)

        if side == "buy":
            available = available_cash_for(conn, user)
            cost = total + commission
            if available < cost:
                return self.send_json({"error": f"Yetersiz kullanılabilir bakiye. Gerekli: {cost:.2f} TL, kullanılabilir: {available:.2f} TL"}, 400)
            conn.execute("UPDATE users SET cash = cash - ? WHERE id = ?", (cost, user["id"]))
            existing = conn.execute("SELECT qty FROM positions WHERE user_id=? AND symbol=?", (user["id"], symbol)).fetchone()
            if existing:
                conn.execute("UPDATE positions SET qty = qty + ? WHERE user_id=? AND symbol=?", (qty, user["id"], symbol))
            else:
                conn.execute("INSERT INTO positions (user_id,symbol,qty) VALUES (?,?,?)", (user["id"], symbol, qty))
        else:
            existing = conn.execute("SELECT qty FROM positions WHERE user_id=? AND symbol=?", (user["id"], symbol)).fetchone()
            if not existing or existing["qty"] < qty:
                return self.send_json({"error": "Yeterli adette hissen yok."}, 400)
            proceeds = total - commission
            conn.execute("UPDATE positions SET qty = qty - ? WHERE user_id=? AND symbol=?", (qty, user["id"], symbol))
            conn.execute("UPDATE users SET cash = cash + ? WHERE id = ?", (proceeds, user["id"]))

        conn.execute(
            "INSERT INTO orders (user_id,symbol,side,qty,price,total,commission,order_type,status,settle_date,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
            (user["id"], symbol, side, qty, fill_price, total, commission, order_type, "filled", settle, now()),
        )
        conn.commit()
        self.send_json({"ok": True, "settle_date": settle, "commission": commission, "fill_price": fill_price, "market_open": market_open})

    # -- takip listem --
    def api_watchlist_list(self, conn):
        user = self.require_user(conn)
        if not user:
            return
        rows = conn.execute("SELECT symbol FROM watchlist WHERE user_id=? ORDER BY created_at ASC", (user["id"],)).fetchall()
        symbols = [r["symbol"] for r in rows]
        stocks = [get_stock(s) for s in symbols if get_stock(s)]
        self.send_json({"symbols": symbols, "stocks": stocks})

    def api_watchlist_add(self, conn):
        user = self.require_user(conn)
        if not user:
            return
        body = self.read_json()
        symbol = (body.get("symbol") or "").upper()
        if not find_stock(symbol):
            return self.send_json({"error": "Hisse bulunamadı."}, 404)
        conn.execute(
            "INSERT OR IGNORE INTO watchlist (user_id,symbol,created_at) VALUES (?,?,?)",
            (user["id"], symbol, now()),
        )
        conn.commit()
        self.send_json({"ok": True})

    def api_watchlist_remove(self, conn, symbol):
        user = self.require_user(conn)
        if not user:
            return
        conn.execute("DELETE FROM watchlist WHERE user_id=? AND symbol=?", (user["id"], symbol.upper()))
        conn.commit()
        self.send_json({"ok": True})

    # -- cuzdan (demo sanal bakiye) --
    def api_wallet_transactions(self, conn):
        user = self.require_user(conn)
        if not user:
            return
        rows = conn.execute(
            "SELECT * FROM wallet_transactions WHERE user_id=? ORDER BY created_at DESC LIMIT 50", (user["id"],)
        ).fetchall()
        self.send_json({"transactions": [dict(r) for r in rows]})

    def api_wallet_deposit(self, conn):
        user = self.require_user(conn)
        if not user:
            return
        body = self.read_json()
        try:
            amount = float(body.get("amount") or 0)
        except (TypeError, ValueError):
            amount = 0
        if amount <= 0 or amount > 1_000_000:
            return self.send_json({"error": "Geçersiz tutar (max 1.000.000 TL)."}, 400)
        conn.execute("UPDATE users SET cash = cash + ? WHERE id=?", (amount, user["id"]))
        conn.execute(
            "INSERT INTO wallet_transactions (user_id,type,amount,created_at) VALUES (?,?,?,?)",
            (user["id"], "deposit", amount, now()),
        )
        conn.commit()
        self.send_json({"ok": True})

    def api_wallet_withdraw(self, conn):
        user = self.require_user(conn)
        if not user:
            return
        body = self.read_json()
        try:
            amount = float(body.get("amount") or 0)
        except (TypeError, ValueError):
            amount = 0
        available = available_cash_for(conn, user)
        if amount <= 0:
            return self.send_json({"error": "Geçersiz tutar."}, 400)
        if amount > available:
            return self.send_json({"error": f"Yetersiz kullanılabilir bakiye. Kullanılabilir: {available:.2f} TL"}, 400)
        conn.execute("UPDATE users SET cash = cash - ? WHERE id=?", (amount, user["id"]))
        conn.execute(
            "INSERT INTO wallet_transactions (user_id,type,amount,created_at) VALUES (?,?,?,?)",
            (user["id"], "withdraw", amount, now()),
        )
        conn.commit()
        self.send_json({"ok": True})

    # -- profil / guvenlik / bildirimler --
    def api_me_update(self, conn):
        user = self.require_user(conn)
        if not user:
            return
        body = self.read_json()
        name = (body.get("name") or "").strip()
        email = (body.get("email") or "").strip().lower()
        if not name or not email:
            return self.send_json({"error": "Ad ve e-posta gerekli."}, 400)
        clash = conn.execute("SELECT id FROM users WHERE email=? AND id<>?", (email, user["id"])).fetchone()
        if clash:
            return self.send_json({"error": "Bu e-posta başka bir hesapta kullanılıyor."}, 409)
        conn.execute("UPDATE users SET name=?, email=? WHERE id=?", (name, email, user["id"]))
        conn.commit()
        updated = conn.execute("SELECT * FROM users WHERE id=?", (user["id"],)).fetchone()
        self.send_json({"user": self.user_public(updated)})

    def api_me_password(self, conn):
        user = self.require_user(conn)
        if not user:
            return
        body = self.read_json()
        current = body.get("current_password") or ""
        new_password = body.get("new_password") or ""
        if not verify_password(current, user["salt"], user["password_hash"]):
            return self.send_json({"error": "Mevcut şifre hatalı."}, 401)
        if len(new_password) < 6:
            return self.send_json({"error": "Yeni şifre en az 6 karakter olmalı."}, 400)
        salt, pw_hash = hash_password(new_password)
        conn.execute("UPDATE users SET salt=?, password_hash=? WHERE id=?", (salt, pw_hash, user["id"]))
        conn.commit()
        self.send_json({"ok": True})

    def api_me_notifications(self, conn):
        user = self.require_user(conn)
        if not user:
            return
        body = self.read_json()
        price_alerts = int(bool(body.get("notify_price_alerts", user["notify_price_alerts"])))
        news = int(bool(body.get("notify_news", user["notify_news"])))
        conn.execute("UPDATE users SET notify_price_alerts=?, notify_news=? WHERE id=?", (price_alerts, news, user["id"]))
        conn.commit()
        updated = conn.execute("SELECT * FROM users WHERE id=?", (user["id"],)).fetchone()
        self.send_json({"user": self.user_public(updated)})

    # -- admin --
    def api_admin_stats(self, conn):
        if not self.require_admin(conn):
            return
        total_users = conn.execute("SELECT COUNT(*) c FROM users").fetchone()["c"]
        total_orders = conn.execute("SELECT COUNT(*) c FROM orders").fetchone()["c"]
        total_cash = conn.execute("SELECT COALESCE(SUM(cash),0) s FROM users").fetchone()["s"]
        total_posts = conn.execute("SELECT COUNT(*) c FROM blog_posts").fetchone()["c"]
        recent = conn.execute("SELECT id,name,email,created_at FROM users ORDER BY id DESC LIMIT 5").fetchall()
        self.send_json({
            "total_users": total_users, "total_orders": total_orders,
            "total_virtual_cash": round(total_cash, 2), "total_posts": total_posts,
            "recent_users": [dict(r) for r in recent],
        })

    def api_admin_users(self, conn):
        if not self.require_admin(conn):
            return
        rows = conn.execute("SELECT id,name,email,role,active,cash,created_at FROM users ORDER BY id DESC").fetchall()
        self.send_json({"users": [dict(r) for r in rows]})

    def api_admin_user_update(self, conn, user_id):
        if not self.require_admin(conn):
            return
        body = self.read_json()
        target = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if not target:
            return self.send_json({"error": "Kullanıcı bulunamadı."}, 404)
        role = body.get("role", target["role"])
        active = int(body.get("active", target["active"]))
        conn.execute("UPDATE users SET role=?, active=? WHERE id=?", (role, active, user_id))
        conn.commit()
        self.send_json({"ok": True})

    def api_admin_blog_save(self, conn):
        if not self.require_admin(conn):
            return
        body = self.read_json()
        slug = (body.get("slug") or "").strip()
        title = (body.get("title") or "").strip()
        if not slug or not title:
            return self.send_json({"error": "Başlık ve slug gerekli."}, 400)
        post_id = body.get("id")
        if post_id:
            conn.execute(
                "UPDATE blog_posts SET slug=?,title=?,excerpt=?,content=?,date=?,cover=? WHERE id=?",
                (slug, title, body.get("excerpt", ""), body.get("content", ""), body.get("date") or now()[:10], body.get("cover", ""), post_id),
            )
        else:
            conn.execute(
                "INSERT INTO blog_posts (slug,title,excerpt,content,date,cover,created_at) VALUES (?,?,?,?,?,?,?)",
                (slug, title, body.get("excerpt", ""), body.get("content", ""), body.get("date") or now()[:10], body.get("cover", ""), now()),
            )
        conn.commit()
        self.send_json({"ok": True})

    def api_admin_blog_delete(self, conn, post_id):
        if not self.require_admin(conn):
            return
        conn.execute("DELETE FROM blog_posts WHERE id=?", (post_id,))
        conn.commit()
        self.send_json({"ok": True})

    def api_admin_faq_save(self, conn):
        if not self.require_admin(conn):
            return
        body = self.read_json()
        q = (body.get("q") or "").strip()
        a = (body.get("a") or "").strip()
        if not q or not a:
            return self.send_json({"error": "Soru ve cevap gerekli."}, 400)
        faq_id = body.get("id")
        if faq_id:
            conn.execute("UPDATE faq SET q=?,a=? WHERE id=?", (q, a, faq_id))
        else:
            conn.execute("INSERT INTO faq (q,a,created_at) VALUES (?,?,?)", (q, a, now()))
        conn.commit()
        self.send_json({"ok": True})

    def api_admin_faq_delete(self, conn, faq_id):
        if not self.require_admin(conn):
            return
        conn.execute("DELETE FROM faq WHERE id=?", (faq_id,))
        conn.commit()
        self.send_json({"ok": True})


def main():
    init_db()
    port = int(os.environ.get("PORT", "8000"))
    server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    print(f"Mukatabak backend {port} portunda çalışıyor. DB: {DB_PATH}")
    server.serve_forever()


if __name__ == "__main__":
    main()
