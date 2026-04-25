"""
TrustShield AI — Dictionary-Based Translation Module
Translates: risk labels, explanations, action suggestions
Languages: English (en), Hindi (hi), Kannada (kn)
No paid APIs — pure dictionary lookup with English fallback
"""

from typing import Optional

# ── Risk Label Translations ───────────────────────────────────

LABELS = {
    "en": {"safe": "SAFE", "suspicious": "SUSPICIOUS", "scam": "SCAM"},
    "hi": {"safe": "सुरक्षित", "suspicious": "संदिग्ध",  "scam": "घोटाला"},
    "kn": {"safe": "ಸುರಕ್ಷಿತ",  "suspicious": "ಅನುಮಾನ",   "scam": "ಹಗರಣ"},
}

# ── Severity Translations ─────────────────────────────────────

SEVERITY = {
    "en": {"critical": "Critical", "high": "High", "medium": "Medium", "low": "Low", "safe": "Safe"},
    "hi": {"critical": "गंभीर",    "high": "उच्च",  "medium": "मध्यम",  "low": "कम",  "safe": "सुरक्षित"},
    "kn": {"critical": "ನಿರ್ಣಾಯಕ", "high": "ಹೆಚ್ಚು", "medium": "ಮಧ್ಯಮ",  "low": "ಕಡಿಮೆ","safe": "ಸುರಕ್ಷಿತ"},
}

# ── Explanation Translations (key phrase → translated phrase) ─

EXPLANATIONS = {
    "Requests sensitive financial data (OTP/PIN/CVV) — banks NEVER ask for these": {
        "hi": "संवेदनशील वित्तीय डेटा मांगता है (OTP/PIN/CVV) — बैंक कभी नहीं पूछते",
        "kn": "ಸಂವೇದನಾಶೀಲ ಹಣಕಾಸಿನ ಡೇಟಾ ಕೇಳುತ್ತದೆ (OTP/PIN/CVV) — ಬ್ಯಾಂಕ್ ಎಂದಿಗೂ ಕೇಳುವುದಿಲ್ಲ",
    },
    "Urgency/time-pressure tactic to prevent careful thinking": {
        "hi": "सावधानीपूर्वक सोचने से रोकने के लिए तात्कालिकता की रणनीति",
        "kn": "ಎಚ್ಚರಿಕೆಯ ಚಿಂತನೆಯನ್ನು ತಡೆಯಲು ತುರ್ತು ತಂತ್ರ",
    },
    "Threatens legal action or arrest — classic psychological pressure tactic": {
        "hi": "कानूनी कार्रवाई या गिरफ्तारी की धमकी — मनोवैज्ञानिक दबाव की रणनीति",
        "kn": "ಕಾನೂನು ಕ್ರಮ ಅಥವಾ ಬಂಧನದ ಬೆದರಿಕೆ — ಮಾನಸಿಕ ಒತ್ತಡದ ತಂತ್ರ",
    },
    "Fake KYC/Aadhaar verification — most common India-specific phishing vector": {
        "hi": "नकली KYC/आधार सत्यापन — सबसे आम भारत-विशिष्ट फ़िशिंग तरीका",
        "kn": "ನಕಲಿ KYC/ಆಧಾರ್ ಪರಿಶೀಲನೆ — ಭಾರತ-ನಿರ್ದಿಷ್ಟ ಫಿಶಿಂಗ್ ತಂತ್ರ",
    },
    "Fake prize/lottery — classic advance-fee and data-harvesting fraud": {
        "hi": "नकली पुरस्कार/लॉटरी — अग्रिम शुल्क और डेटा चोरी का घोटाला",
        "kn": "ನಕಲಿ ಬಹುಮಾನ/ಲಾಟರಿ — ಮುಂಗಡ ಶುಲ್ಕ ಮತ್ತು ಡೇಟಾ ಕಳ್ಳತನ",
    },
    "Impersonates a known financial brand or government institution": {
        "hi": "किसी प्रसिद्ध वित्तीय ब्रांड या सरकारी संस्था का रूप धारण करता है",
        "kn": "ಪ್ರಸಿದ್ಧ ಹಣಕಾಸು ಬ್ರ್ಯಾಂಡ್ ಅಥವಾ ಸರ್ಕಾರಿ ಸಂಸ್ಥೆಯ ಅನುಕರಣೆ",
    },
    "Authority impersonation — claims to be official body or known contact": {
        "hi": "अधिकारी का रूप धारण — आधिकारिक संस्था या परिचित व्यक्ति होने का दावा",
        "kn": "ಅಧಿಕಾರ ಅನುಕರಣೆ — ಅಧಿಕೃತ ಸಂಸ್ಥೆ ಎಂದು ಹೇಳಿಕೊಳ್ಳುತ್ತದೆ",
    },
    "Isolation tactic — instructs you to keep the interaction secret from trusted people": {
        "hi": "अलगाव की रणनीति — विश्वसनीय लोगों से बातचीत छुपाने का निर्देश",
        "kn": "ಪ್ರತ್ಯೇಕತೆ ತಂತ್ರ — ವಿಶ್ವಾಸಾರ್ಹ ಜನರಿಂದ ಸಂವಾದ ರಹಸ್ಯವಾಗಿಡಲು ಸೂಚನೆ",
    },
    "No scam patterns detected in this message": {
        "hi": "इस संदेश में कोई घोटाले के पैटर्न नहीं मिले",
        "kn": "ಈ ಸಂದೇಶದಲ್ಲಿ ಹಗರಣದ ಮಾದರಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ",
    },
}

# ── Action Suggestion Translations ────────────────────────────

ACTIONS = {
    "Do not click any links in this message": {
        "hi": "इस संदेश में किसी लिंक पर क्लिक न करें",
        "kn": "ಈ ಸಂದೇಶದ ಯಾವುದೇ ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡಬೇಡಿ",
    },
    "Do not call back any number provided": {
        "hi": "दिए गए किसी भी नंबर पर वापस कॉल न करें",
        "kn": "ನೀಡಿದ ಯಾವುದೇ ಸಂಖ್ಯೆಗೆ ಮರು ಕರೆ ಮಾಡಬೇಡಿ",
    },
    "Call your bank directly using the number on the back of your card": {
        "hi": "अपने कार्ड के पीछे दिए नंबर से सीधे बैंक को कॉल करें",
        "kn": "ನಿಮ್ಮ ಕಾರ್ಡ್ ಹಿಂಭಾಗದ ಸಂಖ್ಯೆ ಬಳಸಿ ನೇರವಾಗಿ ಬ್ಯಾಂಕ್‌ಗೆ ಕರೆ ಮಾಡಿ",
    },
    "Never share OTP, CVV, or passwords — not even with \"bank officials\"": {
        "hi": "OTP, CVV या पासवर्ड कभी साझा न करें — 'बैंक अधिकारियों' से भी नहीं",
        "kn": "OTP, CVV ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್ ಎಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ — 'ಬ್ಯಾಂಕ್ ಅಧಿಕಾರಿ'ಗಳಿಗೂ ಕೂಡ",
    },
    "Message appears safe — stay vigilant with unknown senders": {
        "hi": "संदेश सुरक्षित लगता है — अज्ञात प्रेषकों से सतर्क रहें",
        "kn": "ಸಂದೇಶ ಸುರಕ್ಷಿತವಾಗಿ ತೋರುತ್ತದೆ — ಅಪರಿಚಿತ ಕಳುಹಿಸುವವರ ಬಗ್ಗೆ ಎಚ್ಚರದಿಂದಿರಿ",
    },
    "Report to CERT-In: report.cert-in.org.in or call 1930 (Cybercrime helpline)": {
        "hi": "CERT-In को रिपोर्ट करें: report.cert-in.org.in या 1930 (साइबर क्राइम हेल्पलाइन)",
        "kn": "CERT-In ಗೆ ವರದಿ ಮಾಡಿ: report.cert-in.org.in ಅಥವಾ 1930 ಕರೆ ಮಾಡಿ",
    },
}

# ── URL risk translations ──────────────────────────────────────

URL_EXPLANATIONS = {
    "HTTP instead of HTTPS — traffic is unencrypted and interceptable": {
        "hi": "HTTP, HTTPS नहीं — ट्रैफिक एन्क्रिप्टेड नहीं है",
        "kn": "HTTP, HTTPS ಅಲ್ಲ — ಟ್ರಾಫಿಕ್ ಎನ್‌ಕ್ರಿಪ್ಟ್ ಆಗಿಲ್ಲ",
    },
    "Raw IP address used — no legitimate bank or brand uses a bare IP": {
        "hi": "कच्चा IP पता — कोई भी वैध बैंक या ब्रांड IP का उपयोग नहीं करता",
        "kn": "ಕಚ್ಚಾ IP ವಿಳಾಸ — ಯಾವುದೇ ಮಾನ್ಯ ಬ್ಯಾಂಕ್ IP ಬಳಸುವುದಿಲ್ಲ",
    },
}


def translate_label(label: str, lang: str) -> str:
    """Translate a risk label (safe/suspicious/scam) to target language."""
    return LABELS.get(lang, LABELS["en"]).get(label, label)


def translate_explanation(text: str, lang: str) -> str:
    """Translate an explanation string. Falls back to English."""
    if lang == "en":
        return text
    return EXPLANATIONS.get(text, {}).get(lang, text)


def translate_action(text: str, lang: str) -> str:
    """Translate an action suggestion string. Falls back to English."""
    if lang == "en":
        return text
    return ACTIONS.get(text, {}).get(lang, text)


def translate_severity(sev: str, lang: str) -> str:
    return SEVERITY.get(lang, SEVERITY["en"]).get(sev, sev)


def translate_result(result: dict, lang: str) -> dict:
    """
    Translate an entire analysis result dict in-place (returns modified copy).
    Works for text, URL, audio, and image results.
    """
    if lang == "en":
        return result  # no-op for English

    out = dict(result)
    out["label"] = translate_label(result.get("label", "safe"), lang)

    # Translate explanations list
    translated_exps = []
    for exp in result.get("explanations", []):
        te = dict(exp)
        te["text"] = translate_explanation(exp.get("text", ""), lang)
        te["severity"] = translate_severity(exp.get("severity", "low"), lang)
        translated_exps.append(te)
    out["explanations"] = translated_exps

    # Translate actions list
    translated_actions = []
    for action in result.get("actions", []):
        ta = dict(action)
        ta["text"] = translate_action(action.get("text", ""), lang)
        translated_actions.append(ta)
    out["actions"] = translated_actions

    return out
