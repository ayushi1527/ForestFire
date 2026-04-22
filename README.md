# 🔥 IoT-Based Smart Forest Fire Detection & Monitoring System

> **Multi-Sensor Fusion | MQTT | Firebase | ML Prediction | Real-Time Dashboard**

A distributed IoT system for early forest fire detection using two interdependent ESP32 sensor nodes, cloud integration via MQTT and Firebase, and a Decision Tree ML model for predictive fire risk classification.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Hardware Components](#-hardware-components)
- [Node Design](#-node-design)
- [Detection Logic](#-detection-logic)
- [ML Model](#-ml-model)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Setup Guide](#-setup-guide)
- [Dashboard Features](#-dashboard-features)
- [Results](#-results)
- [Syllabus Mapping](#-syllabus-mapping)
- [Team](#-team)

---

## 🧠 Overview

Traditional fire detection systems rely on a **single sensor**, leading to high false alarm rates from everyday triggers like sunlight, cooking smoke, or hot weather. This project solves that by:

- Using **two ESP32 nodes** at different altitudes — ground-level (Node 1) and elevated (Node 2)
- Combining **4 different sensor types** per node for corroborated detection
- Sending data via **MQTT protocol** to **Firebase Realtime Database**
- Displaying live alerts, graphs, GPS map, and heatmap on a **web dashboard**
- Predicting fire risk using a **Decision Tree ML model** (98.85% accuracy)

**One-liner:**
> *A real-time intelligent fire monitoring system that detects, verifies, and reports fire incidents using multi-sensor fusion, IoT communication, and predictive ML.*

---

## 🏗 System Architecture

```
┌─────────────────────────┐      ┌─────────────────────────┐
│       NODE 1            │      │       NODE 2            │
│   (Ground Level)        │      │   (Elevated Position)   │
│                         │      │                         │
│  DHT11   → Temperature  │      │  DHT11   → Temperature  │
│  MQ-2    → Smoke/Gas    │      │  MQ-2    → Smoke/Gas    │
│  FC-28   → Soil Moisture│      │  IR Flame → Flame       │
│  IR Flame → Flame       │      │  NEO-6M  → GPS          │
│  NEO-6M  → GPS          │      │  Buzzer  → Local Alert  │
│  Buzzer  → Local Alert  │      │                         │
└────────────┬────────────┘      └────────────┬────────────┘
             │                                │
             │         WiFi + MQTT            │
             └──────────────┬─────────────────┘
                            ▼
                  ┌──────────────────┐
                  │   MQTT Broker    │
                  │  (HiveMQ Cloud)  │
                  └────────┬─────────┘
                           ▼
                  ┌──────────────────┐
                  │    Firebase      │
                  │ Realtime Database│
                  └────────┬─────────┘
                           ▼
              ┌────────────────────────┐
              │      Web Dashboard     │
              │                        │
              │  Live Data  │  Alerts  │
              │  Graphs     │  Map     │
              │  Heatmap    │  Logs    │
              └────────────────────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │   ML Model API   │
                  │ (Flask + sklearn) │
                  │  Predictive Risk  │
                  └──────────────────┘
```

---

## 🔌 Hardware Components

| Component | Model | Purpose | Node |
|-----------|-------|---------|------|
| Microcontroller | ESP32-D0WDQ6 | Brain, WiFi, processing | Both |
| Temperature/Humidity | DHT11 | Ambient conditions | Both |
| Smoke/Gas | MQ-2 | Detects LPG, smoke, methane | Both |
| Soil Moisture | FC-28 | Pre-fire dryness indicator | Node 1 only |
| Flame Sensor | IR (760–1100nm) | Direct flame detection | Both |
| GPS Module | NEO-6M | Location tracking | Both |
| Buzzer | Piezo | Local audio alert | Both |

---

## 📡 Node Design

### Node 1 — Ground Level (Risk + Detection)

**Extra sensor:** Soil Moisture (FC-28)

**Purpose:** Detect pre-fire environmental conditions (dry + hot = high risk) AND confirm local fire.

**Pin Mapping:**

| Sensor | ESP32 Pin |
|--------|-----------|
| DHT11 DATA | GPIO 5 |
| MQ-2 AO | GPIO 34 |
| Soil Moisture AO | GPIO 35 |
| IR Flame D0 | GPIO 18 |
| Buzzer (+) | GPIO 13 |
| GPS RX | GPIO 16 |
| GPS TX | GPIO 17 |

### Node 2 — Elevated Position (Confirmation)

**Purpose:** Confirm fire from a vantage point with better smoke/flame exposure. Acts as the verification layer.

**Pin Mapping:**

| Sensor | ESP32 Pin |
|--------|-----------|
| DHT11 DATA | GPIO 4 |
| MQ-2 AO | GPIO 34 |
| IR Flame D0 | GPIO 27 |
| GPS RX | GPIO 16 |
| GPS TX | GPIO 17 |

> ⚠️ **Important:** GPIO 0, 2, 15 are boot-strapping pins — never connect sensors to these. Always disconnect sensors before uploading code.

---

## 🧠 Detection Logic

The system uses **multi-sensor fusion** — no single sensor can trigger a fire alert. This is the core intelligence:

```
IF   (flame == LOW) AND (smoke > 900 ADC)
  → CONFIRMED_FIRE

ELSE IF   (smoke > 900 AND temp > 40°C)
       OR (flame == LOW AND temp > 40°C)
  → PROBABLE_FIRE

ELSE IF   (soil > 3500 ADC) AND (temp > 35°C)
  → HIGH_RISK

ELSE
  → SAFE
```

### Two-Node Fusion (Cloud Level)

| Node 1 | Node 2 | System Decision |
|--------|--------|-----------------|
| CONFIRMED_FIRE | CONFIRMED_FIRE | 🔴 High-Confidence Fire Alert |
| HIGH_RISK | PROBABLE_FIRE | 🟠 Escalating Threat — Monitor |
| CONFIRMED_FIRE | SAFE | 🟡 Local Ignition Detected |
| SAFE | CONFIRMED_FIRE | 🟡 Elevated Fire Detected |
| SAFE | SAFE | 🟢 No Threat |

### Why This Avoids False Alarms

| Trigger | Only Affects | System Response |
|---------|-------------|-----------------|
| Direct sunlight | Flame sensor only | SAFE (smoke normal) |
| Cooking steam | Smoke sensor only | SAFE (no flame) |
| Hot summer day | Temperature only | SAFE or HIGH_RISK |
| Actual fire | All sensors | CONFIRMED_FIRE ✅ |

---

## 🤖 ML Model

A **Decision Tree classifier** trained on a 2,600-row synthetic dataset built using the same multi-node sensor parameters as the physical system.

### Dataset

| Feature | Description | Range |
|---------|-------------|-------|
| `temp1` | Node 1 temperature | 20–65°C |
| `smoke1` | Node 1 MQ-2 ADC | 300–1500 |
| `soil` | Soil moisture ADC | 800–4095 |
| `flame1` | Node 1 IR sensor | 0 or 1 |
| `temp2` | Node 2 temperature | 20–65°C |
| `smoke2` | Node 2 MQ-2 ADC | 300–1500 |
| `flame2` | Node 2 IR sensor | 0 or 1 |
| `humidity` | Relative humidity | 5–90% |

**Classes:** `SAFE` → `HIGH_RISK` → `PROBABLE_FIRE` → `CONFIRMED_FIRE`

### Results

| Class | Precision | Recall | F1-Score |
|-------|-----------|--------|----------|
| SAFE | 0.99 | 1.00 | 0.99 |
| HIGH_RISK | 1.00 | 0.97 | 0.99 |
| PROBABLE_FIRE | 0.96 | 0.99 | 0.98 |
| CONFIRMED_FIRE | 0.99 | 0.99 | 0.99 |
| **Overall** | **0.99** | **0.99** | **0.99** |

**Test Accuracy: 98.85% | 5-Fold CV Accuracy: ~98%**

### Top Features by Importance

```
Smoke (Node 1)   ████████████████████  38%
Temperature (N1) ██████████████        29%
Soil Moisture    ████████              18%
Flame (Node 1)   █████                 11%
Humidity         ██                     4%
```

### Prediction API

The model runs as a lightweight Flask REST API:

```bash
POST http://localhost:5000/predict
Content-Type: application/json

{
  "temp1": 42, "smoke1": 1050, "soil": 3800, "flame1": 0,
  "temp2": 44, "smoke2": 1100, "flame2": 1,  "humidity": 18
}

→ {"status": "CONFIRMED_FIRE", "confidence": 97.3}
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Hardware | ESP32, DHT11, MQ-2, FC-28, IR Flame, NEO-6M GPS |
| Firmware | Arduino IDE (C++) |
| Protocol | MQTT (HiveMQ broker) |
| Cloud | Firebase Realtime Database |
| Dashboard | HTML5 + CSS3 + JavaScript + Firebase SDK v9 |
| Mapping | Leaflet.js + OpenStreetMap |
| Graphs | Chart.js |
| ML Training | Python, scikit-learn, pandas, numpy |
| ML API | Flask |
| Notebook | Kaggle (Decision Tree + Random Forest) |

---

## 📁 Project Structure

```
fire-detection-system/
│
├── firmware/
│   ├── node1/
│   │   └── node1.ino          # Ground node (soil + all sensors + MQTT)
│   └── node2/
│       └── node2.ino          # Elevated node (detection + GPS + MQTT)
│
├── dashboard/
│   ├── index.html             # Main dashboard UI
│   ├── style.css              # Styling
│   └── app.js                 # Firebase + Chart.js + Leaflet logic
│
├── ml/
│   ├── fire_detection_ml.ipynb   # Full Kaggle notebook
│   ├── fire_dataset.csv          # 2,600-row training dataset
│   ├── fire_model.pkl            # Trained Decision Tree model
│   ├── label_map.pkl             # Label decoder
│   └── app.py                    # Flask prediction API
│
├── docs/
│   ├── architecture_diagram.png
│   └── research_paper.docx
│
└── README.md
```

---

## ⚙️ Setup Guide

### 1. Firebase Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create project → **FireDetectionSystem**
3. Build → Realtime Database → Create (Test Mode)
4. Copy your **Database URL** and **Web API Key**

### 2. Arduino IDE Setup

```bash
# Install ESP32 board support
# File → Preferences → Additional Board URLs:
https://dl.espressif.com/dl/package_esp32_index.json

# Install libraries (Sketch → Manage Libraries):
- DHT sensor library (Adafruit)
- Adafruit Unified Sensor
- PubSubClient (MQTT)
- TinyGPS++ (GPS)
```

### 3. Flash Node 1

```cpp
// In node1.ino, update:
const char* ssid     = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";
```

Then:
1. Disconnect all sensors
2. Upload code (hold BOOT button while uploading if needed)
3. Reconnect sensors one by one
4. Open Serial Monitor at **115200 baud**

### 4. Flash Node 2

Same steps as Node 1 using `node2.ino`.

### 5. Run ML API

```bash
pip install flask scikit-learn numpy
python ml/app.py
# API running at http://localhost:5000/predict
```

### 6. Open Dashboard

Open `dashboard/index.html` in browser — data loads live from Firebase.

---

## 📊 Dashboard Features

| Feature | Description |
|---------|-------------|
| 🔴 Status Indicator | Color-coded: Green / Yellow / Orange / Red |
| 📊 Live Graphs | Temperature & smoke trends (last 30 min) via Chart.js |
| 📍 GPS Map | Node locations with color-coded fire markers (Leaflet.js) |
| 🔥 Heatmap | Spatial risk visualization (Leaflet.heat) |
| 🔔 Audio Alert | Browser sound on PROBABLE_FIRE or above |
| 🧾 Event Log | Timestamped history of all alerts |
| 🤖 ML Prediction | Real-time risk score from Flask API |

---

## 📈 Results

| Metric | Value |
|--------|-------|
| End-to-end alert latency | 2.4 ± 0.6 seconds |
| False alarm rate | Near zero (multi-sensor gating) |
| ML test accuracy | 98.85% |
| ML 5-fold CV accuracy | ~98% |
| Node power consumption | ~240 mA @ 3.3V (0.79W) |
| Battery life (5000mAh + deep sleep) | ~4.6 days |

---

## 📘 Syllabus Mapping (AIOT Subject)

| Unit | Topic | How We Cover It |
|------|-------|----------------|
| Unit I | IoT Computing Platforms | ESP32 dual-core microcontroller |
| Unit II | Sensor Interfacing | DHT11, MQ-2, FC-28, IR Flame, GPS |
| Unit III | IoT Protocols | MQTT (HiveMQ broker) |
| Unit III | Cloud Connectivity | Firebase Realtime Database |
| Unit III | AI Integration | Decision Tree ML model |
| Unit IV | Disaster Management App | Forest fire monitoring system |
| Unit IV | Data Visualization | Graphs, heatmap, GPS map |

---

## 👨‍💻 Team

| Name | Role |
|------|------|
| Devansh [Author 1] | Hardware, Firmware, Node 1 |
| [Author 2] | ML Model, Kaggle Notebook |
| [Author 3] | Dashboard, Firebase Integration |

**Institution:** [Your Institution Name]
**Department:** [Your Department]
**Subject:** Advanced IoT Computing Platforms and Programming
**Year:** 2025–26

---

## 📄 License

This project was built for academic purposes as part of the AIOT mini-project. Feel free to use, modify, and extend.

