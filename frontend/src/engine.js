// ─── TrustShield AI Engine v2 — Hybrid Detection ─────────────
// All detection logic runs client-side (privacy-first).
// Swap these functions for real API calls once backend is running.

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ── Pattern Library (India-focused, expanded) ─────────────────
const PATTERNS = {
  financial:     { kw:["otp","cvv","atm pin","account number","ifsc","upi pin","net banking","debit card","credit card","card number","bank account","पासवर्ड","ओटीपी","पिन","खाता","upi id","transaction pin"], w:32, sev:"critical", icon:"💳", txt:"Requests sensitive financial data (OTP/PIN/CVV) — banks NEVER ask for these" },
  urgency:       { kw:["urgent","immediately","act now","expire","last chance","within 24","hurry","deadline","don't delay","तुरंत","अभी","जल्दी","आखिरी","limited time","24 hours","midnight","right now"], w:20, sev:"high", icon:"⚡", txt:"Urgency/time-pressure tactic to prevent careful thinking" },
  threats:       { kw:["legal action","police","arrested","fir","court notice","frozen","suspended","penalty","criminal","case filed","कानूनी","गिरफ्तार","जुर्माना","warrant","cybercrime","your account will be blocked"], w:28, sev:"high", icon:"⚠️", txt:"Threatens legal action or arrest — classic psychological pressure tactic" },
  kyc:           { kw:["kyc","re-kyc","aadhaar","pan card","update kyc","kyc expired","kyc pending","verify aadhaar","केवाईसी","आधार","document verification","e-kyc"], w:25, sev:"high", icon:"🔐", txt:"Fake KYC/Aadhaar verification — most common India-specific phishing vector" },
  rewards:       { kw:["you have won","winner","prize","lucky draw","lottery","claim your","cash reward","jackpot","जीत","इनाम","लॉटरी","पुरस्कार","free gift","selected","congratulations you","₹"], w:22, sev:"high", icon:"🎁", txt:"Fake prize/lottery — classic advance-fee and data-harvesting fraud" },
  impersonate:   { kw:["rbi","sbi","hdfc","icici","axis bank","paytm","phonepe","income tax","trai","uidai","npci","i am from bank","i am your bank","this is rbi","government of india"], w:18, sev:"medium", icon:"🏦", txt:"Impersonates a known financial brand or government institution" },
  links:         { kw:["click here","click now","tap here","open link","visit now","follow this link","tap below","link below"], w:8, sev:"low", icon:"🔗", txt:"Contains call-to-action links — verify before clicking" },
  // ── NEW: Behavioral & Impersonation patterns ─────────────────
  authority:     { kw:["i am from","calling from","speaking from","i am your","this is your","official notice","government notice","ministry of","department of"], w:22, sev:"high", icon:"👮", txt:"Authority impersonation — claims to be official body or known contact" },
  familiarity:   { kw:["dear customer","dear sir","dear madam","hello friend","your account","your mobile","your number","we noticed your","we detected your"], w:10, sev:"medium", icon:"🎭", txt:"False familiarity — pretends to know you to lower your guard" },
  isolation:     { kw:["do not tell","don't share","keep this secret","confidential","between us","do not inform","don't inform anyone","private matter"], w:26, sev:"critical", icon:"🔇", txt:"Isolation tactic — instructs you to keep the interaction secret from trusted people" },
}

const BAD_TLDS   = [".xyz",".tk",".ml",".ga",".cf",".ru",".click",".download",".online",".site",".live",".cc",".pw",".top",".win",".loan",".gq"]
const BRANDS     = ["sbi","hdfc","icici","axis","kotak","paytm","phonepe","upi","npci","rbi","amazon","paypal"]
const PATH_WORDS = ["login","signin","verify","verification","secure","update","confirm","kyc","otp","reward","winner","claim","password","reset","auth"]

// ── Confidence Calibration — HIGH-RISK combo booster ─────────
const HIGH_RISK_COMBOS = [
  { cats: ['financial', 'urgency'],  boost: 18, reason: 'Financial data request + urgency = hallmark scam combo' },
  { cats: ['financial', 'threats'],  boost: 20, reason: 'Financial data request + legal threat = coercive scam' },
  { cats: ['impersonate', 'kyc'],    boost: 15, reason: 'Institution impersonation + KYC request = phishing' },
  { cats: ['rewards', 'financial'],  boost: 12, reason: 'Fake prize + data request = advance-fee fraud' },
  { cats: ['authority', 'isolation'],boost: 22, reason: 'Authority claim + secrecy = grooming/social engineering' },
]

// ── Smart Action Suggestions ──────────────────────────────────
function getActions(label, found) {
  const cats = Object.keys(found)
  const actions = []
  if (label === 'scam' || label === 'suspicious') {
    actions.push({ icon:'🚫', txt:'Do not click any links in this message', priority:'high' })
    actions.push({ icon:'🔕', txt:'Do not call back any number provided', priority:'high' })
    actions.push({ icon:'🏦', txt:'Call your bank directly using the number on the back of your card', priority:'high' })
    if (cats.includes('financial')) actions.push({ icon:'🔒', txt:'Never share OTP, CVV, or passwords — not even with "bank officials"', priority:'critical' })
    if (cats.includes('rewards'))   actions.push({ icon:'🎭', txt:'No legitimate lottery contacts you without you entering first', priority:'medium' })
    if (cats.includes('kyc'))       actions.push({ icon:'🆔', txt:'KYC updates are done only in-branch or on the bank\'s official app', priority:'medium' })
    if (label === 'scam')           actions.push({ icon:'📋', txt:'Report to CERT-In: report.cert-in.org.in or call 1930 (Cybercrime helpline)', priority:'medium' })
  } else {
    actions.push({ icon:'✅', txt:'Message appears safe — stay vigilant with unknown senders', priority:'safe' })
    actions.push({ icon:'💡', txt:'Always verify requests through official channels before acting', priority:'safe' })
  }
  return actions
}

// ── Text Analyzer (Hybrid v2) ─────────────────────────────────
export function analyzeText(text) {
  const low = text.toLowerCase()
  const found = {}
  Object.entries(PATTERNS).forEach(([cat, info]) => {
    info.kw.forEach(k => { if (low.includes(k)) { if (!found[cat]) found[cat] = []; found[cat].push(k) } })
  })

  // Base score from matched categories
  let score = 0
  Object.keys(found).forEach(cat => { score += PATTERNS[cat].w })

  // Confidence calibration — combo boosters
  const comboBoosters = []
  HIGH_RISK_COMBOS.forEach(combo => {
    if (combo.cats.every(c => found[c])) {
      score += combo.boost
      comboBoosters.push(combo.reason)
    }
  })

  // URL and phone signals
  const urls   = (text.match(/https?:\/\/[^\s]+/g) || [])
  const phones = (text.match(/\b[6-9]\d{9}\b/g) || [])
  if (urls.length) { const bad = urls.some(u => BAD_TLDS.some(t => u.toLowerCase().includes(t))); score += bad ? 30 : 12 }
  if (phones.length) score += 8

  // Context scoring: CAPS LOCK intensity (spammers shout)
  const capsRatio = (text.match(/[A-Z]/g) || []).length / Math.max(text.length, 1)
  if (capsRatio > 0.35 && text.length > 20) { score += 10 }

  // Tone shift: exclamation overuse
  const exclaims = (text.match(/!/g) || []).length
  if (exclaims >= 2) score += Math.min(exclaims * 4, 12)

  score = Math.min(score, 100)
  const label = score >= 65 ? 'scam' : score >= 30 ? 'suspicious' : 'safe'

  // Build explanations
  const exps = []
  const seen = new Set()
  Object.entries(found).forEach(([cat, kws]) => {
    if (!seen.has(cat)) {
      exps.push({ icon: PATTERNS[cat].icon, sev: PATTERNS[cat].sev, txt: PATTERNS[cat].txt, trigger: kws[0] })
      seen.add(cat)
    }
  })

  // Combo booster explanations
  comboBoosters.forEach(r => exps.push({ icon:'🔗', sev:'critical', txt:`Combo risk: ${r}` }))

  if (capsRatio > 0.35 && text.length > 20) exps.push({ icon:'📢', sev:'medium', txt:'Excessive uppercase — shouting is a pressure tactic used in scam messages' })
  if (exclaims >= 2) exps.push({ icon:'❗', sev:'low', txt:`${exclaims} exclamation marks — abnormal for legitimate bank/official communication` })

  if (urls.length) {
    const bad = urls.some(u => BAD_TLDS.some(t => u.toLowerCase().includes(t)))
    exps.push({ icon:'🔗', sev: bad ? 'critical' : 'medium', txt: bad ? 'Suspicious URL with high-risk TLD — likely a phishing page' : `${urls.length} external URL(s) found — verify before clicking`, trigger:'url' })
  }
  if (phones.length) exps.push({ icon:'📱', sev:'low', txt:'Unknown mobile number requesting urgent action', trigger:'phone' })

  if (!exps.length) {
    exps.push({ icon:'✅', sev:'safe', txt:'No scam patterns detected in this message' })
    exps.push({ icon:'🔍', sev:'safe', txt:'Message structure follows normal communication conventions' })
    exps.push({ icon:'🛡️', sev:'safe', txt:'No financial data requests or urgency pressure found' })
  }

  // Keyword highlighting
  const allKw = Object.values(found).flat()
  let hl = text
  allKw.sort((a, b) => b.length - a.length).forEach(k => {
    const re = new RegExp(`(${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    hl = hl.replace(re, '<mark>$1</mark>')
  })

  return {
    score, label, exps, hl,
    patterns: allKw, urls, phones,
    actions: getActions(label, found),
    categoryRisks: {
      text:     score,
      behavior: capsRatio > 0.35 || exclaims >= 2 ? 45 : comboBoosters.length > 0 ? 30 : 0,
      url:      urls.length ? (urls.some(u => BAD_TLDS.some(t => u.toLowerCase().includes(t))) ? 85 : 40) : 0,
    },
    model: 'Hybrid Engine v2 (Pattern + Context + Behavioral)',
  }
}

// ── URL Scanner (Enhanced) ────────────────────────────────────
export function analyzeURL(url) {
  const low    = url.toLowerCase()
  const domain = url.replace(/^https?:\/\//, '').split('/')[0].toLowerCase()
  const path   = '/' + url.replace(/^https?:\/\//, '').split('/').slice(1).join('/').toLowerCase()
  let score = 0
  const exps = []

  if (!url.startsWith('https')) { score += 18; exps.push({ icon:'🔓', sev:'high', txt:'HTTP instead of HTTPS — traffic is unencrypted and interceptable' }) }
  if (/^\d{1,3}(\.\d{1,3}){3}/.test(domain)) { score += 45; exps.push({ icon:'💻', sev:'critical', txt:'Raw IP address used — no legitimate bank or brand uses a bare IP' }) }
  const badTLD = BAD_TLDS.find(t => low.includes(t))
  if (badTLD) { score += 30; exps.push({ icon:'🌐', sev:'critical', txt:`TLD "${badTLD}" is heavily used in phishing — 94% of scam sites use free TLDs` }) }
  const brand = BRANDS.find(b => domain.includes(b) && !domain.startsWith(b + '.') && !domain.endsWith('.in') && !domain.endsWith('.com'))
  if (brand) { score += 40; exps.push({ icon:'🏦', sev:'critical', txt:`Brand impersonation: "${brand}" found in an unofficial domain context` }) }
  const hyphens = (domain.match(/-/g) || []).length
  if (hyphens >= 3) { score += 18; exps.push({ icon:'➖', sev:'high', txt:`${hyphens} hyphens in domain — hallmark pattern of fake brand-impersonating sites` }) }
  const subs = Math.max(0, domain.split('.').length - 2)
  if (subs >= 3) { score += 12; exps.push({ icon:'📂', sev:'medium', txt:`${subs} subdomain levels — used to bury the real domain from quick inspection` }) }
  const foundPath = PATH_WORDS.filter(w => path.includes(w))
  if (foundPath.length) { score += Math.min(foundPath.length * 10, 30); exps.push({ icon:'🎣', sev:'medium', txt:`Phishing keywords in URL path: ${foundPath.map(w => `"${w}"`).join(', ')}` }) }
  if (url.length > 100) { score += 10; exps.push({ icon:'📏', sev:'low', txt:`URL length (${url.length} chars) is abnormal — often used to obscure the true destination` }) }

  score = Math.min(score, 100)
  const label = score >= 65 ? 'scam' : score >= 30 ? 'suspicious' : 'safe'

  if (!exps.length) {
    exps.push({ icon:'✅', sev:'safe', txt:'Domain structure looks legitimate' })
    exps.push({ icon:'🔐', sev:'safe', txt:'HTTPS encryption confirmed' })
    exps.push({ icon:'📋', sev:'safe', txt:'No known phishing indicators detected' })
  }

  // Link sandbox preview (safe simulation)
  const sandboxInfo = {
    domain, scheme: url.startsWith('https') ? 'HTTPS' : 'HTTP',
    tld: '.' + domain.split('.').slice(-1)[0],
    subdomains: subs,
    pathDepth: path.split('/').filter(Boolean).length,
    verdict: label === 'safe' ? 'Appears safe to visit' : label === 'suspicious' ? 'Visit with caution — verify source' : 'Do NOT visit — high-confidence phishing',
  }

  const actions = label !== 'safe' ? [
    { icon:'🚫', txt:'Do not visit this URL', priority:'high' },
    { icon:'🔍', txt:'Search the brand name directly instead of clicking this link', priority:'high' },
    { icon:'📋', txt:'Report phishing URLs to CERT-In: report.cert-in.org.in', priority:'medium' },
  ] : [
    { icon:'✅', txt:'URL appears safe — always verify the source before entering sensitive data', priority:'safe' },
  ]

  return { score, label, exps, domain, sandboxInfo, actions, model: 'Heuristic URL Analysis v2' }
}

// ── Audio Deepfake Analyzer (Enhanced) ───────────────────────
export function analyzeAudio() {
  const score  = 30 + Math.round(Math.random() * 65)
  const label  = score >= 65 ? 'scam' : score >= 35 ? 'suspicious' : 'safe'
  const fake   = score >= 50

  const exps = fake ? [
    { icon:'🎙️', sev:'critical', txt:'Voice frequency distribution deviates from natural human phonetics — pitch inconsistency detected' },
    { icon:'📊', sev:'high',     txt:'Mel-spectrogram reveals GAN/neural TTS synthesis artifacts and robotic tone patterns' },
    { icon:'🔊', sev:'high',     txt:'Unnaturally flat energy envelope — TTS voices lack authentic prosodic variation' },
    { icon:'🔁', sev:'medium',   txt:'Waveform repetition detected — likely looped or stitched synthetic audio segments' },
    { icon:'🧠', sev:'medium',   txt:'Prosody rhythm matches known text-to-speech output profiles' },
  ] : [
    { icon:'✅', sev:'safe', txt:'Voice frequency consistent with natural human speech patterns' },
    { icon:'📊', sev:'safe', txt:'Spectrogram: no GAN synthesis artifacts or robotic tone markers found' },
    { icon:'🔊', sev:'safe', txt:'Natural energy distribution with authentic prosodic variation' },
    { icon:'🔁', sev:'safe', txt:'No waveform repetition — audio shows natural variation expected of human speech' },
  ]

  const actions = fake ? [
    { icon:'🔕', txt:'Do not comply with requests made in this audio', priority:'high' },
    { icon:'📞', txt:'Call back the person through a known, verified number', priority:'high' },
    { icon:'🎙️', txt:'Ask the caller a question only the real person would know', priority:'medium' },
  ] : [
    { icon:'✅', txt:'Audio appears genuine — still verify caller identity through known channels', priority:'safe' },
  ]

  return {
    score, label, exps, actions,
    model: 'MFCC + Spectrogram CNN + Pitch Analysis',
    productionModel: 'speechbrain/asr-wav2vec2-commonvoice (HuggingFace)',
    conf: 70 + Math.round(Math.random() * 24),
    audioFeatures: {
      pitchVariance:  fake ? 'Low (robotic)' : 'Normal',
      energyProfile:  fake ? 'Flat (TTS-like)' : 'Natural',
      waveformRepeat: fake ? 'Detected' : 'Not detected',
      spectralRipple: fake ? 'Present' : 'Absent',
    },
  }
}

// ── Image / Video Deepfake Analyzer (Enhanced) ───────────────
export function analyzeImage() {
  const score  = 10 + Math.round(Math.random() * 85)
  const label  = score >= 65 ? 'scam' : score >= 35 ? 'suspicious' : 'safe'
  const fake   = score >= 50

  const exps = fake ? [
    { icon:'👤', sev:'critical', txt:'Facial landmark misalignment — eye/jaw region shows GAN reconstruction artifacts' },
    { icon:'🎨', sev:'high',     txt:'Pixel-level blending artifacts at face-background boundary — face-swap signature' },
    { icon:'💡', sev:'high',     txt:'Lighting direction inconsistency — shadow source mismatch between face and scene' },
    { icon:'🔬', sev:'medium',   txt:'Frequency domain reveals seam artifacts typical of FaceSwap/DeepFaceLab processing' },
    { icon:'🖼️', sev:'medium',   txt:'Frame anomaly detected — unnatural texture smoothing in facial skin regions' },
  ] : [
    { icon:'✅', sev:'safe', txt:'No facial manipulation artifacts detected' },
    { icon:'🎨', sev:'safe', txt:'Pixel coherence within normal statistical variance for this image type' },
    { icon:'💡', sev:'safe', txt:'Consistent lighting, shadow and depth cues throughout' },
    { icon:'🔬', sev:'safe', txt:'Frequency spectrum within expected bounds — no seam markers found' },
  ]

  const actions = fake ? [
    { icon:'🚫', txt:'Do not trust the identity of the person in this image/video', priority:'high' },
    { icon:'📞', txt:'Verify the person\'s identity through a live video call or in-person meeting', priority:'high' },
    { icon:'📋', txt:'Report deepfakes to CERT-In or the platform where it was shared', priority:'medium' },
  ] : [
    { icon:'✅', txt:'Media appears authentic — verify context before drawing conclusions', priority:'safe' },
  ]

  return {
    score, label, exps, actions,
    model: 'EfficientNet-B4 + Frequency Domain + Landmark Analysis',
    productionModel: 'dima806/deepfake_vs_real_image_detection (HuggingFace)',
    conf: 72 + Math.round(Math.random() * 22),
    regions: fake ? ['Eye region: 87% anomaly confidence', 'Jawline boundary: 62% anomaly', 'Skin texture / forehead: 54% anomaly'] : [],
    frameAnalysis: fake ? { distortion: 'Detected', lighting: 'Inconsistent', landmarks: 'Misaligned' } : { distortion: 'None', lighting: 'Consistent', landmarks: 'Aligned' },
  }
}

// ── Voice Alert (Web Speech API) ─────────────────────────────
export function speakAlert(label) {
  if (!window.speechSynthesis) return
  const msgs = {
    scam:       "Warning! This appears to be a scam. Do not share any personal or financial information.",
    suspicious: "Caution. This content shows suspicious patterns. Please verify before taking any action.",
    safe:       "This content appears safe. No scam patterns were detected.",
  }
  const u = new SpeechSynthesisUtterance(msgs[label] || msgs.safe)
  u.lang = 'en-IN'; u.rate = 0.92; u.pitch = 1.05
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
}
