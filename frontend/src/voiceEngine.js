// ─── TrustShield AI — Voice Engine ───────────────────────────
// Handles ALL spoken output: verdict + explanation + suggestions
// Uses browser SpeechSynthesis API — 100% free, no external API

// Language → BCP-47 voice locale mapping
const LANG_VOICE = {
  en: 'en-IN',   // Indian English
  hi: 'hi-IN',   // Hindi
  kn: 'kn-IN',   // Kannada (falls back to hi-IN on some browsers)
}

// Risk verdict spoken text by language
const VERDICTS = {
  en: {
    scam:       'High risk detected. This is likely a scam.',
    suspicious: 'Caution. This message shows suspicious patterns.',
    safe:       'This content appears safe.',
  },
  hi: {
    scam:       'उच्च जोखिम पाया गया। यह एक घोटाला हो सकता है।',
    suspicious: 'सावधान। इस संदेश में संदिग्ध संकेत हैं।',
    safe:       'यह सामग्री सुरक्षित लगती है।',
  },
  kn: {
    scam:       'ಹೆಚ್ಚಿನ ಅಪಾಯ ಪತ್ತೆಯಾಗಿದೆ. ಇದು ಹಗರಣ ಆಗಿರಬಹುದು.',
    suspicious: 'ಎಚ್ಚರಿಕೆ. ಈ ಸಂದೇಶದಲ್ಲಿ ಅನುಮಾನಾಸ್ಪದ ಮಾದರಿಗಳಿವೆ.',
    safe:       'ಈ ವಿಷಯ ಸುರಕ್ಷಿತವಾಗಿ ಕಾಣುತ್ತದೆ.',
  },
}

// Action suggestion spoken text by language
const ACTION_PREFIXES = {
  en: 'Recommended action: ',
  hi: 'अनुशंसित कार्रवाई: ',
  kn: 'ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ರಮ: ',
}

// URL risk spoken text by language
const URL_VERDICTS = {
  en: { scam:'Dangerous URL detected. Do not open this link.', suspicious:'Suspicious URL. Visit with extreme caution.', safe:'URL appears safe.' },
  hi: { scam:'खतरनाक URL मिला। इस लिंक को न खोलें।', suspicious:'संदिग्ध URL। बहुत सावधानी से जाएँ।', safe:'URL सुरक्षित लगता है।' },
  kn: { scam:'ಅಪಾಯಕಾರಿ URL ಪತ್ತೆಯಾಗಿದೆ. ಈ ಲಿಂಕ್ ತೆರೆಯಬೇಡಿ.', suspicious:'ಅನುಮಾನಾಸ್ಪದ URL. ಅತ್ಯಂತ ಎಚ್ಚರಿಕೆಯಿಂದ ಹೋಗಿ.', safe:'URL ಸುರಕ್ಷಿತವಾಗಿ ಕಾಣುತ್ತದೆ.' },
}

// ── Queue management — prevents overlapping speech ────────────
let _queue = []
let _speaking = false

function _next() {
  if (_speaking || _queue.length === 0) return
  _speaking = true
  const { text, lang, onEnd } = _queue.shift()
  const u = new SpeechSynthesisUtterance(text)
  u.lang  = LANG_VOICE[lang] || 'en-IN'
  u.rate  = lang === 'hi' ? 0.88 : lang === 'kn' ? 0.85 : 0.92
  u.pitch = 1.0
  u.volume = 1.0
  u.onend = () => { _speaking = false; onEnd?.(); _next() }
  u.onerror = () => { _speaking = false; _next() }
  window.speechSynthesis.speak(u)
}

function _enqueue(text, lang, onEnd) {
  if (!window.speechSynthesis || !text?.trim()) return
  _queue.push({ text, lang, onEnd })
  _next()
}

// ── Public API ────────────────────────────────────────────────

/** Cancel all pending speech immediately */
export function cancelSpeech() {
  _queue = []
  _speaking = false
  window.speechSynthesis?.cancel()
}

/**
 * Speak a full analysis result.
 * @param {object} result  - { label, exps, actions }
 * @param {string} lang    - 'en' | 'hi' | 'kn'
 * @param {string} context - 'text' | 'url' | 'audio' | 'image'
 */
export function speakResult(result, lang = 'en', context = 'text') {
  if (!result) return
  cancelSpeech()

  const L = lang in VERDICTS ? lang : 'en'

  // 1. Verdict
  const verdictMap = context === 'url' ? URL_VERDICTS : VERDICTS
  const verdict = verdictMap[L]?.[result.label] || VERDICTS[L][result.label] || ''
  if (verdict) _enqueue(verdict, L)

  // 2. Top explanation (first non-safe exp)
  const topExp = result.exps?.find(e => e.sev !== 'safe')
  if (topExp?.txt) _enqueue(topExp.txt, L)

  // 3. Top action
  const topAction = result.actions?.find(a => a.priority !== 'safe')
  if (topAction?.txt) {
    const prefix = ACTION_PREFIXES[L] || ''
    _enqueue(prefix + topAction.txt, L)
  }
}

/**
 * Speak a single verdict label only (lightweight).
 * @param {string} label   - 'safe' | 'suspicious' | 'scam'
 * @param {string} lang    - 'en' | 'hi' | 'kn'
 */
export function speakVerdict(label, lang = 'en') {
  cancelSpeech()
  const L = lang in VERDICTS ? lang : 'en'
  const text = VERDICTS[L][label] || VERDICTS.en[label] || ''
  _enqueue(text, L)
}

/**
 * Speak any arbitrary string in chosen language.
 */
export function speakRaw(text, lang = 'en') {
  _enqueue(text, lang)
}

// ── Legacy compat — drop-in for old speakAlert calls ─────────
export function speakAlert(label, lang = 'en') {
  speakVerdict(label, lang)
}
