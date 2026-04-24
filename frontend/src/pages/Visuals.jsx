import { useEffect, useState } from "react";
import HeatmapView from "../components/HeatmapView";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
const CHANNEL_1 = "3356584";
const CHANNEL_2 = "3356565";

const READ_API_KEY_1 = "OC16ONG57H8XH41O";
const READ_API_KEY_2 = "M7J7FOFE9VJ1A62X";
export default function Visuals() {
  const [data, setData] = useState([]);
  const [zones, setZones] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("");

  const getRisk = (temp, smoke, flame) => {
    if (flame || temp > 50 || smoke > 300) return "red";
    if (temp > 40 || smoke > 100) return "yellow";
    return "green";
  };
  const fetchData = async () => {
    try {
      // 🔥 ZONE 1
      const res1 = await fetch(
        `https://api.thingspeak.com/channels/${CHANNEL_1}/feeds.json?api_key=${READ_API_KEY_1}&results=20`,
      );
      const data1 = await res1.json();

      // 🔥 ZONE 2
      const res2 = await fetch(
        `https://api.thingspeak.com/channels/${CHANNEL_2}/feeds.json?api_key=${READ_API_KEY_2}&results=20`,
      );
      const data2 = await res2.json();

      if (!data1.feeds?.length || !data2.feeds?.length) return;

      // 🧠 GRAPH DATA (Zone1)
      // const graphData = data1.feeds.map((f, i) => {
      //   const z2 = data2.feeds[i] || {};
      //   console.log("RAW:", f.created_at);
      //   console.log("LOCAL:", new Date(f.created_at).toString());
      //   console.log("IST:", new Date(f.created_at).toLocaleString("en-IN"));

      //   return {
      //     time: new Date(f.created_at).toLocaleTimeString("en-IN", {
      //       timeZone: "Asia/Kolkata",
      //       hour: "2-digit",
      //       minute: "2-digit",
      //       hour12: true,
      //     }),

      //     // Zone 1
      //     z1Temp: Number(f.field1) || 0,
      //     z1Humidity: Number(f.field2) || 0,
      //     z1Smoke: Number(f.field3) || 0,
      //     z1Soil: 0, // no sensor

      //     // Zone 2
      //     z2Temp: Number(z2.field1) || 0,
      //     z2Humidity: Number(z2.field2) || 0,
      //     z2Smoke: Number(z2.field3) || 0,
      //     z2Soil: Number(z2.field5) || 0,
      //   };
      // });
      const graphData = data1.feeds
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .map((f, i) => {
          const z2 = data2.feeds[i] || {};

          const d = new Date(f.created_at);
          const ist = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);

          return {
            time: ist.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit", // 🔥 ADD THIS
            }),

            z1Temp: Number(f.field1) || 0,
            z2Temp: Number(z2.field1) || 0,

            z1Humidity: Number(f.field2) || 0,
            z2Humidity: Number(z2.field2) || 0,

            z1Smoke: Number(f.field3) || 0,
            z2Smoke: Number(z2.field3) || 0,

            z1Soil: 0,
            z2Soil: Number(z2.field5) || 0,
          };
        });

      // 🧠 ZONE DATA (latest)
      const latest1 = data1.feeds[data1.feeds.length - 1];
      const latest2 = data2.feeds[data2.feeds.length - 1];

      const z1 = {
        lat: Number(latest1.field5) || 28.61,
        lon: Number(latest1.field6) || 77.2,
        temp: Number(latest1.field1) || 0,
        smoke: Number(latest1.field3) || 0,
        flame: Number(latest1.field4) === 1,
        risk: getRisk(
          Number(latest1.field1),
          Number(latest1.field3),
          Number(latest1.field4),
        ),
      };

      const z2 = {
        lat: 28.665263625615633, // fixed location
        lon: 77.23245445318264,
        temp: Number(latest2.field1) || 0,
        smoke: Number(latest2.field3) || 0,
        flame: Number(latest2.field4) === 1,
        risk: getRisk(
          Number(latest2.field1),
          Number(latest2.field3),
          Number(latest2.field4),
        ),
      };
      console.log("Latest entry:", data1.feeds[data1.feeds.length - 1]);

      setData([...graphData]);
      setZones([z1, z2]);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Error:", err);
    }
  };
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#fff7ed] min-h-screen pt-24 px-6">
      <h1 className="text-3xl font-bold mb-2">Visual Analytics</h1>
      <p className="text-sm text-gray-600 mb-6">Last Updated: {lastUpdated}</p>

      {/* HEATMAP */}
      <div className="bg-white p-6 rounded-2xl shadow mb-10">
        <h2 className="mb-4 font-semibold">Fire Risk Map</h2>
        <HeatmapView zones={zones} />
      </div>

      {/* TEMP GRAPH */}
      <div className="bg-white p-6 rounded-2xl shadow mb-10">
        <h2 className="mb-4 font-semibold">Temperature Trend</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} key={lastUpdated}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />

            {/* Zone 1 */}
            <Line
              dataKey="z1Temp"
              stroke="#f97316"
              strokeWidth={3}
              name="Zone 1"
            />

            {/* Zone 2 */}
            <Line
              dataKey="z2Temp"
              stroke="#dc2626"
              strokeWidth={3}
              name="Zone 2"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* HUMIDITY GRAPH */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="mb-4 font-semibold">Humidity Trend</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} key={lastUpdated}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Line dataKey="z1Humidity" stroke="#3b82f6" name="Zone 1" />
            <Line dataKey="z2Humidity" stroke="#1d4ed8" name="Zone 2" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* SMOKE GRAPH */}
      <div className="bg-white p-6 rounded-2xl shadow mb-10">
        <h2 className="mb-4 font-semibold">Smoke Levels (Zone Comparison)</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} key={lastUpdated}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />

            {/* Zone 1 Smoke */}
            <Line
              type="monotone"
              dataKey="z1Smoke"
              stroke="#64748b"
              strokeWidth={3}
              name="Zone 1"
            />

            {/* Zone 2 Smoke */}
            <Line
              type="monotone"
              dataKey="z2Smoke"
              stroke="#334155"
              strokeWidth={3}
              name="Zone 2"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* SOIL MOISTURE GRAPH */}
      <div className="bg-white p-6 rounded-2xl shadow mb-10">
        <h2 className="mb-4 font-semibold">Soil Moisture (Zone Comparison)</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} key={lastUpdated}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />

            {/* Zone 1 Soil (always 0) */}
            <Line
              type="monotone"
              dataKey="z1Soil"
              stroke="#a3e635"
              strokeWidth={3}
              name="Zone 1 (No Sensor)"
            />

            {/* Zone 2 Soil */}
            <Line
              type="monotone"
              dataKey="z2Soil"
              stroke="#16a34a"
              strokeWidth={3}
              name="Zone 2"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
