/* Borsa seans takvimi ve mikro fiyat sapması birim testi.
   Kullanım: node tools/market_hours_test.mjs                                  */
import { isMarketOpen, getMaxDeviation, applyPriceDeviations } from "../src/esube/market.js";

let hata = 0;
const bekle = (ad, kosul, ek = "") => {
  console.log(`${kosul ? "TAMAM " : "SORUN "} ${ad}${ek ? " — " + ek : ""}`);
  if (!kosul) hata += 1;
};

/* İstanbul saatine göre bir an üret (UTC+3). */
const an = (metin) => new Date(`${metin}+03:00`);

/* ---- seans saatleri ---- */
bekle("hafta içi 10:00 açık", isMarketOpen(an("2026-09-29T10:00")) === true);
bekle("hafta içi 09:59 kapalı", isMarketOpen(an("2026-09-29T09:59")) === false);
bekle("hafta içi 18:04 açık", isMarketOpen(an("2026-09-29T18:04")) === true);
bekle("hafta içi 18:05 kapalı", isMarketOpen(an("2026-09-29T18:05")) === false);
bekle("cumartesi kapalı", isMarketOpen(an("2026-10-03T12:00")) === false);
bekle("pazar kapalı", isMarketOpen(an("2026-10-04T12:00")) === false);

/* ---- tatiller ---- */
bekle("29 Ekim kapalı", isMarketOpen(an("2026-10-29T12:00")) === false);
bekle("1 Ocak kapalı", isMarketOpen(an("2027-01-01T12:00")) === false);
bekle("23 Nisan kapalı", isMarketOpen(an("2027-04-23T12:00")) === false);
bekle("dini bayram kapalı (2026-05-28)", isMarketOpen(an("2026-05-28T12:00")) === false);

/* ---- yarım günler ---- */
bekle("28 Ekim 12:30 açık", isMarketOpen(an("2026-10-28T12:30")) === true);
bekle("28 Ekim 13:00 kapalı", isMarketOpen(an("2026-10-28T13:00")) === false);
bekle("arife 2026-05-26 12:30 açık", isMarketOpen(an("2026-05-26T12:30")) === true);
bekle("arife 2026-05-26 14:00 kapalı", isMarketOpen(an("2026-05-26T14:00")) === false);

/* ---- fiyat sapması sınırları ---- */
bekle("0-50 TL bandı 0,09", Math.abs(getMaxDeviation(30) - 0.09) < 1e-9, getMaxDeviation(30));
bekle("50-200 TL bandı 0,10", Math.abs(getMaxDeviation(120) - 0.10) < 1e-9, getMaxDeviation(120));
bekle("200+ TL bandı 0,20", Math.abs(getMaxDeviation(450) - 0.20) < 1e-9, getMaxDeviation(450));

/* ---- kümülatif sapma ve tek yönlü hareket sınırı ---- */
for (const [etiket, fiyat, sinir] of [["ucuz", 30, 0.09], ["orta", 120, 0.10], ["pahali", 450, 0.20]]) {
  const temel = [{ code: "TEST", symbol: "TEST", assetClass: "stock", price: fiyat, rawPrice: fiyat }];
  const durum = {};
  let enUzak = 0, ardisik = 0, enUzunArdisik = 0, oncekiYon = 0;
  let oncekiFiyat = fiyat;
  for (let i = 0; i < 2000; i += 1) {
    const cikti = applyPriceDeviations(temel, durum);
    const p = cikti[0].price;
    enUzak = Math.max(enUzak, Math.abs(p - fiyat));
    const yon = Math.sign(p - oncekiFiyat);
    if (yon !== 0 && yon === oncekiYon) ardisik += 1; else ardisik = 1;
    enUzunArdisik = Math.max(enUzunArdisik, ardisik);
    if (yon !== 0) oncekiYon = yon;
    oncekiFiyat = p;
  }
  bekle(`${etiket} hisse sapma bandı aşılmıyor`, enUzak <= sinir + 1e-6, enUzak.toFixed(4));
  bekle(`${etiket} hisse tek yönde 10+ adım yok`, enUzunArdisik < 10, enUzunArdisik);
}

/* Endeks ve döviz gibi hisse olmayan kayıtlara dokunulmamalı. */
{
  const temel = [{ code: "XU100", symbol: "XU100", assetClass: "index", price: 11048.12, rawPrice: 11048.12 }];
  const cikti = applyPriceDeviations(temel, {});
  bekle("endeks fiyatı sapmıyor", cikti[0].price === 11048.12, cikti[0].price);
}

console.log(hata ? `SONUC: SORUN ${hata}` : "SONUC: TAMAM");
process.exit(hata ? 1 : 0);
