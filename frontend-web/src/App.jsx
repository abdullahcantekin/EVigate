import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet/dist/leaflet.css";
import { 
  Zap, Navigation, Battery, MapPin, Star, X 
} from "lucide-react";

// Marker İkonu Fix: Leaflet ikonlarının görünmesi için şarttır
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

// --- COMPONENTS ---

function TopBar() {
  return (
    <div className="absolute top-4 right-4 flex items-center gap-2 z-[1000]">
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

function Sidebar({ battery, setBattery }) {
  const batteryColor = battery > 50 ? "#4ade80" : battery > 20 ? "#fbbf24" : "#f87171";
  return (
    <div className="absolute top-4 left-4 bottom-4 w-80 z-[1000] flex flex-col gap-3 pointer-events-none">
      <div className="p-5 rounded-2xl border border-white/10 bg-[#0d1b2a]/95 backdrop-blur-xl shadow-2xl pointer-events-auto">
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
        
        <div className="space-y-2 mt-6">
          <div className="relative">
             <MapPin size={14} className="absolute left-3 top-3 text-emerald-400" />
             <input disabled placeholder="Başlangıç" className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white/50" defaultValue="Elazığ Merkez" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Rota Verisini Çeken Görünmez Bileşen
function Routing({ from, to, setRouteInfo, setRouteCoords }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !from || !to) return;

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
      lineOptions: { styles: [{ opacity: 0 }] }, // Kütüphanenin kendi çizgisini gizle (çakışmayı önler)
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
      setRouteCoords(route.coordinates); // Koordinatları ana App'e gönder
      map.fitBounds(L.latLngBounds(route.coordinates), { padding: [100, 100] });
    });

    return () => {
      if (map && routingControl) map.removeControl(routingControl);
    };
  }, [map, from, to, setRouteInfo, setRouteCoords]);

  return null;
}

// --- MAIN APP ---
export default function App() {
  const [selectedStation, setSelectedStation] = useState(null);
  const [battery, setBattery] = useState(85);
  const [istasyonlar, setIstasyonlar] = useState([]);
  const [routeActive, setRouteActive] = useState(false);
  const [routeInfo, setRouteInfo] = useState({ distance: 0, duration: 0 });
  const [routeCoords, setRouteCoords] = useState([]);

  // Backend Veri Çekme
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
          <TileLayer
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
            attribution='&copy; Stadia Maps'
          />

          {routeActive && selectedStation && (
            <Routing 
              from={[38.6748, 39.2225]} 
              to={[selectedStation.enlem, selectedStation.boylam]} 
              setRouteInfo={setRouteInfo}
              setRouteCoords={setRouteCoords}
            />
          )}

          {/* Gerçek Rota Çizgisi */}
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
      <Sidebar battery={battery} setBattery={setBattery} />

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
                {routeActive ? `%${Math.max(0, battery - Math.round(routeInfo.distance * 0.2))}` : "---"}
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
