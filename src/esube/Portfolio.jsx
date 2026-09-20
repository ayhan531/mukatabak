// Portföy — Mukatabak 2.5.1 APK'sındaki "Portföyüm" ekranının birebir karşılığı.
import React, { useMemo, useState } from "react";
import Icon from "./icons.jsx";
import { Symbol, Sheet } from "./ui.jsx";
import MiniSpark from "./mini.jsx";
import { money, percent, signed } from "./market.js";
import { T, locale } from "./lang.js";

const pctText = (value) => (value >= 0 ? "+" : "−") + percent(Math.abs(value || 0));
const tr2 = (value) => Number(value || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const tr0 = (value) => Number(value || 0).toLocaleString("tr-TR", { maximumFractionDigits: 0 });

/* ---------- gerçek kapanışlardan portföy serisi ---------- */

const portfolioSeries = (series, holdings) => {
  const held = holdings.filter((item) => item.quantity > 0 && Array.isArray(series?.[item.symbol]) && series[item.symbol].length > 1);
  if (!held.length) return [];
  const days = [...new Set(held.flatMap((item) => series[item.symbol].map((row) => row.day)))].sort();
  const out = [];
  for (const day of days) {
    let total = 0;
    let complete = true;
    for (const item of held) {
      const rows = series[item.symbol];
      let close = null;
      for (const row of rows) { if (row.day <= day) close = row.close; else break; }
      if (close === null) { complete = false; break; }
      total += item.quantity * close;
    }
    if (complete) out.push({ day, value: total });
  }
  return out;
};

const parseAvgCost = (note = "") => {
  const match = /Ortalama maliyet:\s*([\d.,]+)/.exec(note);
  return match ? Number(match[1].replace(",", ".")) : 0;
};
const parseFee = (note = "") => {
  const match = /Komisyon:\s*([\d.,]+)/.exec(note);
  return match ? Number(match[1].replace(",", ".")) : 0;
};

export function toTrade(row) {
  const buy = row.transaction_type === "trade_buy";
  const quantity = Number(row.quantity || 0);
  const price = Number(row.price || 0);
  const total = quantity * price;
  const avgCost = buy ? price : parseAvgCost(row.note) || price;
  const fee = parseFee(row.note);
  const net = buy ? total + fee : total - fee;
  const profit = buy ? 0 : net - quantity * avgCost;
  return {
    symbol: row.code || "",
    name: row.name || row.code || "",
    buy, quantity, price, total, fee, net, avgCost, profit,
    profitPercent: avgCost && quantity ? (profit / (quantity * avgCost)) * 100 : 0,
    date: new Date((Number(row.created_at) || 0) * 1000),
  };
}

/* ---------- alan grafiği (Portföy Performansı) ---------- */

function AreaChart({ values, height = 150 }) {
  const width = 320;
  if (!values || values.length < 2) return <div style={{ height }} />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = width / (values.length - 1);
  const at = (i) => [i * step, height - ((values[i] - min) / span) * (height - 14) - 7];
  let d = "";
  for (let i = 0; i < values.length; i += 1) {
    const [x, y] = at(i);
    if (i === 0) { d += `M${x.toFixed(1)} ${y.toFixed(1)}`; continue; }
    const [px, py] = at(i - 1);
    const cx = (px + x) / 2;
    d += `C${cx.toFixed(1)} ${py.toFixed(1)} ${cx.toFixed(1)} ${y.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  const up = values[values.length - 1] >= values[0];
  const tone = up ? "#22c55e" : "#e5484d";
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id={`mkpf-${up ? "u" : "d"}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tone} stopOpacity=".26" />
          <stop offset="100%" stopColor={tone} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d}L${width} ${height}L0 ${height}Z`} fill={`url(#mkpf-${up ? "u" : "d"})`} />
      <path d={d} fill="none" stroke={tone} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* ---------- işlem detayı ---------- */

export function TransactionDetail({ trade, logo, onClose }) {
  const tone = trade.profit >= 0 ? "var(--green)" : "var(--red)";
  const Row = ({ label, value, strong }) => (
    <div className="detail-row">
      <span className="l" style={{ color: "var(--muted)" }}>{label}</span>
      <span className="v" style={strong ? { fontWeight: 700 } : undefined}>{value}</span>
    </div>
  );
  const head = (
    <div style={{ display: "grid", gridTemplateColumns: "42px 1fr", gap: 11, alignItems: "center" }}>
      <Symbol logo={logo} letter={trade.symbol} size={42} />
      <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <strong style={{ fontSize: "calc(18px * var(--s))" }}>{trade.symbol}</strong>
        <span style={{ fontSize: "calc(13px * var(--s))", color: "var(--muted)" }}>{trade.name}</span>
      </span>
    </div>
  );
  return (
    <Sheet title={head} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <span className={`mk-tag ${trade.buy ? "buy" : "sell"}`} style={{ alignSelf: "flex-start" }}>{T(trade.buy ? "ALIŞ" : "SATIŞ")}</span>
        {!trade.buy && (
          <div className="mk-duo" style={{ marginTop: 0 }}>
            <div>
              <span className="k">{T("Net kâr / zarar")}</span>
              <span className="v" style={{ color: tone }}>{signed(trade.profit)}</span>
            </div>
            <div>
              <span className="k">{T("K/Z Oranı")}</span>
              <span className="v" style={{ color: tone }}>{pctText(trade.profitPercent)}</span>
            </div>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ fontSize: "calc(12.5px * var(--s))", fontWeight: 700, color: "var(--muted)" }}>{T("İşlem detayları")}</span>
          <Row label={T("Adet")} value={`${tr0(trade.quantity)} ${T("adet")}`} />
          <Row label={T(trade.buy ? "Alış fiyatı" : "Satış fiyatı")} value={money(trade.price)} />
          <Row label={T("Komisyon")} value={money(trade.fee)} />
          <Row label={T("Toplam")} value={money(trade.total)} strong />
        </div>
        {!trade.buy && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={{ fontSize: "calc(12.5px * var(--s))", fontWeight: 700, color: "var(--muted)" }}>{T("Maliyet analizi")}</span>
            <Row label={T("Ort. alış")} value={money(trade.avgCost)} />
            <Row label={T("Maliyet")} value={money(trade.quantity * trade.avgCost)} />
            <Row label={T("Getiri")} value={money(trade.net)} strong />
          </div>
        )}
        <button className="mk-send buy" onClick={onClose}>{T("Devam et")}</button>
      </div>
    </Sheet>
  );
}

/* ---------- ekran ---------- */

const RANGES = [
  { key: "1G", back: 1, label: "Son 1 Gün Getiri" },
  { key: "1H", back: 5, label: "Son 1 Hafta Getiri" },
  { key: "1A", back: 21, label: "Son 1 Ay Getiri" },
  { key: "YTD", back: 0, label: "Yıl Başından Bu Yana" },
];

export default function Portfolio({
  holdings, account, orders, transactions, instruments, series, history, historyState, onRetryHistory,
  tab, setTab, hidden, setHidden, openPosition, onCancelOrder, onCreateOrder,
}) {
  const [range, setRange] = useState(2);
  const [detail, setDetail] = useState(null);

  const logos = useMemo(() => new Map(instruments.map((item) => [item.code, item.logo])), [instruments]);

  const stockValue = holdings.reduce((sum, item) => sum + item.value, 0);
  const cash = Number(account?.cash_balance || 0);
  const blocked = Number(account?.blocked_balance || 0);
  const pending = Number(account?.pending_balance || 0);
  const available = Math.max(0, cash - blocked);
  const total = stockValue + cash + pending;
  const dayProfit = holdings.reduce((sum, item) => sum + item.quantity * item.dayDelta, 0);
  const dayRatio = total - dayProfit > 0 ? (dayProfit / (total - dayProfit)) * 100 : 0;

  const curve = useMemo(() => {
    const live = portfolioSeries(series, holdings);
    return live.length >= 2 ? live : (history || []);
  }, [series, holdings, history]);

  const sliced = useMemo(() => {
    if (curve.length < 2) return [];
    const back = RANGES[range].back;
    if (!back) {
      const year = String(new Date().getFullYear());
      const rows = curve.filter((row) => String(row.day).startsWith(year));
      return rows.length >= 2 ? rows : curve;
    }
    return curve.slice(Math.max(0, curve.length - 1 - back));
  }, [curve, range]);

  const rangeReturn = sliced.length >= 2 ? (sliced[sliced.length - 1].value / (sliced[0].value || 1) - 1) * 100 : dayRatio;

  const gainers = useMemo(
    () => holdings.filter((item) => item.quantity > 0 && item.change > 0).sort((a, b) => b.change - a.change).slice(0, 3),
    [holdings]
  );

  const trades = useMemo(
    () => (transactions || [])
      .filter((row) => row.transaction_type === "trade_buy" || row.transaction_type === "trade_sell")
      .map(toTrade),
    [transactions]
  );

  const mask = (text) => (hidden ? "₺••••••" : text);

  return (
    <div className="page">
      <div className="mk-title">
        <h1>{T("Portföyüm")}</h1>
      </div>

      {/* ---- toplam portföy kartı ---- */}
      <section className="mk-card">
        <div className="mk-total">
          <span className="chart"><MiniSpark code="TOTAL" change={dayProfit} width={160} height={84} /></span>
          <span className="label">{T("Toplam Portföy Değeri")}</span>
          <span className="value">{mask(money(total))}</span>
          <span className="line">
            <span className={`mk-badge ${dayProfit >= 0 ? "up" : "down"}`}>
              {dayProfit >= 0 ? "▲" : "▼"} {hidden ? "•••" : (dayProfit >= 0 ? "+" : "−") + tr2(Math.abs(dayProfit))} ({pctText(dayRatio)})
            </span>
            <span className="hint">{T("Günlük Değişim")}</span>
          </span>
        </div>
        <div className="mk-duo">
          <div>
            <span className="k"><Icon name="wallet" size={15} />{T("T+2 Bakiye")}</span>
            <span className="v">{mask(money(cash + pending))}</span>
          </div>
          <div>
            <span className="k"><Icon name="check" size={15} />{T("Kullanılabilir")}</span>
            <span className="v">{mask(money(available))}</span>
          </div>
        </div>
      </section>

      {/* ---- sekmeli liste ---- */}
      <section className="mk-card">
        <div className="mk-tabs" style={{ marginBottom: 6 }}>
          {[T("Varlıklarım"), T("Geçmiş"), T("Emirler")].map((title, index) => (
            <button key={title} className={index === tab ? "active" : ""} onClick={() => setTab(index)}>{title}</button>
          ))}
        </div>

        {tab === 0 && (
          holdings.length ? (
            <>
              <div className="mk-thead">
                <span>{T("Sembol")}</span>
                <span>{T("Adet")}</span>
                <span>{T("Güncel Değer")}</span>
                <span>{T("Günlük Değişim")}</span>
              </div>
              {holdings.map((item, index) => {
                const up = item.dayDelta >= 0;
                return (
                  <React.Fragment key={item.symbol}>
                    {index > 0 && <div className="hline" />}
                    <button className="mk-holding" onClick={() => openPosition(item)}>
                      <span className="who">
                        <Symbol logo={item.logo} letter={item.symbol} size={40} />
                        <span style={{ minWidth: 0 }}>
                          <b>{item.symbol}</b>
                          <s>{item.name}</s>
                        </span>
                      </span>
                      <span className="num">{tr0(item.quantity)}</span>
                      <span className="num">{mask("₺" + tr0(item.value))}</span>
                      <span className={`chg ${up ? "up" : "down"}`}>
                        <b>{hidden ? "•••" : (up ? "+" : "−") + tr0(Math.abs(item.quantity * item.dayDelta))}</b>
                        <s>{pctText(item.change)}</s>
                      </span>
                    </button>
                  </React.Fragment>
                );
              })}
              <div className="hline" />
              <div className="mk-cash">
                <i><Icon name="wallet" size={18} /></i>
                {T("Nakit (T+2)")}
                <b>{mask(money(cash + pending))}</b>
              </div>
            </>
          ) : (
            <div className="mk-empty">
              <Icon name="portfolio" size={34} />
              <b>{T("Portföyün boş")}</b>
              <span>{T("Al/Sat ekranından ilk emrini verebilirsin.")}</span>
            </div>
          )
        )}

        {tab === 1 && (
          trades.length ? (
            trades.map((trade, index) => (
              <React.Fragment key={index}>
                {index > 0 && <div className="hline" />}
                <button className="mk-trade" onClick={() => setDetail(trade)}>
                  <Symbol logo={logos.get(trade.symbol)} letter={trade.symbol} size={44} />
                  <span className="who">
                    <span className="t">
                      <b>{trade.symbol}</b>
                      <span className={`mk-tag ${trade.buy ? "buy" : "sell"}`}>{T(trade.buy ? "Alış" : "Satış")}</span>
                    </span>
                    <s>{tr0(trade.quantity)} {T("adet")} · ₺{tr2(trade.price)} · {trade.date.toLocaleDateString(locale(), { day: "numeric", month: "short", year: "numeric" })}</s>
                  </span>
                  <span className="amt">
                    {trade.buy
                      ? <><b>₺{tr0(trade.total)}</b><s>{T("tutar")}</s></>
                      : <><b className={trade.profit >= 0 ? "up" : "down"}>{(trade.profit >= 0 ? "+" : "−") + "₺" + tr0(Math.abs(trade.profit))}</b><s>{T("net kâr")}</s></>}
                  </span>
                  <Icon name="chevron" size={16} />
                </button>
              </React.Fragment>
            ))
          ) : (
            <div className="mk-empty">
              <Icon name="history" size={34} />
              <b>{T("İşlem geçmişin boş")}</b>
              <span>{T("Gerçekleşen alış ve satışların burada listelenir.")}</span>
            </div>
          )
        )}

        {tab === 2 && (
          orders.length ? (
            orders.map((order, index) => (
              <React.Fragment key={order.id}>
                {index > 0 && <div className="hline" />}
                <div className="mk-trade" style={{ gridTemplateColumns: "44px 1fr auto" }}>
                  <Symbol logo={logos.get(order.symbol)} letter={order.symbol} size={44} />
                  <span className="who">
                    <span className="t">
                      <b>{order.symbol}</b>
                      <span className={`mk-tag ${order.side === "buy" ? "buy" : "sell"}`}>{T(order.side === "buy" ? "Alış" : "Satış")}</span>
                    </span>
                    <s>{tr0(order.quantity)} {T("adet")} · ₺{tr2(order.price)} · {T("bekliyor")}</s>
                  </span>
                  <button className="mk-btn ghost" style={{ height: 38, padding: "0 14px" }} onClick={() => onCancelOrder(order)}>{T("İptal")}</button>
                </div>
              </React.Fragment>
            ))
          ) : (
            <div className="mk-empty">
              <Icon name="orders" size={34} />
              <b>{T("Bekleyen emir bulunmuyor")}</b>
              <span>{T("Verdiğiniz emirler burada listelenir.")}</span>
            </div>
          )
        )}
      </section>

      {/* ---- performans ---- */}
      <section className="mk-card">
        <div className="mk-card-head" style={{ marginBottom: 12 }}>
          <h2>{T("Portföy Performansı")}</h2>
          <span className="mk-range">
            {RANGES.map((item, index) => (
              <button key={item.key} className={index === range ? "active" : ""} onClick={() => setRange(index)}>{item.key}</button>
            ))}
          </span>
        </div>
        <div style={{ fontSize: "calc(34px * var(--s))", fontWeight: 700, letterSpacing: "-.8px", color: rangeReturn >= 0 ? "var(--green)" : "var(--red)" }}>
          {pctText(rangeReturn)}
        </div>
        <div style={{ fontSize: "calc(13.5px * var(--s))", color: "var(--muted)", marginBottom: 6 }}>{T(RANGES[range].label)}</div>
        {sliced.length >= 2 ? (
          <AreaChart values={sliced.map((row) => row.value)} />
        ) : (
          <div className="mk-empty" style={{ padding: "22px 10px" }}>
            <span>{T(historyState === "failed" ? "Geçmiş veri alınamadı." : "Performans verisi birikiyor…")}</span>
            {historyState === "failed" && <button className="mk-btn ghost" style={{ height: 40 }} onClick={onRetryHistory}>{T("Tekrar dene")}</button>}
          </div>
        )}
      </section>

      {/* ---- en çok kazandıranlar ---- */}
      {gainers.length > 0 && (
        <section className="mk-card">
          <div className="mk-card-head" style={{ marginBottom: 12 }}>
            <h2>{T("En Çok Kazandıranlar")}</h2>
            <span className="mk-range"><button className="active">{T("Günlük")}</button></span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${gainers.length}, 1fr)`, gap: 12 }}>
            {gainers.map((item) => (
              <button
                key={item.symbol}
                onClick={() => openPosition(item)}
                style={{ background: "var(--tint-green)", borderRadius: 16, padding: "16px 8px", display: "grid", justifyItems: "center", gap: 8 }}
              >
                <Symbol logo={item.logo} letter={item.symbol} size={40} />
                <b style={{ fontSize: "calc(14.5px * var(--s))", fontWeight: 700 }}>{item.symbol}</b>
                <span style={{ fontSize: "calc(13px * var(--s))", fontWeight: 600, color: "var(--green)" }}>{pctText(item.change)}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {detail && <TransactionDetail trade={detail} logo={logos.get(detail.symbol)} onClose={() => setDetail(null)} />}
    </div>
  );
}
