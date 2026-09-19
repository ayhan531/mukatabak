// Hesap — Mukatabak 2.5.1 APK'sındaki "Hesap" ekranının birebir karşılığı.
import React from "react";
import Icon from "./icons.jsx";
import { money } from "./market.js";
import { T } from "./lang.js";

const TONE = { t1: "var(--ink)", t2: "#6c5ce7", t3: "#e0a12a", t4: "#16a34a", t5: "var(--ink)", t6: "#7b5bdc" };

const Row = ({ tile, icon, title, subtitle, onClick }) => (
  <button onClick={onClick}>
    <i className={`tile ${tile}`}><Icon name={icon} size={20} /></i>
    <span>
      <b style={{ color: TONE[tile] }}>{title}</b>
      <s>{subtitle}</s>
    </span>
    <span className="chev"><Icon name="chevron" size={16} /></span>
  </button>
);

export default function Account({
  me, account, monogram, version, dark, setDark,
  onOpenPersonal, onOpenSecurity, onOpenContracts, onOpenSettings, onOpenNotifications,
  onTransfer, onHistory, onOrders, onLogout,
}) {
  const cash = Number(account?.cash_balance || 0);
  const blocked = Number(account?.blocked_balance || 0);
  const pending = Number(account?.pending_balance || 0);
  const available = Math.max(0, cash - blocked);
  const verified = String(me?.kyc_status || "").toLowerCase() === "approved" || String(me?.status || "") === "active";

  return (
    <div className="page">
      <div className="mk-title">
        <h1>{T("Hesap")}</h1>
        <button className="icon-btn round" onClick={() => setDark(!dark)} aria-label={T("Tema")}>
          <Icon name={dark ? "sun" : "moon"} size={21} />
        </button>
      </div>

      {/* ---- profil ---- */}
      <section className="mk-card">
        <button className="mk-profile" onClick={onOpenPersonal} style={{ width: "100%", textAlign: "left" }}>
          <span className="mk-ava">
            {me?.avatar_url ? <img src={me.avatar_url} alt="" /> : monogram}
          </span>
          <span className="copy">
            <b>{me?.full_name || T("İsim Soyisim")}</b>
            <s>{T("Hesap No")} · {me?.account_no || "—"}</s>
            <span className="mk-verified">
              <Icon name="check" size={13} />
              {T(verified ? "Doğrulanmış hesap" : "Onay bekleyen hesap")}
            </span>
          </span>
        </button>
      </section>

      {/* ---- bakiye ---- */}
      <section className="mk-card mk-balance" style={{ position: "relative" }}>
        <span className="wallet"><Icon name="wallet" size={20} /></span>
        <div className="k">{T("Kullanılabilir Bakiye")}</div>
        <div className="v">{money(available)}</div>
        <div className="t2">{T("T+2 bakiye")} {money(cash + pending)}</div>
        <div className="mk-money">
          <button className="mk-btn solid" onClick={() => onTransfer(true)}>
            <Icon name="deposit" size={18} />{T("Para Yatır")}
          </button>
          <button className="mk-btn ghost" onClick={() => onTransfer(false)}>
            <Icon name="withdraw" size={18} />{T("Para Çek")}
          </button>
        </div>
      </section>

      {/* ---- menü ---- */}
      <section className="mk-card mk-menu">
        <Row tile="t1" icon="history" title={T("Geçmiş İşlemler")} subtitle={T("Alış ve satış kayıtları")} onClick={onHistory} />
        <div className="hline" />
        <Row tile="t2" icon="orders" title={T("Emirlerim")} subtitle={T("Bekleyen ve gerçekleşen emirler")} onClick={onOrders} />
        <div className="hline" />
        <Row tile="t3" icon="bell" title={T("Bildirimler")} subtitle={T("Fiyat alarmları ve duyurular")} onClick={onOpenNotifications} />
        <div className="hline" />
        <Row tile="t4" icon="shield" title={T("Güvenlik")} subtitle={T("Şifre değiştirme, aktif cihazlar, işlem onayı")} onClick={onOpenSecurity} />
        <div className="hline" />
        <Row tile="t5" icon="sliders" title={T("Ayarlar")} subtitle={T("Dil, tema, yazı boyutu, gece-gündüz")} onClick={onOpenSettings} />
        <div className="hline" />
        <Row tile="t6" icon="list" title={T("Güvenlik Politikası ve Sözleşmeler")} subtitle={T("KVKK, çerçeve sözleşme, risk bildirimi")} onClick={onOpenContracts} />
      </section>

      <button className="mk-logout" onClick={onLogout}>
        <Icon name="logout" size={19} />{T("Çıkış Yap")}
      </button>

      <div className="mk-version">{T("Sürüm")} {version} · {T("Sürümünüz güncel.")}</div>
    </div>
  );
}
