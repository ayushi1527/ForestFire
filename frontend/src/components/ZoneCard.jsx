import MetricCard from "./MetricCard";
import { Thermometer, Droplets, Flame, MapPin, Wind, Leaf } from "lucide-react";

import {
  getTempStatus,
  getSoilStatus,
  getSmokeStatus,
  getFlameStatus,
  getZoneStatus,
} from "../utils/alertLogic";

export default function ZoneCard({ zone, data, type, onCardClick }) {
  const statuses = [
    getTempStatus(data.temp),
    getSmokeStatus(data.smoke),
    getFlameStatus(data.flame),
  ];

  if (type === "zone2") {
    statuses.push(getSoilStatus(data.soil));
  }

  const zoneStatus = getZoneStatus(statuses);

  const badge = {
    red: "bg-red-500 text-white",
    yellow: "bg-yellow-400 text-black",
    green: "bg-green-500 text-white",
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-lg mb-10">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Zone {zone}</h2>
        <span className={`px-4 py-2 rounded-full ${badge[zoneStatus]}`}>
          {zoneStatus.toUpperCase()}
        </span>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-3 gap-6">
        <MetricCard
          title="Temperature"
          value={data?.temp ? `${data.temp}°C` : "--"}
          icon={<Thermometer />}
          zone={`Zone ${zone}`}
          onClick={onCardClick}
        />

        <MetricCard
          title="Humidity"
          value={data?.humidity ? `${data.humidity}%` : "--"}
          icon={<Droplets />}
          zone={`Zone ${zone}`}
          onClick={onCardClick}
        />

        <MetricCard
          title="Flame"
          value={data?.flame ? "YES" : "NO"}
          icon={<Flame />}
          zone={`Zone ${zone}`}
          onClick={onCardClick}
        />

        <MetricCard
          title="Smoke"
          value={data?.smoke ? data.smoke : "--"}
          icon={<Wind />}
          zone={`Zone ${zone}`}
          onClick={onCardClick}
        />

        {type === "zone2" && (
          <MetricCard
            title="Soil Moisture"
            value={data?.soil ? `${data.soil}%` : "--"}
            icon={<Leaf />}
            zone={`Zone ${zone}`}
            onClick={onCardClick}
          />
        )}

        <MetricCard
          title="GPS"
          value={data?.lat && data?.lon ? `${data.lat}, ${data.lon}` : "--"}
          icon={<MapPin />}
          zone={`Zone ${zone}`}
        />
      </div>
    </div>
  );
}
