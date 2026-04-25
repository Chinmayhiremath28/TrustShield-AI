"""
TrustShield AI — FastAPI Backend
Responsible AI: Real-Time Scam & Deepfake Detection
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

from models.text_analyzer import analyze_text
from models.url_scanner import analyze_url
from models.audio_analyzer import analyze_audio
from models.image_analyzer import analyze_image
from models.translator import translate_result

# ── Dataset loader ────────────────────────────────────────────
from services.dataset_loader import load_datasets, spam_keywords, phishing_urls


# ✅ FIRST create app
app = FastAPI(
    title="TrustShield AI API",
    description="Responsible AI system for real-time scam and deepfake detection",
    version="1.0.0",
)

# ✅ THEN use app lifecycle
@app.on_event("startup")
def startup_event():
    load_datasets()
    print(f"Loaded {len(spam_keywords)} spam keywords")
    print(f"Loaded {len(phishing_urls)} phishing URLs")


# CORS — update origins for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response Models ─────────────────────────────────

class TextRequest(BaseModel):
    text: str
    language: Optional[str] = "en"


class URLRequest(BaseModel):
    url: str


class AnalysisResponse(BaseModel):
    risk_score: int
    label: str
    explanations: list
    metadata: dict = {}


# ── Endpoints ────────────────────────────────────────────────

@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "TrustShield AI",
        "privacy": "No data stored. All processing in-memory.",
    }


@app.post("/analyze/text")
async def text_endpoint(req: TextRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    result = analyze_text(req.text, req.language)
    return translate_result(result, req.language or "en")


@app.post("/analyze/url")
async def url_endpoint(req: URLRequest):
    if not req.url.strip():
        raise HTTPException(status_code=400, detail="URL cannot be empty")
    result = analyze_url(req.url)
    return result


@app.post("/analyze/audio", response_model=AnalysisResponse)
async def audio_endpoint(file: UploadFile = File(...)):
    allowed = {"audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/x-m4a"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=415, detail="Unsupported audio format")
    audio_bytes = await file.read()
    return analyze_audio(audio_bytes, file.filename)


@app.post("/analyze/image", response_model=AnalysisResponse)
async def image_endpoint(file: UploadFile = File(...)):
    allowed = {"image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=415, detail="Unsupported media format")
    media_bytes = await file.read()
    return analyze_image(media_bytes, file.filename, file.content_type)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)