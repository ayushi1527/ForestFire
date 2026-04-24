import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";

export default function HeatmapView({ zones }) {

  // 🎨 Color based on risk
  const getColor = (risk) => {
    if (risk === "red") return "#ef4444";
    if (risk === "yellow") return "#facc15";
    return "#22c55e";
  };

  // 🧠 Risk calculation
  const getRisk = (temp, smoke, flame, soil) => {
    if (flame || temp > 50 || smoke > 300 || (soil !== null && soil < 20)) {
      return "red";
    }
    if (temp > 40 || smoke > 100) {
      return "yellow";
    }
    return "green";
  };

  return (
    <MapContainer
      center={[28.61, 77.20]} // default center (India)
      zoom={2}
      className="h-[400px] w-full rounded-2xl"
    >
      {/* 🌍 Map Layer */}
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* 🔥 Zones */}
      {zones.map((zone, i) => {

        const risk = getRisk(
          zone?.temp ?? 0,
          zone?.smoke ?? 0,
          zone?.flame ?? 0,
          zone?.soil ?? null
        );

        return (
          <CircleMarker
            key={i}
            center={[zone.lat, zone.lon]}
            radius={risk === "red" ? 25 : risk === "yellow" ? 20 : 15} // 🔥 dynamic size
            pathOptions={{
              color: getColor(risk),
              fillColor: getColor(risk),
              fillOpacity: 0.6,
            }}
          >
            <Popup>
              <div className="text-sm">
                <strong>Zone {i + 1}</strong> <br />
                🌡 Temp: {zone.temp ?? "--"}°C <br />
                💧 Humidity: {zone.humidity ?? "--"}% <br />
                🌫 Smoke: {zone.smoke ?? "--"} <br />
                🔥 Flame: {zone.flame ? "YES" : "NO"} <br />
                🌱 Soil: {zone.soil ?? "N/A"} <br />
                📍 {zone.lat?.toFixed(4)}, {zone.lon?.toFixed(4)} <br />
                <span className="font-semibold">
                  Risk: {risk.toUpperCase()}
                </span>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}