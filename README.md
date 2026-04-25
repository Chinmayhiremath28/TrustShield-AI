# 🛡️ TrustShield AI — v3 Final

> **Responsible AI System for Real-Time Scam & Deepfake Detection**  
> Hackathon 2025 · Privacy-First · India-Focused · Multilingual · Voice-Enabled

---

## ✨ What's New in v3

| Feature | Description |
|---------|-------------|
| ⚡ **Live Protection Mode** | Real-time message feed — auto-scans each message as it arrives |
| 🔊 **Full Voice Mode** | Speaks verdict + explanation + action in EN / हिन्दी / ಕನ್ನಡ |
| 🌐 **Multilingual Backend** | Dictionary-based translator in `models/translator.py` |
| 🧠 **Impersonation Boost** | "I am from bank" now reliably flagged suspicious/scam |
| 🔗 **Domain Keyword Check** | URL scanner now catches phishing words in domain names |

---

## 📋 Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Python | **3.10 or 3.11 ONLY** | https://python.org |
| Node.js | 18 or newer | https://nodejs.org |
| VS Code | Any recent | https://code.visualstudio.com |

> ⚠️ Python 3.12+ may have compatibility issues with some packages. Use 3.10 or 3.11.

---

## 🚀 Step-by-Step Setup in VS Code

### Step 1 — Open the project

Option A (recommended): Double-click `TrustShieldAI.code-workspace`  
Option B: File → Open Folder → select `TrustShieldAI/`

---

### Step 2 — Start the Backend

Open Terminal 1 (`Ctrl+`` ` ``):

```bash
cd backend
```

**Create virtual environment:**
```bash
python -m venv venv
```

**Activate it:**
```bash
# Windows
venv\Scripts\activate

# Mac / Linux
source venv/bin/activate
```

You should see `(venv)` at the start of the prompt.

**Install dependencies:**
```bash
pip install -r requirements.txt
```

**Start the server:**
```bash
uvicorn main:app --reload
```

✅ Backend running at: http://localhost:8000  
📖 API docs (Swagger): http://localhost:8000/docs

---

### Step 3 — Start the Frontend

Open Terminal 2 (click `+` in terminal panel):

```bash
cd frontend
npm install
npm run dev
```

✅ App running at: http://localhost:5173

---

### Step 4 — Open in Browser

Go to: **http://localhost:5173**

The animated intro screen plays once, then the dashboard loads.

---

## 🎯 Feature Guide

### ⚡ Live Protection Mode
1. Click the **"⚡ Live Mode"** tab (5th tab)  
2. Click **"▶ Start Simulation"**  
3. Watch 10 real-world messages arrive one by one  
4. Each message is **automatically scanned** — no button needed  
5. Risk badges appear inline: `✅ SAFE`, `⚠️ SUSPICIOUS`, `🚨 HIGH RISK`  
6. URLs inside messages are **auto-scanned** too

### 🔊 Voice Mode
1. Toggle **"🔊 Voice Mode"** in the header  
2. Now every scan result is **spoken aloud**:  
   - Verdict (High risk / Safe / Caution)  
   - Top explanation  
   - Recommended action  
3. Voice **matches the selected language**

### 🌐 Language Selection
1. Click **EN / हि / ಕ** in the header  
2. All UI text, risk labels, explanations, and voice output switch instantly  
3. Supported: English · Hindi · Kannada

### 🔍 Manual Scanning
- **Text/SMS tab** — paste message → press ↑ or Enter
- **URL Scanner** — paste URL → click Scan Now
- **Audio tab** — upload audio file → click Analyze
- **Image/Video tab** — upload image → click Analyze

---

## 🐛 Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `'python' not found` | Use `python3` instead; ensure Python is in PATH |
| `(venv)` not showing | Run `Set-ExecutionPolicy RemoteSigned` in PowerShell (Windows admin) |
| Port 8000 in use | `uvicorn main:app --reload --port 8001` |
| Port 5173 in use | Vite auto-picks next port (5174, etc.) |
| `npm: not found` | Reinstall Node.js from nodejs.org and restart VS Code |
| Voice not speaking | Allow browser microphone/speech permissions; check OS audio |
| Intro shows every time | The intro shows once per session. Open incognito for fresh session. |
| CORS error in console | Frontend runs in standalone mode — detection works without backend |

---

## 🏗️ Project Structure

```
TrustShieldAI/
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  ← Main app + all tabs
│   │   ├── LiveProtectionMode.jsx   ← ⚡ NEW: Live feed simulation
│   │   ├── voiceEngine.js           ← 🔊 NEW: Multilingual speech engine
│   │   ├── engine.js                ← Hybrid AI detection (client-side)
│   │   ├── translations.js          ← EN / हिन्दी / ಕನ್ನಡ strings
│   │   ├── components.jsx           ← RiskMeter, ResultBlock, etc.
│   │   ├── IntroScreen.jsx          ← Premium animated intro
│   │   ├── ParticleBackground.jsx   ← Ambient background
│   │   ├── TransparencyDashboard.jsx← AI transparency modal
│   │   └── index.css                ← Premium design system
│   ├── package.json
│   └── vite.config.js
│
└── backend/
    ├── main.py                      ← FastAPI + 5 endpoints
    ├── requirements.txt
    └── models/
        ├── text_analyzer.py         ← Hybrid engine v2 + behavioral
        ├── url_scanner.py           ← Domain + path + TLD scanning
        ├── audio_analyzer.py        ← MFCC + spectrogram analysis
        ├── image_analyzer.py        ← EfficientNet-B4 heuristics
        └── translator.py            ← 🌐 NEW: EN/HI/KN translation
```

---

## 🔒 Responsible AI

- **No data storage** — all analysis runs in-memory, nothing persisted
- **No tracking** — no analytics, no cookies, no user identifiers
- **Explainable** — every verdict comes with plain-language reasons
- **Human-final** — all verdicts are advisory only
- **No bias** — patterns reviewed to avoid false flags on normal multilingual text

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/analyze/text` | Scam detection (supports `language` param) |
| POST | `/analyze/url` | Phishing URL scan |
| POST | `/analyze/audio` | Voice deepfake detection |
| POST | `/analyze/image` | Image/video deepfake detection |

---

## 🌐 Free Deployment

- **Frontend** → [Vercel](https://vercel.com) — connect GitHub repo, deploy in 1 click
- **Backend** → [Render](https://render.com) — free tier, Python 3.11 support

Set `VITE_API_URL=https://your-backend.onrender.com` in Vercel environment variables.

---

*TrustShield AI · Responsible AI Hackathon 2025*
