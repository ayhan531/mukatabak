"""Mukatabak demo backend.

Sadece Python standart kütüphanesi kullanılır (harici bağımlılık yok).
Kimlik dogrulama + sanal/demo hisse alim-satim + admin paneli + blog/SSS CMS saglar.
Gercek para transferi, IBAN toplama veya kimlik dogrulamali para cekme YOKTUR.
"""

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
import secrets
import sqlite3
import time

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = Path(os.environ.get("DATA_DIR", ROOT / "data"))
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DATA_DIR / "mukatabak.db"
DIST_DIR = ROOT / "web" / "dist"

SECRET = os.environ.get("SESSION_SECRET") or secrets.token_hex(32)
STARTING_CASH = float(os.environ.get("STARTING_CASH", "100000"))
SESSION_MAX_AGE = 60 * 60 * 24 * 30  # 30 gun

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

NEWS = [
    {"title": "BIST 100 endeksinde güne yükselişle başlandı", "summary": "Bankacılık ve sanayi hisselerindeki alımlar endeksi yukarı taşıdı."},
    {"title": "Merkez Bankası faiz kararı yaklaşıyor", "summary": "Piyasa katılımcıları bu hafta açıklanacak karara odaklandı."},
    {"title": "Teknoloji hisselerinde yatırımcı ilgisi sürüyor", "summary": "Küresel piyasalardaki olumlu hava yerel teknoloji hisselerine de yansıdı."},
    {"title": "Enerji sektöründe volatilite arttı", "summary": "Uluslararası petrol fiyatlarındaki dalgalanma enerji hisselerini etkiliyor."},
]

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
            status TEXT NOT NULL DEFAULT 'filled',
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


# ── Fiyat simulasyonu ────────────────────────────────────────────────────

def live_stock(stock):
    t = time.time() / 60.0
    wave = math.sin(t * 0.11 + stock["seed"]) * 0.009 + math.sin(t * 0.033 + stock["seed"] * 2) * 0.004
    price = round(stock["base"] * (1 + wave), 2)
    change_pct = round(wave * 100, 2)
    return {
        "symbol": stock["symbol"],
        "name": stock["name"],
        "price": price,
        "change_pct": change_pct,
    }


def get_stock(symbol):
    for s in STOCKS:
        if s["symbol"] == symbol.upper():
            return live_stock(s)
    return None


def all_stocks():
    return [live_stock(s) for s in STOCKS]


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
        return {"id": row["id"], "name": row["name"], "email": row["email"], "role": row["role"]}

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

            if method == "GET" and route == "/news":
                return self.send_json({"items": NEWS})

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
        self.send_json({
            "cash": round(user["cash"], 2),
            "available_cash": round(user["cash"], 2),
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
        orders = [{
            "id": r["id"], "symbol": r["symbol"], "side": r["side"], "qty": r["qty"],
            "price": r["price"], "total": r["total"], "status": r["status"], "date": r["created_at"],
        } for r in rows]
        self.send_json({"orders": orders})

    def api_trade(self, conn):
        user = self.require_user(conn)
        if not user:
            return
        body = self.read_json()
        symbol = (body.get("symbol") or "").upper()
        side = body.get("side")
        try:
            qty = float(body.get("qty") or 0)
        except (TypeError, ValueError):
            qty = 0
        if side not in ("buy", "sell") or qty <= 0:
            return self.send_json({"error": "Geçersiz emir."}, 400)
        stock = get_stock(symbol)
        if not stock:
            return self.send_json({"error": "Hisse bulunamadı."}, 404)

        total = round(stock["price"] * qty, 2)
        if side == "buy":
            if user["cash"] < total:
                return self.send_json({"error": "Yetersiz sanal bakiye."}, 400)
            new_cash = user["cash"] - total
            conn.execute("UPDATE users SET cash = ? WHERE id = ?", (new_cash, user["id"]))
            existing = conn.execute("SELECT qty FROM positions WHERE user_id=? AND symbol=?", (user["id"], symbol)).fetchone()
            if existing:
                conn.execute("UPDATE positions SET qty = qty + ? WHERE user_id=? AND symbol=?", (qty, user["id"], symbol))
            else:
                conn.execute("INSERT INTO positions (user_id,symbol,qty) VALUES (?,?,?)", (user["id"], symbol, qty))
        else:
            existing = conn.execute("SELECT qty FROM positions WHERE user_id=? AND symbol=?", (user["id"], symbol)).fetchone()
            if not existing or existing["qty"] < qty:
                return self.send_json({"error": "Yeterli adette hissen yok."}, 400)
            conn.execute("UPDATE positions SET qty = qty - ? WHERE user_id=? AND symbol=?", (qty, user["id"], symbol))
            conn.execute("UPDATE users SET cash = cash + ? WHERE id = ?", (total, user["id"]))

        conn.execute(
            "INSERT INTO orders (user_id,symbol,side,qty,price,total,status,created_at) VALUES (?,?,?,?,?,?,?,?)",
            (user["id"], symbol, side, qty, stock["price"], total, "filled", now()),
        )
        conn.commit()
        self.send_json({"ok": True})

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
