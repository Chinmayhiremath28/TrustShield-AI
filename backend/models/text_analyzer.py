"""
Text Scam Analyzer v2 — Hybrid Detection Engine
Combines: Rule-based heuristics + Keyword weighting + Context scoring + Behavioral analysis + Dataset boost
"""

import re
from typing import List, Dict, Tuple

# ── Dataset-driven boost (loaded at startup, graceful if empty) ──
try:
    from services.dataset_loader import score_text_by_dataset
except ImportError:
    def score_text_by_dataset(text: str) -> int:
        return 0

# ── Scam Pattern Library (India-focused, expanded) ────────────

PATTERNS: Dict[str, Dict] = {
    "financial_data_request": {
        "keywords": [
            "otp", "cvv", "atm pin", "debit card number", "credit card",
            "account number", "ifsc", "upi id", "upi pin", "net banking password",
            "transaction pin", "card number", "bank password",
            "पासवर्ड", "ओटीपी", "पिन", "खाता संख्या",
        ],
        "weight": 30, "severity": "critical",
        "explanation": "Requests sensitive financial data (OTP/PIN/CVV) — banks NEVER ask for these",
    },
    "urgency_pressure": {
        "keywords": [
            "act now", "expires in", "last chance", "immediately", "urgent",
            "within 24 hours", "before midnight", "time is running out",
            "right now", "limited time", "don't wait", "hurry",
            "तुरंत", "अभी", "जल्दी", "आखिरी मौका",
        ],
        "weight": 20, "severity": "high",
        "explanation": "Uses urgency/time-pressure tactics to prevent careful thinking",
    },
    "legal_threats": {
        "keywords": [
            "legal action", "police complaint", "arrested", "fir will be filed",
            "court notice", "frozen", "seized", "suspended", "penalty",
            "warrant issued", "cybercrime", "your account will be blocked",
            "कानूनी कार्रवाई", "गिरफ्तार", "जुर्माना",
        ],
        "weight": 28, "severity": "high",
        "explanation": "Threatens legal action/arrest — psychological pressure tactic",
    },
    "fake_kyc_verification": {
        "keywords": [
            "kyc update", "re-kyc", "kyc expired", "aadhaar verification",
            "pan verification", "update kyc", "kyc pending", "kyc failed",
            "e-kyc", "document verification",
            "केवाईसी", "आधार", "पैन कार्ड",
        ],
        "weight": 25, "severity": "high",
        "explanation": "Fake KYC/Aadhaar verification — common India-specific phishing vector",
    },
    "lottery_reward_fraud": {
        "keywords": [
            "you have won", "winner", "prize money", "lucky draw", "lottery",
            "claim your reward", "cashback offer", "congratulations you",
            "selected customer", "free gift", "special offer",
            "जीत गए", "इनाम", "लॉटरी", "पुरस्कार",
        ],
        "weight": 22, "severity": "high",
        "explanation": "Fake prize/lottery claim — advance-fee fraud pattern",
    },
    "impersonation": {
        "keywords": [
            "rbi", "sebi", "income tax department", "trai", "police officer",
            "bank manager", "sbi", "hdfc", "icici", "axis bank", "paytm",
            "phonepe", "google pay", "amazon pay", "npci", "uidai",
        ],
        "weight": 18, "severity": "medium",
        "explanation": "Impersonates official institutions or known financial brands",
    },
    # ── NEW: Authority Impersonation ─────────────────────────
    "authority_impersonation": {
        "keywords": [
            "i am from bank", "i am from rbi", "calling from sbi",
            "speaking from hdfc", "i am your bank", "this is rbi",
            "government of india", "ministry of finance", "department of",
            "i am your manager", "i am your boss", "official notice from",
            "calling from the bank", "from the bank", "from bank",
            "from rbi", "from hdfc", "from sbi", "from icici",
            "i am calling from", "this is your bank",
        ],
        "weight": 35, "severity": "critical",
        "explanation": "Direct authority claim — scammers impersonate bank/government officials",
    },
    # ── NEW: Isolation Tactic ────────────────────────────────
    "isolation_tactic": {
        "keywords": [
            "do not tell", "don't share this", "keep this secret",
            "confidential matter", "between us", "do not inform anyone",
            "don't inform your family", "private matter", "do not share with",
        ],
        "weight": 26, "severity": "critical",
        "explanation": "Isolation tactic — instructs secrecy to prevent victim from seeking help",
    },
    # ── NEW: Familiarity Manipulation ────────────────────────
    "familiarity_manipulation": {
        "keywords": [
            "dear valued customer", "dear sir/madam", "we noticed your account",
            "we detected unusual", "as per our records", "your registered mobile",
            "your linked account", "your upi id",
        ],
        "weight": 10, "severity": "medium",
        "explanation": "False familiarity — pretends to know account details to lower your guard",
    },
}

# ── Confidence Calibration — High-Risk Combos ─────────────────

COMBOS = [
    {"cats": ["financial_data_request", "urgency_pressure"],    "boost": 18, "reason": "Financial request + urgency = hallmark scam combination"},
    {"cats": ["financial_data_request", "legal_threats"],       "boost": 20, "reason": "Financial request + legal threat = coercive fraud"},
    {"cats": ["impersonation", "fake_kyc_verification"],        "boost": 15, "reason": "Institution impersonation + KYC = phishing attack"},
    {"cats": ["lottery_reward_fraud", "financial_data_request"],"boost": 12, "reason": "Fake prize + data request = advance-fee fraud"},
    {"cats": ["authority_impersonation", "isolation_tactic"],   "boost": 22, "reason": "Authority claim + secrecy = social engineering grooming"},
]

SUSPICIOUS_URL_IN_TEXT = re.compile(
    r'https?://[^\s]+\.(xyz|tk|ml|ga|cf|ru|click|download|online|site|live|cc|pw|top|win|loan)[^\s]*',
    re.IGNORECASE,
)
PHONE_IN_TEXT = re.compile(r'\b[6-9]\d{9}\b')
ANY_URL = re.compile(r'https?://[^\s]+')


def _find_patterns(text: str) -> Dict[str, List[str]]:
    lower = text.lower()
    found = {}
    for cat, info in PATTERNS.items():
        for kw in info["keywords"]:
            if kw in lower:
                if cat not in found:
                    found[cat] = []
                found[cat].append(kw)
    return found


def _behavioral_score(text: str) -> Tuple[int, List[dict]]:
    """Analyze behavioral signals: CAPS intensity, exclamation overuse, tone shifts."""
    score = 0
    exps = []
    caps_ratio = len(re.findall(r'[A-Z]', text)) / max(len(text), 1)
    exclaims = len(re.findall(r'!', text))
    if caps_ratio > 0.35 and len(text) > 20:
        score += 10
        exps.append({"icon": "📢", "severity": "medium",
                     "text": "Excessive uppercase — shouting is a psychological pressure tactic in scam messages",
                     "triggered_by": "caps_ratio"})
    if exclaims >= 2:
        score += min(exclaims * 4, 12)
        exps.append({"icon": "❗", "severity": "low",
                     "text": f"{exclaims} exclamation marks — unusual for legitimate bank/government communication",
                     "triggered_by": "exclamation_count"})
    return score, exps


def _highlight(text: str, found: Dict[str, List[str]]) -> str:
    keywords = list({kw for kws in found.values() for kw in kws})
    keywords.sort(key=len, reverse=True)
    result = text
    for kw in keywords:
        pattern = re.compile(f'({re.escape(kw)})', re.IGNORECASE)
        result = pattern.sub(r'<mark>\1</mark>', result)
    return result


def _get_actions(label: str, found: dict) -> List[dict]:
    actions = []
    if label in ("scam", "suspicious"):
        actions.append({"icon": "🚫", "priority": "high",  "text": "Do not click any links in this message"})
        actions.append({"icon": "🔕", "priority": "high",  "text": "Do not call back any number provided"})
        actions.append({"icon": "🏦", "priority": "high",  "text": "Call your bank directly using the number on the back of your card"})
        if "financial_data_request" in found:
            actions.append({"icon": "🔒", "priority": "critical", "text": "Never share OTP, CVV or passwords — not even with 'bank officials'"})
        if "lottery_reward_fraud" in found:
            actions.append({"icon": "🎭", "priority": "medium", "text": "No legitimate lottery contacts you without prior registration"})
        if label == "scam":
            actions.append({"icon": "📋", "priority": "medium", "text": "Report to CERT-In: report.cert-in.org.in or call 1930 (Cybercrime helpline)"})
    else:
        actions.append({"icon": "✅", "priority": "safe", "text": "Message appears safe — stay vigilant with unknown senders"})
        actions.append({"icon": "💡", "priority": "safe", "text": "Always verify requests through official channels before acting"})
    return actions


def analyze_text(text: str, language: str = "en") -> dict:
    """
    Hybrid Detection Engine v2:
    Pattern matching + Combo calibration + Behavioral analysis + Dataset boost + Context scoring
    """
    found = _find_patterns(text)
    urls  = ANY_URL.findall(text)
    phones = PHONE_IN_TEXT.findall(text)

    # Base score from pattern weights
    score = sum(PATTERNS[cat]["weight"] for cat in found)

    # Confidence calibration — combo boosters
    combo_reasons = []
    for combo in COMBOS:
        if all(c in found for c in combo["cats"]):
            score += combo["boost"]
            combo_reasons.append(combo["reason"])

    # URL scoring
    if urls:
        bad_url = bool(SUSPICIOUS_URL_IN_TEXT.search(" ".join(urls)))
        score += 30 if bad_url else 12

    # Phone scoring
    if phones:
        score += 8

    # Behavioral scoring
    beh_score, beh_exps = _behavioral_score(text)
    score += beh_score

    # ── Dataset-driven keyword boost ──────────────────────────
    dataset_boost = score_text_by_dataset(text)
    score += dataset_boost

    score = min(score, 100)
    label = "scam" if score >= 65 else "suspicious" if score >= 30 else "safe"

    # Build explanations
    seen = set()
    explanations = []
    for cat, kws in found.items():
        if cat not in seen:
            explanations.append({
                "icon": PATTERNS[cat].get("icon", "⚠️"),
                "severity": PATTERNS[cat]["severity"],
                "text": PATTERNS[cat]["explanation"],
                "triggered_by": kws[0],
            })
            seen.add(cat)

    # Combo booster explanations
    for reason in combo_reasons:
        explanations.append({"icon": "🔗", "severity": "critical",
                              "text": f"Combo risk detected: {reason}", "triggered_by": "combo"})

    # Behavioral explanations
    explanations.extend(beh_exps)

    # URL/Phone explanations
    if urls:
        bad_url = bool(SUSPICIOUS_URL_IN_TEXT.search(" ".join(urls)))
        explanations.append({
            "icon": "🔗",
            "severity": "critical" if bad_url else "medium",
            "text": "Suspicious URL with high-risk TLD — likely phishing" if bad_url
                    else f"{len(urls)} external URL(s) found — verify before clicking",
            "triggered_by": "url",
        })
    if phones:
        explanations.append({"icon": "📱", "severity": "low",
                              "text": "Unverified phone number requesting action", "triggered_by": "phone"})

    if not explanations:
        explanations = [
            {"icon": "✅", "severity": "safe", "text": "No scam patterns detected in this message"},
            {"icon": "🔍", "severity": "safe", "text": "Message structure follows normal communication conventions"},
            {"icon": "🛡️", "severity": "safe", "text": "No financial data requests or urgency pressure detected"},
        ]

    all_kw = [kw for kws in found.values() for kw in kws]

    return {
        "risk_score": score,
        "label": label,
        "explanations": explanations,
        "metadata": {
            "highlighted_text": _highlight(text, found),
            "detected_patterns": all_kw,
            "urls_found": urls,
            "phones_found": phones,
            "combo_boosters": combo_reasons,
            "dataset_boost": dataset_boost,
            "model": "Hybrid Engine v2 (Pattern + Behavioral + Context + Dataset)",
            "privacy_note": "Text analyzed in memory. Not stored.",
        },
        "category_risks": {
            "text":     score,
            "behavior": beh_score * 5,
            "url":      85 if (urls and bool(SUSPICIOUS_URL_IN_TEXT.search(" ".join(urls)))) else (40 if urls else 0),
        },
        "actions": _get_actions(label, found),
    }
