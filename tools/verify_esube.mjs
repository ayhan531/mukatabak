/* Uçtan uca tarayıcı doğrulaması: kurumsal site (masaüstü + telefon),
   giriş/kayıt ekranı ve e-şube.
   Kullanım:  PORT=8099 python3 tools/backend_server.py &
              node tools/verify_esube.mjs [taban-adres]              */
import { createRequire } from "node:module";

const require_ = createRequire(import.meta.url);
let chromium;
for (const yol of ["playwright", "playwright-core", "/home/claude/.npm-global/lib/node_modules/playwright/index.js"]) {
  try { ({ chromium } = require_(yol)); break; } catch { /* sonrakini dene */ }
}
if (!chromium) { console.error("playwright bulunamadı (npm i -D playwright)"); process.exit(2); }

const TABAN = process.argv[2] || process.env.TABAN || "http://127.0.0.1:8099";
const TC = process.env.TEST_TC || "11111111110";
const SIFRE = process.env.TEST_SIFRE || "Admin12345";
const SHOT = process.env.SHOT_DIR || "/tmp";

let hata = 0;
const ok = (ad, kosul, ek = "") => { console.log(`${kosul ? "TAMAM " : "SORUN "} ${ad}${ek ? " — " + ek : ""}`); if (!kosul) hata += 1; };

const tarayici = await chromium.launch();
const hatalar = [];
const dinle = (p) => {
  p.on("pageerror", (e) => hatalar.push("PAGEERROR " + e.message));
  p.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !/Failed to load resource|TUNNEL|ERR_INTERNET/.test(t)) hatalar.push("CONSOLE " + t); });
};

const giris = async (p) => {
  await p.click("button.corporate-login");
  await p.waitForTimeout(700);
  await (await p.$$("input"))[0].fill(TC);
  await (await p.$('input[type="password"]')).fill(SIFRE);
  await p.keyboard.press("Enter");
  await p.waitForTimeout(2600);
};

/* ---------- 1) masaüstü kurumsal site ---------- */
{
  const p = await (await tarayici.newContext({ viewport: { width: 1440, height: 950 } })).newPage();
  dinle(p);
  await p.goto(TABAN + "/", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1600);
  ok("masaüstü başlık", /Mukatabak/.test(await p.title()), await p.title());
  ok("SPK şeridi", (await p.$$(".corporate-licence")).length === 1);
  ok("canlı bant", (await p.$$(".corporate-band-lane span")).length >= 8);
  await p.screenshot({ path: `${SHOT}/v-masaustu.png` });
  for (const [yol, baslik] of [["/kurumsal", "Hakkımızda"], ["/hizmetler", "Hizmetlerimiz"], ["/ucretler", "Komisyon & Ücretler"],
                               ["/blog", "Blog"], ["/sss", "SSS"], ["/iletisim", "İletişim"], ["/sozlesmeler", "Sözleşmeler"]]) {
    await p.goto(TABAN + yol, { waitUntil: "domcontentloaded" }); await p.waitForTimeout(600);
    const h = await p.$eval("main h1, main h2", (n) => n.innerText).catch(() => "-");
    ok("sayfa " + yol, h.trim().startsWith(baslik), h.replace(/\n/g, " "));
  }
  await p.close();
}

/* ---------- 2) telefon: kurumsal site ---------- */
{
  const ctx = await tarayici.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); dinle(p);
  await p.goto(TABAN + "/", { waitUntil: "domcontentloaded" }); await p.waitForTimeout(1600);
  const tasma = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok("telefonda yatay taşma yok", tasma <= 0, "fark " + tasma);
  await p.click(".corporate-menu"); await p.waitForTimeout(400);
  ok("mobil menü açılıyor", (await p.$$(".corporate-nav nav.open a")).length >= 6);
  await p.click(".corporate-menu"); await p.waitForTimeout(300);
  const sec = await p.$(".corporate-numbers");
  await sec.scrollIntoViewIfNeeded(); await p.waitForTimeout(2200);
  const rakam = await p.$$eval(".corporate-numbers strong", (n) => n.map((x) => x.textContent));
  ok("rakamlar sayıyor", rakam.every((x) => x && !/^0/.test(x)), rakam.join(" · "));
  await p.screenshot({ path: `${SHOT}/v-telefon-ana.png`, fullPage: true });
  await p.close();
}

/* ---------- 3) telefon: giriş / kayıt ekranı ---------- */
{
  const ctx = await tarayici.newContext({ viewport: { width: 390, height: 640 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); dinle(p);
  await p.goto(TABAN + "/", { waitUntil: "domcontentloaded" }); await p.waitForTimeout(1300);
  await p.click("button.corporate-login"); await p.waitForTimeout(800);
  const ho = await p.$('text="Hesap Oluştur"'); if (ho) { await ho.click(); await p.waitForTimeout(600); }
  const o = await p.evaluate(() => {
    const g = document.querySelector(".auth-screen");
    const d = [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Hesap Oluştur" && b.classList.contains("confirm"));
    return {
      belgeKaydiriyor: document.documentElement.scrollHeight > innerHeight + 20,
      ekranTam: g ? Math.round(g.getBoundingClientRect().width) : 0,
      vw: innerWidth,
      gonderVar: Boolean(d),
      gonderAlt: d ? Math.round(d.getBoundingClientRect().bottom + scrollY) : 0,
      sayfaYuk: document.documentElement.scrollHeight,
    };
  });
  ok("kayıt formu sayfa kaydırmalı", o.belgeKaydiriyor, JSON.stringify(o));
  ok("giriş ekranı tam genişlik", o.ekranTam === o.vw, `${o.ekranTam}/${o.vw}`);
  ok("Hesap Oluştur düğmesi sayfada", o.gonderVar && o.gonderAlt <= o.sayfaYuk);
  await p.screenshot({ path: `${SHOT}/v-telefon-kayit.png`, fullPage: true });
  await p.close();
}

/* ---------- 4) telefon: e-şube ---------- */
{
  const ctx = await tarayici.newContext({ viewport: { width: 390, height: 664 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); dinle(p);
  await p.goto(TABAN + "/", { waitUntil: "domcontentloaded" }); await p.waitForTimeout(1200);
  await giris(p);
  ok("e-şube açıldı", (await p.$$(".navbar")).length === 1);
  for (const t of ["Hisseler", "Portföy", "Hesap", "Ana Sayfa"]) {
    const el = await p.$(`.navbar >> text="${t}"`);
    if (!el) { ok("sekme " + t, false, "bulunamadı"); continue; }
    await el.click(); await p.waitForTimeout(1200);
    const g = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok("sekme " + t, g <= 0, "taşma " + g);
    await p.screenshot({ path: `${SHOT}/v-esube-${t.replace(/\s/g, "")}.png` });
  }
  await p.close();
}

ok("tarayıcı hatası yok", hatalar.length === 0, hatalar.join(" | "));
console.log(hata ? `SONUC: SORUN ${hata}` : "SONUC: TAMAM");
await tarayici.close();
process.exit(hata ? 1 : 0);
