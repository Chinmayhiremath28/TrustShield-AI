# TrustShield AI — Complete VS Code Run Guide

## What you need installed first
- Node.js (v18+) — https://nodejs.org
- Python (v3.10+) — https://python.org
- VS Code — https://code.visualstudio.com
- Git (optional) — https://git-scm.com

---

## PHASE 1 — Extract & Open in VS Code

### Step 1 — Extract the zip
Right-click `TrustShieldAI_v2.zip` → Extract All
You will get a folder called `TrustShieldAI` with:
  TrustShieldAI/
  ├── frontend/
  ├── backend/
  ├── README.md
  └── TrustShieldAI.code-workspace

### Step 2 — Open in VS Code
Option A (recommended):
  Double-click `TrustShieldAI.code-workspace`
  VS Code opens with everything pre-configured.

Option B:
  Open VS Code → File → Open Folder → select TrustShieldAI folder

---

## PHASE 2 — Install VS Code Extensions

Click the Extensions icon (left sidebar, looks like 4 squares) and install:

1. Python          — by Microsoft (ms-python.python)
2. Pylance         — by Microsoft (ms-python.vscode-pylance)
3. ES7+ React      — by dsznajder
4. Tailwind CSS    — by bradlc
5. Thunder Client  — by Rangav (for API testing)

You only need to install these once.

---

## PHASE 3 — Run the Backend (Python / FastAPI)

### Step 1 — Open a Terminal
In VS Code: Terminal menu → New Terminal
OR press:  Ctrl + ` (backtick key, top-left of keyboard)

### Step 2 — Navigate into the backend folder
Type exactly:
  cd backend
Press Enter.

You should now see something like:
  C:\Users\YourName\TrustShieldAI\backend>

### Step 3 — Create a Python virtual environment
Type:
  python -m venv venv
Press Enter.
Wait about 10 seconds. A folder called `venv` will appear inside backend/.

What this does: creates an isolated Python environment so packages
don't conflict with other projects on your computer.

### Step 4 — Activate the virtual environment

On Windows:
  venv\Scripts\activate

On Mac / Linux:
  source venv/bin/activate

After activating, your terminal line will show (venv) at the start:
  (venv) C:\Users\YourName\TrustShieldAI\backend>

IMPORTANT: You must see (venv) before continuing. If you don't see it,
the activation didn't work — try the command again.

### Step 5 — Install Python packages
Type:
  pip install -r requirements.txt
Press Enter.

This installs FastAPI, Uvicorn, and other dependencies.
It will print a lot of text — wait until it says "Successfully installed".
Takes 30–60 seconds depending on your internet speed.

### Step 6 — Start the backend server
Type:
  uvicorn main:app --reload
Press Enter.

You will see:
  INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
  INFO:     Started reloader process
  INFO:     Application startup complete.

The backend is now running! Leave this terminal open.

### Step 7 — Verify backend works
Open your browser and go to:
  http://localhost:8000

You should see:
  {"status":"online","service":"TrustShield AI",...}

Also check the automatic API docs at:
  http://localhost:8000/docs

This shows all 5 API endpoints you can test in the browser.

---

## PHASE 4 — Run the Frontend (React / Vite)

### Step 1 — Open a SECOND terminal
In VS Code: Terminal menu → New Terminal
OR click the + icon in the terminal panel at the bottom.

You now have two terminals running side by side. Keep the backend
terminal open — don't close it.

### Step 2 — Navigate into the frontend folder
Type:
  cd frontend
Press Enter.

### Step 3 — Install Node packages
Type:
  npm install
Press Enter.

This downloads React, Vite, TailwindCSS and all other frontend
dependencies into a folder called `node_modules`.

It will print a lot of text. Wait for it to finish.
Takes 1–3 minutes on first install.

When done you'll see something like:
  added 312 packages in 45s

### Step 4 — Start the frontend development server
Type:
  npm run dev
Press Enter.

You will see:
  VITE v5.x.x  ready in 400ms
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/

### Step 5 — Open the app in your browser
Go to:
  http://localhost:5173

The TrustShield AI app will open with the animated intro screen!

---

## PHASE 5 — What you should see

1. INTRO SCREEN (3 seconds)
   - Full-screen dark background with particles
   - "TRUSTSHIELD AI" types out letter by letter
   - Shield icon with glowing rings
   - Loading bar completes
   - Smooth fade transition to dashboard

2. MAIN DASHBOARD
   - Particle network background (subtle, always visible)
   - Header with: language switcher (EN/हि/ಕ), Elderly Mode toggle,
     Voice Alert toggle, "How it works" button
   - 4 stat cards: India-Focused, Explainable AI, Zero Storage, Real-Time
   - 4 tabs: Text/SMS, URL Scanner, Audio, Image/Video

3. TEST IT — try these actions:
   a. Click "Sample 1" in the Text tab → click the ⚡ button
      You'll see the risk meter animate, keywords highlight in red,
      explanations appear, and "What to do" action cards appear.

   b. Click the URL tab → click "Sample 1" (the .xyz URL)
      Watch the 4-step progress bar scan, then see URL sandbox preview.

   c. Click "How it works" button (top right)
      The AI Transparency Dashboard modal opens.

   d. Toggle "Elderly Mode"
      All fonts get larger and simpler.

   e. Toggle "🔊 Voice Alert" then scan a message
      Your browser will speak the verdict aloud.

---

## Terminal Layout Summary

Your VS Code should have TWO terminals running at the same time:

Terminal 1 (Backend):            Terminal 2 (Frontend):
─────────────────────────        ───────────────────────────
(venv) backend> uvicorn ...      frontend> npm run dev
INFO: Running on :8000           VITE ready → http://localhost:5173

---

## Common Problems & Fixes

PROBLEM: 'python' is not recognized
FIX: Try 'python3' instead of 'python', or reinstall Python
     and check "Add Python to PATH" during installation.

PROBLEM: 'npm' is not recognized
FIX: Reinstall Node.js from https://nodejs.org and restart VS Code.

PROBLEM: (venv) doesn't appear after activation on Windows
FIX: Run this first in PowerShell (as Administrator):
     Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
     Then try venv\Scripts\activate again.

PROBLEM: Port 8000 already in use
FIX: Change the port:
     uvicorn main:app --reload --port 8001

PROBLEM: Port 5173 already in use
FIX: Vite picks the next available port automatically (5174, 5175, etc.)
     Just use whichever URL Vite shows you.

PROBLEM: CORS error in browser console
FIX: The frontend uses mock/local detection by default.
     CORS only matters when you connect frontend → backend.
     Everything works without the backend for demo purposes.

PROBLEM: node_modules folder is huge / install takes long
FIX: This is normal. node_modules can be 200MB. It's excluded from
     zip files. You only install once.

PROBLEM: App loads but intro doesn't show
FIX: The intro shows once per browser session. Open an incognito
     window or clear sessionStorage:
     F12 → Console → type: sessionStorage.clear() → refresh page

---

## Quick Reference — Commands at a Glance

Every time you want to run the project:

Terminal 1 — Backend:
  cd backend
  venv\Scripts\activate        (Windows)
  source venv/bin/activate     (Mac/Linux)
  uvicorn main:app --reload

Terminal 2 — Frontend:
  cd frontend
  npm run dev

Open browser: http://localhost:5173

To stop either server: press Ctrl + C in that terminal.
