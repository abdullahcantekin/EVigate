import React, { useState, useEffect } from "react";
// ZoomControl import listesinde korundu
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, LayersControl, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet/dist/leaflet.css";
import { 
  Zap, Navigation, Battery, MapPin, Star, X 
} from "lucide-react";

// --- HAFTA 5: ARAÇ VERİ KÜTÜPHANESİ ---
const VEHICLE_MODELS = {
  "togg-t10x": { name: "Togg T10X", batteryCapacity: 88, consumption: 18.5 }, 
  "tesla-model-3": { name: "Tesla Model 3", batteryCapacity: 75, consumption: 14.2 },
  "renault-zoe": { name: "Renault Zoe", batteryCapacity: 52, consumption: 17.2 },
  "hyundai-ioniq-5": { name: "Hyundai Ioniq 5", batteryCapacity: 77, consumption: 17.9 }
};

// Marker İkonu Fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const customIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// --- HAFTA 5: SIRA BEKLEME TAHMİN ALGORİTMASI ---
const calculateWaitTime = (power, occupancy) => {
  if (occupancy === 0) return 0;
  // Güç düşükse ve doluluk fazlaysa süre artar (Basit Mühendislik Modeli)
  const baseTime = (200 / power) * 30; 
  return Math.round(baseTime * (occupancy / 100));
};

// --- COMPONENTS ---

function TopBar() {
  return (
    <div className="absolute top-4 right-56 flex items-center gap-2 z-[1000]"> 
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/10 bg-[#0d1b2a]/90 backdrop-blur-md">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400/80 text-xs font-semibold">Canlı</span>
        </div>
        <div className="w-px h-3 bg-white/10" />
        <span className="text-white/30 text-xs">Elazığ, TR</span>
      </div>
    </div>
  );
}

// Sidebar: Hafta 5 Dinamik Algoritma Entegre Edildi
function Sidebar({ battery, setBattery, selectedVehicle, setSelectedVehicle, destination, setDestination, istasyonlar, setSelectedStation, setRouteActive }) {
  const batteryColor = battery > 50 ? "#4ade80" : battery > 20 ? "#fbbf24" : "#f87171";
  const vehicle = VEHICLE_MODELS[selectedVehicle];
  const estimatedRange = Math.round((battery * vehicle.batteryCapacity) / vehicle.consumption);

  return (
    <div className="absolute top-4 left-4 bottom-4 w-80 z-[1000] flex flex-col gap-3 pointer-events-none">
      <div className="p-5 rounded-2xl border border-white/10 bg-[#0d1b2a]/95 backdrop-blur-xl shadow-2xl pointer-events-auto overflow-y-auto max-h-full scrollbar-hide">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30">
            <Zap size={18} className="text-emerald-400" fill="currentColor" />
          </div>
          <div>
            <div className="text-white font-black text-xl tracking-tight leading-none" style={{ fontFamily: "'Orbitron', sans-serif" }}>EVigate</div>
            <div className="text-emerald-500/60 text-[10px] uppercase font-medium">Smart Navigator</div>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-white/40 text-[10px] uppercase font-bold mb-2 block">Araç Modeli</label>
          <select 
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm text-white outline-none focus:border-emerald-500/50 transition-all cursor-pointer"
          >
            {Object.keys(VEHICLE_MODELS).map(key => (
              <option key={key} value={key} className="bg-[#0d1b2a] text-white">
                {VEHICLE_MODELS[key].name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-end mb-2">
            <span className="text-white/40 text-[10px] uppercase font-bold">Batarya Durumu</span>
            <span className="text-2xl font-black" style={{ color: batteryColor, fontFamily: "'Orbitron'" }}>%{battery}</span>
          </div>
          <input 
            type="range" min="0" max="100" value={battery} 
            onChange={(e) => setBattery(e.target.value)}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
        
        <div className="space-y-2 mt-4">
          <div className="relative">
             <MapPin size={14} className="absolute left-3 top-3 text-emerald-400" />
             <input disabled placeholder="Başlangıç" className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white/50" defaultValue="Elazığ Merkez" />
          </div>
          <div className="relative">
             <Navigation size={14} className="absolute left-3 top-3 text-blue-400" />
             <input 
               placeholder="Varış Noktası Ara..." 
               className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-blue-500/50 outline-none" 
               onChange={(e) => setDestination(e.target.value)}
             />
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/5">
           <div className="flex justify-between items-center text-[10px] text-white/30 uppercase font-bold mb-1">
              <span>Tahmini Menzil</span>
              <span className="text-emerald-400">Canlı</span>
           </div>
           <div className="text-3xl font-black text-white" style={{ fontFamily: "'Orbitron'" }}>
              {estimatedRange} <span className="text-xs text-white/40 font-normal">KM</span>
           </div>
        </div>

        {/* HAFTA 5: AKILLI ÖNERİ PANELİ (ALGORİTMİK) */}
        {destination && (
          <div className="mt-6 pt-6 border-t border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-4">
              <Star size={14} className="text-amber-400" fill="currentColor" />
              <span className="text-[10px] text-white/50 uppercase font-black tracking-widest">Yapay Zeka Önerileri</span>
            </div>
            
            <div className="space-y-3">
              {istasyonlar
                .map(s => ({ ...s, wait: calculateWaitTime(150, Math.floor(Math.random() * 100)) })) // Algoritma burada çalışıyor
                .sort((a, b) => a.wait - b.wait) // En az bekleteni en üste al
                .slice(0, 2)
                .map((stasyon, index) => (
                <div 
                  key={stasyon.id}
                  onClick={() => {
                    setSelectedStation(stasyon);
                    setRouteActive(true);
                  }}
                  className="group cursor-pointer p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-all pointer-events-auto"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-white font-bold text-xs group-hover:text-emerald-400 transition-colors tracking-tight">{stasyon.isim}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${stasyon.wait === 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'}`}>
                      {stasyon.wait === 0 ? "Hemen Müsait" : "Sıra Bekleme"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-white/30 font-medium">
                      <Zap size={10} className="text-emerald-500/50" />
                      <span>150 kW</span>
                      <div className="w-1 h-1 rounded-full bg-white/10" />
                      <span className={stasyon.wait === 0 ? "text-emerald-400/70" : "text-amber-400/70"}>
                        {stasyon.wait === 0 ? "Sıra Yok" : `${stasyon.wait} dk Bekleme`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Routing({ from, to, setRouteInfo, setRouteCoords }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !from || !to) return;

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
      lineOptions: { styles: [{ opacity: 0 }] },
      createMarker: () => null,
      addWaypoints: false,
      show: false
    }).addTo(map);

    routingControl.on('routesfound', (e) => {
      const route = e.routes[0];
      setRouteInfo({
        distance: (route.summary.totalDistance / 1000).toFixed(1),
        duration: Math.round(route.summary.totalTime / 60)
      });
      setRouteCoords(route.coordinates);
      map.fitBounds(L.latLngBounds(route.coordinates), { padding: [100, 100] });
    });

    return () => {
      if (map && routingControl) map.removeControl(routingControl);
    };
  }, [map, from, to, setRouteInfo, setRouteCoords]);

  return null;
}

export default function App() {
  const [selectedStation, setSelectedStation] = useState(null);
  const [battery, setBattery] = useState(85);
  const [istasyonlar, setIstasyonlar] = useState([]);
  const [routeActive, setRouteActive] = useState(false);
  const [routeInfo, setRouteInfo] = useState({ distance: 0, duration: 0 });
  const [routeCoords, setRouteCoords] = useState([]);

  const [selectedVehicle, setSelectedVehicle] = useState("togg-t10x");
  const [destination, setDestination] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/istasyonlar")
      .then((res) => res.json())
      .then((data) => setIstasyonlar(data))
      .catch((err) => console.error("API Bağlantı Hatası:", err));
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0f1a]">
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Sora:wght@400;600&display=swap" rel="stylesheet" />
      
      <div className="absolute inset-0 z-0">
        <MapContainer 
          center={[38.6748, 39.2225]} 
          zoom={13} 
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <ZoomControl position="bottomright" />

          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Karanlık Mod">
              <TileLayer
                url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                attribution='&copy; Stadia Maps'
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Klasik Harita">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Uydu Görünümü">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='Tiles &copy; Esri'
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {routeActive && selectedStation && (
            <Routing 
              from={[38.6748, 39.2225]} 
              to={[selectedStation.enlem, selectedStation.boylam]} 
              setRouteInfo={setRouteInfo}
              setRouteCoords={setRouteCoords}
            />
          )}

          {routeActive && routeCoords.length > 0 && (
            <Polyline 
              positions={routeCoords} 
              pathOptions={{ color: '#10b981', weight: 6, opacity: 0.8 }} 
            />
          )}

          {istasyonlar.map((s) => (
            <Marker 
              key={s.id} 
              position={[s.enlem, s.boylam]} 
              icon={customIcon}
              eventHandlers={{ click: () => {
                setSelectedStation(s);
                setRouteActive(false);
                setRouteCoords([]);
              }}}
            >
              <Popup><strong>{s.isim}</strong></Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <TopBar />
      <Sidebar 
        battery={battery} 
        setBattery={setBattery}
        selectedVehicle={selectedVehicle}
        setSelectedVehicle={setSelectedVehicle}
        destination={destination}
        setDestination={setDestination}
        istasyonlar={istasyonlar}
        setSelectedStation={setSelectedStation}
        setRouteActive={setRouteActive}
      />

      {selectedStation && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] w-[400px] bg-[#0d1b2a]/95 border border-emerald-500/30 rounded-3xl p-6 backdrop-blur-2xl shadow-2xl transition-all">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full uppercase">Hızlı Şarj</span>
                <div className="flex gap-0.5"><Star size={10} className="text-amber-400" fill="currentColor" /> <span className="text-[10px] text-amber-400 font-bold">4.9</span></div>
              </div>
              <h3 className="text-white font-bold text-xl">{selectedStation.isim}</h3>
            </div>
            <button onClick={() => { setSelectedStation(null); setRouteActive(false); }} className="p-2 hover:bg-white/10 rounded-full text-white/40"><X size={20}/></button>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
              <div className="text-white/30 text-[10px] uppercase mb-1">Güç</div>
              <div className="text-white font-bold text-sm">150 kW</div>
            </div>
            <div className="bg-white/5 p-3 rounded-2xl border border-emerald-500/20 text-center">
              <div className="text-white/30 text-[10px] uppercase mb-1">Mesafe</div>
              <div className="text-emerald-400 font-bold text-sm">{routeActive ? `${routeInfo.distance} km` : "---"}</div>
            </div>
            <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
              <div className="text-white/30 text-[10px] uppercase mb-1">Varış Batarya</div>
              <div className="text-amber-400 font-bold text-sm">
                {routeActive ? `%${Math.max(0, battery - Math.round((routeInfo.distance * VEHICLE_MODELS[selectedVehicle].consumption) / VEHICLE_MODELS[selectedVehicle].batteryCapacity))}` : "---"}
              </div>
            </div>
          </div>

          <button 
            onClick={() => setRouteActive(true)}
            className="w-full bg-emerald-500 py-4 rounded-2xl font-bold text-black flex items-center justify-center gap-3 hover:scale-[1.02] transition-all"
          >
            <Navigation size={18} fill="currentColor"/> ROTA OLUŞTUR
          </button>
        </div>
      )}
    </div>
  );
}