# PMFBY API - Complete End-to-End Integration Document

## 🌾 Pradhan Mantri Fasal Bima Yojana - Yield Prediction API

**Version:** 1.0.0  
**Model Accuracy:** 81.8% (R² = 0.8179)  
**Coverage:** Maharashtra, India (37 Districts)  
**Last Updated:** December 2024

---

# Table of Contents

1. [System Overview](#1-system-overview)
2. [Prerequisites & Requirements](#2-prerequisites--requirements)
3. [Connection Setup](#3-connection-setup)
4. [API Endpoints](#4-api-endpoints)
5. [Input Parameters](#5-input-parameters)
6. [Output Response Format](#6-output-response-format)
7. [Complete Code Examples](#7-complete-code-examples)
8. [Error Handling](#8-error-handling)
9. [Best Practices](#9-best-practices)
10. [Troubleshooting](#10-troubleshooting)
11. [Support & Contact](#11-support--contact)

---

# 1. System Overview

## What This API Does

The PMFBY Yield Prediction API provides:
- **Crop Yield Prediction**: Predicts yield in kg/ha for any Maharashtra farm
- **PMFBY Assessment**: Calculates if insurance claim should be triggered
- **Weather Analysis**: Real-time weather data from NASA POWER
- **Soil Properties**: District-level soil characteristics
- **Stress Indices**: Agronomic stress calculations

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                     YOUR SYSTEM (Client)                         │
│  ┌─────────────┐                                                │
│  │ Farm Data   │──── HTTP POST ────┐                            │
│  │ (lat, lon,  │                   │                            │
│  │  crop, etc) │                   ▼                            │
│  └─────────────┘           ┌──────────────┐                     │
│                            │  PMFBY API   │                     │
│                            │  Server      │                     │
│                            └──────┬───────┘                     │
│                                   │                             │
│  ┌─────────────┐                  │                             │
│  │ Prediction  │◄── JSON ─────────┘                             │
│  │ Result      │                                                │
│  └─────────────┘                                                │
└─────────────────────────────────────────────────────────────────┘
```

## Key Features

| Feature | Description |
|---------|-------------|
| Auto-detect District | GPS coordinates → District name |
| Auto-calculate Threshold | Historical data → PMFBY threshold |
| Real-time Weather | NASA POWER API → 15 weather features |
| Uncertainty Estimation | ±XX kg/ha with 95% confidence |
| Claim Probability | % chance of insurance claim |

---

# 2. Prerequisites & Requirements

## Client System Requirements

| Requirement | Details |
|-------------|---------|
| **Language** | Any (Python, JavaScript, Java, C#, PHP, etc.) |
| **HTTP Client** | Ability to make HTTP POST requests |
| **JSON Support** | Parse JSON responses |
| **Network** | Access to server IP on port 5000 |
| **Timeout** | Support 120+ second timeouts |

## For Python Users

```bash
# Install required library
pip install requests
```

## Network Requirements

| Condition | Requirement |
|-----------|-------------|
| Same WiFi/LAN | Use server's local IP |
| Different Network | Use ngrok URL (ask server team) |
| Firewall | Outbound HTTP to port 5000 |

---

# 3. Connection Setup

## API Connection Details

```
┌─────────────────────────────────────────┐
│  API BASE URL                           │
│  http://10.244.29.240:5000              │
├─────────────────────────────────────────┤
│  Port: 5000                             │
│  Protocol: HTTP                         │
│  Content-Type: application/json         │
└─────────────────────────────────────────┘
```

## Step 1: Verify Connection

Before integrating, test if you can reach the API:

### Browser Test
Open in browser: `http://10.244.29.240:5000/api/health`

**Expected Response:**
```json
{
  "status": "ok",
  "model": "v1 (81.8% accuracy)",
  "version": "1.0.0"
}
```

### Python Test
```python
import requests

response = requests.get("http://10.244.29.240:5000/api/health", timeout=10)
print(response.json())
```

### cURL Test
```bash
curl http://10.244.29.240:5000/api/health
```

---

# 4. API Endpoints

## Endpoint Summary

| Endpoint | Method | Description | Response Time |
|----------|--------|-------------|---------------|
| `/api/health` | GET | Check if API is running | < 1 second |
| `/api/threshold` | POST | Get PMFBY threshold only | 1-2 seconds |
| `/api/predict` | POST | Full yield prediction | 30-60 seconds |

---

## 4.1 Health Check

**Purpose:** Verify API is running

```http
GET /api/health HTTP/1.1
Host: 10.244.29.240:5000
```

**Response:**
```json
{
  "status": "ok",
  "model": "v1 (81.8% accuracy)",
  "version": "1.0.0",
  "endpoints": [
    "POST /api/predict",
    "POST /api/threshold",
    "GET /api/health"
  ]
}
```

---

## 4.2 Calculate Threshold

**Purpose:** Get PMFBY threshold without full prediction

```http
POST /api/threshold HTTP/1.1
Host: 10.244.29.240:5000
Content-Type: application/json

{
  "latitude": 19.54841,
  "longitude": 74.188663,
  "crop": "Rice",
  "season": "Kharif"
}
```

**Response:**
```json
{
  "success": true,
  "threshold": 2059,
  "district": "Nashik",
  "crop": "Rice",
  "season": "Kharif",
  "calculation_method": "7-year average excluding 2 worst years",
  "unit": "kg/ha"
}
```

---

## 4.3 Full Prediction (Main Endpoint)

**Purpose:** Get complete yield prediction with PMFBY assessment

```http
POST /api/predict HTTP/1.1
Host: 10.244.29.240:5000
Content-Type: application/json

{
  "latitude": 19.54841,
  "longitude": 74.188663,
  "crop": "Rice",
  "season": "Kharif",
  "area": 10
}
```

**Response:** See Section 6 for complete response format.

---

# 5. Input Parameters

## Required Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `latitude` | float | Farm latitude (decimal degrees) | 19.54841 |
| `longitude` | float | Farm longitude (decimal degrees) | 74.188663 |
| `crop` | string | Crop name (case-sensitive) | "Rice" |
| `season` | string | Growing season | "Kharif" |
| `area` | float | Farm area in hectares | 10 |

## Optional Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `year` | int | Crop year | Current year - 1 |
| `district` | string | Override auto-detection | Auto-detected |
| `threshold` | float | Override auto-calculation | Auto-calculated |

## Valid Values

### Crops (30+ supported)
```
Rice, Wheat, Cotton, Soyabean, Sugarcane, Jowar, Bajra, Maize,
Groundnut, Sunflower, Arhar(Tur), Gram, Moong(Green Gram), Urad,
Onion, Potato, Tomato, Chilli, Turmeric, Ginger, etc.
```

### Seasons
| Season | Period | Months |
|--------|--------|--------|
| Kharif | Monsoon | June - November |
| Rabi | Winter | November - March |
| Summer | Summer | March - June |

### Districts (37 Maharashtra districts)
```
Ahmednagar, Akola, Amravati, Aurangabad, Beed, Bhandara, Buldhana,
Chandrapur, Dhule, Gadchiroli, Gondia, Hingoli, Jalgaon, Jalna,
Kolhapur, Latur, Mumbai, Nagpur, Nanded, Nandurbar, Nashik,
Osmanabad, Parbhani, Pune, Raigad, Ratnagiri, Sangli, Satara,
Sindhudurg, Solapur, Thane, Wardha, Washim, Yavatmal
```

---

# 6. Output Response Format

## Complete Response Structure

```json
{
  "success": true,
  "data": {
    "location": {
      "latitude": 19.54841,
      "longitude": 74.188663,
      "district": "Nashik"
    },
    "crop_info": {
      "crop": "Rice",
      "season": "Kharif",
      "area": 10,
      "area_unit": "hectares"
    },
    "prediction": {
      "predicted_yield": 2148,
      "uncertainty": 686,
      "confidence_interval": [340, 2933],
      "unit": "kg/ha",
      "total_production": 21480,
      "total_production_unit": "kg"
    },
    "pmfby": {
      "threshold": 2059,
      "threshold_production": 20590,
      "shortfall": 0,
      "loss_percentage": 0.0,
      "claim_triggered": false,
      "claim_probability": 13.1,
      "decision_confidence": 73.8
    },
    "weather": {
      "rainfall": 1295,
      "gdd": 4047,
      "heat_stress": 319,
      "vpd": 1.18,
      "dry_spells": 2
    },
    "soil": {
      "texture": "Clay",
      "clay_pct": 45.2,
      "ph": 7.8,
      "quality_index": 0.80
    },
    "stress": {
      "vegetative": 0.15,
      "flowering_heat": 0.22,
      "combined": 0.37,
      "yield_potential": 0.65
    },
    "model": {
      "version": "v1",
      "accuracy": 81.8,
      "r2_score": 0.8179
    }
  }
}
```

## Field Descriptions

### `prediction` Object
| Field | Type | Unit | Description |
|-------|------|------|-------------|
| `predicted_yield` | int | kg/ha | Predicted yield per hectare |
| `uncertainty` | int | kg/ha | ± uncertainty range |
| `confidence_interval` | [int, int] | kg/ha | 95% confidence interval |
| `total_production` | int | kg | yield × area |

### `pmfby` Object
| Field | Type | Unit | Description |
|-------|------|------|-------------|
| `threshold` | int | kg/ha | PMFBY threshold yield |
| `shortfall` | int | kg/ha | How much below threshold |
| `loss_percentage` | float | % | (shortfall/threshold) × 100 |
| `claim_triggered` | bool | - | True if loss ≥ 33% |
| `claim_probability` | float | % | Probability of claim |

### `weather` Object
| Field | Type | Unit | Description |
|-------|------|------|-------------|
| `rainfall` | int | mm | Total rainfall in season |
| `gdd` | int | degree-days | Growing Degree Days |
| `heat_stress` | int | - | Heat stress intensity |
| `vpd` | float | kPa | Vapor Pressure Deficit |
| `dry_spells` | int | count | Number of dry periods |

### `soil` Object
| Field | Type | Unit | Description |
|-------|------|------|-------------|
| `texture` | string | - | Soil texture class |
| `clay_pct` | float | % | Clay percentage |
| `ph` | float | - | Soil pH value |
| `quality_index` | float | 0-1 | Overall soil quality |

---

# 7. Complete Code Examples

## Python (Recommended)

### Basic Request
```python
import requests
import json

# API Configuration
API_URL = "http://10.244.29.240:5000"

# Farm data
farm_data = {
    "latitude": 19.54841,
    "longitude": 74.188663,
    "crop": "Rice",
    "season": "Kharif",
    "area": 10
}

# Make prediction request
response = requests.post(
    f"{API_URL}/api/predict",
    json=farm_data,
    headers={"Content-Type": "application/json"},
    timeout=120  # Important: Weather fetch takes time
)

# Parse response
result = response.json()

if result["success"]:
    data = result["data"]
    
    # Extract key values
    print(f"District: {data['location']['district']}")
    print(f"Predicted Yield: {data['prediction']['predicted_yield']} kg/ha")
    print(f"Total Production: {data['prediction']['total_production']} kg")
    print(f"Threshold: {data['pmfby']['threshold']} kg/ha")
    print(f"Claim Triggered: {data['pmfby']['claim_triggered']}")
    print(f"Claim Probability: {data['pmfby']['claim_probability']}%")
else:
    print(f"Error: {result.get('error')}")
```

### Using Client Module
```python
# Copy pmfby_client.py to your project first!
from pmfby_client import PMFBYClient

# Initialize client
client = PMFBYClient("http://10.244.29.240:5000")

# Check health
health = client.health_check()
print(f"API Status: {health['status']}")

# Get prediction
result = client.predict(
    latitude=19.54841,
    longitude=74.188663,
    crop="Rice",
    season="Kharif",
    area=10
)

if result["success"]:
    data = result["data"]
    print(f"Yield: {data['prediction']['predicted_yield']} kg/ha")
```

---

## JavaScript (Node.js)

```javascript
const axios = require('axios');

const API_URL = 'http://10.244.29.240:5000';

async function predictYield(farmData) {
    try {
        const response = await axios.post(`${API_URL}/api/predict`, farmData, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 120000  // 2 minutes
        });
        
        const data = response.data.data;
        
        console.log(`District: ${data.location.district}`);
        console.log(`Yield: ${data.prediction.predicted_yield} kg/ha`);
        console.log(`Claim: ${data.pmfby.claim_triggered}`);
        
        return response.data;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// Usage
predictYield({
    latitude: 19.54841,
    longitude: 74.188663,
    crop: 'Rice',
    season: 'Kharif',
    area: 10
});
```

---

## Java

```java
import java.net.http.*;
import java.net.URI;
import java.time.Duration;

public class PMFBYClient {
    private static final String API_URL = "http://10.244.29.240:5000";
    
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(120))
            .build();
        
        String json = """
            {
                "latitude": 19.54841,
                "longitude": 74.188663,
                "crop": "Rice",
                "season": "Kharif",
                "area": 10
            }
            """;
        
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(API_URL + "/api/predict"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .timeout(Duration.ofSeconds(120))
            .build();
        
        HttpResponse<String> response = client.send(request, 
            HttpResponse.BodyHandlers.ofString());
        
        System.out.println(response.body());
    }
}
```

---

## cURL

```bash
curl -X POST http://10.244.29.240:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 19.54841,
    "longitude": 74.188663,
    "crop": "Rice",
    "season": "Kharif",
    "area": 10
  }' \
  --max-time 120
```

---

## C# (.NET)

```csharp
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

class Program
{
    static async Task Main()
    {
        var client = new HttpClient { Timeout = TimeSpan.FromSeconds(120) };
        
        var farmData = new
        {
            latitude = 19.54841,
            longitude = 74.188663,
            crop = "Rice",
            season = "Kharif",
            area = 10
        };
        
        var json = JsonSerializer.Serialize(farmData);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        
        var response = await client.PostAsync(
            "http://10.244.29.240:5000/api/predict", content);
        
        var result = await response.Content.ReadAsStringAsync();
        Console.WriteLine(result);
    }
}
```

---

# 8. Error Handling

## Error Response Format

```json
{
  "error": "Error message description"
}
```

## Common HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Parse `data` field |
| 400 | Bad Request | Check input parameters |
| 500 | Server Error | Retry or contact support |

## Error Types and Solutions

| Error Message | Cause | Solution |
|---------------|-------|----------|
| `Missing required field: crop` | Field not in request | Add missing field |
| `Invalid crop name` | Unsupported crop | Check valid crops list |
| `Connection refused` | Server not running | Start server or check IP |
| `Timeout` | Weather API slow | Increase timeout to 120s |

## Retry Logic (Python)

```python
import time
import requests

def predict_with_retry(farm_data, max_retries=3):
    for attempt in range(max_retries):
        try:
            response = requests.post(
                f"{API_URL}/api/predict",
                json=farm_data,
                timeout=120
            )
            return response.json()
        except requests.exceptions.Timeout:
            if attempt < max_retries - 1:
                print(f"Retry {attempt + 1}/{max_retries}...")
                time.sleep(5)
            else:
                raise
        except Exception as e:
            raise e
```

---

# 9. Best Practices

## 1. Always Set Timeout

Weather data fetch takes 30-60 seconds. Always set timeout:
```python
response = requests.post(url, json=data, timeout=120)
```

## 2. Validate Input Before Sending

```python
def validate_farm_data(data):
    required = ["latitude", "longitude", "crop", "season", "area"]
    for field in required:
        if field not in data:
            raise ValueError(f"Missing {field}")
    
    if not -90 <= data["latitude"] <= 90:
        raise ValueError("Invalid latitude")
    
    if not -180 <= data["longitude"] <= 180:
        raise ValueError("Invalid longitude")
    
    if data["area"] <= 0:
        raise ValueError("Area must be positive")
```

## 3. Cache Threshold Values

Thresholds don't change often:
```python
threshold_cache = {}

def get_threshold(district, crop, season):
    key = f"{district}_{crop}_{season}"
    if key not in threshold_cache:
        result = client.get_threshold(...)
        threshold_cache[key] = result["threshold"]
    return threshold_cache[key]
```

## 4. Store Raw Responses

For auditing and debugging:
```python
db.insert({
    "farm_id": farm.id,
    "api_response": json.dumps(result),
    "timestamp": datetime.now()
})
```

## 5. Handle Batch Processing

For multiple farms, add delays:
```python
for farm in farms:
    result = client.predict(**farm)
    results.append(result)
    time.sleep(2)  # Avoid overwhelming API
```

---

# 10. Troubleshooting

## Connection Issues

| Problem | Check | Fix |
|---------|-------|-----|
| Can't reach API | Ping IP | Verify same network |
| Port blocked | Firewall | Ask server to open 5000 |
| Wrong IP | Server changed | Get new IP |

## Request Issues

| Problem | Check | Fix |
|---------|-------|-----|
| 400 Error | Parameters | Verify JSON format |
| Timeout | Network | Increase timeout |
| Empty response | Server logs | Contact support |

## Data Issues

| Problem | Check | Fix |
|---------|-------|-----|
| Wrong district | Coordinates | Verify lat/lon |
| Missing threshold | Crop/Season | Check valid values |
| No prediction | Model error | Contact support |

---

# 11. Support & Contact

## Response Expectations

| Metric | Value |
|--------|-------|
| Health check | < 1 second |
| Threshold | 1-2 seconds |
| Full prediction | 30-60 seconds |
| Model accuracy | 81.8% |

## Technical Specifications

| Specification | Value |
|---------------|-------|
| Model | Random Forest (v1) |
| R² Score | 0.8179 |
| MAE | 195 kg/ha |
| Training data | 20,558 records |
| Coverage | Maharashtra (37 districts) |
| Features | 15 (weather + location + crop) |

## Contact

**Server Team:** [Add your contact here]
**Email:** [Add email]
**Phone:** [Add phone]

---

# Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│  PMFBY API Quick Reference                                  │
├─────────────────────────────────────────────────────────────┤
│  Base URL:  http://10.244.29.240:5000                       │
│  Timeout:   120 seconds                                     │
│  Format:    JSON                                            │
├─────────────────────────────────────────────────────────────┤
│  ENDPOINTS:                                                 │
│  GET  /api/health     - Check status                        │
│  POST /api/threshold  - Get threshold                       │
│  POST /api/predict    - Full prediction                     │
├─────────────────────────────────────────────────────────────┤
│  REQUIRED FIELDS:                                           │
│  latitude, longitude, crop, season, area                    │
├─────────────────────────────────────────────────────────────┤
│  QUICK TEST:                                                │
│  curl http://10.244.29.240:5000/api/health                  │
└─────────────────────────────────────────────────────────────┘
```

---

**Document Version:** 1.0.0  
**API Version:** 1.0.0  
**Model Version:** v1 (81.8% accuracy)  
**Date:** December 2024
