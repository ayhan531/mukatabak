// Haberler — piyasa sekmelerine göre canlı akış ve haber detayı.
import React, { useMemo, useState } from "react";
import Icon from "./icons.jsx";
import { SearchBox } from "./ui.jsx";
import { MARKET_NAMES, fold } from "./market.js";
import { T, locale } from "./lang.js";

const newsDate = (value) =>
  value && !Number.isNaN(Date.parse(value))
    ? new Date(value).toLocaleString(locale(), { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })
    : "";

/** Satır içinde tek satıra sığan kısa tarih. */
const shortDate = (value) =>
  value && !Number.isNaN(Date.parse(value))
    ? new Date(value).toLocaleString(locale(), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : "";

const cleanTitle = (title = "") => {
  const text = String(title).trim();
  const cut = text.split(/\s[·|–-]\s/);
  if (cut.length > 1 && cut[0].length <= 24) return cut.slice(1).join(" · ").trim();
  return text;
};

/* Haber satırı: gerçek fotoğrafla. Görsel gelmezse ya da yer tutucu kadar
   küçükse satır işaretle gösterilir; liste hiçbir zaman boş kare göstermez. */
function NewsRow({ item, index, onOpen }) {
  const [bozuk, setBozuk] = useState(false);
  const gorsel = item.image_url || item.photo_url || "";
  const fotoVar = Boolean(gorsel) && !bozuk;
  return (
    <button className="mk-news" onClick={() => onOpen(item)}>
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
              if (g.naturalWidth < 80 || g.naturalHeight < 60) setBozuk(true);
            }}
          />
        ) : (
          <Icon name="news" size={24} />
        )}
      </span>
      <span>
        <b>{cleanTitle(item.title)}</b>
        <span><Icon name="clock" size={13} />{shortDate(item.published_at) || item.source || ""}</span>
      </span>
    </button>
  );
}

export function Article({ item, onBack }) {
  const [gorselBozuk, setGorselBozuk] = useState(false);
  return (
    <div className="page">
      <div className="page-head with-tail">
        <button className="icon-btn" onClick={onBack} aria-label={T("Geri")}><Icon name="back" size={21} /></button>
        <span>
          <h1 style={{ margin: 0, fontSize: "calc(20px * var(--s))", fontWeight: 700 }}>{T("Haber")}</h1>
          {item.published_at && <span className="mk-sub">{newsDate(item.published_at)}</span>}
        </span>
        <span />
      </div>
      <section className="mk-card">
        {item.image_url && !gorselBozuk && (
          <div className="article-photo">
            <img
              src={item.image_url}
              alt=""
              decoding="async"
              referrerPolicy="no-referrer"
              onError={() => setGorselBozuk(true)}
              onLoad={(event) => {
                const g = event.currentTarget;
                // Boş/yer tutucu görseller (çok küçük ya da aşırı ince) gösterilmez.
                if (g.naturalWidth < 120 || g.naturalHeight < 80) setGorselBozuk(true);
              }}
            />
          </div>
        )}
        <h2 style={{ margin: "4px 0 12px", fontSize: "calc(21px * var(--s))", fontWeight: 700, lineHeight: 1.32 }}>
          {cleanTitle(item.title || T("Haber"))}
        </h2>
        <div className="article-body">{item.body || item.summary || T("Bu haber için özet metni bulunmuyor.")}</div>
        {item.source && (
          <div className="sd-note" style={{ marginTop: 14 }}>
            {T("Kaynak:")} {item.source}
            {item.link && (
              <> · <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontWeight: 600 }}>{T("Habere git")}</a></>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default function News({ marketTab, setMarketTab, items, state, onOpen, onBack }) {
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const needle = fold(query);
    if (!needle) return items;
    return items.filter((item) => fold(item.title || "").includes(needle));
  }, [items, query]);

  const tabs = [0, 1, 2, 3, 4];

  return (
    <div className="page">
      <div className="mk-title">
        <h1>{T("Haberler")}</h1>
        {onBack && (
          <button className="icon-btn round" onClick={onBack} aria-label={T("Geri")}>
            <Icon name="back" size={20} />
          </button>
        )}
      </div>

      <SearchBox placeholder={T("Haber ara")} value={query} onChange={setQuery} />

      <div className="mk-tabs news-tabs">
        {tabs.map((index) => (
          <button key={index} className={index === marketTab ? "active" : ""} onClick={() => setMarketTab(index)}>
            {T(MARKET_NAMES[index])}
          </button>
        ))}
      </div>

      <section className="mk-card">
        {state !== "live" && !shown.length ? (
          <>
            {[0, 1, 2, 3].map((key) => (
              <div className="mk-news" key={key}>
                <span className="sk sk-thumb" />
                <span><span className="sk sk-line" /><span className="sk sk-line short" /></span>
              </div>
            ))}
          </>
        ) : shown.length ? (
          shown.map((item, index) => (
            <React.Fragment key={item.link || item.id || index}>
              {index > 0 && <div className="hline" />}
              <NewsRow item={item} index={index} onOpen={onOpen} />
            </React.Fragment>
          ))
        ) : (
          <div className="mk-empty">
            <Icon name="news" size={30} />
            <b>{T(query ? "Sonuç bulunamadı" : "Haber akışı alınamadı")}</b>
            <span>{T(query ? "Başka bir kelime dene." : "Birazdan tekrar dene.")}</span>
          </div>
        )}
      </section>
    </div>
  );
}
