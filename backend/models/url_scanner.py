"""
URL Scanner — Phishing & Fraud Detection
Checks domain structure, TLD reputation, brand impersonation, path keywords + dataset blocklist
"""

import re
from urllib.parse import urlparse
from typing import Optional

# ── Dataset blocklist (graceful if not loaded yet) ────────────
try:
    from services.dataset_loader import is_known_phishing_url
except ImportError:
    def is_known_phishing_url(url: str) -> bool:
        return False


# ── Risk Databases (static, no API required) ─────────────────

BAD_TLDS = {
    ".xyz", ".tk", ".ml", ".ga", ".cf", ".ru", ".click",
    ".download", ".online", ".site", ".live", ".cc", ".pw",
    ".top", ".work", ".bid", ".win", ".loan", ".gq",
}

BRAND_KEYWORDS = [
    "sbi", "hdfc", "icici", "axis", "kotak", "pnb", "bob",
    "paytm", "phonepe", "googlepay", "gpay", "amazonpay",
    "npci", "upi", "neft", "imps", "rbi",
    "amazon", "flipkart", "snapdeal", "myntra",
    "paypal", "netflix", "airtel", "jio", "bsnl",
]

PHISHING_PATH_WORDS = {
    "login", "signin", "verify", "verification", "secure",
    "update", "confirm", "bank", "kyc", "otp", "reward",
    "winner", "prize", "claim", "account", "password", "reset",
    "auth", "authenticate", "credential",
}


def _get_domain_parts(url: str):
    try:
        parsed = urlparse(url if "://" in url else "http://" + url)
        domain = parsed.netloc or parsed.path.split("/")[0]
        path = parsed.path
        scheme = parsed.scheme
        return domain.lower(), path.lower(), scheme.lower()
    except Exception:
        return url.lower(), "", "http"


def _count_subdomains(domain: str) -> int:
    return max(0, domain.count(".") - 1)


def _check_ip(domain: str) -> bool:
    return bool(re.match(r'^\d{1,3}(\.\d{1,3}){3}(:\d+)?$', domain))


def _brand_impersonation(domain: str):
    """Returns impersonated brand name if detected, else None."""
    clean = re.sub(r':\d+$', '', domain)  # remove port
    parts = clean.split(".")
    domain_part = parts[0] if len(parts) > 1 else clean

    for brand in BRAND_KEYWORDS:
        # Exact match on registered domain is fine (sbi.co.in)
        # Flag if brand appears in an unexpected position
        if brand in clean:
            registered = ".".join(parts[-2:]) if len(parts) >= 2 else clean
            if not (registered.startswith(brand + ".") or registered == brand + ".com"):
                return brand
    return None


def analyze_url(url: str) -> dict:
    """
    Analyze a URL for phishing and fraud indicators.
    Returns Responsible-AI explainability response.
    Dataset blocklist checked first — instant High Risk if matched.
    """
    domain, path, scheme = _get_domain_parts(url)
    explanations = []
    score = 0

    # 0. Dataset blocklist — highest priority check ───────────
    if is_known_phishing_url(url):
        score = 100
        explanations.append({
            "icon": "🚫",
            "severity": "critical",
            "text": "URL matched known phishing blocklist — confirmed malicious domain",
            "check": "blocklist_hit",
        })
        return {
            "risk_score": score,
            "label": "scam",
            "explanations": explanations,
            "metadata": {
                "domain": domain,
                "scheme": scheme,
                "path": path,
                "model": "Dataset Blocklist + Heuristic Analysis",
                "blocklist_hit": True,
                "privacy_note": "URL analyzed in memory. Not stored or logged.",
            },
        }

    # 1. HTTPS check
    if scheme != "https":
        score += 18
        explanations.append({
            "icon": "🔓",
            "severity": "high",
            "text": "URL uses HTTP instead of HTTPS — connection is unencrypted",
            "check": "no_https",
        })

    # 2. Raw IP address
    if _check_ip(domain):
        score += 45
        explanations.append({
            "icon": "💻",
            "severity": "critical",
            "text": "URL uses a raw IP address instead of a domain name — very suspicious",
            "check": "raw_ip",
        })

    # 3. Bad TLD
    for tld in BAD_TLDS:
        if domain.endswith(tld) or f"{tld}/" in url.lower():
            score += 30
            explanations.append({
                "icon": "🌐",
                "severity": "critical",
                "text": f"Top-level domain '{tld}' is frequently used in phishing campaigns",
                "check": "bad_tld",
            })
            break

    # 4. Brand impersonation
    brand = _brand_impersonation(domain)
    if brand:
        score += 40
        explanations.append({
            "icon": "🏦",
            "severity": "critical",
            "text": f'Possible brand impersonation: "{brand}" appears in an unofficial domain',
            "check": "brand_impersonation",
        })

    # 5. Excessive hyphens in domain
    hyphen_count = domain.count("-")
    if hyphen_count >= 3:
        score += 18
        explanations.append({
            "icon": "➖",
            "severity": "high",
            "text": f"Domain has {hyphen_count} hyphens — common pattern in fake brand sites",
            "check": "excessive_hyphens",
        })

    # 5b. Phishing keywords in DOMAIN NAME (e.g. secure-update-login.xyz)
    found_domain_words = [w for w in PHISHING_PATH_WORDS if w in domain]
    if found_domain_words:
        word_score = min(len(found_domain_words) * 12, 36)
        score += word_score
        explanations.append({
            "icon": "🎣",
            "severity": "high",
            "text": f"Phishing keywords embedded in domain name: {', '.join(repr(w) for w in found_domain_words[:4])}",
            "check": "phishing_domain_words",
        })

    # 6. Excessive subdomains
    sub_count = _count_subdomains(domain)
    if sub_count >= 3:
        score += 12
        explanations.append({
            "icon": "📂",
            "severity": "medium",
            "text": f"Unusual subdomain depth ({sub_count} levels) — often used to hide real domain",
            "check": "deep_subdomain",
        })

    # 7. Phishing keywords in path
    found_path_words = [w for w in PHISHING_PATH_WORDS if w in path]
    if found_path_words:
        score += min(len(found_path_words) * 10, 30)
        explanations.append({
            "icon": "🎣",
            "severity": "medium",
            "text": f"Phishing keywords in URL path: {', '.join(repr(w) for w in found_path_words[:4])}",
            "check": "phishing_path",
        })

    # 8. Very long URL
    if len(url) > 100:
        score += 10
        explanations.append({
            "icon": "📏",
            "severity": "low",
            "text": f"URL is unusually long ({len(url)} chars) — often used to obscure real destination",
            "check": "long_url",
        })

    score = min(score, 100)
    label = "scam" if score >= 65 else "suspicious" if score >= 30 else "safe"

    if not explanations:
        explanations = [
            {"icon": "✅", "severity": "safe", "text": "Domain structure appears legitimate", "check": "ok"},
            {"icon": "🔐", "severity": "safe", "text": "HTTPS encryption confirmed", "check": "ok"},
            {"icon": "📋", "severity": "safe", "text": "No known phishing indicators found", "check": "ok"},
        ]

    return {
        "risk_score": score,
        "label": label,
        "explanations": explanations,
        "metadata": {
            "domain": domain,
            "scheme": scheme,
            "path": path,
            "model": "Heuristic URL Analysis v1.0",
            "privacy_note": "URL analyzed in memory. Not stored or logged.",
        },
    }
