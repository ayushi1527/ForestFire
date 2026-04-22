#include <DHT.h>

#include <WiFi.h>
#include <PubSubClient.h>

// ---------------- PIN DEFINITIONS ----------------
#define DHTPIN 5
#define DHTTYPE DHT11

#define MQ2_PIN 34
#define SOIL_PIN 35
#define FLAME_PIN 18
#define BUZZER_PIN 13

// ---------------- OBJECT ----------------
DHT dht(DHTPIN, DHTTYPE);

// ---------------- VARIABLES ----------------
float temp;
int smoke;
int soil;
int flame;

const char* ssid = "YOUR_WIFI";
const char* password = "YOUR_PASSWORD";

const char* mqtt_server = "broker.hivemq.com";
WiFiClient espClient;
PubSubClient client(espClient);

String status = "SAFE";

// ---------------- SETUP ----------------
void setup() {
  Serial.begin(115200);

  dht.begin();

  pinMode(FLAME_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  digitalWrite(BUZZER_PIN, LOW);

  Serial.println("System Starting...");
}

// ---------------- LOOP ----------------
void loop() {

  // ---- READ SENSORS ----
  temp = dht.readTemperature();
  smoke = analogRead(MQ2_PIN);
  soil = analogRead(SOIL_PIN);
  flame = digitalRead(FLAME_PIN);

  // ---- CHECK SENSOR ERROR ----
  if (isnan(temp)) {
    Serial.println("DHT ERROR!");
    return;
  }

  // ---- LOGIC ----
  bool flame_detected = (flame == LOW);
  bool smoke_detected = (smoke > 900);   // adjust after testing
  bool high_temp = (temp > 40);
  bool very_dry = (soil > 3500);

  if (flame_detected && smoke_detected) {
    status = "CONFIRMED_FIRE";
  }
  else if ((smoke_detected && high_temp) || (flame_detected && high_temp)) {
    status = "PROBABLE_FIRE";
  }
  else if (very_dry && high_temp) {
    status = "HIGH_RISK";
  }
  else {
    status = "SAFE";
  }

  // ---- BUZZER ----
  if (status == "FIRE") {
    digitalWrite(BUZZER_PIN, HIGH);
  } else {
    digitalWrite(BUZZER_PIN, LOW);
  }

  // ---- PRINT DATA ----
  Serial.print("Temp: ");
  Serial.print(temp);
  Serial.print(" °C | Smoke: ");
  Serial.print(smoke);
  Serial.print(" | Soil: ");
  Serial.print(soil);
  Serial.print(" | Flame: ");
  Serial.print(flame);
  Serial.print(" | Status: ");
  Serial.println(status);

  Serial.println("----------------------------------");

  delay(2000);
}