// Hisse detay sayfası — fiyat grafiği, şirket bilgisi, haberler ve emir kısayolları.
import React, { useEffect, useMemo, useState } from "react";
import Icon from "./icons.jsx";
import { Symbol } from "./ui.jsx";
import { api } from "./store.js";
import { money, percent, volumeText } from "./market.js";
import { T, locale } from "./lang.js";

const RANGES = [
  { key: "1G", take: 24 },
  { key: "1H", take: 60 },
  { key: "1A", take: 120 },
  { key: "TÜM", take: 0 },
];

function PriceChart({ points, up, height = 190 }) {
  const width = 340;
  const [hover, setHover] = useState(null);
  if (!points || points.length < 2) {
    return <div className="sd-chart-empty">{T("Grafik için yeterli veri yok.")}</div>;
  }
  const values = points.map((point) => point.price);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = width / (values.length - 1);
  const at = (index) => [index * step, height - ((values[index] - min) / span) * (height - 26) - 14];
  let d = "";
  for (let i = 0; i < values.length; i += 1) {
    const [x, y] = at(i);
    if (i === 0) { d += `M${x.toFixed(1)} ${y.toFixed(1)}`; continue; }
    const [px, py] = at(i - 1);
    const cx = (px + x) / 2;
    d += `C${cx.toFixed(1)} ${py.toFixed(1)} ${cx.toFixed(1)} ${y.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  const tone = up ? "#16a34a" : "#e5484d";
  const id = up ? "sdu" : "sdd";
  const active = hover === null ? points.length - 1 : hover;
  const [hx, hy] = at(active);

  const pick = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - box.left) / box.width;
    setHover(Math.min(points.length - 1, Math.max(0, Math.round(ratio * (points.length - 1)))));
  };

  return (
    <div className="sd-chart">
      <div className="sd-chart-tip">
        <strong>{money(points[active].price)}</strong>
        <span>{points[active].label}</span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        onPointerDown={pick}
        onPointerMove={(event) => { if (event.buttons) pick(event); }}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={tone} stopOpacity=".26" />
            <stop offset="100%" stopColor={tone} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${d}L${width} ${height}L0 ${height}Z`} fill={`url(#${id})`} />
        <path d={d} fill="none" stroke={tone} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <line x1={hx} y1="0" x2={hx} y2={height} stroke="currentColor" strokeOpacity=".18" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <circle cx={hx} cy={hy} r="5" fill="#fff" stroke={tone} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

const Stat = ({ label, value, tone }) => (
  <div className="sd-stat">
    <span>{label}</span>
    <strong style={tone ? { color: tone } : undefined}>{value}</strong>
  </div>
);

export default function Stock({ code, instrument, holding, watched, onToggleWatch, onBack, onTrade, onOpenNews }) {
  const [data, setData] = useState(null);
  const [state, setState] = useState("loading");
  const [range, setRange] = useState(2);

  useEffect(() => {
    let alive = true;
    setState("loading");
    setData(null);
    api(`/api/company/${encodeURIComponent(code)}`)
      .then((payload) => { if (alive) { setData(payload); setState("live"); } })
      .catch(() => { if (alive) setState("failed"); });
    return () => { alive = false; };
  }, [code]);

  const quote = data?.quote || {};
  const price = Number(instrument?.price ?? quote.price ?? 0);
  const change = Number(instrument?.change ?? quote.change_pct ?? 0);
  const dayDelta = Number(instrument?.dayDelta ?? 0);
  const up = change >= 0;

  const points = useMemo(() => {
    const rows = data?.history || [];
    const take = RANGES[range].take;
    const sliced = take > 0 ? rows.slice(-take) : rows;
    return sliced.map((row) => ({
      price: Number(row.price || 0),
      label: new Date(Number(row.recorded_at || 0) * 1000).toLocaleString(locale(), {
        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
      }),
    }));
  }, [data, range]);

  const name = instrument?.name || quote.name || code;

  return (
    <div className="page sd-page">
      <div className="page-head with-tail">
        <button className="icon-btn" onClick={onBack} aria-label={T("Geri")}><Icon name="back" size={21} /></button>
        <span className="sd-head">
          <Symbol logo={instrument?.logo} letter={code} size={34} />
          <span>
            <b>{code}</b>
            <s>{name}</s>
          </span>
        </span>
        <button className="icon-btn round" onClick={onToggleWatch} aria-label={T("Takip listesi")}>
          <span style={{ color: watched ? "#f6b93b" : "var(--muted)", fontSize: 19, lineHeight: 1 }}>{watched ? "★" : "☆"}</span>
        </button>
      </div>

      <section className="mk-card">
        <div className="sd-price">
          <strong>{money(price)}</strong>
          <span className={`mk-badge ${up ? "up" : "down"}`}>
            {up ? "▲" : "▼"} {(up ? "+" : "−") + Math.abs(dayDelta).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({percent(Math.abs(change))})
          </span>
        </div>
        <div className="mk-range" style={{ marginTop: 14 }}>
          {RANGES.map((item, index) => (
            <button key={item.key} className={index === range ? "active" : ""} onClick={() => setRange(index)}>{item.key}</button>
          ))}
        </div>
        {state === "loading"
          ? <div className="sk sk-chart" />
          : <PriceChart points={points} up={up} />}
      </section>

      <section className="mk-card">
        <div className="mk-card-head" style={{ marginBottom: 12 }}>
          <h2>{T("Özet")}</h2>
        </div>
        <div className="sd-stats">
          <Stat label={T("Sektör")} value={data?.profile?.sector || "—"} />
          <Stat label={T("Faaliyet")} value={data?.profile?.industry || "—"} />
          <Stat label={T("Günlük değişim")} value={(up ? "+" : "−") + percent(Math.abs(change))} tone={up ? "var(--green)" : "var(--red)"} />
          <Stat label={T("İşlem hacmi")} value={instrument?.volume ? volumeText(instrument.volume * price) : "—"} />
          {holding?.quantity > 0 && (
            <>
              <Stat label={T("Portföyümdeki adet")} value={Number(holding.quantity).toLocaleString("tr-TR")} />
              <Stat label={T("Pozisyon değeri")} value={money(holding.value)} />
              <Stat label={T("Ortalama maliyet")} value={money(holding.avgCost)} />
              <Stat
                label={T("Kâr / zarar")}
                value={(holding.profit >= 0 ? "+" : "−") + money(Math.abs(holding.profit))}
                tone={holding.profit >= 0 ? "var(--green)" : "var(--red)"}
              />
            </>
          )}
        </div>
      </section>

      <section className="mk-card">
        <div className="mk-card-head" style={{ marginBottom: 10 }}>
          <h2>{T("Şirket hakkında")}</h2>
        </div>
        {state === "loading"
          ? <><div className="sk sk-line" /><div className="sk sk-line" /><div className="sk sk-line short" /></>
          : <p className="sd-about">{data?.profile?.description || T("Bu şirket için açıklama bulunmuyor.")}</p>}
        {data?.profile?.risk_note && <div className="sd-risk">{data.profile.risk_note}</div>}
      </section>

      {(data?.news || []).length > 0 && (
        <section className="mk-card">
          <div className="mk-card-head" style={{ marginBottom: 6 }}>
            <h2>{T("Şirket haberleri")}</h2>
          </div>
          {data.news.map((item, index) => (
            <React.Fragment key={item.link || index}>
              {index > 0 && <div className="hline" />}
              <button className="mk-news" onClick={() => onOpenNews?.(item)}>
                <span className={`thumb v${(index % 3) + 1}`}>
                  {item.image_url
                    ? <img src={item.image_url} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} />
                    : <Icon name="news" size={24} />}
                </span>
                <span>
                  <b>{item.title}</b>
                  {item.source && <span><Icon name="clock" size={13} />{item.source}</span>}
                </span>
              </button>
            </React.Fragment>
          ))}
        </section>
      )}

      {(data?.research_sources || []).length > 0 && (
        <section className="mk-card mk-menu">
          <div className="mk-card-head" style={{ marginBottom: 6 }}>
            <h2>{T("Araştırma kaynakları")}</h2>
          </div>
          {data.research_sources.map((source, index) => (
            <React.Fragment key={source.url}>
              {index > 0 && <div className="hline" />}
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="sd-source">
                <i className="tile t1"><Icon name="link" size={19} /></i>
                <span><b>{source.name}</b><s>{source.description}</s></span>
                <span className="chev"><Icon name="chevron" size={16} /></span>
              </a>
            </React.Fragment>
          ))}
          {data?.disclaimer && <div className="sd-note">{data.disclaimer}</div>}
        </section>
      )}

      {state === "failed" && (
        <div className="mk-empty">
          <Icon name="history" size={30} />
          <b>{T("Şirket bilgisi alınamadı")}</b>
          <span>{T("Bağlantını kontrol edip tekrar dene.")}</span>
        </div>
      )}

      <div className="sd-actions">
        <button className="mk-send sell" onClick={() => onTrade(false)}>{T("Sat")}</button>
        <button className="mk-send buy" onClick={() => onTrade(true)}>{T("Al")}</button>
      </div>
    </div>
  );
}
