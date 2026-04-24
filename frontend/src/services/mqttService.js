import mqtt from "mqtt";

// If your broker supports WebSockets, use ws:// or wss://
// Example public test broker (replace with yours):
const BROKER_URL = "wss://10.225.104.160:9001";

export const connectMQTT = (onMessage) => {
  const client = mqtt.connect(BROKER_URL);

  client.on("connect", () => {
    console.log("MQTT connected");
    // Subscribe to your topics
    client.subscribe("fire/node1");
    client.subscribe("fire/node2");
  });

  client.on("message", (topic, message) => {
    try {
      const payload = JSON.parse(message.toString());
      onMessage(topic, payload);
    } catch (e) {
      console.error("Invalid JSON from MQTT:", e);
    }
  });

  client.on("error", (err) => {
    console.error("MQTT error:", err);
  });

  return client;
};