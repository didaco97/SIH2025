# 🌾 KrishiSense: YES-TECH Agri Platform

<div align="center">

![KrishiSense Header](https://capsule-render.vercel.app/api?type=waving&color=059669&height=300&section=header&text=KrishiSense&fontSize=90&animation=fadeIn&fontAlignY=38&desc=AI-Powered%20Precision%20Agriculture%20&%20Insurance%20Settlement&descAlignY=51&descAlign=50)

[![SIH 2025 Winner](https://img.shields.io/badge/🏆_SIH_2025-WINNER-ffd700?style=for-the-badge&logo=trophy&logoColor=black)](https://sih.gov.in)
[![Team Graviton](https://img.shields.io/badge/Team-GRAVITON-blueviolet?style=for-the-badge&logo=github)](https://github.com/Start-Hack/Graviton)
[![Problem Statement](https://img.shields.io/badge/PSID-SIH25263-ef4444?style=for-the-badge)](https://sih.gov.in)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)

**Winning Project of Smart India Hackathon 2025 🏆**

*Revolutionizing Farm-Level Yield Estimation & Crop Insurance with Satellite Intelligence*

[Explore Features](#-key-features) • [Tech Stack](#-technology-stack) • [Team](#-team-graviton) • [Installation](#-installation)

</div>

---

## 📜 Problem Statement: SIH25263

### **Farm level yield estimation using very-high spatial resolution data and robust crop models**

**Organization:** Ministry of Agriculture & Farmers Welfare (MoA&FW)  
**Department:** Department of Agriculture & Farmers Welfare (DoA&FW) (PMFBY)  
**Category:** Software  
**Theme:** Agriculture, FoodTech & Rural Development

### **Background**
> PMFBY has traditionally relied on manual Crop Cutting Experiments (CCEs) for yield estimation, which suffer from delays, inconsistencies, and errors. To address these challenges, the Government of India has introduced the **Yield Estimation System based on Technology (YES-TECH)**. While YES-TECH models are standardized for village-level estimation, there is a critical need for **individual farm-level crop yield and loss assessment** using high-spatial-resolution satellite/UAV data.

### **The Challenge**
Develop an innovative digital solution that integrates **very-high spatial resolution satellite or UAV/drone imagery** with robust **process-based crop growth and yield models**. The goal is to enable **highly accurate, dynamic yield predictions and damage assessments at a fine spatial scale**, supporting timely and objective insurance settlements and agricultural decision-making.

### **Key Requirements**
*   🛰️ **High-Resolution Integration:** Ingest & process <1m-5m resolution satellite/UAV data.
*   🌱 **Robust Crop Models:** Incorporate process-based simulations (e.g., DSSAT, AquaCrop) coupled with ML.
*   📊 **Visual Dashboard:** Advanced mapping of yield predictions, hotspots, and claim workflows.
*   🔗 **Interoperability:** API integration with PMFBY and CROPIC platforms.

---

## 🚀 Our Solution: KrishiSense

KrishiSense is a state-of-the-art **AI-powered Agricultural Intelligence Platform** developed to bridge the gap between satellite data and farm-level actionable insights. By leveraging **Google Vertex AI**, **Sentinel-2 Imagery**, and **Deep Learning**, we provide precision yield estimation and automated claim processing.

### ✨ Key Features

#### 🛡️ For Officers (PMFBY / Insurance)
*   **Satellite Farm Segmentation:** Auto-detect farm boundaries using **Segment Anything Model (SAM)** on satellite maps.
*   **AI Yield Prediction:** Farm-level yield forecasting using historic weather, soil, and NDVI data.
*   **Heatmap Analytics:** Real-time visualization of **NDVI (Crop Health)** and **Soil Moisture** indices.
*   **Automated Claim Verification:** Verify claims against satellite evidence and historic data.
*   **Blockchain Integration:** Secure, immutable storage of claim reports and verified hashes.

#### 👨‍🌾 For Farmers (Kisan Portal)
*   **Easy Claim Filing:** Simplified, AI-assisted claim filing with **7/12 Extract OCR**.
   > *Upload your land document, and our AI auto-fills survey numbers, village, and owner details!*
*   **Geotagged Proofs:** Upload verified photos with automatic coordinate extraction.
*   **Transparency:** Track claim status in real-time from "Pending" to "Approved".
*   **Multilingual Support:** Accessible in local languages for maximum reach.

---

## 💻 Technology Stack

<div align="center">

| Frontend | Backend & AI | Data & Infrastructure |
| :---: | :---: | :---: |
| ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white) | ![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white) | ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black) |
| ![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black) | ![Vertex AI](https://img.shields.io/badge/Google_Vertex_AI-4285F4?style=flat&logo=googlecloud&logoColor=white) | ![Google Maps](https://img.shields.io/badge/Google_Maps_API-4285F4?style=flat&logo=googlemaps&logoColor=white) |
| ![Twlwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) | ![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=flat&logo=pytorch&logoColor=white) | ![Polygon](https://img.shields.io/badge/Polygon_Blockchain-7B3FE4?style=flat&logo=polygon&logoColor=white) |
| ![Shadcn](https://img.shields.io/badge/shadcn%2Fui-000000?style=flat&logo=shadcnui&logoColor=white) | ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white) | ![PDF.js](https://img.shields.io/badge/PDF.js-EC1C24?style=flat&logo=adobeacrobatreader&logoColor=white) |

</div>

---

## 👥 Team GRAVITON

**SIH 2025 Team ID: 52275**

We are a team of passionate developers and data scientists dedicated to solving India's agricultural challenges through technology.

| Name | Role |
| :--- | :--- |
| **Team Leader** | Full Stack & Cloud Architect |
| **Member 2** | AI/ML Engineer (Computer Vision) |
| **Member 3** | Frontend Developer & UI/UX |
| **Member 4** | Backend Developer & API Specialist |
| **Member 5** | Data Scientist & Crop Modeler |
| **Member 6** | Blockchain & Security Developer |

*(Note: Specific member names were not extracted from the summary slide, but we are Team GRAVITON!)*

---

## 🛠️ Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/Start-Hack/KrishiSense.git
    cd KrishiSense
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env.local` file with your credentials:
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=...
    NEXT_PUBLIC_GOOGLE_MAPS_KEY=...
    NEXT_PUBLIC_VERTEX_API_KEY=...
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

5.  **Open Application**
    Visit `http://localhost:3000` to see the app in action!

---

<div align="center">

**Made with ❤️ for Indian Agriculture 🇮🇳**

</div>
