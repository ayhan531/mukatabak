// Hisseler — APK'daki ikinci sekmenin birebir karşılığı.
import React, { useMemo, useState } from "react";
import Icon from "./icons.jsx";
import { SearchBox, LazyList } from "./ui.jsx";
import { InstrumentRow } from "./Home.jsx";
import { listFor, search, movers, BIST, MARKET_NAMES, MARKET_TAB_ORDER, MARKET_CONTACT_TEXT, TRADABLE_MARKETS } from "./market.js";
import { T } from "./lang.js";

const Group = ({ tone, title, items, openTrade }) => (
  <section className="mk-card">
    <div className="mk-card-head">
      <span className={`mk-chip-ico ${tone}`}>{tone === "up" ? "↑" : "↓"}</span>
      <h2>{title}</h2>
      <span className="count">{items.length} {T("hisse")}</span>
    </div>
    {items.length ? (
      items.map((item, index) => (
        <React.Fragment key={item.code}>
          {index > 0 && <div className="hline" />}
          <InstrumentRow item={item} onClick={() => openTrade(item)} />
        </React.Fragment>
      ))
    ) : (
      <div className="mk-empty">
        <Icon name="bars" size={28} />
        <b>{T("Kayıt yok")}</b>
        <span>{T("Bu listede gösterilecek kayıt yok.")}</span>
      </div>
    )}
  </section>
);

export default function Stocks({ instruments, state, unread, onNotifications, openTrade, onNotice }) {
  const [query, setQuery] = useState("");
  /* Piyasa sekmeleri: BIST Tüm, 100, 50, 30, Katılım, Halka Arz, Fon, Döviz.
     Katılım listesi backend'den (Borsa İstanbul dosyası) gelen bayrağa göre süzülür. */
  const [tab, setTab] = useState(BIST);
  const stocks = useMemo(() => listFor(tab, instruments), [tab, instruments]);
  const results = useMemo(() => search(query, stocks, 500), [query, stocks]);
  const up = useMemo(() => movers(stocks, true, 7), [stocks]);
  const down = useMemo(() => movers(stocks, false, 7), [stocks]);
  const all = useMemo(
    () => stocks.slice().sort((a, b) => String(a.symbol).localeCompare(String(b.symbol), "tr")),
    [stocks],
  );

  return (
    <div className="page">
      <div className="mk-title">
        <h1>{T("Hisseler")}</h1>
        <button className="icon-btn round" onClick={onNotifications} aria-label={T("Bildirimler")}>
          <Icon name="bell" size={21} />
          {unread > 0 && <i className="dot" />}
        </button>
      </div>

      <SearchBox placeholder={T("Hisse ara")} value={query} onChange={setQuery} />

      <div className="mk-piyasa-seg">
        {MARKET_TAB_ORDER.map((index) => (
          <button
            key={index}
            className={tab === index ? "on" : ""}
            onClick={() => { setTab(index); setQuery(""); }}
          >
            {T(MARKET_NAMES[index])}
          </button>
        ))}
      </div>

      {query ? (
        <section className="mk-card">
          <div className="mk-card-head">
            <h2>{T("Sonuçlar")}</h2>
            <span className="count">{results.length} {T("hisse")}</span>
          </div>
          {results.length ? (
            <LazyList
              items={results}
              render={(item) => <InstrumentRow key={item.code} item={item} onClick={() => openTrade(item)} />}
            />
          ) : (
            <div className="mk-empty">
              <Icon name="search" size={30} />
              <b>{T("Sonuç bulunamadı")}</b>
              <span>{T("Başka bir sembol ya da şirket adı dene.")}</span>
            </div>
          )}
        </section>
      ) : state !== "live" && !stocks.length ? (
        <div className="mk-empty">
          <Icon name="history" size={30} />
          <b>{T(state === "failed" ? "Piyasa verisi alınamadı" : "Piyasa verisi yükleniyor…")}</b>
          <span>{T("Bağlantını kontrol edip sayfayı yenile.")}</span>
        </div>
      ) : (
        <>
          {tab === BIST && <Group tone="up" title={T("En Çok Yükselenler")} items={up} openTrade={openTrade} />}
          {tab === BIST && <Group tone="down" title={T("En Çok Düşenler")} items={down} openTrade={openTrade} />}
          {!TRADABLE_MARKETS.has(tab) && MARKET_CONTACT_TEXT[tab] && (
            <div className="mk-bilgi"><Icon name="info" size={17} /><span>{T(MARKET_CONTACT_TEXT[tab])}</span></div>
          )}
          {/* Aramaya gerek kalmadan seçili piyasadaki bütün kayıtlar listelenir. */}
          <section className="mk-card">
            <div className="mk-card-head">
              <h2>{tab === BIST ? T("Tüm Hisseler") : T(MARKET_NAMES[tab])}</h2>
              <span className="count">{all.length} {T("hisse")}</span>
            </div>
            <LazyList
              items={all}
              render={(item) => <InstrumentRow key={item.code} item={item} onClick={() => openTrade(item)} />}
            />
          </section>
        </>
      )}
    </div>
  );
}
