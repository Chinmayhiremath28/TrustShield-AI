"""
TrustShield AI — Dataset Loader
Loads spam SMS CSV + phishing URLs .txt at startup.
Extracts weighted keyword set for hybrid detection boost.
Zero ML dependencies — pure Python stdlib only.
"""

import os
import csv
import re
from collections import Counter
from typing import Set

# ── Paths ─────────────────────────────────────────────────────
_BASE = os.path.join(os.path.dirname(__file__), "datasets")
SPAM_CSV_PATH    = os.path.join(_BASE, "spam.csv")
PHISHING_TXT_PATH = os.path.join(_BASE, "phishing_urls.txt")

# ── Shared singletons (imported by other modules) ─────────────
spam_keywords: Set[str] = set()
phishing_urls: Set[str] = set()

# ── Stopwords to skip during keyword extraction ───────────────
_STOPWORDS = {
    "a","an","the","is","it","in","on","at","to","for","of","and","or",
    "but","not","you","your","my","we","i","be","are","was","will","have",
    "has","had","do","does","did","can","get","this","that","with","as",
    "by","from","its","our","they","he","she","him","her","up","if","so",
    "no","yes","me","us","now","then","when","who","what","how","all",
}

# ── Keyword scoring weight (per dataset hit) ──────────────────
DATASET_KEYWORD_WEIGHT = 6   # points per matched dataset keyword
DATASET_MAX_BOOST      = 30  # cap on total dataset boost

# ── Helpers ───────────────────────────────────────────────────

def _tokenize(text: str):
    """Lowercase alpha-only tokens, min 4 chars, not stopwords."""
    return [
        w for w in re.findall(r"[a-z]{4,}", text.lower())
        if w not in _STOPWORDS
    ]


def _load_spam_csv() -> int:
    """Parse spam.csv, extract top keywords from spam messages."""
    global spam_keywords

    if not os.path.exists(SPAM_CSV_PATH):
        print(f"[DatasetLoader] ⚠  spam.csv not found at {SPAM_CSV_PATH}")
        return 0

    spam_messages = []
    total = 0

    with open(SPAM_CSV_PATH, encoding="utf-8", errors="ignore", newline="") as fh:
        reader = csv.DictReader(fh)
        # Tolerate different column name casings
        for row in reader:
            label_col   = next((k for k in row if k.strip().lower() == "label"),   None)
            message_col = next((k for k in row if k.strip().lower() == "message"), None)
            if not label_col or not message_col:
                continue
            total += 1
            if row[label_col].strip().lower() == "spam":
                spam_messages.append(row[message_col].strip())

    # Frequency count across all spam messages
    freq: Counter = Counter()
    for msg in spam_messages:
        for tok in _tokenize(msg):
            freq[tok] += 1

    # Keep tokens that appear in ≥ 2 spam messages (reduces noise)
    spam_keywords = {word for word, count in freq.items() if count >= 2}

    return total


def _load_phishing_urls() -> int:
    """Parse phishing_urls.txt, one URL per line, strip whitespace/comments."""
    global phishing_urls

    if not os.path.exists(PHISHING_TXT_PATH):
        print(f"[DatasetLoader] ⚠  phishing_urls.txt not found at {PHISHING_TXT_PATH}")
        return 0

    loaded = 0
    with open(PHISHING_TXT_PATH, encoding="utf-8", errors="ignore") as fh:
        for raw_line in fh:
            line = raw_line.strip()
            if not line or line.startswith("#"):
                continue
            # Normalize: lowercase, strip trailing slash
            phishing_urls.add(line.lower().rstrip("/"))
            loaded += 1

    return loaded


# ── Public entry point ────────────────────────────────────────

def load_datasets() -> None:
    """
    Called once at FastAPI startup via @app.on_event("startup").
    Populates spam_keywords and phishing_urls in-place.
    """
    global spam_keywords, phishing_urls

    print("[DatasetLoader] Loading datasets…")

    csv_rows  = _load_spam_csv()
    url_count = _load_phishing_urls()

    print(
        f"[DatasetLoader] ✅ Loaded — "
        f"spam CSV rows: {csv_rows} | "
        f"spam keywords extracted: {len(spam_keywords)} | "
        f"phishing URLs: {url_count}"
    )


def score_text_by_dataset(text: str) -> int:
    """
    Compute dataset-driven score boost for a text message.
    Returns an integer in [0, DATASET_MAX_BOOST].
    Called by text_analyzer.analyze_text() after rule scoring.
    """
    if not spam_keywords:
        return 0

    tokens = _tokenize(text)
    hits   = sum(1 for tok in tokens if tok in spam_keywords)
    boost  = min(hits * DATASET_KEYWORD_WEIGHT, DATASET_MAX_BOOST)
    return boost


def is_known_phishing_url(url: str) -> bool:
    """
    Return True if the URL (or its normalized form) is in the
    phishing URL blocklist. Called by url_scanner.analyze_url().
    """
    normalized = url.lower().rstrip("/")
    return normalized in phishing_urls
