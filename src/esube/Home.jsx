// Ana Sayfa — Mukatabak 2.5.1 APK'sındaki ana ekranın birebir karşılığı.
import React, { useMemo, useState } from "react";
import Icon from "./icons.jsx";
import { Symbol, SearchBox } from "./ui.jsx";
import MiniSpark from "./mini.jsx";
import { listFor, search, amount, money, move, BIST } from "./market.js";
import { T } from "./lang.js";

/* ---------- hisse satırı (APK'daki Takip Listem / Sonuçlar satırı) ---------- */

export function InstrumentRow({ item, onClick }) {
  const up = Number(item.change) >= 0;
  return (
    <button className="inst-row" onClick={onClick}>
      <Symbol logo={item.logo} letter={item.symbol} size={44} />
      <span className="inst-copy">
        <strong>{item.symbol}</strong>
        <span>{item.name}</span>
      </span>
      <span className="inst-price">
        <strong>{amount(item.price, "")}</strong>
        <span className={up ? "up" : "down"}>
          {up ? "▲" : "▼"} {(up ? "+" : "−") + Math.abs(Number(item.dayDelta) || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({move(item.change).replace("+", "").replace("−", "")})
        </span>
      </span>
      <span className="inst-trail"><MiniSpark code={item.code} change={item.change} /></span>
    </button>
  );
}

/* ---------- üstteki yatay piyasa şeridi ---------- */

const TILES = [
  { code: "XAUUSD", label: "Ons Altın", tone: "g", icon: "wallet" },
  { code: "XAUTRY", label: "Gram Altın", tone: "g", icon: "wallet" },
  { code: "XU100", label: "BIST 100", tone: "", icon: "bars" },
  { code: "XU030", label: "BIST 30", tone: "", icon: "bars" },
  { code: "XBANK", label: "BIST Banka", tone: "", icon: "bank" },
  { code: "USDTRY", label: "Dolar", tone: "b", icon: "trend" },
  { code: "EURTRY", label: "Euro", tone: "b", icon: "trend" },
  { code: "XAGTRY", label: "Gram Gümüş", tone: "g", icon: "wallet" },
  { code: "BRENT", label: "Brent", tone: "b", icon: "trend" },
  { code: "BTCUSD", label: "Bitcoin", tone: "g", icon: "percent" },
];

export function MarketStrip({ instruments }) {
  const byCode = useMemo(() => new Map(instruments.map((item) => [item.code, item])), [instruments]);
  const tiles = TILES.map((tile) => ({ ...tile, item: byCode.get(tile.code) })).filter((tile) => tile.item);
  if (!tiles.length) {
    return (
      <div className="mk-strip">
        {[0, 1, 2].map((key) => (
          <div className="mk-tile" key={key}>
            <span className="sk sk-line short" style={{ width: "58%" }} />
            <span className="sk sk-line" style={{ width: "72%", height: 20 }} />
            <span className="sk sk-line short" style={{ width: "50%" }} />
            <span className="sk" style={{ height: 34, borderRadius: 8 }} />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="mk-strip">
      {tiles.map(({ code, label, tone, icon, item }) => {
        const up = Number(item.change) >= 0;
        return (
          <div className="mk-tile" key={code}>
            <span className="top">
              <i className={tone}><Icon name={icon} size={14} /></i>
              <span>{T(label)}</span>
            </span>
            <b>{Number(item.price).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
            <em className={up ? "up" : "down"}>
              {up ? "▲" : "▼"} {(up ? "+" : "−") + Math.abs(Number(item.dayDelta) || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({move(item.change).replace("+", "").replace("−", "")})
            </em>
            <MiniSpark code={code} change={item.change} width={144} height={34} />
          </div>
        );
      })}
    </div>
  );
}

/* ---------- haber satırı ---------- */

const ago = (value) => {
  if (!value) return "";
  const ts = typeof value === "number" ? value * 1000 : Date.parse(value);
  if (!ts || Number.isNaN(ts)) return "";
  const diff = Math.max(0, Date.now() - ts);
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return T("az önce");
  if (hours < 24) return `${hours} ${T("saat önce")}`;
  const days = Math.floor(hours / 24);
  if (days === 1) return T("Dün");
  return `${days} ${T("gün önce")}`;
};

/** "Borsa İstanbul · Başlık" gibi kaynak ön eklerini temizler (APK'da başlık yalın görünür). */
const cleanTitle = (title = "") => {
  const text = String(title).trim();
  const cut = text.split(/\s[·|–-]\s/);
  if (cut.length > 1 && cut[0].length <= 24) return cut.slice(1).join(" · ").trim();
  return text;
};

export function NewsRow({ item, index, onOpen }) {
  const [bozuk, setBozuk] = useState(false);
  const gorsel = item.image_url || item.photo_url || "";
  const fotoVar = Boolean(gorsel) && !bozuk;
  return (
    <button className="mk-news" onClick={() => onOpen?.(item)}>
      <span className={`thumb v${(index % 3) + 1}`}>
        {fotoVar ? (
          <img
            src={gorsel}
            alt=""
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setBozuk(true)}
            onLoad={(event) => {
              const g = event.currentTarget;
              // Yer tutucu görseller (çok küçük) yerine haber işareti gösterilir.
              if (g.naturalWidth < 80 || g.naturalHeight < 60) setBozuk(true);
            }}
          />
        ) : (
          <Icon name="news" size={26} />
        )}
      </span>
      <span>
        <b>{cleanTitle(item.title)}</b>
        <span><Icon name="clock" size={13} />{ago(item.published_at || item.time || item.published)}</span>
      </span>
    </button>
  );
}

/* ---------- ekran ---------- */

/** Veri gelene kadar gösterilen iskelet satırlar. */
const RowSkeleton = () => (
  <div className="inst-row" style={{ pointerEvents: "none" }}>
    <span className="sk sk-avatar" />
    <span className="inst-copy"><span className="sk sk-line" style={{ width: "42%" }} /><span className="sk sk-line short" style={{ width: "62%" }} /></span>
    <span className="inst-price"><span className="sk sk-line" style={{ width: 62 }} /><span className="sk sk-line short" style={{ width: 46 }} /></span>
    <span className="inst-trail" />
  </div>
);

export default function Home({
  brandBar, instruments, state, watchlist, openTrade, news, newsState, onOpenNews, onAllNews,
}) {
  const [query, setQuery] = useState("");
  const stocks = useMemo(() => listFor(BIST, instruments), [instruments]);
  const results = useMemo(() => search(query, stocks, 12), [query, stocks]);
  const watched = useMemo(
    () => watchlist.map((code) => stocks.find((item) => item.code === code)).filter(Boolean),
    [watchlist, stocks]
  );

  return (
    <div className="page">
      {brandBar}

      <MarketStrip instruments={instruments} />

      <SearchBox placeholder={T("Hisse ara")} value={query} onChange={setQuery} />

      {query ? (
        <section className="mk-card">
          <div className="mk-card-head">
            <h2>{T("Sonuçlar")}</h2>
            <span className="count">{results.length} {T("hisse")}</span>
          </div>
          {results.length ? (
            results.map((item, index) => (
              <React.Fragment key={item.code}>
                {index > 0 && <div className="hline" />}
                <InstrumentRow item={item} onClick={() => openTrade(item)} />
              </React.Fragment>
            ))
          ) : (
            <div className="mk-empty">
              <Icon name="search" size={30} />
              <b>{T("Sonuç bulunamadı")}</b>
              <span>{T("Başka bir sembol ya da şirket adı dene.")}</span>
            </div>
          )}
        </section>
      ) : (
        <>
          <section className="mk-card">
            <div className="mk-card-head">
              <span className="mk-chip-ico star">★</span>
              <h2>{T("Takip Listem")}</h2>
            </div>
            {state !== "live" && !watched.length ? (
              <><RowSkeleton /><div className="hline" /><RowSkeleton /><div className="hline" /><RowSkeleton /></>
            ) : watched.length ? (
              watched.map((item, index) => (
                <React.Fragment key={item.code}>
                  {index > 0 && <div className="hline" />}
                  <InstrumentRow item={item} onClick={() => openTrade(item)} />
                </React.Fragment>
              ))
            ) : (
              <div className="mk-empty">
                <Icon name="star" size={30} />
                <b>{T("Takip listen boş")}</b>
                <span>{T("Bir hisseyi açıp yıldıza dokunarak listene ekleyebilirsin.")}</span>
              </div>
            )}
          </section>

          <section className="mk-card">
            <div className="mk-card-head">
              <h2>{T("Piyasalardan Son Haberler")}</h2>
              {onAllNews && <button className="mk-all" onClick={onAllNews}>{T("Tümü")}</button>}
            </div>
            {newsState !== "live" && !news?.length ? (
              <><div className="mk-news"><span className="sk sk-thumb" /><span><span className="sk sk-line" /><span className="sk sk-line short" /></span></div>
                <div className="mk-news"><span className="sk sk-thumb" /><span><span className="sk sk-line" /><span className="sk sk-line short" /></span></div></>
            ) : news?.length ? (
              news.slice(0, 6).map((item, index) => (
                <NewsRow key={item.id || item.link || index} item={item} index={index} onOpen={onOpenNews} />
              ))
            ) : (
              <div className="mk-empty">
                <Icon name="news" size={30} />
                <b>{T(newsState === "failed" ? "Haber akışı alınamadı" : "Haberler yükleniyor…")}</b>
                <span>{T("Birazdan tekrar dene.")}</span>
              </div>
            )}
          </section>

          {state === "failed" && !instruments.length && (
            <div className="mk-empty">
              <Icon name="history" size={30} />
              <b>{T("Piyasa verisi alınamadı")}</b>
              <span>{T("Bağlantını kontrol edip sayfayı yenile.")}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export { money };
