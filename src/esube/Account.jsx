// Hesap — Mukatabak 2.5.1 APK'sındaki "Hesap" ekranının birebir karşılığı.
import React, { useRef, useState } from "react";
import Icon from "./icons.jsx";
import { money } from "./market.js";
import { T } from "./lang.js";
import { Sheet } from "./ui.jsx";
import { SUPPORT_WHATSAPP_URL, SUPPORT_PHONE_DISPLAY } from "../support.js";

const TONE = { t1: "var(--ink)", t2: "#6c5ce7", t3: "#e0a12a", t4: "#16a34a", t5: "var(--ink)", t6: "#7b5bdc", t7: "#0e9a8a" };

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
  onTransfer, onHistory, onOrders, onBanks, onLogout, onExport,
  onOpenKyc, kycApproved, moneyRequests, onCancelMoneyRequest,
}) {
  const [supportOpen, setSupportOpen] = useState(false);
  const bakiyeGecmisi = useRef(null);
  const cash = Number(account?.cash_balance || 0);
  const blocked = Number(account?.blocked_balance || 0);
  /* Bekleyen para çekme talebi kullanılabilir bakiyeden düşülür: müşteri
     çekmeye gönderdiği parayı ikinci kez harcayamaz. */
  const pendingWithdrawals = Number(account?.pending_withdrawals || 0);
  const pending = Number(account?.pending_balance || 0);
  // Hisse alımında T+2 bakiyesi de kullanılabilir.
  const available = Math.max(0, cash + pending - blocked - pendingWithdrawals);
  const verified = kycApproved ?? (String(me?.kyc_status || "").toLowerCase() === "approved" || String(me?.status || "") === "active");
  const kilitli = kycApproved === false;

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

      {/* ---- kimlik doğrulama uyarısı ---- */}
      {kycApproved === false && (
        <button className="mk-card mk-kyc" onClick={onOpenKyc}>
          <i className={`tile ${me?.kyc_status === "under_review" ? "t3" : "t8"}`}>
            <Icon name={me?.kyc_status === "under_review" ? "clock" : "lock"} size={19} />
          </i>
          <span>
            <b>{T(me?.kyc_status === "under_review" ? "Kimlik belgelerin incelemede" : "Kimlik doğrulaman eksik")}</b>
            <s>{T(me?.kyc_status === "under_review"
              ? "Onaylandığında para yatırma, çekme ve emir verme açılır."
              : "Para yatırma, çekme ve emir verme için kimliğini doğrula.")}</s>
          </span>
          <span className="chev"><Icon name="chevron" size={16} /></span>
        </button>
      )}

      {/* ---- bakiye ---- */}
      <section className="mk-card mk-balance" style={{ position: "relative" }}>
        <span className="wallet"><Icon name="wallet" size={20} /></span>
        <div className="k">{T("Kullanılabilir Bakiye")}</div>
        <div className="v">{money(available)}</div>
        <div className="t2">{T("T+2 bakiye")} {money(pending)}</div>
        {pendingWithdrawals > 0 && (
          <div className="t2">{T("Çekim talebinde bekleyen")} {money(pendingWithdrawals)}</div>
        )}
        <div className="mk-money">
          <button className={`mk-btn solid${kilitli ? " kilitli" : ""}`} onClick={() => onTransfer(true)}>
            <Icon name="deposit" size={18} />{T("Para Yatır")}
          </button>
          <button className={`mk-btn ghost${kilitli ? " kilitli" : ""}`} onClick={() => onTransfer(false)}>
            <Icon name="withdraw" size={18} />{T("Para Çek")}
          </button>
        </div>
      </section>

      {/* ---- bakiye geçmişi: para yatırma / çekme / kredi talepleri ---- */}
      <section className="mk-card mk-history" ref={bakiyeGecmisi}>
        <div className="mk-card-head"><h2>{T("Bakiye Geçmişi")}</h2></div>
        {moneyRequests && moneyRequests.length ? (
          moneyRequests.map((item, index) => {
            const renk = item.status === "rejected" ? "var(--red)" : item.status === "approved" ? "var(--green)" : "var(--ink-orange)";
            return (
              <React.Fragment key={item.id}>
                {index > 0 && <div className="hline" />}
                <div className="mk-req">
                  <span className="mk-req-top">
                    <b>{item.type_label || T("Talep")}</b>
                    <em>{money(item.amount)}</em>
                  </span>
                  <span className="mk-req-alt">
                    {item.created_at_label}
                    {" · "}
                    <b style={{ color: renk }}>{item.status_label || T("Beklemede")}</b>
                  </span>
                  {item.status === "rejected" && item.admin_note && (
                    <span className="mk-req-not">{item.status_label === "İptal" ? T("Not:") : T("Ret nedeni:")} {item.admin_note}</span>
                  )}
                  {item.status === "pending" && item.request_type === "withdraw" && onCancelMoneyRequest && (
                    <button className="mk-btn ghost small" onClick={() => onCancelMoneyRequest(item)}>
                      {T("Talebi iptal et")}
                    </button>
                  )}
                </div>
              </React.Fragment>
            );
          })
        ) : (
          <div className="mk-empty">
            <Icon name="wallet" size={28} />
            <b>{T("Kayıt yok")}</b>
            <span>{T("Henüz para yatırma ya da çekme talebin yok.")}</span>
          </div>
        )}
      </section>

      {/* ---- menü ---- */}
      <section className="mk-card mk-menu">
        <Row tile="t1" icon="history" title={T("Geçmiş İşlemler")} subtitle={T("Alış ve satış kayıtları")} onClick={onHistory} />
        <div className="hline" />
        <Row tile="t2" icon="orders" title={T("Emirlerim")} subtitle={T("Bekleyen ve gerçekleşen emirler")} onClick={onOrders} />
        <div className="hline" />
        {/* Para çekmede kullanılan kayıtlı IBAN'lar buradan görülür. */}
        <Row tile="t7" icon="bank" title={T("Banka Hesaplarım")} subtitle={T("Para çekmede kullanılan IBAN'lar")} onClick={onBanks} />
        <div className="hline" />
        <Row tile="t3" icon="bell" title={T("Bildirimler")} subtitle={T("Fiyat alarmları ve duyurular")} onClick={onOpenNotifications} />
        <div className="hline" />
        <Row tile="t4" icon="shield" title={T("Güvenlik")} subtitle={T("Şifre değiştirme, aktif cihazlar, işlem onayı")} onClick={onOpenSecurity} />
        <div className="hline" />
        <Row tile="t5" icon="sliders" title={T("Ayarlar")} subtitle={T("Dil, tema, yazı boyutu, gece-gündüz")} onClick={onOpenSettings} />
        <div className="hline" />
        <Row tile="t6" icon="list" title={T("Güvenlik Politikası ve Sözleşmeler")} subtitle={T("KVKK, çerçeve sözleşme, risk bildirimi")} onClick={onOpenContracts} />
        <div className="hline" />
        {/* Müşteri hizmetleri: telefon satırda değil, tıklanınca açılan pencerede gösterilir. */}
        <Row tile="t7" icon="headset" title={T("Yardım ve destek")} subtitle={T("Müşteri hizmetleri ile iletişime geçin")} onClick={() => setSupportOpen(true)} />
      </section>

      {supportOpen && (
        <Sheet title={T("Yardım ve destek")} onClose={() => setSupportOpen(false)}>
          <div className="mk-destek">
            <span className="tl-note">{T("Müşteri hizmetleri ekibimize WhatsApp üzerinden yazabilirsiniz.")}</span>
            <div className="mk-destek-no">
              <small>{T("WhatsApp destek hattı")}</small>
              <strong>{SUPPORT_PHONE_DISPLAY}</strong>
            </div>
            <button className="mk-btn solid" style={{ width: "100%", height: 50 }} onClick={() => window.open(SUPPORT_WHATSAPP_URL, "_blank", "noopener,noreferrer")}>
              {T("WhatsApp ile yaz")}
            </button>
          </div>
        </Sheet>
      )}

      {onExport && (
        <button className="mk-btn ghost" style={{ width: "100%", height: 52 }} onClick={onExport}>
          <Icon name="download" size={18} />{T("Hesap ekstresini indir (CSV)")}
        </button>
      )}

      <button className="mk-logout" onClick={onLogout}>
        <Icon name="logout" size={19} />{T("Çıkış Yap")}
      </button>

      <div className="mk-version">{T("Sürüm")} {version} · {T("Sürümünüz güncel.")}</div>
    </div>
  );
}
