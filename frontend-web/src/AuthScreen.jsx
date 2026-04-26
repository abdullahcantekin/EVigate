import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Mail, Lock, Eye, EyeOff, User, Zap, ArrowRight, ChevronRight, Wifi, Shield, AlertCircle,
} from "lucide-react";

// --- SUPABASE BAĞLANTISI ---
// Buraya kendi Supabase proje URL ve Anon Key'ini tırnak içinde yapıştır.
const supabaseUrl = "https://fuiekipxjhkbjxnaqenn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1aWVraXB4amhrYmp4bmFxZW5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzOTUyMTQsImV4cCI6MjA4ODk3MTIxNH0.4G0CMBFnWCrtI-jbJvXwD4Ar-MKR69NftGQeB79oD6s";
const supabase = createClient(supabaseUrl, supabaseKey);

/* ─────────────────────────────────────────────
   GOOGLE FONTS  (add once to index.html if not already present)
   <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Sora:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
───────────────────────────────────────────── */

// ── Keyframe injection (runs once on mount) ──
const KEYFRAMES = `
  @keyframes ev-pulse   { 0%,100%{opacity:.3} 50%{opacity:.8} }
  @keyframes ev-ping    { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(2.2);opacity:0} }
  @keyframes ev-scanX   { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }
  @keyframes ev-fadeUp  { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ev-slideR  { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
  @keyframes ev-orb1    { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-20px) scale(1.08)} }
  @keyframes ev-orb2    { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-20px,25px) scale(1.05)} }
  @keyframes ev-dashFlow{ to{stroke-dashoffset:-180} }
  @keyframes ev-spin    { to{transform:rotate(360deg)} }
`;

function injectKeyframes() {
  if (document.getElementById("ev-kf")) return;
  const s = document.createElement("style");
  s.id = "ev-kf";
  s.textContent = KEYFRAMES;
  document.head.appendChild(s);
}

// ── Tiny helpers ──────────────────────────────
const C = {
  bg: "#080d1a",
  green: "#4ade80",
  greenDim: "rgba(74,222,128,0.12)",
  greenBorder: "rgba(74,222,128,0.3)",
  glass: "linear-gradient(135deg,rgba(13,27,42,0.97),rgba(8,14,26,0.97))",
  border: "rgba(255,255,255,0.07)",
  inputBg: "rgba(255,255,255,0.04)",
  inputBorder: "rgba(255,255,255,0.08)",
  muted: "rgba(255,255,255,0.35)",
  faint: "rgba(255,255,255,0.18)",
};

// ── Sub-components ────────────────────────────

function MapBg() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, background: C.bg }} />
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.055 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="g1" width="56" height="56" patternUnits="userSpaceOnUse">
            <path d="M56 0L0 0 0 56" fill="none" stroke="#4ade80" strokeWidth="0.5" />
          </pattern>
          <pattern id="g2" width="280" height="280" patternUnits="userSpaceOnUse">
            <path d="M280 0L0 0 0 280" fill="none" stroke="#4ade80" strokeWidth="1.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#g1)" />
        <rect width="100%" height="100%" fill="url(#g2)" />
      </svg>
      <div style={{ position: "absolute", top: "8%", left: "5%", width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle,rgba(74,222,128,0.07),transparent 68%)", animation: "ev-orb1 9s ease-in-out infinite" }} />
      <div style={{ position: "absolute", bottom: "5%", right: "3%", width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle,rgba(34,211,238,0.055),transparent 68%)", animation: "ev-orb2 12s ease-in-out infinite" }} />
      <div style={{ position: "absolute", top: "50%", right: "25%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(74,222,128,0.04),transparent 70%)", animation: "ev-pulse 7s ease-in-out infinite 2s" }} />
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <path d="M0 400 Q300 320 600 420 T1200 360" fill="none" stroke="#1e293b" strokeWidth="16" />
        <path d="M0 400 Q300 320 600 420 T1200 360" fill="none" stroke="#0f172a" strokeWidth="11" />
        <path d="M240 0 Q380 220 300 500 T280 800" fill="none" stroke="#1e293b" strokeWidth="12" />
        <path d="M240 0 Q380 220 300 500 T280 800" fill="none" stroke="#0f172a" strokeWidth="8" />
        <path d="M900 0 L920 250 Q950 450 880 600 L850 800" fill="none" stroke="#172033" strokeWidth="9" />
        <path d="M0 160 Q500 110 900 250 T1200 280" fill="none" stroke="#172033" strokeWidth="7" />
        <path d="M80 720 Q180 500 300 420 Q450 380 600 420 Q750 460 920 250" fill="none" stroke="#4ade80" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="11 6" opacity="0.55" style={{ filter: "drop-shadow(0 0 7px #4ade80)", animation: "ev-dashFlow 3.5s linear infinite" }} />
        <path d="M80 720 Q180 500 300 420 Q450 380 600 420 Q750 460 920 250" fill="none" stroke="#4ade80" strokeWidth="1" strokeLinecap="round" opacity="0.2" />
        {[[80,720],[300,420],[600,420],[920,250]].map(([cx,cy],i) => (
          <circle key={i} cx={cx} cy={cy} r="5" fill={i===3?"#22d3ee":"#4ade80"} style={{ filter: `drop-shadow(0 0 7px ${i===3?"#22d3ee":"#4ade80"})` }} />
        ))}
      </svg>
      <div style={{ position: "absolute", inset: 0, opacity: 0.018, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(74,222,128,0.6) 2px,rgba(74,222,128,0.6) 3px)" }} />
    </div>
  );
}

function GlassInput({ id, label, type = "text", placeholder, icon: Icon, value, onChange, rightSlot, error }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label htmlFor={id} style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, fontFamily: "'Sora',sans-serif" }}>
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: focused ? C.green : C.faint, transition: "color 0.25s" }}>
          <Icon size={16} />
        </div>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%", padding: "13px 44px 13px 42px", borderRadius: 13,
            background: focused ? "rgba(74,222,128,0.05)" : C.inputBg,
            border: `1px solid ${error ? "rgba(248,113,113,0.55)" : focused ? "rgba(74,222,128,0.45)" : C.inputBorder}`,
            color: "white", fontSize: 14, fontFamily: "'Sora',sans-serif", outline: "none",
            transition: "border-color 0.25s,background 0.25s",
            boxShadow: focused ? "0 0 0 3px rgba(74,222,128,0.07)" : "none",
          }}
        />
        {rightSlot && (
          <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}>
            {rightSlot}
          </div>
        )}
      </div>
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#f87171", fontSize: 11, fontFamily: "'Sora',sans-serif", marginTop: 2 }}>
          <AlertCircle size={12} /> {error}
        </div>
      )}
    </div>
  );
}

function PasswordInput({ id, label, placeholder, value, onChange, error }) {
  const [show, setShow] = useState(false);
  return (
    <GlassInput
      id={id} label={label} type={show ? "text" : "password"} placeholder={placeholder}
      icon={Lock} value={value} onChange={onChange} error={error}
      rightSlot={
        <button
          type="button" onClick={() => setShow(v => !v)}
          style={{ background: "none", border: "none", cursor: "pointer", color: C.faint, padding: 2, lineHeight: 0, transition: "color 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.color = C.green)}
          onMouseLeave={e => (e.currentTarget.style.color = C.faint)}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      }
    />
  );
}

function PrimaryButton({ children, onClick, loading }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button" onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%", padding: "14px 20px", borderRadius: 14, border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        background: loading ? "rgba(74,222,128,0.4)" : hovered ? "#6ee7a0" : C.green,
        color: "#080d1a", fontSize: 14, fontWeight: 900, fontFamily: "'Sora',sans-serif",
        letterSpacing: "0.04em", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        transition: "background 0.25s,box-shadow 0.25s,transform 0.15s",
        boxShadow: hovered && !loading ? "0 0 28px rgba(74,222,128,0.45),0 4px 20px rgba(0,0,0,0.3)" : "0 0 16px rgba(74,222,128,0.2)",
        transform: hovered && !loading ? "translateY(-1px)" : "none",
      }}
    >
      {loading ? (
        <>
          <div style={{ width: 16, height: 16, border: "2px solid rgba(8,13,26,0.3)", borderTop: "2px solid #080d1a", borderRadius: "50%", animation: "ev-spin 0.75s linear infinite" }} />
          Doğrulanıyor...
        </>
      ) : (
        <>
          {children}
          <ArrowRight size={16} />
        </>
      )}
    </button>
  );
}

function TextLink({ children, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button" onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: "none", border: "none", cursor: "pointer", color: hov ? C.green : C.muted, fontSize: 12, fontFamily: "'Sora',sans-serif", fontWeight: 500, textDecoration: hov ? "underline" : "none", transition: "color 0.2s", padding: 0 }}
    >
      {children}
    </button>
  );
}

function Divider({ text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "'Sora',sans-serif", whiteSpace: "nowrap" }}>{text}</span>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
    </div>
  );
}

// ── Main Component ────────────────────────────
export default function AuthScreen({ onSuccess }) {
  const [mode, setMode] = useState("login"); 
  const [loading, setLoading] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState(""); // Genel sunucu hataları için

  useEffect(() => { injectKeyframes(); }, []);

  function switchMode(next) {
    setErrors({});
    setAuthError("");
    setMode(next);
    setAnimKey(k => k + 1); 
  }

  function validate() {
    const e = {};
    if (mode === "register" && !name.trim()) e.name = "İsim gerekli";
    if (!email.includes("@")) e.email = "Geçerli bir e-posta girin";
    if (password.length < 6) e.password = "En az 6 karakter gerekli";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // --- GERÇEK SUPABASE AUTH MANTIĞI ---
  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    setAuthError("");

    try {
      if (mode === "register") {
        // KAYIT OL
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: { data: { full_name: name } } // İsmi veritabanına kaydeder
        });

        if (error) throw error;
        
        alert("Kayıt başarılı! Lütfen giriş yapın.");
        switchMode("login");

      } else {
        // GİRİŞ YAP
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) throw error;

        // Başarılı giriş, App.jsx'e kullanıcının bilgisini gönderiyoruz
        if (onSuccess) onSuccess(data.user);
      }
    } catch (error) {
      console.error("Auth Error:", error.message);
      // Hataları Türkçeleştirip kullanıcıya gösterelim
      if (error.message.includes("Invalid login")) {
        setAuthError("E-posta adresiniz veya şifreniz hatalı.");
      } else if (error.message.includes("already registered")) {
        setAuthError("Bu e-posta adresi zaten kayıtlı.");
      } else {
        setAuthError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  const isLogin = mode === "login";

  return (
    <div style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Sora',sans-serif", overflow: "hidden" }}>
      <MapBg />

      {/* Top-right status chip */}
      <div style={{ position: "absolute", top: 18, right: 18, display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 10, background: "rgba(13,27,42,0.9)", border: `1px solid ${C.border}`, backdropFilter: "blur(20px)", zIndex: 10 }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, animation: "ev-pulse 2s infinite" }} />
        <span style={{ fontSize: 11, color: "rgba(74,222,128,0.7)", fontWeight: 600 }}>Sistem Aktif</span>
        <div style={{ width: 1, height: 12, background: C.border }} />
        <Wifi size={12} color="rgba(255,255,255,0.2)" />
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Auth</span>
      </div>

      {/* ── Auth Card ── */}
      <div
        key={animKey}
        style={{
          position: "relative", zIndex: 20, width: "100%", maxWidth: 440, margin: "0 16px", padding: "36px 36px 32px",
          borderRadius: 24, background: C.glass, border: `1px solid ${C.border}`,
          boxShadow: "0 0 0 1px rgba(74,222,128,0.05),0 30px 70px rgba(0,0,0,0.6),0 0 80px rgba(74,222,128,0.05)",
          animation: "ev-fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, borderRadius: "24px 24px 0 0", background: `linear-gradient(90deg,transparent,${C.green},transparent)`, opacity: 0.35, overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.9) 50%,transparent 100%)", animation: "ev-scanX 3s linear infinite" }} />
        </div>

        {/* ── Logo ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div style={{ position: "relative", width: 42, height: 42, background: C.greenDim, border: `1px solid ${C.greenBorder}`, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Zap size={20} color={C.green} fill={C.green} />
            <div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: C.green }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: C.green, animation: "ev-ping 2s ease-out infinite" }} />
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 22, fontWeight: 900, letterSpacing: "-0.5px", lineHeight: 1, color: "white" }}>EVigate</div>
            <div style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(74,222,128,0.5)", fontWeight: 600, marginTop: 3 }}>Smart EV Navigator</div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.green }}>{isLogin ? "Giriş Yap" : "Kayıt Ol"}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{isLogin ? "Hesabına hoş geldin" : "Hemen başla"}</div>
          </div>
        </div>

        {/* ── Mode tabs ── */}
        <div style={{ display: "flex", gap: 4, padding: 4, borderRadius: 14, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, marginBottom: 28 }}>
          {[["login","Giriş Yap"],["register","Kayıt Ol"]].map(([m, lbl]) => (
            <button
              key={m} type="button" onClick={() => switchMode(m)}
              style={{
                flex: 1, padding: "9px 0", borderRadius: 11, border: "none", cursor: "pointer",
                fontFamily: "'Sora',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.03em",
                transition: "all 0.25s", background: mode === m ? C.green : "transparent",
                color: mode === m ? "#080d1a" : C.muted, boxShadow: mode === m ? "0 0 16px rgba(74,222,128,0.3)" : "none",
              }}
            >
              {lbl}
            </button>
          ))}
        </div>

        {/* Genel Hata Mesajı (Yanlış şifre vs) */}
        {authError && (
          <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", padding: "10px", borderRadius: "10px", fontSize: "12px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
             <AlertCircle size={14} /> {authError}
          </div>
        )}

        {/* ── Form fields ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {!isLogin && (
            <div style={{ animation: "ev-slideR 0.3s ease-out both" }}>
              <GlassInput
                id="ev-name" label="İsim & Soyisim" placeholder="Ahmet Yılmaz" icon={User}
                value={name} onChange={e => setName(e.target.value)} error={errors.name}
              />
            </div>
          )}

          <GlassInput
            id="ev-email" label="E-posta" type="email" placeholder="ornek@mail.com" icon={Mail}
            value={email} onChange={e => setEmail(e.target.value)} error={errors.email}
          />

          <PasswordInput
            id="ev-pass" label="Şifre" placeholder={isLogin ? "Şifrenizi girin" : "En az 6 karakter"}
            value={password} onChange={e => setPassword(e.target.value)} error={errors.password}
          />
        </div>

        {isLogin && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
            <TextLink>Şifremi unuttum</TextLink>
          </div>
        )}

        <div style={{ marginTop: 22 }}>
          <PrimaryButton onClick={handleSubmit} loading={loading}>
            {isLogin ? "Sisteme Giriş Yap" : "Güvenli Hesap Oluştur"}
          </PrimaryButton>
        </div>

        <div style={{ textAlign: "center", marginTop: 18, fontSize: 12, color: C.muted, fontFamily: "'Sora',sans-serif" }}>
          {isLogin ? (
            <>Hesabın yok mu?{" "}<TextLink onClick={() => switchMode("register")}>Kayıt Ol <ChevronRight size={11} style={{ display: "inline", verticalAlign: "middle" }} /></TextLink></>
          ) : (
            <>Zaten hesabın var mı?{" "}<TextLink onClick={() => switchMode("login")}>Giriş Yap <ChevronRight size={11} style={{ display: "inline", verticalAlign: "middle" }} /></TextLink></>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 26, paddingTop: 18, borderTop: `1px solid rgba(255,255,255,0.05)` }}>
          <Shield size={12} color="rgba(74,222,128,0.45)" />
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'Sora',sans-serif" }}>256-bit SSL şifreleme · Supabase Güvencesiyle</span>
        </div>
      </div>
    </div>
  );
}