// Fiyat sapmasinin matematigini dogrudan sinar (tarayici gerekmez).
import { applyPriceDeviations, getMaxDeviation, getDeviationSteps } from '../src/esube/market.js';
let hata = 0;
const ok = (ad, k, ek='') => { console.log(`${k?'TAMAM ':'SORUN '} ${ad}${ek?' — '+ek:''}`); if(!k) hata++; };

ok('bant 0-50 (orantili: fiyatin binde 2si, en fazla 0.09)', getMaxDeviation(35) === 0.07 && getMaxDeviation(45) === 0.09, 'geldi ' + getMaxDeviation(35) + ' / ' + getMaxDeviation(45));
ok('ucuz hisse en az 0.01', getMaxDeviation(2) === 0.01 && getMaxDeviation(0.5) === 0.01, 'geldi ' + getMaxDeviation(2));
ok('bant 50-200',  getMaxDeviation(169.8)=== 0.10, 'geldi ' + getMaxDeviation(169.8));
ok('bant 200+',    getMaxDeviation(383.25)=== 0.20, 'geldi ' + getMaxDeviation(383.25));
ok('adim boylari', JSON.stringify(getDeviationSteps(0.20))==='[0.02,0.03,0.04,0.05]' && JSON.stringify(getDeviationSteps(0.01))==='[0.01]');

// 20.000 adim boyunca sinir asimi ve ardisik yon denetimi
const semboller = [
  {code:'UCUZ',  assetClass:'stock', price:35,     rawPrice:35},
  {code:'ORTA',  assetClass:'stock', price:169.8,  rawPrice:169.8},
  {code:'PAHALI',assetClass:'stock', price:383.25, rawPrice:383.25},
  {code:'ENDEKS',assetClass:'index', price:12290,  rawPrice:12290},
  {code:'FON',   assetClass:'fund',  price:12.34,  rawPrice:12.34},
];
const durum = {};
let asim = 0, enUzunSeri = 0, degisenAdim = 0, endeksOynadi = 0, fonOynadi = 0;
let onceki = null;
for (let i=0;i<20000;i++){
  const c = applyPriceDeviations(semboller, durum);
  for (const x of c){
    if (x.assetClass !== 'stock'){
      const t = semboller.find(s=>s.code===x.code);
      if (x.price !== t.price) { if(x.assetClass==='index') endeksOynadi++; else fonOynadi++; }
      continue;
    }
    const t = semboller.find(s=>s.code===x.code);
    const d = Math.round((x.price - t.rawPrice)*100)/100;
    const mx = getMaxDeviation(t.rawPrice);
    if (Math.abs(d) > mx + 1e-9) asim++;
    const st = durum[x.code];
    if (st && st.streak > enUzunSeri) enUzunSeri = st.streak;
  }
  const im = c.find(x=>x.code==='ORTA').price;
  if (onceki !== null && im !== onceki) degisenAdim++;
  onceki = im;
}
ok('sinir hic asilmadi', asim===0, 'asim=' + asim);
ok('ardisik ayni yon <= 3', enUzunSeri<=3, 'en uzun seri=' + enUzunSeri);
ok('endeks sapmiyor', endeksOynadi===0, 'oynama=' + endeksOynadi);
ok('fon sapmiyor', fonOynadi===0, 'oynama=' + fonOynadi);
ok('fiyat gercekten oynuyor', degisenAdim > 19000, 'degisen adim=' + degisenAdim + '/20000');

// dagilim: sapma her iki yone de gidiyor mu
const d2 = {}; const ornek=[];
for (let i=0;i<4000;i++){ const c=applyPriceDeviations(semboller,d2); ornek.push(Math.round((c[1].price-169.8)*100)/100); }
const arti = ornek.filter(x=>x>0).length, eksi = ornek.filter(x=>x<0).length;
ok('iki yone de sapiyor', arti>300 && eksi>300, `+${arti} / -${eksi}`);
ok('maksimuma yaklasiyor', Math.max(...ornek.map(Math.abs)) >= 0.08, 'en buyuk=' + Math.max(...ornek.map(Math.abs)));

// BIST %10 tavan/taban: kilitli tahta oynamaz, sapma tavani/tabani asmaz
{
  const kilit = [
    {code:'TAVAN', assetClass:'stock', price:110, rawPrice:110, previousClose:100, rawChange:10, change:10},
    {code:'TABAN', assetClass:'stock', price:90,  rawPrice:90,  previousClose:100, rawChange:-10, change:-10},
    {code:'TAVANA_YAKIN', assetClass:'stock', price:109.9, rawPrice:109.9, previousClose:100, rawChange:9.9, change:9.9},
    {code:'TABANA_YAKIN', assetClass:'stock', price:93,  rawPrice:93,  previousClose:100, rawChange:-7, change:-7},
  ];
  const dk = {}; let kilitOynadi = 0, tavanAsti = 0, tabanAsti = 0, yuzdeAsti = 0;
  for (let i=0;i<20000;i++){
    for (const x of applyPriceDeviations(kilit, dk)){
      if ((x.code==='TAVAN' && x.price!==110) || (x.code==='TABAN' && x.price!==90) || (x.code==='TAVANA_YAKIN' && x.price!==109.9)) kilitOynadi++;
      if (x.price > 109.95 + 1e-9 && x.code!=='TAVAN' && x.code!=='TAVANA_YAKIN') tavanAsti++;
      if (x.price < 90.05 - 1e-9 && x.code!=='TABAN') tabanAsti++;
      if (x.change > 9.95 + 1e-9 && x.code!=='TAVAN' && x.code!=='TAVANA_YAKIN' || x.change < -9.95 - 1e-9 && x.code!=='TABAN') yuzdeAsti++;
    }
  }
  ok('tavana/tabana kilitli tahta oynamaz', kilitOynadi===0, 'oynayan=' + kilitOynadi);
  ok('sapma tavan/tabani asmaz', tavanAsti===0 && tabanAsti===0 && yuzdeAsti===0, `tavanAsti=${tavanAsti} tabanAsti=${tabanAsti} yuzdeAsti=${yuzdeAsti}`);
}

console.log(hata ? 'SONUC: SORUN' : 'SONUC: TAMAM');
process.exit(hata?1:0);
