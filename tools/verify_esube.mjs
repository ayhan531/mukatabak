// E-şube ve kurumsal site için uçtan uca tarayıcı doğrulaması.
// Kullanım: backend 8099 portunda ayaktayken  node tools/verify_esube.mjs
import { chromium } from "playwright";

/* ===== smoke.mjs ===== */
{
const B = "http://127.0.0.1:8099";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 420, height: 900 } });
const errs = [];
p.on("pageerror", (e) => errs.push("PAGEERROR: " + e.message));
p.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !/TUNNEL|ERR_INTERNET|Failed to load resource/.test(t)) errs.push("CONSOLE: " + t); });
const shot = (n) => p.screenshot({ path: `/tmp/sm-${n}.png` });

await p.goto(B + "/", { waitUntil: "domcontentloaded" });
await p.waitForTimeout(1200);
console.log("LANDING:", await p.title());
await shot("01-landing");

// giriş butonu
const btn = await p.$("button.corporate-login");
console.log("login button:", Boolean(btn));
await btn.click();
await p.waitForTimeout(800);
await shot("02-auth");
const inputs = await p.$$eval("input", (ns) => ns.map((n) => n.name || n.placeholder || n.type));
console.log("AUTH inputs:", JSON.stringify(inputs));

// TC + şifre
await p.fill('input[inputmode="numeric"], input[name="tc"]', "11111111110").catch(async () => {
  const all = await p.$$("input"); await all[0].fill("11111111110");
});
const pass = await p.$('input[type="password"]');
await pass.fill("Admin12345");
await p.keyboard.press("Enter");
await p.waitForTimeout(2500);
await shot("03-after-login");
console.log("AFTER LOGIN text:", (await p.innerText("body")).slice(0, 200).replace(/\n+/g, " | "));

const tabs = ["Ana Sayfa", "Hisseler", "Portföy", "Hesap"];
for (const t of tabs) {
  const el = await p.$(`.navbar >> text="${t}"`) || await p.$(`text="${t}"`);
  if (!el) { console.log("tab missing:", t); continue; }
  await el.click();
  await p.waitForTimeout(1200);
  await shot("04-" + t.replace(/\s/g, ""));
  const body = (await p.innerText("body")).replace(/\n+/g, " | ");
  console.log(`TAB ${t}:`, body.slice(0, 120), "|| len", body.length);
}
// Hisseler sekmesinde tüm hisse listesi ve tembel yükleme
{
  const el = await p.$('.navbar >> text="Hisseler"'); if (el) { await el.click(); await p.waitForTimeout(900); }
  const has = await p.$('text="Tüm Hisseler"');
  console.log("TUM HISSELER section:", Boolean(has));
  if (has) { await has.scrollIntoViewIfNeeded(); await p.waitForTimeout(600);
    let n = await p.$$eval(".inst-row", (ns) => ns.length); console.log("rows(before scroll):", n);
    for (let i = 0; i < 6; i++) { await p.mouse.wheel(0, 4000); await p.waitForTimeout(400); }
    n = await p.$$eval(".inst-row", (ns) => ns.length); console.log("rows(after scroll):", n);
    await p.screenshot({ path: "/tmp/sm-05-tumhisseler.png" });
  }
}
console.log("ERRORS", JSON.stringify(errs, null, 1));
await b.close();

}

/* ===== smoke2.mjs ===== */
{
const B = "http://127.0.0.1:8099";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 420, height: 900 } });
const errs = [];
p.on("pageerror", (e) => errs.push("PAGEERROR: " + e.message));
p.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !/TUNNEL|ERR_INTERNET|Failed to load resource/.test(t)) errs.push("CONSOLE: " + t); });
const shot = (n) => p.screenshot({ path: `/tmp/s2-${n}.png` });
const txt = async (n = 160) => (await p.innerText("body")).replace(/\n+/g, " | ").slice(0, n);

await p.goto(B + "/", { waitUntil: "domcontentloaded" });
await p.waitForTimeout(1000);
await (await p.$("button.corporate-login")).click();
await p.waitForTimeout(700);
await (await p.$$("input"))[0].fill("11111111110");
await (await p.$('input[type="password"]')).fill("Admin12345");
await p.keyboard.press("Enter");
await p.waitForTimeout(2500);

// 1) Hisse detay
await (await p.$('.navbar >> text="Hisseler"')).click();
await p.waitForTimeout(900);
await (await p.$(".inst-row")).click();
await p.waitForTimeout(1500);
console.log("STOCK DETAIL:", await txt(180));
await shot("01-stock");

// 2) Al panel
const al = await p.$('.sd-actions button.mk-send.buy');
if (al) { await al.click(); await p.waitForTimeout(1200); console.log("TRADE:", await txt(200)); await shot("02-trade");
  const amount = await p.$$('.mk-order-panel input:not([readonly])');
  console.log("order inputs:", amount.length);
  if (amount.length) { const last = amount[amount.length - 1]; await last.fill("40000"); await p.keyboard.press("Tab"); await p.waitForTimeout(700);
    console.log("AMOUNT after blur:", await last.inputValue()); }
  await shot("03-trade-amount");
  await p.keyboard.press("Escape"); await p.waitForTimeout(600);
}

// 3) Haberler
await p.keyboard.press("Escape"); await p.waitForTimeout(400);
await (await p.$('.navbar >> text="Ana Sayfa"')).click(); await p.waitForTimeout(900);
const tumu = await p.$('text="Tümü"');
if (tumu) { await tumu.click(); await p.waitForTimeout(1500); console.log("NEWS:", await txt(200)); await shot("04-news"); }

// 4) Hesap > Güvenlik
await (await p.$('.navbar >> text="Hesap"')).click(); await p.waitForTimeout(900);
const guv = await p.$('text="Güvenlik"');
if (guv) { await guv.click(); await p.waitForTimeout(900); console.log("GUVENLIK:", await txt(260)); await shot("05-security");
  const iki = await p.$('text="İki Adımlı Doğrulama"');
  if (iki) { await iki.click(); await p.waitForTimeout(800); const t = await txt(320); console.log("2FA:", t); console.log("2FA has SMS:", /SMS/.test(t)); await shot("06-2fa"); }
}
console.log("ERRORS", JSON.stringify(errs, null, 1));
await b.close();

}

/* ===== smoke3.mjs ===== */
{
const B = "http://127.0.0.1:8099";
const b = await chromium.launch();
const errs = [];
const wire = (p) => { p.on("pageerror", (e) => errs.push("PAGEERROR: " + e.message));
  p.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !/TUNNEL|ERR_INTERNET|Failed to load resource/.test(t)) errs.push("CONSOLE: " + t); }); };

// 1) masaüstü landing
const d = await b.newPage({ viewport: { width: 1440, height: 1000 } }); wire(d);
await d.goto(B + "/", { waitUntil: "domcontentloaded" }); await d.waitForTimeout(1500);
console.log("SPK badge:", await d.$$eval(".corporate-licence", (n) => n.map((x) => x.innerText)));
await d.screenshot({ path: "/tmp/s3-landing-desktop.png" });
await d.screenshot({ path: "/tmp/s3-landing-full.png", fullPage: true });
// kurumsal alt sayfalar
for (const [slug, name] of [["/kurumsal","Hakkımızda"],["/hizmetler","Hizmetler"],["/ucretler","Komisyon"],["/blog","Blog"],["/sss","SSS"],["/iletisim","İletişim"],["/sozlesmeler","Sözleşmeler"]]) {
  await d.goto(B + slug, { waitUntil: "domcontentloaded" }); await d.waitForTimeout(700);
  const h = await d.$eval("main h1, main h2", (n) => n.innerText).catch(() => "-");
  console.log("PAGE", slug, "->", h.replace(/\n/g, " "));
}

// 2) admin konsol
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } }); wire(p);
await p.goto(B + "/", { waitUntil: "domcontentloaded" }); await p.waitForTimeout(900);
await (await p.$("button.corporate-login")).click(); await p.waitForTimeout(700);
await (await p.$$("input"))[0].fill("11111111110");
await (await p.$('input[type="password"]')).fill("Admin12345");
await p.keyboard.press("Enter"); await p.waitForTimeout(2500);
const adm = await p.$('button[title="Admin"]');
console.log("admin entry:", Boolean(adm));
if (adm) { await adm.click(); await p.waitForTimeout(2200);
  const tabs = await p.$$eval(".admin-tabs button, nav button", (ns) => ns.map((n) => n.innerText).slice(0, 20)).catch(() => []);
  console.log("ADMIN tabs:", JSON.stringify(tabs));
  await p.screenshot({ path: "/tmp/s3-admin.png", fullPage: false });
  console.log("ADMIN text:", (await p.innerText("body")).replace(/\n+/g, " | ").slice(0, 260));
}
console.log("ERRORS", JSON.stringify(errs, null, 1));
await b.close();

}
