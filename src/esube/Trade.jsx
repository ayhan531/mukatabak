// Hızlı emir paneli — MainPage.QuickTrade.cs / MainPage.Trade.cs birebir karşılığı.
import React, { useEffect, useMemo, useRef, useState } from "react";
import Icon from "./icons.jsx";
import { Symbol, SearchBox, Dialog, Sheet, Divided } from "./ui.jsx";
import {
  money, percent, move, signed, parseAmount, group, isMarketOpen, businessDays, search,
  BIST, FUNDS, IPO, listFor,
} from "./market.js";
import { api } from "./store.js";
import { T, locale } from "./lang.js";

const KIND_NAMES = ["Hisse", "Fon", "Halka Arz"];
const REFERRAL_TEXT = {
  fund: "Fon alış satışları için referansınız ile iletişime geçiniz.",
  ipo: "Halka arz alış satışları için referansınız ile iletişime geçiniz.",
  currency: "Döviz alış satışları için referansınız ile iletişime geçiniz.",
};
const KIND_MARKETS = [BIST, FUNDS, IPO];

const dateTime = (value) =>
  value ? new Date(value).toLocaleString(locale(), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" }) : null;

export function TradeHeader({ stock, onClose, watched, onToggleWatch, updatedAt }) {
  const up = stock.change >= 0;
  const stamp = dateTime(updatedAt);
  return (
    <div className="thead">
      <div className="logo"><Symbol logo={stock.logo} letter={stock.symbol} size={46} /></div>
      <div className="sym">
        {stock.symbol}
        <button className="star" onClick={onToggleWatch} aria-label={T("Takip listesi")} style={{ color: watched ? "var(--purple)" : "var(--muted)", display: "flex", padding: 5 }}>
          <Icon name={watched ? "star-filled" : "star"} size={18} />
        </button>
      </div>
      <button className="icon-btn soft sm trade-close" onClick={onClose} aria-label={T("Kapat")}><Icon name="close" size={18} /></button>
      <div className="nm">{stock.name}</div>
      <div className="price">{money(stock.price)}</div>
      <div className="src">
        <i className="dot" style={{ background: stamp ? "var(--green)" : "var(--ink-orange)" }} />
        {stamp || T("Veri bekleniyor")}
      </div>
      <div className="badge-wrap">
        <span className={`move-badge ${up ? "up" : "down"}`}>
          <Icon name={up ? "trend" : "trend-down"} size={13} />
          {(up ? "+" : "−") + percent(Math.abs(stock.change))}
          <span>{(up ? "+" : "−") + money(Math.abs(stock.dayDelta || 0))}</span>
        </span>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="box">{children}</div>
    </div>
  );
}

const Info = ({ label, value }) => (
  <div className="field">
    <label>{label}</label>
    <div className="box"><span className="ro">{value}</span></div>
  </div>
);

export function TradePanel({
  stock, buying, sheet, searchable, instruments, cash, availableLots, watchlist,
  onToggleWatch, onPickStock, onClose, onSubmitted, onNotice, tradeKind, setTradeKind,
}) {
  const isFund = stock.kind === "fund";
  const isIpo = stock.kind === "ipo";
  const isCurrency = stock.kind === "currency";
  const referralOnly = isFund || isIpo || isCurrency;
  const unit = isFund ? "pay" : "lot";
  const closed = !isFund && !isIpo && !isMarketOpen();

  const [buy, setBuy] = useState(isIpo ? true : buying);
  const [market, setMarket] = useState(!closed);
  const [byAmount, setByAmount] = useState(true);
  const [limitText, setLimitText] = useState(stock.price ? stock.price.toFixed(2).replace(".", ",") : "");
  const [quantityText, setQuantityText] = useState("");
  const [amountText, setAmountText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [kindOpen, setKindOpen] = useState(false);

  useEffect(() => {
    setBuy(isIpo ? true : buying);
    setMarket(!closed);
    setLimitText(stock.price ? stock.price.toFixed(2).replace(".", ",") : "");
    setQuantityText("");
    setAmountText("");
    setError("");
  }, [stock.symbol]); // eslint-disable-line react-hooks/exhaustive-deps

  const price = useMemo(() => {
    if (isFund || isIpo || market) return stock.price;
    const parsed = parseAmount(limitText);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : stock.price;
  }, [isFund, isIpo, market, limitText, stock.price]);

  const max = useMemo(() => {
    if (!buy) return availableLots;
    return price > 0 ? Math.floor(cash / (price * 1.001)) : 0;
  }, [buy, price, cash, availableLots]);

  const quantity = Number.parseInt(quantityText, 10) > 0 ? Number.parseInt(quantityText, 10) : 0;
  const total = quantity * price;
  const ratio = max > 0 ? Math.min(100, Math.max(0, Math.round((quantity * 100) / max))) : 0;

  const setQuantity = (value) => {
    const q = Math.max(0, Math.floor(value) || 0);
    setQuantityText(q > 0 ? String(q) : "");
    setAmountText(q > 0 ? (q * price).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "");
  };

  const onAmountChange = (raw) => {
    const pretty = group(raw);
    setAmountText(pretty);
    const value = parseAmount(pretty);
    const q = Number.isFinite(value) && price > 0 ? Math.floor(value / price) : 0;
    setQuantityText(q > 0 ? String(q) : "");
  };

  const matches = useMemo(() => {
    if (!searchable || !query.trim()) return [];
    return search(query, listFor(KIND_MARKETS[tradeKind], instruments), 5);
  }, [searchable, query, tradeKind, instruments]);

  const submit = async () => {
    setError("");
    if (quantity <= 0) { setError(T(isFund ? "En az 1 pay gir." : "En az 1 lot gir.")); return; }
    if (!(price > 0) || price > 1000000) { setError(T("Geçerli bir fiyat gir.")); return; }
    if (isFund || isIpo) {
      onNotice(
        isIpo ? "Halka arz talebi" : "Fon işlemleri",
        "Bu ürün grubunda emir e-şube üzerinden iletilmiyor. Referansınız ile iletişime geçiniz."
      );
      return;
    }
    if (buy && total + Math.round(total * 0.001 * 100) / 100 > cash) { setError(T("Yetersiz bakiye.")); return; }
    if (!buy && quantity > availableLots) { setError(T("Satılabilir lot adedini aşıyorsun.")); return; }
    onSubmitted({ stock, buy, quantity, price, market: market && !closed, duration: market ? "Günlük" : "İptale kadar" });
  };

  const priceField = isFund
    ? <Info label={T("Son açıklanan fon fiyatı")} value={money(stock.price)} />
    : isIpo
      ? <Info label={T("Arz fiyatı")} value={money(stock.price)} />
      : (
        <Field label={T("Limit fiyat (₺)")}>
          <input inputMode="decimal" value={limitText} onChange={(event) => setLimitText(event.target.value)} placeholder="0,00" />
        </Field>
      );

  const kindNames = isFund ? ["Alış", "Satış", "Tutar ile", "Pay ile"] : ["Alış", "Satış", "Piyasa", "Limit"];
  const typeOn = (index) => (index === 2 ? (isFund ? byAmount : market) : isFund ? !byAmount : !market);

  const up = Number(stock.change) >= 0;
  const feeTotal = total > 0 ? (buy ? total * 1.001 : total * 0.999) : 0;
  const caption = buy
    ? (isFund ? "Alınacak pay ya da tutar" : "Alınacak adet ya da tutar")
    : (isFund ? "Satılacak pay ya da tutar" : "Satılacak adet ya da tutar");

  return (
    <div className="mk-order-panel">
      <div className="mk-side">
        <button className={`buy${buy ? " on" : ""}`} onClick={() => !isIpo && setBuy(true)}>{T("Al")}</button>
        <button className={`sell${!buy ? " on" : ""}`} onClick={() => !isIpo && setBuy(false)}>{T("Sat")}</button>
      </div>

      {searchable && (
        <div className="mk-picker-wrap">
          <SearchBox placeholder={T("Hisse ara")} value={query} onChange={setQuery} />
          {matches.length > 0 && (
            <div className="mk-matches">
              {matches.map((item) => (
                <button key={item.code} onClick={() => { setQuery(""); onPickStock(item); }}>
                  <Symbol logo={item.logo} letter={item.symbol} size={34} />
                  <span><b>{item.symbol}</b><s>{item.name}</s></span>
                  <em>{money(item.price)}</em>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mk-picked">
        <button className="star" onClick={onToggleWatch} aria-label={T("Takip listesi")}>
          {watchlist?.includes(stock.code) ? "★" : "☆"}
        </button>
        <Symbol logo={stock.logo} letter={stock.symbol} size={40} />
        <span className="who">
          <b>{stock.symbol}</b>
          <s>{stock.name}</s>
        </span>
        <span className="p">
          <b>{Number(stock.price).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
          <em className={up ? "up" : "down"}>
            {up ? "▲ +" : "▼ −"}{Math.abs(Number(stock.dayDelta) || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({percent(Math.abs(stock.change))})
          </em>
        </span>
      </div>

      {!isFund && !isIpo && (
        <>
          <div className="mk-seg2">
            <button className={market ? "on" : ""} onClick={() => !closed && setMarket(true)} disabled={closed}>{T("Piyasa")}</button>
            <button className={!market ? "on" : ""} onClick={() => setMarket(false)}>{T("Limit")}</button>
          </div>
          {closed && (
            <div className="mk-warn"><Icon name="info" size={15} />{T("Piyasa kapalı · sadece limit emir.")}</div>
          )}
        </>
      )}

      <div className="mk-order-box">
        <span className="cap">{T(caption)}</span>
        <div className="duo">
          <input
            inputMode="numeric"
            value={quantityText}
            placeholder="0"
            onChange={(event) => setQuantity(Number.parseInt(event.target.value.replace(/\D/g, ""), 10))}
          />
          <input
            inputMode="decimal"
            value={amountText}
            placeholder="0,00"
            onChange={(event) => onAmountChange(event.target.value)}
          />
        </div>
        <div className="mk-quick">
          {[25, 50, 75, 100].map((step) => (
            <button
              key={step}
              className={ratio === step ? "on" : ""}
              onClick={() => setQuantity((max * step) / 100)}
            >%{step}</button>
          ))}
        </div>
        {!isFund && !isIpo && (
          <div className="lim">
            <span>{T("Limit fiyat")}</span>
            <input
              inputMode="decimal"
              value={market ? Number(stock.price).toFixed(2).replace(".", ",") : limitText}
              readOnly={market}
              placeholder="0,00"
              onChange={(event) => setLimitText(event.target.value)}
            />
          </div>
        )}
      </div>

      <div className="mk-total-row">
        <span>{T("Toplam")}</span>
        <b>{money(feeTotal)}</b>
      </div>

      {error && <span className="mk-err">{error}</span>}

      <button className={`mk-send ${buy ? "buy" : "sell"}`} onClick={submit} disabled={busy}>
        {T(buy ? "Alış Emri Gönder" : "Satış Emri Gönder")}
      </button>

      {referralOnly && (
        <span className="mk-warn">{T(REFERRAL_TEXT[stock.kind] || "")}</span>
      )}
    </div>
  );
}

export function ReviewOrder({ order, onCancel, onConfirmed }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { stock, buy, quantity, price, market } = order;
  const isFund = stock.kind === "fund";
  const isIpo = stock.kind === "ipo";

  const confirm = async () => {
    setBusy(true);
    setError("");
    try {
      await api("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          symbol: stock.code || stock.symbol,
          side: buy ? "buy" : "sell",
          order_type: market ? "market" : "limit",
          quantity,
          limit_price: price,
          amount_mode: "quantity",
          client_order_id: `w${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
        }),
      });
      onConfirmed();
    } catch (problem) {
      setError(problem.message || T("Emir iletilemedi."));
    } finally {
      setBusy(false);
    }
  };

  const Row = ({ label, value, strong, tone }) => (
    <div className="detail-row">
      <span className="l">{label}</span>
      <span className={`v${strong ? " b" : ""}`} style={tone ? { color: tone } : undefined}>{value}</span>
    </div>
  );

  return (
    <Dialog
      title={T(isIpo ? "Halka arz talebini onayla" : buy ? "Alış emrini onayla" : "Satış emrini onayla")}
      onClose={onCancel}
      closable={false}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Row label={T("Emir")} value={T(isIpo ? "Halka arz talebi" : isFund ? "Fon emri" : market ? "Piyasa" : "Limit")} />
        <Row label={T("İşlem")} value={T(isIpo ? "Talep" : buy ? "Alış" : "Satış")} tone={buy ? "var(--green)" : "var(--red)"} />
        <Row label={T(isFund ? "Fon" : "Hisse")} value={stock.symbol} />
        <Row label={T(isFund ? "Fon fiyatı" : isIpo ? "Arz fiyatı" : "Fiyat")} value={money(price)} />
        <Row label={T(isFund ? "Pay" : isIpo ? "Talep lotu" : "Adet")} value={`${quantity} ${T(isFund ? "pay" : "lot")}`} />
        <div className="hline" />
        <Row label={T(isIpo ? "Toplam talep" : "Toplam")} value={money(quantity * price)} strong />
        {error && <div className="trade-error">{error}</div>}
        <div className="grid2">
          <button className="btn ghost" onClick={onCancel}>{T("Vazgeç")}</button>
          <button className="btn" disabled={busy} onClick={confirm}>{T(busy ? "Gönderiliyor…" : "Onayla")}</button>
        </div>
      </div>
    </Dialog>
  );
}

/* ---------- sonuç kutusu (OrderResult) ---------- */

export function OrderResult({ order, onClose, onHistory, onOrders, t2Enabled }) {
  const { stock, buy, quantity, price, market } = order;
  const isFund = stock.kind === "fund";
  const isIpo = stock.kind === "ipo";
  // T+2 açıkken satış tutarı takasa düşer; kısa bir "Takasta" ibaresi görünüp kaybolur.
  const [settling, setSettling] = useState(Boolean(t2Enabled) && market && !buy);
  useEffect(() => {
    if (!settling) return undefined;
    const timer = setTimeout(() => setSettling(false), 2000);
    return () => clearTimeout(timer);
  }, [settling]);
  return (
    <Dialog
      title={T(market ? (buy ? "Alış gerçekleşti" : "Satış gerçekleşti") : isIpo ? "Talebin alındı" : "Emrin alındı")}
      onClose={onClose}
      closable={false}
      center
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14, textAlign: "center" }}>
        <div className="result-mark"><Icon name="check" size={30} /></div>
        {settling && <span className="settling-pill">{T("Takasta")}</span>}
        <strong style={{ fontSize: "calc(16px * var(--s))" }}>
          {stock.symbol} · {quantity} {T(isFund ? "pay" : "lot")} · {money(price)}
        </strong>
        <span style={{ fontSize: "calc(13px * var(--s))", color: "var(--muted)" }}>
          {market
            ? T("Portföyün ve bakiyen güncellendi; işlem geçmişine düştü.")
            : T(isIpo
              ? "Halka arz talebini Portföy > Emirler altında izleyebilirsin."
              : "Limit emrini Portföy > Emirler altında izleyebilirsin.")}
        </span>
        <button className="btn ghost" onClick={market ? onHistory : onOrders}>
          {T(market ? "İşlem geçmişine git" : "Emirlerimi gör")}
        </button>
        <button className="btn" onClick={onClose}>{T("Bitti")}</button>
      </div>
    </Dialog>
  );
}

/* ---------- panel kabuğu: ortalanmış kutu ya da alttan sayfa ---------- */

export function QuickTrade({ asSheet, header, children, onClose }) {
  // fit: panel ekrana sığmazsa küçülür, kaydırma gerekmez.
  return asSheet
    ? <Sheet title={header} onClose={onClose} closable={false} fit>{children}</Sheet>
    : <Dialog title={header} onClose={onClose} closable={false} fit>{children}</Dialog>;
}
