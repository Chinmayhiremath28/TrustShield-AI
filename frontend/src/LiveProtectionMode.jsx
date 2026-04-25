import React, { useState, useEffect, useRef, useCallback } from 'react'
import { analyzeText, analyzeURL } from './engine.js'
import { speakResult, cancelSpeech } from './voiceEngine.js'

// ── Simulated incoming messages ────────────────────────────────
// Realistic mix: normal, scam, mixed, URL-bearing
const FEED = [
  { id: 1,  delay: 1800, text: "Hey, can we meet for coffee tomorrow morning? 😊" },
  { id: 2,  delay: 4200, text: "URGENT! Your SBI account has been blocked. Share your OTP immediately to reactivate: 9876543210" },
  { id: 3,  delay: 7500, text: "Your Swiggy order #45231 is out for delivery. Expected in 15 mins." },
  { id: 4,  delay: 11000,text: "Hi, I am calling from HDFC Bank. Please verify your KYC details immediately or your account will be frozen." },
  { id: 5,  delay: 14500,text: "Congratulations! You have won ₹50,000 in the Lucky Draw. Claim now: http://lucky-winner.xyz/claim?ref=sms" },
  { id: 6,  delay: 18000,text: "Income Tax Department: A penalty of ₹1,20,000 is pending against your PAN. Pay within 24 hours or face arrest. Do not tell anyone." },
  { id: 7,  delay: 22000,text: "Your OTP for Amazon order is 847291. Do not share this OTP with anyone." },
  { id: 8,  delay: 25000,text: "Team lunch at 1 PM. Don't forget to come! Also bring the project files." },
  { id: 9,  delay: 28500,text: "RBI Notice: Update your UPI PIN at http://rbi-update-upi.tk/verify before midnight to avoid account suspension." },
  { id: 10, delay: 33000,text: "Dear Customer, you have been selected for an exclusive offer. Send your Aadhaar number and CVV to claim ₹10,000 cashback." },
]

// URL regex for inline detection
const URL_RE = /https?:\/\/[^\s]+/g

// Risk badge colors
const BADGE = {
  scam:       { bg:'rgba(194,90,90,.12)',   border:'rgba(194,90,90,.28)',   text:'#c25a5a',  icon:'🚨', label:'HIGH RISK' },
  suspicious: { bg:'rgba(200,160,60,.1)',    border:'rgba(200,160,60,.25)',  text:'#c8a060',  icon:'⚠️', label:'SUSPICIOUS' },
  safe:       { bg:'rgba(74,158,107,.08)',   border:'rgba(74,158,107,.2)',   text:'#4a9e6b',  icon:'✅', label:'SAFE' },
}

// ── Single message card ───────────────────────────────────────
function MessageCard({ msg, voiceMode, lang }) {
  const [result,    setResult]    = useState(null)
  const [urlResult, setUrlResult] = useState(null)
  const [scanning,  setScanning]  = useState(true)

  useEffect(() => {
    // Simulate scan delay (100–400ms) then run detection
    const t = setTimeout(() => {
      const res = analyzeText(msg.text)
      setResult(res)
      setScanning(false)

      // Auto link scan
      const urls = msg.text.match(URL_RE) || []
      if (urls.length > 0) {
        const ur = analyzeURL(urls[0])
        setUrlResult(ur)
        // Escalate parent score if URL is worse
        if (ur.score > res.score) {
          res.score = ur.score
          res.label = ur.label
        }
      }

      if (voiceMode) speakResult(res, lang, 'text')
    }, 120 + Math.random() * 280)
    return () => clearTimeout(t)
  }, [])

  const badge  = result ? BADGE[result.label] : null
  const urlBdg = urlResult ? BADGE[urlResult.label] : null

  // Highlight keywords in message text
  function renderText(text) {
    if (!result?.patterns?.length) return text
    let out = text
    const sorted = [...result.patterns].sort((a, b) => b.length - a.length)
    sorted.forEach(kw => {
      const re = new RegExp(`(${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
      out = out.replace(re, '§§$1§§')
    })
    return out.split('§§').map((part, i) =>
      i % 2 === 1
        ? <mark key={i} style={{ background:'rgba(239,68,68,.15)', color:'#fca5a5', borderRadius:3, padding:'0 2px' }}>{part}</mark>
        : part
    )
  }

  return (
    <div style={{
      display: 'flex', justifyContent: 'flex-start', marginBottom: 10,
      animation: 'fadeUp .35s ease both',
    }}>
      <div style={{ maxWidth:'85%', display:'flex', flexDirection:'column', gap:6 }}>

        {/* Message bubble */}
        <div style={{
          padding: '9px 13px', borderRadius: '16px 16px 16px 4px',
          background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.09)',
          fontSize: 13, color: '#e2e8f0', lineHeight: 1.5,
        }}>
          {renderText(msg.text)}
        </div>

        {/* Scanning indicator */}
        {scanning && (
          <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#64748b' }}>
            <div style={{ display:'flex', gap:3 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width:5, height:5, borderRadius:'50%', background:'#c8a96e',
                  animation:`dots 1s ${i*.18}s ease-in-out infinite` }}/>
              ))}
            </div>
            Scanning…
          </div>
        )}

        {/* Risk badge */}
        {!scanning && badge && (
          <div style={{
            display:'inline-flex', alignItems:'center', gap:7,
            padding:'5px 11px', borderRadius:8, alignSelf:'flex-start',
            background: badge.bg, border:`1px solid ${badge.border}`,
            animation: 'fadeUp .3s ease both',
          }}>
            <span style={{ fontSize:13 }}>{badge.icon}</span>
            <span style={{ fontSize:11, fontWeight:600, color:badge.text, letterSpacing:'.05em' }}>{badge.label}</span>
            {result?.score != null && (
              <span style={{ fontSize:10, color:badge.text, opacity:.7 }}>· {result.score}/100</span>
            )}
          </div>
        )}

        {/* URL warning inline */}
        {urlResult && urlBdg && urlResult.label !== 'safe' && (
          <div style={{
            padding:'6px 11px', borderRadius:8,
            background: urlBdg.bg, border:`1px solid ${urlBdg.border}`,
            fontSize:11, color:urlBdg.text, display:'flex', alignItems:'center', gap:6,
            animation:'fadeUp .3s .1s ease both',
          }}>
            <span>🔗</span>
            <span>
              <strong>Unsafe link detected</strong> — {urlResult.domain}
            </span>
          </div>
        )}

        {/* Top explanation */}
        {!scanning && result?.exps?.[0] && result.label !== 'safe' && (
          <div style={{ fontSize:11, color:'#94a3b8', paddingLeft:4, lineHeight:1.5 }}>
            {result.exps[0].icon} {result.exps[0].txt}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Typing indicator ──────────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display:'flex', justifyContent:'flex-start', marginBottom:8 }}>
      <div style={{ padding:'10px 14px', borderRadius:'16px 16px 16px 4px',
        background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.09)',
        display:'flex', gap:4, alignItems:'center' }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'#5a5550',
            animation:`dots 1.1s ${i*.2}s ease-in-out infinite` }}/>
        ))}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────
export default function LiveProtectionMode({ voiceMode, lang, t }) {
  const [messages,  setMessages]  = useState([])
  const [typing,    setTyping]    = useState(false)
  const [running,   setRunning]   = useState(false)
  const [feedIdx,   setFeedIdx]   = useState(0)
  const [done,      setDone]      = useState(false)
  const bottomRef   = useRef(null)
  const timers      = useRef([])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages, typing])

  // Clean up timers on unmount
  useEffect(() => () => { timers.current.forEach(clearTimeout); cancelSpeech() }, [])

  function startFeed() {
    if (running) return
    setRunning(true)
    setDone(false)
    setMessages([])
    setFeedIdx(0)
    timers.current.forEach(clearTimeout)
    timers.current = []

    FEED.forEach((msg, idx) => {
      // Show typing indicator 1.2s before message
      const typingTimer = setTimeout(() => setTyping(true), msg.delay - 1200)
      // Show actual message
      const msgTimer = setTimeout(() => {
        setTyping(false)
        setMessages(prev => [...prev, msg])
        if (idx === FEED.length - 1) setDone(true)
      }, msg.delay)

      timers.current.push(typingTimer, msgTimer)
    })
  }

  function stopFeed() {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setRunning(false)
    setTyping(false)
    cancelSpeech()
  }

  function resetFeed() {
    stopFeed()
    setMessages([])
    setDone(false)
  }

  // Stats summary
  const summary = messages.length > 0 ? (() => {
    let safe = 0, susp = 0, scam = 0
    messages.forEach(msg => {
      const r = analyzeText(msg.text)
      if (r.label === 'scam') scam++
      else if (r.label === 'suspicious') susp++
      else safe++
    })
    return { safe, susp, scam }
  })() : null

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

      {/* Header controls */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        <div>
          <p style={{ fontSize:13, fontWeight:600, color:'#e2e8f0' }}>
            Live Message Feed
          </p>
          <p style={{ fontSize:11, color:'#64748b', marginTop:2 }}>
            Simulates real-time incoming messages — each auto-scanned instantly
          </p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {!running ? (
            <button onClick={startFeed}
              style={{ padding:'8px 18px', borderRadius:9, border:'none', background:'#b08040',
                color:'white', fontWeight:600, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
              ▶ Start Simulation
            </button>
          ) : (
            <button onClick={stopFeed}
              style={{ padding:'8px 18px', borderRadius:9, border:'1px solid rgba(255,255,255,.15)',
                background:'transparent', color:'#94a3b8', fontWeight:600, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
              ⏹ Stop
            </button>
          )}
          {(messages.length > 0 || done) && (
            <button onClick={resetFeed}
              style={{ padding:'8px 14px', borderRadius:9, border:'1px solid rgba(255,255,255,.1)',
                background:'transparent', color:'#64748b', fontWeight:500, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
              ↺ Reset
            </button>
          )}
        </div>
      </div>

      {/* Live stats bar */}
      {summary && (
        <div style={{ display:'flex', gap:8 }}>
          {[
            { label:'Safe',       val:summary.safe, col:'#4a9e6b', bg:'rgba(74,158,107,.08)',   border:'rgba(74,158,107,.2)' },
            { label:'Suspicious', val:summary.susp, col:'#f59e0b', bg:'rgba(200,160,60,.08)',   border:'rgba(200,160,60,.18)' },
            { label:'Scam',       val:summary.scam, col:'#ef4444', bg:'rgba(194,90,90,.08)',   border:'rgba(194,90,90,.18)' },
          ].map(s => (
            <div key={s.label} style={{ flex:1, padding:'8px 12px', borderRadius:10,
              background:s.bg, border:`1px solid ${s.border}`, textAlign:'center' }}>
              <div style={{ fontSize:18, fontWeight:700, color:s.col }}>{s.val}</div>
              <div style={{ fontSize:10, color:s.col, opacity:.8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Chat window */}
      <div style={{ borderRadius:14, overflow:'hidden', background:'rgba(0,0,0,.2)', border:'1px solid rgba(255,255,255,.07)' }}>

        {/* Chat header */}
        <div style={{ padding:'10px 14px', borderBottom:'1px solid rgba(255,255,255,.07)',
          background:'rgba(15,30,25,.6)', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ position:'relative' }}>
            <div style={{ width:34, height:34, borderRadius:'50%',
              background:'linear-gradient(135deg,#1e4d37,#166534)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>📱</div>
            {running && (
              <div style={{ position:'absolute', bottom:0, right:0, width:9, height:9,
                borderRadius:'50%', background:'#4a9e6b', border:'2px solid #0f172a' }}/>
            )}
          </div>
          <div>
            <div style={{ fontWeight:600, fontSize:12, color:'#f1f5f9' }}>Incoming Messages</div>
            <div style={{ fontSize:10, color: running ? '#4a9e6b' : '#475569' }}>
              {running ? '● Live scanning active' : done ? 'Simulation complete' : 'Ready'}
            </div>
          </div>
          {voiceMode && (
            <div style={{ marginLeft:'auto', fontSize:11, color:'#818cf8', display:'flex', alignItems:'center', gap:4 }}>
              🔊 Voice ON
            </div>
          )}
        </div>

        {/* Messages */}
        <div style={{ padding:14, minHeight:180, maxHeight:380, overflowY:'auto',
          display:'flex', flexDirection:'column' }}>

          {messages.length === 0 && !running && (
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center',
              color:'#334155', fontSize:12, textAlign:'center', padding:'20px 0' }}>
              Press "Start Simulation" to begin live scanning
            </div>
          )}

          {messages.map(msg => (
            <MessageCard key={msg.id} msg={msg} voiceMode={voiceMode} lang={lang}/>
          ))}

          {typing && <TypingIndicator/>}

          {done && !running && (
            <div style={{ marginTop:8, padding:'8px 14px', borderRadius:10,
              background:'rgba(200,169,110,.07)', border:'1px solid rgba(200,169,110,.18)',
              fontSize:11, color:'#c8a96e', textAlign:'center' }}>
              ✓ Simulation complete — {messages.length} messages scanned
            </div>
          )}

          <div ref={bottomRef}/>
        </div>
      </div>

      {/* Responsible AI note */}
      <div style={{ fontSize:11, color:'#334155', textAlign:'center' }}>
        🔒 Your data is processed locally and not stored · Final decision is always yours
      </div>
    </div>
  )
}
