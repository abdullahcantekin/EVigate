import os
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
from supabase import create_client, Client

# Gizli şifreleri yükle
load_dotenv()
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

app = FastAPI(title="EVigate API", description="Akıllı Elektrikli Araç Rota Asistanı")

# --- VERİ MODELLERİ ---
# Dışarıdan gelecek istasyon verisinin formatını belirliyoruz
class İstasyonEkle(BaseModel):
    isim: str
    enlem: float
    boylam: float
    hizli_sarj_var_mi: bool = False

# --- UÇ NOKTALAR (ENDPOINTS) ---

@app.get("/")
def read_root():
    return {"mesaj": "EVigate API sistemleri tam kapasite çalışıyor! 🚀"}

# 1. Tüm İstasyonları Listele (GET)
@app.get("/istasyonlar", tags=["İstasyonlar"])
def istasyonlari_getir():
    # Supabase'deki 'stations' tablosundan tüm verileri çek
    cevap = supabase.table("stations").select("*").execute()
    return cevap.data

# 2. Yeni İstasyon Ekle (POST)
@app.post("/istasyonlar", tags=["İstasyonlar"])
def yeni_istasyon_ekle(istasyon: İstasyonEkle):
    yeni_veri = {
        "isim": istasyon.isim,
        "enlem": istasyon.enlem,
        "boylam": istasyon.boylam,
        "hizli_sarj_var_mi": istasyon.hizli_sarj_var_mi
    }
    # Supabase'deki 'stations' tablosuna yeni veriyi yaz
    cevap = supabase.table("stations").insert(yeni_veri).execute()
    return {"mesaj": "İstasyon başarıyla eklendi!", "eklenen_veri": cevap.data}