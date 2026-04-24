import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function GraphPopup({ history, metric, zone, onClose }) {
  if (!history || !metric || !zone) return null;

  // 🧠 Select correct zone data
  const data = zone === "Zone 1" ? history.z1 : history.z2;

  // 🎯 Map metric → key
  const keyMap = {
    Temperature: "temp",
    Humidity: "humidity",
    Smoke: "smoke",
    "Soil Moisture": "soil",
    Flame: "flame",
  };

  const dataKey = keyMap[metric];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl w-[90%] max-w-3xl shadow-xl">

        {/* HEADER */}
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {metric} - {zone}
          </h2>

          <button onClick={onClose} className="text-red-500 text-lg">
            ✕
          </button>
        </div>

        {/* GRAPH */}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />

            <Line
              type={metric === "Flame" ? "stepAfter" : "monotone"}
              dataKey={dataKey}
              stroke="#f97316"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>

      </div>
    </div>
  );
}