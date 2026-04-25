# TrustShield AI — Complete Setup & Deployment Guide

## Project Structure

```
trustshield-ai/
├── frontend/                   ← React + Vite app
│   ├── src/
│   │   ├── App.jsx             ← Main component (provided as artifact)
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── backend/                    ← FastAPI Python backend
    ├── main.py
    ├── requirements.txt
    ├── Procfile
    ├── render.yaml
    └── models/
        ├── __init__.py
        ├── text_analyzer.py
        ├── url_scanner.py
        ├── audio_analyzer.py
        └── image_analyzer.py
```

---

## Step 1 — Frontend Setup (VS Code)

### 1.1 Create Vite + React project

```bash
# In your workspace folder
npm create vite@latest trustshield-frontend -- --template react
cd trustshield-frontend
npm install
```

### 1.2 Install dependencies

```bash
npm install tailwindcss @tailwindcss/vite lucide-react
```

### 1.3 Configure Tailwind

In `vite.config.js`:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

In `src/index.css`:
```css
@import "tailwindcss";
```

### 1.4 Place the App

Copy the TrustShield AI JSX artifact into `src/App.jsx`.

In `src/main.jsx`:
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)
```

In `index.html`, add:
```html
<title>TrustShield AI</title>
<meta name="description" content="Responsible AI: Real-Time Scam & Deepfake Detection">
```

### 1.5 Configure API base URL

Create `src/config.js`:
```js
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
```

In `App.jsx`, replace mock functions with real API calls (see Section 4).

### 1.6 Run locally

```bash
npm run dev
# Opens at http://localhost:5173
```

---

## Step 2 — Backend Setup (VS Code)

### 2.1 Create Python virtual environment

```bash
# In your workspace folder
mkdir trustshield-backend && cd trustshield-backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### 2.2 Copy backend files

Place `main.py`, `requirements.txt`, `Procfile`, `render.yaml`, and the `models/` folder into `trustshield-backend/`.

### 2.3 Install dependencies

```bash
pip install -r requirements.txt
```

### 2.4 Run locally

```bash
uvicorn main:app --reload --port 8000
# API at http://localhost:8000
# Docs at http://localhost:8000/docs  ← Swagger UI
```

---

## Step 3 — Connect Frontend to Backend

In `src/App.jsx`, find the mock functions and replace them:

```js
// Replace analyzeText() with:
async function callTextAPI(text) {
  const res = await fetch(`${API_BASE}/analyze/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  const data = await res.json();
  return {
    score: data.risk_score,
    label: data.label,
    explanations: data.explanations.map(e => ({ icon: e.icon, text: e.text, sev: e.severity })),
    patterns: data.metadata.detected_patterns,
    highlighted: data.metadata.highlighted_text,
  };
}

// Replace analyzeURL() with:
async function callURLAPI(url) {
  const res = await fetch(`${API_BASE}/analyze/url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  const data = await res.json();
  return {
    score: data.risk_score,
    label: data.label,
    explanations: data.explanations.map(e => ({ icon: e.icon, text: e.text, sev: e.severity })),
    domain: data.metadata.domain,
  };
}

// Replace analyzeAudio() / analyzeImage() with FormData POST:
async function callMediaAPI(endpoint, file) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/analyze/${endpoint}`, { method: 'POST', body: form });
  const data = await res.json();
  return {
    score: data.risk_score,
    label: data.label,
    explanations: data.explanations.map(e => ({ icon: e.icon, text: e.text, sev: e.severity })),
    model: data.metadata.model,
    confidence: data.metadata.confidence,
    regions: data.metadata.anomaly_regions || [],
  };
}
```

---

## Step 4 — Deployment (100% Free)

### 4a. Deploy Frontend → Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# From frontend folder
cd trustshield-frontend
vercel

# Follow prompts:
# Framework: Vite
# Build command: npm run build
# Output: dist
```

Set environment variable in Vercel dashboard:
```
VITE_API_URL = https://your-backend.onrender.com
```

### 4b. Deploy Backend → Render

1. Push `trustshield-backend/` to a GitHub repo
2. Go to render.com → New → Web Service
3. Connect the GitHub repo
4. Settings:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Python version**: 3.11
5. Add env var: `ALLOWED_ORIGINS = https://your-app.vercel.app`
6. Click **Deploy**

> ⚠️ Free Render instances spin down after 15 min inactivity.
> Add a startup ping in frontend (call `/` endpoint on load).

---

## Step 5 — Optional: Real ML Models (HuggingFace Free Tier)

### Enable real deepfake detection

```bash
pip install transformers torch Pillow librosa
```

In `models/image_analyzer.py`, uncomment the HuggingFace section at the bottom and replace the heuristic function.

**Free models to use:**
| Task | Model |
|------|-------|
| Image deepfake | `dima806/deepfake_vs_real_image_detection` |
| Audio deepfake | `speechbrain/asr-wav2vec2-commonvoice` |
| Text classification | `distilbert-base-uncased` (fine-tune on phishing data) |
| Zero-shot text | `facebook/bart-large-mnli` |

---

## Step 6 — Demo Script (Hackathon Presentation)

### Opening (30 seconds)
> "Every 10 seconds, an Indian citizen falls victim to a digital scam. TrustShield AI is a responsible, privacy-first system that detects scams and deepfakes in real time."

### Demo Flow:
1. **Text tab** → Paste Sample 1 (SBI KYC scam) → Show risk meter + explanations
2. **URL tab** → Paste `http://sbi-kyc-verify.xyz/login` → Show phishing indicators
3. **Audio tab** → Upload synthetic voice sample → Show spectrogram analysis
4. **Image tab** → Upload sample face image → Show anomaly regions
5. **Toggle Elderly Mode** → Show accessible UI
6. **Toggle Hindi** → Show multilingual support

### Responsible AI Talking Points:
- ✅ Zero data storage — all processing in-memory
- ✅ Explainable AI — every decision has human-readable reasoning
- ✅ India-specific threat intelligence (UPI, Aadhaar, OTP fraud)
- ✅ Free and open — deployable with zero cost
- ✅ Accessible — elderly mode, 3 languages

---

## API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/analyze/text` | Scam message detection |
| POST | `/analyze/url` | Phishing URL scan |
| POST | `/analyze/audio` | Voice deepfake detection |
| POST | `/analyze/image` | Image/video deepfake detection |

Full interactive docs: `http://localhost:8000/docs`

---

## VS Code Recommended Extensions

- **Python** (ms-python.python)
- **Pylance** (ms-python.vscode-pylance)
- **ES7+ React/Redux** (dsznajder.es7-react-js-snippets)
- **Tailwind CSS IntelliSense** (bradlc.vscode-tailwindcss)
- **Thunder Client** (rangav.vscode-thunder-client) — API testing
- **GitLens** (eamodio.vscode-gitlens)

---

*TrustShield AI · Hackathon 2025 · Responsible AI · Privacy-First*
