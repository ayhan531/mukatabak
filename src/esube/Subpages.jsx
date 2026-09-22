// Alt sayfalar — Ayarlar, Güvenlik, Şifre, Kişisel Bilgiler, İletişim, Bildirim Ayarları, Sözleşmeler.
import React, { useMemo, useState } from "react";
import Icon from "./icons.jsx";
import { Divided, Toggle, Sheet, Choices, CenteredHeader, PageHeader } from "./ui.jsx";
import { CONTRACTS, PRIVACY } from "./contracts.js";
import { locale } from "./lang.js";
import { T } from "./lang.js";

export const SCALE_NAMES = ["Küçük", "Normal", "Büyük"];
export const SCALE_VALUES = [0.9, 1, 1.12];
export const ACCENT_NAMES = ["Mor", "Mavi", "Turkuaz", "Yeşil", "Turuncu", "Pembe", "Kırmızı", "Lacivert", "Gri"];
export const ACCENT_LIGHT = ["#7054F6", "#2F72E8", "#0E9AA7", "#1E9E6A", "#E3922F", "#D9479A", "#D6453D", "#2B3A8C", "#4B5563"];
export const ACCENT_NIGHT = ["#7B69DE", "#5187DB", "#30A7B2", "#37AF82", "#D49447", "#D061A3", "#D25E56", "#6E7BC4", "#8E949F"];
export const LANG_NAMES = ["Türkçe", "English", "Azərbaycanca", "Deutsch", "Français"];
export const DATA_NAMES = ["Canlı veri", "Yalnızca Wi-Fi", "Tasarruf"];

/* ---------- ortak satırlar ---------- */

const SettingsRow = ({ icon, label, value, chevron, onClick, tail }) => {
  const content = (
    <>
      <span className="ic">{typeof icon === "string" && icon.length <= 2 ? icon : <Icon name={icon} size={20} />}</span>
      <span className="lb">{label}</span>
      {tail || (value ? <span className="vl">{value}</span> : <span />)}
      {chevron ? <Icon name="chevron" size={18} color="var(--muted)" /> : <span />}
    </>
  );
  return onClick
    ? <button className="srow" onClick={onClick}>{content}</button>
    : <div className="srow">{content}</div>;
};

export const SecRow = ({ icon, label, note, tail, chevron, onClick }) => {
  const content = (
    <>
      <span className="disc"><Icon name={icon} size={20} /></span>
      <span className="copy"><strong>{label}</strong><span>{note}</span></span>
      {tail || <span />}
      {chevron ? <Icon name="chevron" size={18} color="var(--muted)" /> : <span />}
    </>
  );
  return onClick ? <button className="sec-row" onClick={onClick}>{content}</button> : <div className="sec-row">{content}</div>;
};

export const InfoRow = ({ title, note, chevron, tail, onClick }) => {
  const content = (
    <>
      <span className="copy"><strong>{title}</strong><span>{note}</span></span>
      {tail || <span />}
      {chevron ? <Icon name="chevron" size={18} color="var(--muted)" /> : <span />}
    </>
  );
  return onClick ? <button className="info-row" onClick={onClick}>{content}</button> : <div className="info-row">{content}</div>;
};

const Section = ({ heading, children }) => (
  <div className="sec-section">
    {heading && <div className="head">{heading}</div>}
    <div className="sec-card"><Divided>{children}</Divided></div>
  </div>
);

/* ---------- Ayarlar ---------- */

/* ---------- Ayarlar — APK: Dil, Tema, Yazı Boyutu ---------- */

// APK'daki dil listesi. Çeviri tablosu yalnızca bazı diller için dolu;
// karşılığı olmayan dillerde metinler Türkçe kalır (APK'daki not ile aynı).
export const LANG_OPTIONS = [
  { code: "TR", label: "Türkçe", sub: "Türkçe", index: 0 },
  { code: "AZ", label: "Azerice", sub: "Azərbaycan dili", index: 2 },
  { code: "TM", label: "Türkmence", sub: "Türkmençe", index: 0 },
  { code: "UZ", label: "Özbekçe", sub: "O'zbekcha", index: 0 },
  { code: "KZ", label: "Kazakça", sub: "Qazaqşa", index: 0 },
  { code: "KG", label: "Kırgızca", sub: "Kyrgyzça", index: 0 },
  { code: "EN", label: "İngilizce", sub: "English", index: 1 },
];

export const SKIN_NAMES = ["Klasik", "Nane", "Şeftali", "Gök", "Krem", "Pembe", "Lavanta"];
const SKIN_SWATCH = [
  "linear-gradient(140deg,#dce6ff,#eef1fb)",
  "linear-gradient(140deg,#d9f6f6,#e8fbef)",
  "linear-gradient(140deg,#ffe2ee,#ffeadf)",
  "linear-gradient(140deg,#cbe1ff,#e4f0ff)",
  "linear-gradient(140deg,#edf1ff,#fdf4e8)",
  "linear-gradient(140deg,#fbdde5,#ffe9f2)",
  "linear-gradient(140deg,#d4e0ff,#e7e2ff)",
];

export function Settings({
  onBack, dark, setDark, textSize, setTextSize, skin = 0, setSkin,
  lang, setLang, onNotify, onSecurity,
}) {
  const [picker, setPicker] = useState(null);
  const current = LANG_OPTIONS.find((item) => item.index === lang) || LANG_OPTIONS[0];

  const Card = ({ icon, tint, label, value, onClick }) => (
    <button className="mk-card" onClick={onClick} style={{ display: "grid", gridTemplateColumns: "44px 1fr auto 16px", alignItems: "center", gap: 13, width: "100%", textAlign: "left" }}>
      <i className="tile" style={{ width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center", background: tint.bg, color: tint.ink }}>
        <Icon name={icon} size={20} />
      </i>
      <b style={{ fontSize: "calc(18px * var(--s))", fontWeight: 700 }}>{label}</b>
      <span style={{ fontSize: "calc(14px * var(--s))", fontWeight: 600, color: "var(--accent)" }}>{value}</span>
      <span style={{ color: "var(--muted)" }}><Icon name="chevron" size={16} /></span>
    </button>
  );

  return (
    <div className="page">
      <div className="page-head with-tail">
        <button className="icon-btn" onClick={onBack} aria-label={T("Geri")}><Icon name="back" size={21} /></button>
        <span>
          <h1 style={{ margin: 0, fontSize: "calc(24px * var(--s))", fontWeight: 700 }}>{T("Ayarlar")}</h1>
          <span className="mk-sub">{T("Dil, tema ve yazı boyutu")}</span>
        </span>
        <button className="icon-btn round" onClick={() => setDark(!dark)} aria-label={T("Tema")}>
          <Icon name={dark ? "sun" : "moon"} size={20} />
        </button>
      </div>

      <Card icon="globe" tint={{ bg: "var(--tint-blue)", ink: "var(--accent)" }} label={T("Dil")} value={T(current.label)} onClick={() => setPicker("lang")} />
      <Card icon="palette" tint={{ bg: "#ece7ff", ink: "#7b5bdc" }} label={T("Tema")} value={T(SKIN_NAMES[skin])} onClick={() => setPicker("skin")} />

      <section className="mk-card">
        <div className="mk-card-head" style={{ marginBottom: 12 }}>
          <span className="mk-chip-ico" style={{ background: "var(--tint-green)", color: "var(--green)" }}><Icon name="sliders" size={18} /></span>
          <h2>{T("Yazı Boyutu")}</h2>
        </div>
        <div className="mk-tabs" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
          {SCALE_NAMES.map((name, index) => (
            <button key={name} className={index === textSize ? "active" : ""} onClick={() => setTextSize(index)} style={{ textAlign: "center" }}>{T(name)}</button>
          ))}
        </div>
        <div style={{ fontSize: "calc(13.5px * var(--s))", color: "var(--muted)", marginTop: 12 }}>
          {T("Örnek: Portföyünüz bugün %0,87 değer kazandı.")}
        </div>
      </section>

      <section className="mk-card mk-menu">
        <button onClick={onNotify}>
          <i className="tile t3"><Icon name="bell" size={20} /></i>
          <span><b>{T("Bildirim tercihleri")}</b><s>{T("Fiyat, haber ve emir bildirimleri")}</s></span>
          <span className="chev"><Icon name="chevron" size={16} /></span>
        </button>
        <div className="hline" />
        <button onClick={onSecurity}>
          <i className="tile t4"><Icon name="shield" size={20} /></i>
          <span><b>{T("Güvenlik ayarları")}</b><s>{T("Şifre, cihazlar ve işlem onayı")}</s></span>
          <span className="chev"><Icon name="chevron" size={16} /></span>
        </button>
      </section>

      {picker === "lang" && (
        <Sheet title={T("Dil")} onClose={() => setPicker(null)}>
          <div>
            {LANG_OPTIONS.map((item, index) => (
              <React.Fragment key={item.code}>
                {index > 0 && <div className="hline" />}
                <button
                  className="mk-menu"
                  onClick={() => { setLang(item.index); setPicker(null); }}
                  style={{ display: "grid", gridTemplateColumns: "44px 1fr 22px", alignItems: "center", gap: 13, width: "100%", padding: "11px 0", textAlign: "left" }}
                >
                  <i style={{
                    width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center",
                    fontSize: "calc(13px * var(--s))", fontWeight: 700,
                    background: item.index === lang ? "var(--accent)" : "transparent",
                    color: item.index === lang ? "#fff" : "var(--muted)",
                  }}>{item.code}</i>
                  <span>
                    <b style={{ display: "block", fontSize: "calc(16px * var(--s))", fontWeight: 600 }}>{item.label}</b>
                    <s style={{ display: "block", textDecoration: "none", fontSize: "calc(12.5px * var(--s))", color: "var(--muted)" }}>{item.sub}</s>
                  </span>
                  {item.index === lang ? <Icon name="check" size={20} color="var(--accent)" /> : <span />}
                </button>
              </React.Fragment>
            ))}
            <div style={{ fontSize: "calc(13px * var(--s))", color: "var(--ink-orange)", paddingTop: 12 }}>
              {T("Çeviri sonraki sürümde; şimdilik metinler Türkçe.")}
            </div>
          </div>
        </Sheet>
      )}

      {picker === "skin" && (
        <Sheet title={T("Tema")} onClose={() => setPicker(null)}>
          <div className="mk-swatch">
            {SKIN_NAMES.map((name, index) => (
              <button key={name} className={index === skin ? "on" : ""} onClick={() => { setSkin(index); setPicker(null); }}>
                <i style={{ background: SKIN_SWATCH[index] }}>{index === skin ? <Icon name="check" size={22} /> : null}</i>
                <span>{T(name)}</span>
              </button>
            ))}
          </div>
          <div style={{ fontSize: "calc(13px * var(--s))", color: "var(--muted)", paddingTop: 14 }}>
            {T("Tema arka planın renk dünyasını değiştirir; vurgu rengi ve kart yapısı aynı kalır.")}
          </div>
        </Sheet>
      )}
    </div>
  );
}

export function Security({ onBack, onPassword, onTwoFactor, sessions, onRevoke, confirmOn, setConfirmOn, passwordChangedAt, twoFactor, twoFactorMethod }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [note, setNote] = useState("");
  const changed = passwordChangedAt ? new Date(passwordChangedAt) : null;

  const submit = async () => {
    if (!current || !next) { setNote(T("Mevcut ve yeni şifreni gir.")); return; }
    if (next !== again) { setNote(T("Yeni şifreler eşleşmiyor.")); return; }
    try {
      await onPassword(current, next);
      setCurrent(""); setNext(""); setAgain("");
      setNote(T("Şifren güncellendi."));
    } catch (error) {
      setNote(error.message || T("Şifre güncellenemedi."));
    }
  };

  const Field = ({ value, onChange, placeholder }) => (
    <input
      type="password"
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      style={{
        width: "100%", height: 54, borderRadius: 15, padding: "0 16px",
        background: "rgba(255,255,255,.62)", border: "1px solid var(--edge)",
        fontSize: "calc(15px * var(--s))",
      }}
    />
  );

  return (
    <div className="page">
      <div className="page-head with-tail">
        <button className="icon-btn" onClick={onBack} aria-label={T("Geri")}><Icon name="back" size={21} /></button>
        <span>
          <h1 style={{ margin: 0, fontSize: "calc(24px * var(--s))", fontWeight: 700 }}>{T("Güvenlik")}</h1>
          <span className="mk-sub">{T("Şifre, cihazlar ve işlem onayı")}</span>
        </span>
        <span />
      </div>

      <section className="mk-card">
        <div className="mk-card-head" style={{ marginBottom: 14 }}>
          <span className="mk-chip-ico" style={{ background: "#ece7ff", color: "#7b5bdc" }}><Icon name="lock" size={18} /></span>
          <h2>{T("Şifre Değiştir")}</h2>
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          <Field value={current} onChange={setCurrent} placeholder={T("Mevcut şifre")} />
          <Field value={next} onChange={setNext} placeholder={T("Yeni şifre")} />
          <Field value={again} onChange={setAgain} placeholder={T("Yeni şifre (tekrar)")} />
          <button className="mk-btn" style={{ background: "var(--accent)", color: "#fff", height: 54, borderRadius: 15, fontWeight: 700 }} onClick={submit}>
            {T("Şifreyi Güncelle")}
          </button>
          {note && <span style={{ fontSize: "calc(13px * var(--s))", color: "var(--muted)" }}>{note}</span>}
          {changed && !note && (
            <span style={{ fontSize: "calc(12.5px * var(--s))", color: "var(--muted)" }}>
              {T("Son değiştirme:")} {changed.toLocaleDateString(locale(), { day: "numeric", month: "long", year: "numeric" })}
            </span>
          )}
        </div>
      </section>

      <section className="mk-card">
        <div className="mk-card-head" style={{ marginBottom: 6 }}>
          <span className="mk-chip-ico" style={{ background: "var(--tint-blue)", color: "var(--accent)" }}><Icon name="laptop" size={18} /></span>
          <h2>{T("Aktif Cihazlar")}</h2>
        </div>
        {sessions.length ? sessions.map((session, index) => {
          const mobile = /Mobile|Android|iPhone/i.test(session.device || "");
          const label = (session.device || "").split(")")[0].split("(").pop() || T("Cihaz");
          return (
            <React.Fragment key={session.id}>
              {index > 0 && <div className="hline" />}
              <div style={{ display: "grid", gridTemplateColumns: "40px 1fr auto", gap: 12, alignItems: "center", padding: "12px 0" }}>
                <span style={{ width: 40, height: 40, borderRadius: 13, display: "grid", placeItems: "center", background: "var(--soft)", color: "var(--muted)" }}>
                  <Icon name={mobile ? "phone" : "laptop"} size={19} />
                </span>
                <span style={{ minWidth: 0 }}>
                  <b style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "calc(15.5px * var(--s))", fontWeight: 700 }}>
                    {label}
                    {session.current && <span className="mk-tag buy">{T("Bu cihaz")}</span>}
                  </b>
                  <s style={{ display: "block", textDecoration: "none", fontSize: "calc(12.5px * var(--s))", color: "var(--muted)", marginTop: 2 }}>
                    {session.ip_address} · {session.last_seen_at}
                  </s>
                </span>
                {session.current
                  ? <span />
                  : <button className="mk-btn ghost" style={{ height: 38, padding: "0 14px", fontSize: "calc(13.5px * var(--s))" }} onClick={() => onRevoke(session.id)}>{T("Çıkış yap")}</button>}
              </div>
            </React.Fragment>
          );
        }) : (
          <div className="mk-empty"><span>{T("Kayıtlı cihaz bulunmuyor.")}</span></div>
        )}
      </section>

      <section className="mk-card">
        <div className="mk-card-head" style={{ marginBottom: 12 }}>
          <span className="mk-chip-ico" style={{ background: "var(--tint-green)", color: "var(--green)" }}><Icon name="shield" size={18} /></span>
          <h2>{T("İşlem Onayı")}</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ flex: 1 }}>
            <b style={{ display: "block", fontSize: "calc(15.5px * var(--s))", fontWeight: 700 }}>{T("Al-Sat işlemlerinde şifre iste")}</b>
            <s style={{ display: "block", textDecoration: "none", fontSize: "calc(12.5px * var(--s))", color: "var(--muted)", marginTop: 2 }}>
              {T("Açıkken her emirden önce işlem şifresi sorulur")}
            </s>
          </span>
          <Toggle on={confirmOn} onChange={setConfirmOn} />
        </div>
        <div className="hline" style={{ margin: "14px 0" }} />
        <button onClick={onTwoFactor} style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left" }}>
          <span style={{ flex: 1 }}>
            <b style={{ display: "block", fontSize: "calc(15.5px * var(--s))", fontWeight: 700 }}>{T("İki Adımlı Doğrulama")}</b>
            <s style={{ display: "block", textDecoration: "none", fontSize: "calc(12.5px * var(--s))", color: "var(--muted)", marginTop: 2 }}>
              {twoFactor ? `${T("Açık")} · ${T("Doğrulama uygulaması")}` : T("Kapalı")}
            </s>
          </span>
          <Icon name="chevron" size={16} />
        </button>
      </section>
    </div>
  );
}

export const maskPhone = (value) => {
  const digits = String(value || "").replace(/\D/g, "").replace(/^90/, "").replace(/^0/, "");
  return digits.length >= 10 ? `+90 ${digits[0]}•• ••• •• ${digits.slice(-2)}` : "+90 5•• ••• •• ••";
};

const Radio = ({ on }) => (
  <span className="radio" data-on={on ? "1" : "0"}><i /></span>
);

export function TwoFactorPage({ onBack, twoFactor, twoFactorMethod, confirmOn, phone, onSave }) {
  const [enabled, setEnabled] = useState(twoFactor);
  const method = 1; // SMS kaldırıldı; tek yöntem doğrulama uygulaması.
  const [confirm, setConfirm] = useState(confirmOn);

  return (
    <div className="page gap-14">
      <CenteredHeader title={T("İki Adımlı Doğrulama")} onBack={onBack} />
      <span style={{ fontSize: "calc(14px * var(--s))", color: "var(--muted)" }}>{T("Girişte ek doğrulama ile hesabınızı koruyun.")}</span>

      <div className="sec-card">
        <Divided>
          <SecRow
            icon="shield"
            label={T("İki Adımlı Doğrulama")}
            note={T("Hesabınızı daha güvenli hale getirin.")}
            tail={<Toggle on={enabled} onChange={setEnabled} />}
          />
        </Divided>
      </div>

      <Section heading={T("DOĞRULAMA YÖNTEMİ")}>
        <SecRow
          icon="phone"
          label={T("Doğrulama Uygulaması")}
          note={T("Google Authenticator, Microsoft Authenticator")}
          tail={<Radio on />}
        />
      </Section>

      <div className="sec-card">
        <Divided>
          <SecRow
            icon="phone"
            label={T("İşlem Onayı")}
            note={T("Para çekme ve kritik işlemlerde ek doğrulama")}
            tail={<Toggle on={confirm} onChange={setConfirm} />}
          />
        </Divided>
      </div>

      <button className="btn primary-lg" onClick={() => onSave(enabled, method, confirm)}>{T("Kaydet ve Devam Et")}</button>
    </div>
  );
}

/* ---------- Şifre Değiştir ---------- */

const RULES = ["En az 8 karakter", "Büyük ve küçük harf", "En az bir rakam", "Özel karakter"];
const checkRules = (text = "") => [
  text.length >= 8,
  /[A-ZĞÜŞİÖÇ]/.test(text) && /[a-zğüşıöç]/.test(text),
  /\d/.test(text),
  /[^\p{L}\d\s]/u.test(text),
];

function PasswordField({ label, value, onChange }) {
  const [shown, setShown] = useState(false);
  return (
    <div className="pw-field">
      <label>{label}</label>
      <div className="box">
        <input type={shown ? "text" : "password"} value={value} placeholder="••••••••" onChange={(event) => onChange(event.target.value)} />
        <button className="icon-btn" onClick={() => setShown((current) => !current)} aria-label={T("Göster")}>
          <Icon name={shown ? "eye-off" : "eye"} size={20} color="var(--muted)" />
        </button>
      </div>
    </div>
  );
}

export function PasswordPage({ onBack, onSubmit }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const ok = checkRules(next);
  const count = ok.filter(Boolean).length;
  const tone = count <= 1 ? "var(--red)" : count === 2 ? "var(--ink-orange)" : count === 3 ? "var(--purple)" : "var(--green)";
  const grade = !next ? "" : T(count <= 1 ? "Zayıf" : count === 2 ? "Orta" : count === 3 ? "İyi" : "Güçlü");

  const send = async () => {
    const problem = !current ? "Mevcut şifreni gir."
      : !ok.every(Boolean) ? "Yeni şifre dört kuralı da karşılamalı."
        : again !== next ? "Yeni şifreler eşleşmiyor."
          : current === next ? "Yeni şifre mevcut şifreyle aynı olamaz." : null;
    if (problem) { setError(T(problem)); return; }
    setBusy(true);
    try { await onSubmit(current, next); } catch (problemError) { setError(problemError.message); } finally { setBusy(false); }
  };

  return (
    <div className="page gap-14">
      <CenteredHeader title={T("Şifre Değiştir")} onBack={onBack} />
      <PasswordField label={T("Mevcut Şifre")} value={current} onChange={setCurrent} />
      <PasswordField label={T("Yeni Şifre")} value={next} onChange={setNext} />
      <PasswordField label={T("Yeni Şifre Tekrar")} value={again} onChange={setAgain} />
      <div className="sec-section">
        <div className="head">{T("ŞİFRE GÜVENLİĞİ")}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "12px 2px" }}>
          <div className="meter">
            <div className="bar">{[0, 1, 2, 3].map((index) => <i key={index} style={index < count ? { background: tone } : undefined} />)}</div>
            <span className="grade" style={{ color: tone }}>{grade}</span>
          </div>
          {RULES.map((rule, index) => (
            <div className={`rule${ok[index] ? " ok" : ""}`} key={rule}>
              <span className="disc"><Icon name="check" size={15} /></span>
              {T(rule)}
            </div>
          ))}
        </div>
      </div>
      {error && <span style={{ fontSize: "calc(12.5px * var(--s))", color: "var(--red)" }}>{error}</span>}
      <button className="btn primary-lg" disabled={busy} onClick={send}>{T("Şifreyi Değiştir")}</button>
    </div>
  );
}

/* ---------- Kişisel Bilgiler ---------- */

export function Personal({ onBack, me, onContact, onIdentity, onAvatar, monogram }) {
  return (
    <div className="page gap-14">
      <CenteredHeader title={T("Kişisel Bilgiler")} onBack={onBack} />
      <div className="sec-card">
        <Divided>
          <button className="sec-row" onClick={onAvatar}>
            <span className="ava n44 lav" style={{ overflow: "hidden" }}>
              {me?.avatar_url ? <img src={me.avatar_url} alt="" /> : monogram}
            </span>
            <span className="copy">
              <strong>{T("Profil fotoğrafı")}</strong>
              <span>{me?.avatar_url ? T("Fotoğrafı değiştir") : T("Fotoğraf yükle")}</span>
            </span>
            <span />
            <Icon name="chevron" size={18} color="var(--muted)" />
          </button>
          <InfoRow title={T("Kimlik Bilgileri")} note={T("Ad soyad, T.C. kimlik no ve doğum tarihi")} chevron onClick={onIdentity} />
          <InfoRow title={T("İletişim Bilgileri")} note={T("E-posta ve tebligat tercihiniz")} chevron onClick={onContact} />
        </Divided>
      </div>
    </div>
  );
}

export function Contact({ onBack, me, onNotice, channel, setChannel }) {
  const [picker, setPicker] = useState(false);
  const channels = ["E-posta", "SMS", "Posta"];
  return (
    <div className="page gap-14">
      <CenteredHeader title={T("İletişim Bilgileri")} onBack={onBack} />
      <div className="sec-card">
        <Divided>
          <InfoRow title={T("E-posta")} note={me?.email || T("E-postanızı giriniz")} chevron onClick={() => onNotice("E-posta", "Değişiklik için kayıtlı telefonuna doğrulama kodu gönderilir; bu sürümde kapalı.")} />
          <InfoRow title={T("Tebligat Tercihi")} note={T(channels[channel] || channels[0])} chevron onClick={() => setPicker(true)} />
        </Divided>
      </div>
      {picker && (
        <Sheet title={T("Tebligat Tercihi")} onClose={() => setPicker(false)}>
          <Choices names={channels.map((item) => T(item))} selected={channel} onChoose={(index) => { setChannel(index); setPicker(false); }} />
        </Sheet>
      )}
      <div className="contact-note">
        <Icon name="info" size={22} color="var(--muted)" />
        <span>{T("E-posta değişiklikleri için doğrulama gerekir.")}</span>
      </div>
    </div>
  );
}

/* ---------- Bildirim Ayarları ---------- */

const NOTIFY_KEYS = ["notify-price", "notify-news", "notify-trade", "notify-referral"];
const QUIET_HOURS = ["Kapalı", "22:00 - 08:00", "23:00 - 07:00", "00:00 - 08:00"];
const WEEKLY = ["Kapalı", "Her pazartesi 09:00", "Her cuma 18:00", "Her pazar 20:00"];

const PUSH_NOTES = {
  acik: "Bu cihaza bildirim gönderiliyor",
  kapali: "Bildirimleri bu cihaza almak için açın",
  bekliyor: "Ayarlanıyor…",
  engellendi: "Tarayıcı bu site için bildirimleri engelliyor",
  "ana-ekran-gerekli": "iPhone'da önce uygulamayı ana ekrana ekleyin",
  desteklenmiyor: "Bu tarayıcı cihaz bildirimini desteklemiyor",
  hata: "Abonelik kurulamadı, tekrar deneyin",
};

export function NotifySettings({ onBack, draft, setDraft, quiet, setQuiet, weekly, setWeekly, onSave, push = "kapali", onPush, onPushTest }) {
  const [picker, setPicker] = useState(null);
  const anyOn = NOTIFY_KEYS.some((key) => draft[key]);
  const setAll = (on) => setDraft(Object.fromEntries(NOTIFY_KEYS.map((key) => [key, on])));

  const Type = ({ id, title, note }) => (
    <InfoRow title={title} note={note} tail={<Toggle on={Boolean(draft[id])} onChange={(on) => setDraft({ ...draft, [id]: on })} />} />
  );

  return (
    <div className="page gap-12 notify-page">
      <CenteredHeader title={T("Bildirim Ayarları")} onBack={onBack} />
      <div className="sec-card">
        <InfoRow
          title={T("Cihaz Bildirimleri")}
          note={T(PUSH_NOTES[push] || PUSH_NOTES.kapali)}
          tail={<Toggle on={push === "acik"} onChange={(on) => onPush?.(on)} />}
        />
      </div>
      {push === "acik" && (
        <div className="sec-card">
          <InfoRow title={T("Deneme bildirimi gönder")} note={T("Bu cihaza örnek bir bildirim yollar")} chevron onClick={() => onPushTest?.()} />
        </div>
      )}
      <div className="sec-card">
        <InfoRow title={T("Tüm Bildirimler")} note={T("Tüm bildirimleri tek dokunuşla aç veya kapat")} tail={<Toggle on={anyOn} onChange={setAll} />} />
      </div>
      <Section heading={T("BİLDİRİM TÜRLERİ")}>
        <Type id="notify-price" title={T("Fiyat Bildirimleri")} note={T("İzlediğiniz hisselerde fiyat uyarıları")} />
        <Type id="notify-news" title={T("Haber Bildirimleri")} note={T("Piyasa haberleri ve şirket duyuruları")} />
        <Type id="notify-trade" title={T("İşlem Bildirimleri")} note={T("Alım, satım ve emir gerçekleşmeleri")} />
        <Type id="notify-referral" title={T("Referans Bildirimleri")} note={T("Referansınızın işlem ve fırsat duyuruları")} />
      </Section>
      <Section heading={T("ZAMANLAMA")}>
        <InfoRow title={T("Sessiz Saatler")} note={T(QUIET_HOURS[quiet])} chevron onClick={() => setPicker("quiet")} />
        <InfoRow title={T("Haftalık Özet")} note={T(WEEKLY[weekly])} chevron onClick={() => setPicker("weekly")} />
      </Section>
      <button className="btn primary-lg" onClick={onSave}>{T("Kaydet")}</button>

      {picker === "quiet" && (
        <Sheet title={T("Sessiz Saatler")} onClose={() => setPicker(null)}>
          <Choices names={QUIET_HOURS.map(T)} selected={quiet} onChoose={(index) => { setQuiet(index); setPicker(null); }} />
        </Sheet>
      )}
      {picker === "weekly" && (
        <Sheet title={T("Haftalık Özet")} onClose={() => setPicker(null)}>
          <Choices names={WEEKLY.map(T)} selected={weekly} onChoose={(index) => { setWeekly(index); setPicker(null); }} />
        </Sheet>
      )}
    </div>
  );
}

export { NOTIFY_KEYS };

/* ---------- Sözleşmeler ---------- */

// APK'daki "Politika ve Sözleşmeler" ekranı.
const DOC_ROWS = [
  { title: "Güvenlik Politikası", note: "Hesap ve veri güvenliği ilkeleri", pick: (list, privacy) => privacy },
  { title: "KVKK Aydınlatma Metni", note: "Kişisel verilerin işlenmesi", pick: (list) => list.find((item) => item.title.includes("Kişisel Verilerin")) },
  { title: "Müşteri Çerçeve Sözleşmesi", note: "Aracılık hizmetinin koşulları", pick: (list) => list.find((item) => item.title.includes("Çerçeve")) },
  { title: "Risk Bildirim Formu", note: "Sermaye piyasası işlemlerinin riskleri", pick: (list) => list.find((item) => item.title.includes("Risk")) },
  { title: "Kullanım Koşulları", note: "Uygulamanın kullanım kuralları", pick: (list) => list.find((item) => item.title.includes("Elektronik İşlem")) },
];

export function ContractsList({ onBack, onOpen }) {
  const [all, setAll] = useState(false);
  const rows = DOC_ROWS.map((row) => ({ ...row, doc: row.pick(CONTRACTS, PRIVACY) })).filter((row) => row.doc);
  const shown = rows.map((row) => row.doc.title);
  const rest = CONTRACTS.filter((item) => !shown.includes(item.title));

  return (
    <div className="page">
      <div className="page-head with-tail">
        <button className="icon-btn" onClick={onBack} aria-label={T("Geri")}><Icon name="back" size={21} /></button>
        <span>
          <h1 style={{ margin: 0, fontSize: "calc(23px * var(--s))", fontWeight: 700 }}>{T("Politika ve Sözleşmeler")}</h1>
          <span className="mk-sub">{T("Güvenlik politikası, KVKK ve sözleşmeler")}</span>
        </span>
        <span />
      </div>

      <section className="mk-card mk-menu">
        {rows.map((row, index) => (
          <React.Fragment key={row.title}>
            {index > 0 && <div className="hline" />}
            <button onClick={() => onOpen({ ...row.doc, title: T(row.title) })}>
              <i className="tile t1"><Icon name="list" size={20} /></i>
              <span><b>{T(row.title)}</b><s>{T(row.note)}</s></span>
              <span className="chev"><Icon name="chevron" size={16} /></span>
            </button>
          </React.Fragment>
        ))}
      </section>

      {rest.length > 0 && (
        all ? (
          <section className="mk-card mk-menu">
            {rest.map((item, index) => (
              <React.Fragment key={item.title}>
                {index > 0 && <div className="hline" />}
                <button onClick={() => onOpen(item)}>
                  <i className="tile t5"><Icon name="list" size={20} /></i>
                  <span><b>{item.title}</b><s>{T("Bilgilendirme metni")}</s></span>
                  <span className="chev"><Icon name="chevron" size={16} /></span>
                </button>
              </React.Fragment>
            ))}
          </section>
        ) : (
          <button className="mk-btn ghost" style={{ width: "100%" }} onClick={() => setAll(true)}>{T("Tüm belgeleri göster")}</button>
        )
      )}

      <div className="mk-version">{T("Sözleşmelerin imzalı kopyaları e-posta adresinize gönderilir.")}</div>
    </div>
  );
}

export function DocumentPage({ document: doc, onBack }) {
  const blocks = useMemo(() => {
    const out = [];
    for (const raw of (doc?.body || "").split("\n")) {
      const line = raw.trim();
      if (!line) continue;
      if (line.startsWith("* ")) { out.push({ type: "bullet", text: line.slice(2) }); continue; }
      const numbered = line.length > 2 && /^\d/.test(line) && line.indexOf(". ") >= 0 && line.indexOf(". ") < 4;
      const heading = line.startsWith("Madde ") || numbered || (line.length < 64 && !".;:,".includes(line[line.length - 1]));
      out.push({ type: heading ? "head" : "text", text: line });
    }
    return out;
  }, [doc]);

  return (
    <div className="page gap-14">
      <PageHeader title={doc?.title || "Belge"} onBack={onBack} />
      <div className="doc-card">
        {blocks.map((block, index) =>
          block.type === "head" ? <h3 key={index}>{block.text}</h3>
            : block.type === "bullet" ? <div className="bullet" key={index}><span>•</span><span>{block.text}</span></div>
              : <p key={index}>{block.text}</p>
        )}
      </div>
    </div>
  );
}

export { CONTRACTS, PRIVACY };
