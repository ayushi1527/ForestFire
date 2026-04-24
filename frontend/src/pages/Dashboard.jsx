import { useEffect, useState } from "react";
import ZoneCard from "../components/ZoneCard";
import AlertHistory from "../components/AlertHistory";
import AlertPopup from "../components/AlertPopup";
//import { connectMQTT } from "../services/mqttService";
import GraphPopup from "../components/GraphPopup";

export default function Dashboard() {
  const [zone1, setZone1] = useState({});
  const [zone2, setZone2] = useState({
    lat: 28.665263625615633, // fixed location
    lon: 77.23245445318264,
  });
  const [alert, setAlert] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [popupAlert, setPopupAlert] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const MAX_POINTS = 20;

  const [history, setHistory] = useState({
    z1: [],
    z2: [],
  });

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     const z1 = generateData();
  //     const z2 = generateData();

  //     setZone1(z1);
  //     setZone2(z2);

  //     const newAlerts = [
  //       ...checkAlerts(z1, "Zone 1"),
  //       ...checkAlerts(z2, "Zone 2"),
  //     ];

  //     // add latest alerts on top
  //     setAlerts((prev) => [...newAlerts, ...prev].slice(0, 10));
  //     setZone1(z1);
  //     setZone2(z2);

  //     if (z1.flame) {
  //       setPopupAlert({ zone: "Zone 1" });
  //     }
  //     if (z2.flame) {
  //       setPopupAlert({ zone: "Zone 2" });
  //     }
  //   }, 3000);
  //   const checkAlerts = (data, zoneName) => {
  //     let newAlerts = [];

  //     if (data.temp > 50) {
  //       newAlerts.push({
  //         message: "High Temperature Detected",
  //         severity: "red",
  //         zone: zoneName,
  //         time: new Date().toLocaleTimeString(),
  //       });
  //     }

  //     if (data.smoke > 300) {
  //       newAlerts.push({
  //         message: "Smoke Level Critical",
  //         severity: "red",
  //         zone: zoneName,
  //         time: new Date().toLocaleTimeString(),
  //       });
  //     }

  //     if (data.flame) {
  //       newAlerts.push({
  //         message: "🔥 Flame Detected",
  //         severity: "red",
  //         zone: zoneName,
  //         time: new Date().toLocaleTimeString(),
  //       });
  //     }

  //     if (data.soil && data.soil < 20) {
  //       newAlerts.push({
  //         message: "Low Soil Moisture",
  //         severity: "yellow",
  //         zone: zoneName,
  //         time: new Date().toLocaleTimeString(),
  //       });
  //     }

  //     return newAlerts;
  //   };

  //   return () => clearInterval(interval);
  // }, []);
  const CHANNEL_1 = "3356584"; // node1
  const CHANNEL_2 = "3356565"; // node2
  const fetchData = async () => {
    try {
      // Zone 1
      const res1 = await fetch(
        `https://api.thingspeak.com/channels/3356584/feeds.json?api_key=OC16ONG57H8XH41O&results=2`,
      );
      const data1 = await res1.json();
      const feed1 = data1.feeds[0];

      const z1 = {
        temp: Number(feed1.field1) || 0,
        humidity: Number(feed1.field2) || 0,
        smoke: Number(feed1.field3) || 0,
        flame: Number(feed1.field4) || 0,
        lat: Number(feed1.field5) || 0,
        lon: Number(feed1.field6) || 0,
        time: new Date().toLocaleTimeString() || 0,
      };

      // Zone 2
      const res2 = await fetch(
        `https://api.thingspeak.com/channels/3356565/feeds.json?api_key=M7J7FOFE9VJ1A62X&results=2`,
      );
      const data2 = await res2.json();
      const feed2 = data2.feeds[0];

      const z2 = {
        temp: Number(feed2.field1),
        humidity: Number(feed2.field2),
        soil: Number(feed2.field5),
        smoke: Number(feed2.field3),
        flame: Number(feed2.field4),
        lat: 28.665263625615633, // keep fixed if no GPS
        lon: 77.23245445318264,
        time: new Date().toLocaleTimeString(),
      };
      console.log("Feed1:", feed1);
      console.log("Feed2:", feed2);
      console.log("Zone2 raw:", data2);
      if (!data1.feeds || data1.feeds.length === 0) return;
      if (!data2.feeds || data2.feeds.length === 0) return;

      // update states
      setZone1(z1);
      setZone2((prev) => ({ ...prev, ...z2 }));

      // update history
      setHistory((prev) => ({
        z1: [...prev.z1, z1].slice(-20),
        z2: [...prev.z2, z2].slice(-20),
      }));
    } catch (err) {
      console.error("Error fetching ThingSpeak:", err);
    }
  };
  useEffect(() => {
    fetchData(); // first call

    const interval = setInterval(fetchData, 20000); // every 20 sec

    return () => clearInterval(interval);
  }, []);

  const handleCardClick = (metric, zone) => {
    setSelectedMetric(metric);
    setSelectedZone(zone);
    setGraphData(true);
  };

  return (
    <div className="bg-[#fff7ed] min-h-screen pt-24 px-6">
      {/* ALERT BANNER */}
      {alert && (
        <div className="bg-red-500 text-white p-4 rounded-xl mb-6 text-center font-semibold">
          {alert}
        </div>
      )}

      <h1 className="text-3xl mb-6 font-bold">Forest Monitoring Dashboard</h1>

      <ZoneCard
        zone={1}
        data={zone1}
        type="zone1"
        onCardClick={handleCardClick}
      />

      <ZoneCard
        zone={2}
        data={zone2}
        type="zone2"
        onCardClick={handleCardClick}
      />
      {graphData && (
        <GraphPopup
          history={history}
          metric={selectedMetric}
          zone={selectedZone}
          onClose={() => setGraphData(null)}
        />
      )}
      <AlertHistory alerts={alerts} />
      <AlertPopup alert={popupAlert} onClose={() => setPopupAlert(null)} />
    </div>
  );
}
