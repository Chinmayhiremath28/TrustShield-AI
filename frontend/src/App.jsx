import React, { useState, useRef, useEffect, useCallback } from 'react'
import T from './translations.js'
import { analyzeText, analyzeURL, analyzeAudio, analyzeImage } from './engine.js'
import { speakResult, speakAlert, cancelSpeech } from './voiceEngine.js'
import { ResultBlock, ProgressBlock, Toggle } from './components.jsx'
import IntroScreen from './IntroScreen.jsx'
import ParticleBackground from './ParticleBackground.jsx'
import TransparencyDashboard from './TransparencyDashboard.jsx'
import LiveProtectionMode from './LiveProtectionMode.jsx'
import HeroSection from './HeroSection.jsx'

// ── Sample data ───────────────────────────────────────────────
const SAMPLES_TEXT = [
  "URGENT: Your SBI account will be suspended! Complete KYC now: http://sbi-kyc-update.xyz/login?otp=true&block=1",
  "Dear Customer, you have WON ₹50,000 in the Lucky Draw! Send your Aadhaar + OTP to 9876543210 to claim.",
  "This is HDFC Bank. Your debit card is blocked. Share your CVV and ATM PIN immediately to reactivate.",
  "UPI ID blocked due to suspicious activity. Update immediately: https://upi-verify-secure.tk/reset",
]
const SAMPLES_URL = [
  "http://sbi-kyc-verify-login.xyz/otp?block=true&ref=sms",
  "https://phonepe-reward-winner-claim.tk/prize/50000",
  "http://192.168.1.100/banking/verify-customer",
  "https://google.com",
]

// ── Progress helper ───────────────────────────────────────────
function useProgress(numSteps, onDone) {
  const [pct,  setPct]  = useState(0)
  const [step, setStep] = useState(0)
  const ref = useRef(null)

  const start = useCallback(() => {
    setPct(0); setStep(0)
    clearInterval(ref.current)
    ref.current = setInterval(() => {
      setPct(prev => {
        const next = prev + 2.2 + Math.random() * 2.2
        if (next >= 100) {
          clearInterval(ref.current)
          onDone()
          return 100
        }
        setStep(Math.min(Math.floor(next / (100 / numSteps)), numSteps - 1))
        return next
      })
    }, 220)
  }, [numSteps, onDone])

  useEffect(() => () => clearInterval(ref.current), [])
  return { pct, step, start }
}

// ─────────────────────────────────────────────────────────────
export default function App() {
  const [tab,          setTab]          = useState(0)
  const [lang,         setLang]         = useState('en')
  const [elderly,      setElderly]      = useState(false)
  const [voiceAlert,   setVoiceAlert]   = useState(false)
  const [liveMode,     setLiveMode]     = useState(false)
  const [banner,       setBanner]       = useState(true)
  const [showIntro,    setShowIntro]    = useState(!sessionStorage.getItem('ts_intro_done'))
  const [showTransp,   setShowTransp]   = useState(false)
  const t = T[lang]

  function handleIntroDone() {
    sessionStorage.setItem('ts_intro_done', '1')
    setShowIntro(false)
  }

  // Cancel speech when voice mode is turned off
  useEffect(() => { if (!voiceAlert) cancelSpeech() }, [voiceAlert])

  // Chat state
  const [msgs,         setMsgs]        = useState([{ id:0, from:'sys', txt:'🛡️ Paste any suspicious message to scan it instantly.' }])
  const [chatInput,    setChatInput]   = useState('')
  const [chatLoading,  setChatLoading] = useState(false)
  const [chatResult,   setChatResult]  = useState(null)
  const chatBottom = useRef(null)

  // URL state
  const [urlVal,     setUrlVal]     = useState('')
  const [urlLoading, setUrlLoading] = useState(false)
  const [urlResult,  setUrlResult]  = useState(null)
  const urlDone = useCallback(() => {
    const res = analyzeURL(urlVal)
    setUrlResult(res); setUrlLoading(false)
    if (voiceAlert) speakResult(res, lang, 'url')
  }, [urlVal, voiceAlert, lang])
  const urlProg = useProgress(t.scan_steps.length, urlDone)

  // Audio state
  const [audioFile,    setAudioFile]    = useState(null)
  const [audioLoading, setAudioLoading] = useState(false)
  const [audioResult,  setAudioResult]  = useState(null)
  const audioDone = useCallback(() => {
    const res = analyzeAudio()
    setAudioResult(res); setAudioLoading(false)
    if (voiceAlert) speakResult(res, lang, 'audio')
  }, [voiceAlert, lang])
  const audioProg = useProgress(t.audio_steps.length, audioDone)

  // Image state
  const [imgFile,    setImgFile]    = useState(null)
  const [imgPreview, setImgPreview] = useState(null)
  const [imgLoading, setImgLoading] = useState(false)
  const [imgResult,  setImgResult]  = useState(null)
  const imgDone = useCallback(() => {
    const res = analyzeImage()
    setImgResult(res); setImgLoading(false)
    if (voiceAlert) speakResult(res, lang, 'image')
  }, [voiceAlert, lang])
  const imgProg = useProgress(t.img_steps.length, imgDone)

  // Scroll chat to bottom on new messages
  useEffect(() => { chatBottom.current?.scrollIntoView({ behavior:'smooth' }) }, [msgs, chatLoading])

  // ── Handlers ───────────────────────────────────────────────
  function runChat() {
    const text = chatInput.trim()
    if (!text) return
    setMsgs(m => [...m, { id: Date.now(), from:'user', txt:text }])
    setChatLoading(true); setChatResult(null); setChatInput('')
    setTimeout(() => {
      const res = analyzeText(text)
      const lbl = res.label === 'safe' ? `✅ ${t.safe}` : res.label === 'suspicious' ? `⚠️ ${t.suspicious}` : `🚨 ${t.scam}`
      setMsgs(m => [...m, { id: Date.now()+1, from:'ai', label: res.label, txt: lbl, sub: res.exps[0]?.txt }])
      setChatLoading(false); setChatResult(res)
      if (voiceAlert) speakResult(res, lang, 'text')
    }, 1300 + Math.random() * 400)
  }

  function handleImgFile(file) {
    if (!file) return
    setImgFile(file.name); setImgResult(null)
    const reader = new FileReader()
    reader.onload = e => setImgPreview(e.target.result)
    reader.readAsDataURL(file)
  }

  // ── Tab: Text / Chat ───────────────────────────────────────
  function TabText() {
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {/* Sample chips — muted indigo, no neon cyan */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, alignItems:'center' }}>
          <span style={{ fontSize:11, color:'#475569', fontWeight:500, textTransform:'uppercase', letterSpacing:'.06em' }}>{t.sample}:</span>
          {SAMPLES_TEXT.map((_, i) => (
            <button key={i} onClick={() => { setChatInput(SAMPLES_TEXT[i]); setTab(0) }}
              style={{ padding:'3px 11px', borderRadius:7, fontSize:11, fontWeight:500, cursor:'pointer', fontFamily:'inherit',
                background:'rgba(200,169,110,.07)', border:'1px solid rgba(99,102,241,.22)', color:'#c8a96e' }}>
              Sample {i + 1}
            </button>
          ))}
        </div>

        {/* Chat window */}
        <div style={{ borderRadius:16, overflow:'hidden', background:'rgba(0,0,0,.2)', border:'1px solid rgba(255,255,255,.07)' }}>
          {/* Header — no neon avatar */}
          <div style={{ padding:'11px 16px', borderBottom:'1px solid rgba(255,255,255,.07)',
            background:'rgba(10,8,20,.65)', display:'flex', alignItems:'center', gap:11 }}>
            <div style={{ width:38, height:38, borderRadius:'50%',
              background:'linear-gradient(135deg,#1e4d37,#166534)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>🛡️</div>
            <div>
              <div style={{ fontWeight:600, fontSize:13, color:'#f1f5f9' }}>TrustShield Scanner</div>
              <div style={{ fontSize:11, color:'#4a9e6b', display:'flex', alignItems:'center', gap:5 }}>
                <div style={{ width:5, height:5, borderRadius:'50%', background:'#4a9e6b' }}/>
                Online · Privacy Protected
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ padding:14, display:'flex', flexDirection:'column', gap:8, minHeight:140, maxHeight:230, overflowY:'auto' }}>
            {msgs.map(m => {
              if (m.from === 'sys') return (
                <div key={m.id} style={{ textAlign:'center', fontSize:12, color:'#334155', padding:'5px 12px', borderRadius:20, background:'rgba(255,255,255,.03)' }}>{m.txt}</div>
              )
              if (m.from === 'user') return (
                <div key={m.id} style={{ display:'flex', justifyContent:'flex-end' }}>
                  <div className="chat-user" style={{ padding:'9px 13px', maxWidth:'78%' }}>
                    <p style={{ fontSize:12, color:'#d1fae5', lineHeight:1.5, wordBreak:'break-word' }}>{m.txt}</p>
                  </div>
                </div>
              )
              const c = m.label === 'safe' ? '#4a9e6b' : m.label === 'suspicious' ? '#c8a060' : '#f87171'
              return (
                <div key={m.id} style={{ display:'flex', justifyContent:'flex-start' }}>
                  <div className="chat-ai" style={{ padding:'9px 13px', maxWidth:'78%' }}>
                    <p style={{ fontSize:12, fontWeight:700, color:c, marginBottom: m.sub ? 3 : 0 }}>{m.txt}</p>
                    {m.sub && <p style={{ fontSize:11, color:'#475569', lineHeight:1.4 }}>{m.sub}</p>}
                  </div>
                </div>
              )
            })}
            {chatLoading && (
              <div style={{ display:'flex', justifyContent:'flex-start' }}>
                <div className="chat-ai" style={{ padding:'9px 14px' }}>
                  <div style={{ display:'flex', gap:5, alignItems:'center' }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width:7, height:7, borderRadius:'50%', background:'#c8a96e', animation:`dots 1.2s ${i*.22}s ease-in-out infinite` }}/>
                    ))}
                    <span style={{ fontSize:11, color:'#475569', marginLeft:4 }}>Analyzing…</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatBottom}/>
          </div>

          {/* Input — clean borders, indigo send button */}
          <div style={{ padding:10, borderTop:'1px solid rgba(255,255,255,.07)', background:'rgba(255,255,255,.02)', display:'flex', gap:9 }}>
            <textarea value={chatInput} onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); runChat() } }}
              placeholder={t.ph_msg} rows={2}
              style={{ flex:1, resize:'none', fontSize:12, color:'#e2e8f0', padding:'9px 12px', borderRadius:11, border:'1px solid rgba(255,255,255,.08)', background:'rgba(255,255,255,.04)', lineHeight:1.5, maxHeight:90, fontFamily:'inherit', outline:'none' }}/>
            <button onClick={runChat} className="btn-analyze cyber-btn"
              style={{ padding:'0 18px', borderRadius:11, fontSize:16, minWidth:48 }}>↑</button>
          </div>
        </div>
        <ResultBlock res={chatResult} t={t}/>
      </div>
    )
  }

  // ── Tab: URL ────────────────────────────────────────────────
  function TabURL() {
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, alignItems:'center' }}>
          <span style={{ fontSize:11, color:'#475569', fontWeight:500, textTransform:'uppercase', letterSpacing:'.06em' }}>{t.sample}:</span>
          {SAMPLES_URL.map((u, i) => (
            <button key={i} onClick={() => { setUrlVal(SAMPLES_URL[i]); setUrlResult(null) }}
              style={{ padding:'3px 11px', borderRadius:7, fontSize:11, fontWeight:500, cursor:'pointer', fontFamily:'inherit',
                background:'rgba(200,169,110,.07)', border:'1px solid rgba(99,102,241,.22)', color:'#c8a96e',
                maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {u.length > 30 ? u.slice(0,30)+'…' : u}
            </button>
          ))}
        </div>

        <div style={{ display:'flex', gap:9 }}>
          <div style={{ flex:1, display:'flex', alignItems:'center', gap:10, padding:'0 14px', borderRadius:12, background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.09)' }}>
            <span style={{ fontSize:15, flexShrink:0 }}>🔗</span>
            <input value={urlVal} onChange={e => setUrlVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && runURL()}
              placeholder={t.ph_url}
              style={{ flex:1, padding:'13px 0', fontSize:12, color:'#e2e8f0', background:'transparent', border:'none', outline:'none', fontFamily:'inherit' }}/>
            {urlVal && <button onClick={() => { setUrlVal(''); setUrlResult(null) }} style={{ background:'none', border:'none', cursor:'pointer', color:'#475569', fontSize:15 }}>✕</button>}
          </div>
          <button onClick={runURL} disabled={!urlVal || urlLoading} className="btn-analyze cyber-btn"
            style={{
              padding:'0 18px', borderRadius:12, fontSize:13, fontWeight:600,
              whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:7,
              opacity: urlVal && !urlLoading ? 1 : 0.4,
              cursor: urlVal && !urlLoading ? 'pointer' : 'not-allowed',
            }}>
            {urlLoading
              ? <div className="anim-spin" style={{ width:14, height:14, borderRadius:'50%', border:'2px solid white', borderTopColor:'transparent' }}/>
              : '↗'}
            {t.scan}
          </button>
        </div>
        {urlLoading && <ProgressBlock steps={t.scan_steps} step={urlProg.step} pct={urlProg.pct}/>}
        <ResultBlock res={urlResult} t={t}/>
      </div>
    )
  }

  function runURL() {
    if (!urlVal || urlLoading) return
    setUrlLoading(true); setUrlResult(null)
    urlProg.start()
  }

  // ── Tab: Audio ──────────────────────────────────────────────
  function TabAudio() {
    const inputRef = useRef(null)
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <div className={`upload-zone${audioLoading ? ' dragging' : ''}`}
          style={{ borderRadius:22, padding: audioLoading ? '30px 20px' : '40px 20px', display:'flex', flexDirection:'column', alignItems:'center', gap:14, background:'rgba(0,0,0,.18)' }}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f=e.dataTransfer.files[0]; if(f?.type.startsWith('audio/')) { setAudioFile(f.name); setAudioResult(null) } }}
          onClick={() => !audioLoading && inputRef.current?.click()}>
          <input ref={inputRef} type="file" accept="audio/*" style={{ display:'none' }}
            onChange={e => { const f=e.target.files[0]; if(f) { setAudioFile(f.name); setAudioResult(null) } }}/>
          {audioLoading ? (
            <>
              <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:48 }}>
                {Array.from({ length:30 }, (_, i) => (
                  <div key={i} style={{ width:4, minHeight:6, borderRadius:2,
                    background: i%3===0 ? '#c8a96e' : '#a07840',
                    opacity: 0.6 + (i%3)*0.15,
                    animation:`wave ${0.35+Math.random()*.5}s ${Math.random()*.4}s ease-in-out infinite`,
                    height:`${20+Math.floor(Math.random()*80)}%` }}/>
                ))}
              </div>
              <p style={{ fontSize:12, color:'#c8a96e', fontWeight:500 }}>Running MFCC + Spectrogram Analysis…</p>
            </>
          ) : (
            <>
              <div style={{ width:64, height:64, borderRadius:18, background:'rgba(200,169,110,.07)', border:'1px solid rgba(99,102,241,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>🎙️</div>
              <div style={{ textAlign:'center' }}>
                <p style={{ fontWeight:600, fontSize:13, color: audioFile ? '#c8a96e' : '#94a3b8' }}>{audioFile || t.drop_audio}</p>
                <p style={{ fontSize:11, color:'#334155', marginTop:4 }}>MP3, WAV, OGG, M4A supported</p>
              </div>
              {!audioFile && <div style={{ padding:'6px 16px', borderRadius:8, fontSize:12, fontWeight:500, cursor:'pointer', background:'rgba(200,169,110,.07)', border:'1px solid rgba(99,102,241,.22)', color:'#c8a96e' }}>Browse Files</div>}
            </>
          )}
        </div>

        {audioFile && !audioLoading && !audioResult && (
          <button onClick={runAudio} className="btn-analyze"
            style={{ width:'100%', padding:'13px', fontSize:13 }}>
            Analyze Voice Deepfake
          </button>
        )}
        {audioLoading && <ProgressBlock steps={t.audio_steps} step={audioProg.step} pct={audioProg.pct}/>}
        <ResultBlock res={audioResult} t={t}/>
      </div>
    )
  }

  function runAudio() {
    if (!audioFile || audioLoading) return
    setAudioLoading(true); setAudioResult(null)
    audioProg.start()
  }

  // ── Tab: Image ──────────────────────────────────────────────
  function TabImage() {
    const inputRef = useRef(null)
    const resCol = imgResult ? (imgResult.label==='safe' ? '#4a9e6b' : imgResult.label==='suspicious' ? '#c8a060' : '#f87171') : null
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <div className="upload-zone"
          style={{ borderRadius:22, padding: imgPreview ? '16px' : '40px 20px', display:'flex', flexDirection:'column', alignItems:'center', gap:14, background:'rgba(0,0,0,.18)' }}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleImgFile(e.dataTransfer.files[0]) }}
          onClick={() => !imgPreview && inputRef.current?.click()}>
          <input ref={inputRef} type="file" accept="image/*,video/*" style={{ display:'none' }} onChange={e => handleImgFile(e.target.files[0])}/>

          {imgPreview ? (
            <>
              <div style={{ position:'relative', borderRadius:14, overflow:'hidden', maxWidth:'100%' }}>
                <img src={imgPreview} alt="upload" style={{ maxHeight:200, maxWidth:'100%', display:'block', borderRadius:14 }}/>
                {imgLoading && (
                  <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:14 }}>
                    <div style={{ position:'absolute', left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,rgba(99,102,241,.8),transparent)', animation:'scanline 1.3s linear infinite' }}/>
                    <span className="mono" style={{ fontSize:12, color:'#c8a96e', fontWeight:600, opacity:.85 }}>SCANNING…</span>
                  </div>
                )}
                {imgResult && !imgLoading && <div style={{ position:'absolute', inset:0, border:`2.5px solid ${resCol}`, borderRadius:14, background:`${resCol}10` }}/>}
              </div>
              <button onClick={() => { setImgFile(null); setImgPreview(null); setImgResult(null) }}
                style={{ fontSize:11, color:'#475569', cursor:'pointer', background:'none', border:'1px solid rgba(255,255,255,.12)', padding:'4px 14px', borderRadius:8, fontFamily:'inherit' }}>
                Change file
              </button>
            </>
          ) : (
            <>
              <div style={{ width:64, height:64, borderRadius:18, background:'rgba(200,169,110,.07)', border:'1px solid rgba(99,102,241,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>🖼️</div>
              <div style={{ textAlign:'center' }}>
                <p style={{ fontWeight:600, fontSize:13, color:'#94a3b8' }}>{t.drop_img}</p>
                <p style={{ fontSize:11, color:'#334155', marginTop:4 }}>JPG, PNG, MP4, MOV supported</p>
              </div>
              <div style={{ padding:'6px 16px', borderRadius:8, fontSize:12, fontWeight:500, cursor:'pointer', background:'rgba(200,169,110,.07)', border:'1px solid rgba(99,102,241,.22)', color:'#c8a96e' }}>Browse Files</div>
            </>
          )}
        </div>

        {imgFile && !imgLoading && !imgResult && (
          <button onClick={runImg} className="btn-analyze"
            style={{ width:'100%', padding:'13px', fontSize:13 }}>
            Analyze Deepfake
          </button>
        )}
        {imgLoading && <ProgressBlock steps={t.img_steps} step={imgProg.step} pct={imgProg.pct}/>}
        <ResultBlock res={imgResult} t={t}/>
      </div>
    )
  }

  function runImg() {
    if (!imgFile || imgLoading) return
    setImgLoading(true); setImgResult(null)
    imgProg.start()
  }

  // ── Tab: Live Protection Mode ──────────────────────────────
  function TabLive() {
    return (
      <LiveProtectionMode
        voiceMode={voiceAlert}
        lang={lang}
        t={t}
      />
    )
  }

  const TABS = [TabText, TabURL, TabAudio, TabImage, TabLive]
  const TabContent = TABS[tab]

  // ── Render ────────────────────────────────────────────────
  return (
    <div className={`grid-bg${elderly ? ' elderly-mode' : ''}`} style={{ minHeight:'100vh', position:'relative' }}>
      {showIntro && <IntroScreen onDone={handleIntroDone}/>}
      <ParticleBackground/>
      {showTransp && <TransparencyDashboard onClose={() => setShowTransp(false)}/>}

      {/* ── Sticky Navbar ────────────────────────────────────── */}
      <nav className="navbar-glass" style={{ position:'sticky', top:0, zIndex:100, padding:'0 clamp(16px,4vw,52px)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:58, gap:12 }}>

          {/* Brand */}
          <div style={{ display:'flex', alignItems:'center', gap:11, flexShrink:0 }}>
            <div style={{
              width:34, height:34, borderRadius:9,
              background:'linear-gradient(145deg,rgba(200,169,110,.2),rgba(140,100,60,.12))',
              border:'1px solid rgba(200,169,110,.25)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:15,
              boxShadow:'0 4px 14px rgba(0,0,0,.3)',
            }}>🛡️</div>
            <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
              <span style={{ fontSize:14, fontWeight:700, color:'#ede8e0', letterSpacing:'-.02em' }}>TrustShield</span>
              <span style={{ fontSize:14, fontWeight:300, color:'#c8a96e' }}>AI</span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            {/* Language */}
            <div style={{ display:'flex', borderRadius:8, overflow:'hidden', border:'1px solid rgba(255,255,255,.08)', flexShrink:0 }}>
              {['en','hi','kn'].map(l => (
                <button key={l} onClick={() => setLang(l)} style={{
                  padding:'5px 11px', fontSize:11, fontWeight:600, fontFamily:'inherit',
                  cursor:'pointer', border:'none', transition:'all .15s',
                  background: lang===l ? 'rgba(200,169,110,.14)' : 'transparent',
                  color:      lang===l ? '#c8a96e' : '#5a5550',
                }}>
                  {l==='en'?'EN':l==='hi'?'हि':'ಕ'}
                </button>
              ))}
            </div>

            <Toggle value={elderly}    onChange={() => setElderly(v=>!v)}    label={t.elderly}        activeColor="#c8a96e"/>
            <Toggle value={voiceAlert} onChange={() => setVoiceAlert(v=>!v)} label={`🔊 ${t.voice}`}  activeColor="#c8a96e"/>

            <button onClick={() => setTab(4)} style={{
              padding:'5px 12px', borderRadius:8, border:'none', fontFamily:'inherit',
              background: tab===4 ? 'rgba(200,169,110,.12)' : 'rgba(255,255,255,.04)',
              color:      tab===4 ? '#c8a96e' : '#5a5550',
              fontSize:11, fontWeight:600, cursor:'pointer', transition:'all .15s',
              display:'flex', alignItems:'center', gap:5,
            }}>⚡ {t.liveMode}</button>

            <button onClick={() => setShowTransp(true)} className="btn-ghost hide-sm"
              style={{ padding:'5px 14px', fontSize:12 }}>How it works</button>
          </div>
        </div>
      </nav>

      {/* ── Body ─────────────────────────────────────────────── */}
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 clamp(16px,4vw,52px) 72px', position:'relative', zIndex:1 }}>

        {/* Privacy banner */}
        {banner && (
          <div className="privacy-banner" style={{
            margin:'16px 0', padding:'10px 16px', borderRadius:12,
            display:'flex', alignItems:'center', justifyContent:'space-between', gap:12,
          }}>
            <p style={{ fontSize:12, color:'#9a9490', flex:1 }}>{t.privacy}</p>
            <button onClick={() => setBanner(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#4a4740', fontSize:16, lineHeight:1 }}>✕</button>
          </div>
        )}

        {/* Hero */}
        <HeroSection
          onScanNow={() => { document.getElementById('scanner-card')?.scrollIntoView({ behavior:'smooth' }); setTab(0) }}
          onLearnMore={() => setShowTransp(true)}
        />

        {/* Stats bar */}
        <div style={{ display:'flex', gap:12, margin:'32px 0', flexWrap:'wrap' }}>
          {t.stats.map(([ic, h, s], i) => (
            <div key={i} className="glass stat-card" style={{ flex:'1 1 160px', minWidth:144, padding:'16px 18px', borderRadius:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                <span style={{ fontSize:16 }}>{ic}</span>
                <span style={{ fontSize:12, fontWeight:600, color:'#ede8e0' }}>{h}</span>
              </div>
              <p style={{ fontSize:11, color:'#4a4740', lineHeight:1.5 }}>{s}</p>
            </div>
          ))}
        </div>

        {/* Scanner card */}
        <div id="scanner-card" className="glass-deep main-card-enter" style={{ borderRadius:24, overflow:'hidden' }}>
          {/* Tab bar */}
          <div style={{
            display:'flex',
            borderBottom:'1px solid rgba(255,255,255,.06)',
            background:'rgba(0,0,0,.2)',
            overflowX:'auto',
          }}>
            {t.tabs.map((tb, i) => (
              <button key={i} onClick={() => setTab(i)} className="tab-btn-premium" style={{
                flex:'1 0 auto', padding:'14px 8px',
                display:'flex', alignItems:'center', justifyContent:'center',
                gap:5, fontSize:12, fontWeight:600, cursor:'pointer', border:'none',
                fontFamily:'inherit', whiteSpace:'nowrap',
                borderBottom:`2px solid ${tab===i ? '#c8a96e' : 'transparent'}`,
                transition:'all .18s',
                color:      tab===i ? '#c8a96e' : '#5a5550',
                background: tab===i ? 'rgba(200,169,110,.06)' : 'transparent',
              }}>{tb}</button>
            ))}
          </div>
          {/* Content */}
          <div style={{ padding:'26px clamp(16px,3vw,30px)' }}>
            <TabContent/>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop:48, textAlign:'center' }}>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:8, marginBottom:16,
            padding:'10px 22px', borderRadius:12,
            background:'rgba(255,255,255,.025)', border:'1px solid rgba(255,255,255,.06)',
          }}>
            <span style={{ fontSize:14 }}>⚖️</span>
            <p style={{ fontSize:11, color:'#4a4740' }}>
              <strong style={{ color:'#6b6560', fontWeight:500 }}>{t.responsible_local}</strong>
              {' · '}{t.responsible_human}
            </p>
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:18, flexWrap:'wrap' }}>
            <p style={{ fontSize:11, color:'#2a2824' }}>TrustShield AI · Responsible AI · Hybrid Engine v2</p>
            <button onClick={() => setShowTransp(true)} className="footer-link">AI Transparency</button>
            <span style={{ fontSize:11, color:'#2a2824' }}>Made for India 🇮🇳</span>
          </div>
        </div>
      </div>
    </div>
  )
}
