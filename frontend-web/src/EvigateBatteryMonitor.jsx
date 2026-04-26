import React, { useState, useEffect, useRef } from "react";
import { Activity, Save } from "lucide-react"; // Save ikonunu ekledik
import Chart from 'chart.js/auto';

const MODELS = {
  model3: { name: "Tesla Model 3", cap: 75, range: 560, degradePerYear: 2.3, degradePer10k: 0.4 },
  modely: { name: "Tesla Model Y", cap: 82, range: 530, degradePerYear: 2.5, degradePer10k: 0.45 },
  models: { name: "Tesla Model S", cap: 100, range: 650, degradePerYear: 2.1, degradePer10k: 0.35 },
  leaf:   { name: "Nissan Leaf", cap: 40, range: 270, degradePerYear: 3.8, degradePer10k: 0.7 },
  ioniq5: { name: "Hyundai Ioniq 5", cap: 77.4, range: 500, degradePerYear: 2.4, degradePer10k: 0.42 },
  egolf:  { name: "VW e-Golf", cap: 35.8, range: 230, degradePerYear: 3.2, degradePer10k: 0.6 },
};

function calcSOH(model, year, km) {
  const age = Math.max(0, 2026 - parseInt(year));
  const km10k = (parseInt(km) || 0) / 10000;
  return Math.max(60, Math.round(100 - age * model.degradePerYear - km10k * model.degradePer10k));
}

function getMonthlyData(model, year, km) {
  const startYear = parseInt(year);
  const totalMonths = Math.max(1, (2026 - startYear) * 12);
  const totalKm = parseInt(km) || 0;
  const kmPerMonth = totalKm / totalMonths;
  const rows = [];
  for (let i = 0; i <= Math.min(totalMonths, 35); i++) {
    const monthIdx = totalMonths - (Math.min(totalMonths, 35) - i);
    const d = new Date(startYear, 0);
    d.setMonth(d.getMonth() + monthIdx);
    const label = d.toLocaleString("tr-TR", { month: "short", year: "2-digit" });
    const kmAtMonth = Math.round(kmPerMonth * monthIdx);
    const ageYears = monthIdx / 12;
    const soh = Math.max(60, parseFloat((100 - ageYears * model.degradePerYear - (kmAtMonth / 10000) * model.degradePer10k).toFixed(1)));
    const menzil = Math.round(model.range * (soh / 100));
    rows.push({ label, soh, menzil, km: kmAtMonth });
  }
  return rows;
}

function getSohColor(soh) {
  if (soh >= 85) return "#4ade80";
  if (soh >= 75) return "#fbbf24";
  if (soh >= 65) return "#f97316";
  return "#f87171";
}

function getSohLabel(soh) {
  if (soh >= 85) return "Mükemmel";
  if (soh >= 75) return "İyi Durum";
  if (soh >= 65) return "Orta";
  return "Dikkat Gerekli";
}

const glassStyle = {
  background: "linear-gradient(135deg,rgba(13,27,42,0.96),rgba(8,14,26,0.97))",
  border: "1px solid rgba(255,255,255,0.07)",
  boxShadow: "0 0 0 1px rgba(74,222,128,0.04),0 20px 40px rgba(0,0,0,0.5)",
};

const inputStyle = {
  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "white",
  fontFamily: "'Sora',sans-serif", fontSize: 13, padding: "10px 14px", borderRadius: 12, outline: "none", width: "100%",
};

const labelStyle = { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", fontWeight: 600, display: "block", marginBottom: 6 };

function Header() {
  return (
    <div style={{ ...glassStyle, padding: "16px 22px", borderRadius: 18, display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 38, height: 38, background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Activity size={18} color="#4ade80" />
      </div>
      <div>
        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 17, fontWeight: 900, letterSpacing: "-0.5px", lineHeight: 1 }}>EVigate <span style={{ color: "#4ade80" }}>Battery</span></div>
        <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(74,222,128,0.5)", fontWeight: 600, marginTop: 2 }}>Pil Sağlığı İzleme Sistemi</div>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", animation: "pulse 2s infinite" }} />
        <span style={{ fontSize: 11, color: "rgba(74,222,128,0.6)", fontWeight: 600 }}>Canlı</span>
      </div>
    </div>
  );
}

// Yeni OnSave ve IsSaving parametreleri eklendi
function InputForm({ modelKey, year, km, chargeLimit, onChange, onSave, isSaving }) {
  return (
    <div style={{ ...glassStyle, padding: "20px 22px", borderRadius: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>Araç Bilgileri</div>
        
        {/* --- YENİ KAYDET BUTONU --- */}
        <button 
          onClick={onSave}
          disabled={isSaving}
          style={{
            background: isSaving ? "rgba(74,222,128,0.2)" : "#4ade80",
            color: isSaving ? "#4ade80" : "#080d1a",
            border: "none", padding: "6px 14px", borderRadius: 8, fontSize: 10, fontWeight: 700,
            cursor: isSaving ? "wait" : "pointer", textTransform: "uppercase", letterSpacing: "0.05em",
            display: "flex", alignItems: "center", gap: 6, transition: "all 0.3s"
          }}
        >
          <Save size={14} />
          {isSaving ? "Kaydediliyor..." : "Verileri Kaydet"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 14 }}>
        <div>
          <label style={labelStyle}>Araç Modeli</label>
          <select value={modelKey} onChange={e => onChange("modelKey", e.target.value)} style={inputStyle}>
            {Object.keys(MODELS).map(k => <option key={k} value={k} style={{background: "#0d1b2a"}}>{MODELS[k].name}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Satın Alma Yılı</label>
          <input type="number" style={inputStyle} value={year} min="2010" max="2026" onChange={e => onChange("year", parseInt(e.target.value) || 2020)} />
        </div>
        <div>
          <label style={labelStyle}>Güncel KM</label>
          <input type="number" style={inputStyle} value={km} min="0" max="500000" onChange={e => onChange("km", parseInt(e.target.value) || 0)} />
        </div>
        <div>
          <label style={labelStyle}>Günlük Şarj (%)</label>
          <select value={chargeLimit} onChange={e => onChange("chargeLimit", parseInt(e.target.value))} style={inputStyle}>
            <option value={80} style={{background: "#0d1b2a"}}>80% (Önerilen)</option>
            <option value={100} style={{background: "#0d1b2a"}}>100% (Tam)</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function StatCards({ soh, currentRange, age, km, color }) {
  const cards = [
    { label: "Güncel SOH", val: `${soh}%`, color },
    { label: "Güncel Menzil", val: `${currentRange} km`, color: "#22d3ee" },
    { label: "Araç Yaşı", val: `${age} yıl`, color: "rgba(255,255,255,0.7)" },
    { label: "Toplam KM", val: km.toLocaleString("tr-TR"), color: "rgba(255,255,255,0.7)" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12 }}>
      {cards.map(s => (
        <div key={s.label} style={{ ...glassStyle, padding: "14px 16px", borderRadius: 16, display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>{s.label}</div>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 900, color: s.color, lineHeight: 1.1 }}>{s.val}</div>
        </div>
      ))}
    </div>
  );
}

function HealthGauge({ soh, color, label, model }) {
  const offset = 402 - (soh / 100) * 402;
  const capEst = (model.cap * soh / 100).toFixed(1);
  const capLost = (model.cap - model.cap * soh / 100).toFixed(1);
  const details = [
    { l: "Tahmini Kapasite", v: `${capEst} kWh`, c: color },
    { l: "Orijinal Kapasite", v: `${model.cap} kWh`, c: "rgba(255,255,255,0.4)" },
    { l: "Kaybedilen", v: `${capLost} kWh`, c: "#f87171" },
  ];
  return (
    <div style={{ ...glassStyle, padding: "22px 20px", borderRadius: 18, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>Pil Sağlığı</div>
      <div style={{ position: "relative", width: 160, height: 160 }}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="64" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
          <circle cx="80" cy="80" r="64" fill="none" stroke={color} strokeWidth="12" strokeDasharray="402" strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 80 80)" style={{ transition: "stroke-dashoffset 1s ease,stroke 0.5s" }} />
          <text x="80" y="86" textAnchor="middle" fill={color} fontFamily="'Orbitron',monospace" fontSize="26" fontWeight="900">{soh}%</text>
        </svg>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, textAlign: "center", color, letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
        {details.map(r => (
          <div key={r.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", borderRadius: 9, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{r.l}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: r.c }}>{r.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BatteryChart({ monthlyData }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) { chartRef.current.destroy(); }
    
    const labels = monthlyData.map(r => r.label);
    const sohData = monthlyData.map(r => r.soh);
    const rangeData = monthlyData.map(r => r.menzil);
    
    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { type: "line", label: "SOH %", data: sohData, borderColor: "#4ade80", backgroundColor: "rgba(74,222,128,0.08)", borderWidth: 2.5, fill: true, tension: 0.4, yAxisID: "y" },
          { type: "bar", label: "Menzil (km)", data: rangeData, backgroundColor: "rgba(34,211,238,0.15)", borderRadius: 4, yAxisID: "y1" },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "rgba(255,255,255,0.25)", font: { size: 10 } }, grid: { color: "rgba(255,255,255,0.04)" } },
          y: { position: "left", min: 55, max: 102, ticks: { color: "#4ade80" }, grid: { color: "rgba(74,222,128,0.06)" } },
          y1: { position: "right", ticks: { color: "#22d3ee" }, grid: { display: false } },
        },
      },
    });
    
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [monthlyData]);

  return (
    <div style={{ ...glassStyle, padding: "20px 22px", borderRadius: 18, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>Aylık Pil Sağlığı Trendi</div>
      <div style={{ position: "relative", width: "100%", height: 240 }}><canvas ref={canvasRef} /></div>
    </div>
  );
}

function MonthlyTable({ monthlyData }) {
  const last12 = monthlyData.slice(-12).reverse();
  return (
    <div style={{ ...glassStyle, padding: "20px 22px", borderRadius: 18 }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", fontWeight: 600, marginBottom: 14 }}>Aylık Detay Tablosu (Son 12 Ay)</div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", fontSize: 10, letterSpacing: "0.1em" }}>
              <th style={{ padding: "10px" }}>Ay</th>
              <th style={{ padding: "10px" }}>SOH %</th>
              <th style={{ padding: "10px" }}>Menzil</th>
              <th style={{ padding: "10px" }}>Durum</th>
            </tr>
          </thead>
          <tbody>
            {last12.map((r, i) => {
              const c = getSohColor(r.soh);
              return (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "10px", color: "rgba(255,255,255,0.55)" }}>{r.label}</td>
                  <td style={{ padding: "10px", color: c, fontWeight: "bold" }}>{r.soh.toFixed(1)}%</td>
                  <td style={{ padding: "10px", color: "#22d3ee", fontWeight: "bold" }}>{r.menzil} km</td>
                  <td style={{ padding: "10px" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: c, background: `${c}18`, padding: "4px 8px", borderRadius: 12 }}>{getSohLabel(r.soh)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ANA BİLEŞEN
export default function EvigateBatteryMonitor() {
  const [modelKey, setModelKey] = useState("model3");
  const [year, setYear] = useState(2020);
  const [km, setKm] = useState(65000);
  const [chargeLimit, setChargeLimit] = useState(80);
  
  // --- YENİ EKLENEN KISIM: Kaydetme Durumu ---
  const [isSaving, setIsSaving] = useState(false);

  // --- YENİ EKLENEN KISIM: Veritabanından Veri Çekme (GET) ---
  useEffect(() => {
    fetch("http://localhost:8000/pil-verisi")
      .then(res => res.json())
      .then(data => {
        if (data && data.model_key) {
          setModelKey(data.model_key);
          setYear(data.yil);
          setKm(data.km);
          setChargeLimit(data.sarj_limiti);
        }
      })
      .catch(err => console.error("Veri çekme hatası:", err));
  }, []);

  const handleChange = (key, value) => {
    if (key === "modelKey") setModelKey(value);
    else if (key === "year") setYear(value);
    else if (key === "km") setKm(value);
    else if (key === "chargeLimit") setChargeLimit(value);
  };

  // --- YENİ EKLENEN KISIM: Veritabanına Veri Gönderme (POST) ---
  const handleSaveData = () => {
    setIsSaving(true);
    fetch("http://localhost:8000/pil-verisi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model_key: modelKey,
        yil: year,
        km: km,
        sarj_limiti: chargeLimit
      })
    })
    .then(res => res.json())
    .then(data => {
      console.log("Supabase'e Kaydedildi:", data);
      setIsSaving(false);
      alert("Pil verileriniz başarıyla kaydedildi! 🔋");
    })
    .catch(err => {
      console.error("Kaydetme hatası:", err);
      setIsSaving(false);
    });
  };

  const model = MODELS[modelKey];
  const soh = calcSOH(model, year, km);
  const color = getSohColor(soh);
  const label = getSohLabel(soh);
  const currentRange = Math.round(model.range * (soh / 100) * (chargeLimit / 100));
  const age = Math.max(0, 2026 - year);
  const monthlyData = getMonthlyData(model, year, km);

  return (
    <div style={{ fontFamily: "'Sora',sans-serif", background: "#080d1a", color: "white", minHeight: "100vh", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
      <Header />
      {/* Kaydetme fonksiyonunu ve durumunu InputForm'a yolluyoruz */}
      <InputForm 
        modelKey={modelKey} year={year} km={km} chargeLimit={chargeLimit} 
        onChange={handleChange} 
        onSave={handleSaveData} 
        isSaving={isSaving} 
      />
      <StatCards soh={soh} currentRange={currentRange} age={age} km={km} color={color} />
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 14 }}>
        <HealthGauge soh={soh} color={color} label={label} model={model} />
        <BatteryChart monthlyData={monthlyData} />
      </div>
      <MonthlyTable monthlyData={monthlyData} />
    </div>
  );
}