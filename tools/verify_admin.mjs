/* Yonetim paneli ve kullanici paneli tam gezinti denetimi.
   Kullanim: DATA_DIR=... PORT=8099 backend ayaktayken
             node tools/verify_admin.mjs [taban-adres]                */
import { createRequire } from "node:module";
const require_ = createRequire(import.meta.url);
let chromium;
for (const y of ["playwright", "playwright-core", "/home/claude/.npm-global/lib/node_modules/playwright/index.js"]) {
  try { ({ chromium } = require_(y)); break; } catch { /* sonraki */ }
}
if (!chromium) { console.error("playwright yok"); process.exit(2); }

const TABAN = process.argv[2] || "http://127.0.0.1:8099";
const SHOT = process.env.SHOT_DIR || "/tmp/adm";
const ADMIN_TC = process.env.ADMIN_TC || "11111111110";
const ADMIN_SIFRE = process.env.ADMIN_PASSWORD || "Admin12345";
const MUSTERI_TC = process.env.MUSTERI_TC || "62601815964";
const MUSTERI_SIFRE = process.env.MUSTERI_SIFRE || "Musteri12345";

let hata = 0;
const ok = (ad, k, ek = "") => { console.log(`${k ? "TAMAM " : "SORUN "} ${ad}${ek ? " — " + ek : ""}`); if (!k) hata += 1; };

const b = await chromium.launch();
const hatalar = [];
const dinle = (p, etiket) => {
  p.on("pageerror", (e) => hatalar.push(`[${etiket}] PAGEERROR ${e.message}`));
  p.on("console", (m) => { const t = m.text();
    if (m.type() === "error" && !/Failed to load resource|TUNNEL|ERR_INTERNET|favicon/.test(t)) hatalar.push(`[${etiket}] ${t}`); });
};
const gir = async (p, tc, sifre) => {
  await p.goto(TABAN + "/", { waitUntil: "domcontentloaded" }); await p.waitForTimeout(1200);
  await p.click("button.corporate-login"); await p.waitForTimeout(700);
  await (await p.$$("input"))[0].fill(tc);
  await (await p.$('input[type="password"]')).fill(sifre);
  await p.keyboard.press("Enter"); await p.waitForTimeout(2600);
};

/* ============ 1) YONETIM PANELI (masaustu) ============ */
{
  const p = await (await b.newContext({ viewport: { width: 1500, height: 980 } })).newPage();
  dinle(p, "admin");
  await gir(p, ADMIN_TC, ADMIN_SIFRE);
  const admBtn = await p.$('button[title="Admin"]');
  ok("admin girisi", Boolean(admBtn));
  await admBtn.click(); await p.waitForTimeout(2200);

  const sayfalar = await p.$$eval(".ac-menu button, aside button, nav button",
    (ns) => ns.map((n) => n.innerText.trim()).filter((t) => t && t.length < 40));
  console.log("MENU:", JSON.stringify(sayfalar));

  const hedefler = ["Dashboard", "Kullanıcılar", "Portföyler", "Bakiye Detayları", "Kredi Başvuruları",
    "Kredi Ayarları", "T+2 Takip", "Onay Bekleyenler", "Banka Hesapları", "Para Yatırma Talepleri",
    "Para Yükleme", "Para Çekme", "Hisse Açıklamaları", "Sistem Ayarları", "Piyasa Kontrolü",
    "Emirler", "Belgeler", "Denetim Kaydı"];
  for (const ad of hedefler) {
    const el = await p.$(`button:has-text("${ad}")`);
    if (!el) { ok("sayfa " + ad, false, "menüde yok"); continue; }
    const once = hatalar.length;
    await el.click(); await p.waitForTimeout(1500);
    const bilgi = await p.evaluate(() => {
      const m = document.querySelector("main");
      const g = m ? m.innerText.replace(/\s+/g, " ").trim() : "";
      return { uzunluk: g.length, ilk: g.slice(0, 90),
        bos: /Kayıt yok|Kayıt bulunamadı|henüz yok/i.test(g) && g.length < 260,
        tasma: document.documentElement.scrollWidth - document.documentElement.clientWidth };
    });
    await p.screenshot({ path: `${SHOT}/adm-${ad.replace(/[^\wÇĞİÖŞÜçğıöşü+]/g, "_")}.png` });
    ok("sayfa " + ad, bilgi.uzunluk > 120 && hatalar.length === once && bilgi.tasma <= 0,
       `${bilgi.uzunluk} kr · taşma ${bilgi.tasma} · ${bilgi.ilk}`);
  }
  await p.close();
}

/* ============ 2) YONETIM PANELI (telefon) ============ */
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); dinle(p, "admin-mobil");
  await gir(p, ADMIN_TC, ADMIN_SIFRE);
  const admBtn = await p.$('button[title="Admin"]');
  if (admBtn) { await admBtn.click(); await p.waitForTimeout(2200); }
  const t = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok("admin telefonda taşmıyor", t <= 0, "fark " + t);
  await p.screenshot({ path: `${SHOT}/adm-mobil.png` });
  await p.close();
}

/* ============ 3) KULLANICI PANELI (Hesap ve alt sayfalar) ============ */
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); dinle(p, "musteri");
  await gir(p, MUSTERI_TC, MUSTERI_SIFRE);
  ok("müşteri e-şubesi açıldı", (await p.$$(".navbar")).length === 1);

  const hesap = await p.$('.navbar >> text="Hesap"');
  await hesap.click(); await p.waitForTimeout(1400);
  await p.screenshot({ path: `${SHOT}/usr-hesap.png` });

  const hesabaDon = async () => {
    for (let i = 0; i < 4; i += 1) {
      const kapat = await p.$(".sheet-close, .overlay button[aria-label=\"Kapat\"]");
      if (kapat) { await kapat.click(); await p.waitForTimeout(500); continue; }
      const perde = await p.$(".backdrop");
      if (perde) { await perde.click({ force: true }); await p.waitForTimeout(500); continue; }
      break;
    }
    const h = await p.$('.navbar >> text="Hesap"');
    if (h) { await h.click({ force: true }); await p.waitForTimeout(1000); }
  };

  const altlar = ["Geçmiş İşlemler", "Emirlerim", "Bildirimler", "Güvenlik", "Ayarlar",
                  "Güvenlik Politikası ve Sözleşmeler"];
  for (const ad of altlar) {
    const el = await p.$(`text="${ad}"`);
    if (!el) { ok("alt sayfa " + ad, false, "bulunamadı"); continue; }
    const once = hatalar.length;
    await el.click(); await p.waitForTimeout(1300);
    const bilgi = await p.evaluate(() => {
      const g = document.body.innerText.replace(/\s+/g, " ").trim();
      return { uzunluk: g.length, ilk: g.slice(0, 80),
        tasma: document.documentElement.scrollWidth - document.documentElement.clientWidth };
    });
    await p.screenshot({ path: `${SHOT}/usr-${ad.replace(/\s/g, "_").slice(0, 24)}.png` });
    ok("alt sayfa " + ad, bilgi.uzunluk > 60 && hatalar.length === once && bilgi.tasma <= 0,
       `${bilgi.uzunluk} kr · taşma ${bilgi.tasma}`);
    await hesabaDon();
  }

  // profil kartı → Kişisel Bilgiler
  {
    const kart = await p.$(".mk-profile");
    if (!kart) ok("Kişisel Bilgiler", false, "profil kartı yok");
    else {
      const once = hatalar.length;
      await kart.click(); await p.waitForTimeout(1300);
      const g = (await p.innerText("body")).replace(/\s+/g, " ");
      await p.screenshot({ path: `${SHOT}/usr-kisisel.png` });
      ok("Kişisel Bilgiler", /Kişisel|Kimlik|İletişim/.test(g) && hatalar.length === once, g.slice(0, 70));
      await hesabaDon();
    }
  }

  // Para Yatır / Para Çek sayfaları
  for (const ad of ["Para Yatır", "Para Çek"]) {
    const el = await p.$(`button:has-text("${ad}")`);
    if (!el) { ok(ad, false, "düğme yok"); continue; }
    const once = hatalar.length;
    await el.click(); await p.waitForTimeout(1200);
    const g = (await p.innerText("body")).replace(/\s+/g, " ");
    await p.screenshot({ path: `${SHOT}/usr-${ad.replace(/\s/g, "_")}.png` });
    ok(ad, g.length > 80 && hatalar.length === once, g.slice(0, 90));
    if (ad === "Para Çek") {
      const secici = await p.$(".tl-field select");
      ok("kayıtlı hesap seçici", Boolean(secici),
         secici ? await secici.evaluate((n) => n.options.length + " seçenek") : "yok");
    }
    await hesabaDon();
  }

  // Banka Hesaplarım (Hesap listesinden)
  {
    const bh = await p.$('text="Banka Hesaplarım"');
    if (!bh) ok("Banka Hesaplarım", false, "Hesap listesinde yok");
    else {
      const once = hatalar.length;
      await bh.click(); await p.waitForTimeout(1200);
      const g = (await p.innerText("body")).replace(/\s+/g, " ");
      await p.screenshot({ path: `${SHOT}/usr-banka.png` });
      ok("Banka Hesaplarım", hatalar.length === once && /IBAN|TR\d|Kayıtlı banka/.test(g), g.slice(-120));
      await hesabaDon();
    }
  }
  await p.close();
}

ok("tarayıcı hatası yok", hatalar.length === 0, hatalar.slice(0, 6).join(" | "));
console.log(hata ? `SONUC: SORUN ${hata}` : "SONUC: TAMAM");
await b.close();
process.exit(hata ? 1 : 0);
