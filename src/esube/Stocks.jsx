// Hisseler — APK'daki ikinci sekmenin birebir karşılığı.
import React, { useMemo, useState } from "react";
import Icon from "./icons.jsx";
import { SearchBox } from "./ui.jsx";
import { InstrumentRow } from "./Home.jsx";
import { listFor, search, movers, BIST } from "./market.js";
import { T } from "./lang.js";

const Group = ({ tone, title, items, openTrade }) => (
  <section className="mk-card">
    <div className="mk-card-head">
      <span className={`mk-chip-ico ${tone}`}>{tone === "up" ? "↑" : "↓"}</span>
      <h2>{title}</h2>
      <span className="count">{items.length} {T("pay")}</span>
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
        <span>{T("Piyasa açıldığında burası dolar.")}</span>
      </div>
    )}
  </section>
);

export default function Stocks({ instruments, state, unread, onNotifications, openTrade }) {
  const [query, setQuery] = useState("");
  const stocks = useMemo(() => listFor(BIST, instruments), [instruments]);
  const results = useMemo(() => search(query, stocks, 20), [query, stocks]);
  const up = useMemo(() => movers(stocks, true, 7), [stocks]);
  const down = useMemo(() => movers(stocks, false, 7), [stocks]);

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

      {query ? (
        <section className="mk-card">
          <div className="mk-card-head">
            <h2>{T("Sonuçlar")}</h2>
            <span className="count">{results.length} {T("pay")}</span>
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
      ) : state !== "live" && !stocks.length ? (
        <div className="mk-empty">
          <Icon name="history" size={30} />
          <b>{T(state === "failed" ? "Piyasa verisi alınamadı" : "Piyasa verisi yükleniyor…")}</b>
          <span>{T("Bağlantını kontrol edip sayfayı yenile.")}</span>
        </div>
      ) : (
        <>
          <Group tone="up" title={T("En Çok Yükselenler")} items={up} openTrade={openTrade} />
          <Group tone="down" title={T("En Çok Düşenler")} items={down} openTrade={openTrade} />
        </>
      )}
    </div>
  );
}
