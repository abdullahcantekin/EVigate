import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client

# .env dosyasındaki SUPABASE_URL ve SUPABASE_KEY bilgilerini yükle
load_dotenv()
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")

# Bağlantı Kontrolü
if not url or not key:
    print("⚠️ HATA: .env dosyasında Supabase bilgileri bulunamadı!")

supabase: Client = create_client(url, key)

app = FastAPI(title="EVigate API", description="Akıllı Elektrikli Araç Rota Asistanı")

# --- CORS AYARLARI ---
# Frontend (React) ile Backend'in konuşabilmesi için şarttır.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# --- VERİ MODELLERİ ---
class IstasyonEkle(BaseModel):
    isim: str
    enlem: float
    boylam: float
    hizli_sarj_var_mi: bool = False

# --- UÇ NOKTALAR (ENDPOINTS) ---

@app.get("/")
def read_root():
    return {"mesaj": "EVigate API Online! 🚀", "durum": "Sistemler Aktif"}

# 1. Tüm İstasyonları Listele (GET)
@app.get("/istasyonlar")
def istasyonlari_getir():
    try:
        # DİKKAT: Tablo ismini orijinal 'stations' olarak güncelledik.
        response = supabase.table("stations").select("*").execute()
        
        # VS Code Terminalinde veriyi kontrol etmek için:
        print(f"--- DEBUG: Veritabanından {len(response.data)} adet veri çekildi ---")
        
        return response.data
    except Exception as e:
        print(f"❌ SUPABASE HATASI: {str(e)}")
        return {"hata": str(e)}

# 2. Yeni İstasyon Ekle (POST)
@app.post("/istasyonlar")
def yeni_istasyon_ekle(istasyon: IstasyonEkle):
    try:
        yeni_veri = {
            "isim": istasyon.isim,
            "enlem": istasyon.enlem,
            "boylam": istasyon.boylam,
            "hizli_sarj_var_mi": istasyon.hizli_sarj_var_mi
        }
        # Burada da tablo ismini 'stations' yaptık.
        cevap = supabase.table("stations").insert(yeni_veri).execute()
        return {"mesaj": "İstasyon başarıyla eklendi!", "veri": cevap.data}
    except Exception as e:
        print(f"❌ EKLEME HATASI: {str(e)}")
        return {"hata": str(e)}