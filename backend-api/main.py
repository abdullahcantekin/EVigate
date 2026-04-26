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

# Yeni Pil Verisi Modeli
class PilVerisi(BaseModel):
    model_key: str
    yil: int
    km: int
    sarj_limiti: int

# --- UÇ NOKTALAR (ENDPOINTS) ---

@app.get("/")
def read_root():
    return {"mesaj": "EVigate API Online! 🚀", "durum": "Sistemler Aktif"}

# 1. Tüm İstasyonları Listele (GET)
@app.get("/istasyonlar")
def istasyonlari_getir():
    try:
        response = supabase.table("stations").select("*").execute()
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
        cevap = supabase.table("stations").insert(yeni_veri).execute()
        return {"mesaj": "İstasyon başarıyla eklendi!", "veri": cevap.data}
    except Exception as e:
        print(f"❌ EKLEME HATASI: {str(e)}")
        return {"hata": str(e)}

# --- PİL VERİSİ API'LERİ ---

# 3. Pil Verisini Getirme (GET)
@app.get("/pil-verisi")
def get_pil_verisi():
    try:
        # ID'si 1 olan varsayılan satırı çeker
        response = supabase.table("kullanici_pil_verisi").select("*").eq("id", 1).execute()
        if len(response.data) > 0:
            return response.data[0]
        return {"mesaj": "Veri bulunamadı"}
    except Exception as e:
        print(f"❌ PİL VERİSİ ÇEKME HATASI: {str(e)}")
        return {"hata": str(e)}

# 4. Pil Verisini Güncelleme (POST)
@app.post("/pil-verisi")
def update_pil_verisi(veri: PilVerisi):
    try:
        guncel_veri = {
            "model_key": veri.model_key,
            "yil": veri.yil,
            "km": veri.km,
            "sarj_limiti": veri.sarj_limiti
        }
        # ID'si 1 olan satırı günceller
        response = supabase.table("kullanici_pil_verisi").update(guncel_veri).eq("id", 1).execute()
        return {"mesaj": "Pil verileri başarıyla güncellendi", "data": response.data}
    except Exception as e:
        print(f"❌ GÜNCELLEME HATASI: {str(e)}")
        return {"hata": str(e)}