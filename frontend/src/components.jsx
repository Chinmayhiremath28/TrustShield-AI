import React, { useState } from 'react'

// In-memory feedback store (session-only, privacy-first)
const feedbackStore = []

// UPDATED: muted, accessible tones — no neon
const SEV_COLOR = {
  critical: '#c25a5a',   // soft red    (unchanged — still readable)
  high:     '#c8803a',   // muted orange
  medium:   '#b89040',   // muted amber
  low:      '#5a5550',   // slate       (REMOVED: oversaturated gray)
  safe:     '#4a9e6b',   // muted green
}

// Subtle bg tints for explanation cards
const SEV_BG = {
  critical: 'rgba(239,68,68,.07)',
  high:     'rgba(249,115,22,.07)',
  medium:   'rgba(234,179,8,.06)',
  low:      'rgba(100,116,139,.06)',
  safe:     'rgba(34,197,94,.07)',
}

const SEV_BORDER = {
  critical: 'rgba(239,68,68,.15)',
  high:     'rgba(249,115,22,.14)',
  medium:   'rgba(234,179,8,.14)',
  low:      'rgba(100,116,139,.12)',
  safe:     'rgba(34,197,94,.14)',
}

// ── Circular Risk Meter — premium, no glow ───────────────────
// BEFORE: drop-shadow neon filter, Orbitron font, colored glow badge
// AFTER:  clean SVG ring, Inter font, muted badge with soft shadow
export function RiskMeter({ score, label, t }) {
  const R = 52
  const C = 2 * Math.PI * R
  const offset = C - (score / 100) * C

  // Smooth gradient based on score — no neon
  const col  = score >= 65 ? '#ef4444'
             : score >= 35 ? '#f59e0b'
             :               '#4a9e6b'

  const lbl  = label === 'safe'       ? (t?.safe       || 'SAFE')
             : label === 'suspicious' ? (t?.suspicious  || 'SUSPICIOUS')
             :                         (t?.scam         || 'SCAM')

  // Human-readable label
  const humanLabel = score >= 65 ? 'High Risk'
                   : score >= 35 ? 'Medium Risk'
                   :               'Low Risk'

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
      {/* SVG ring — REMOVED: drop-shadow filter */}
      <div style={{ position:'relative' }}>
        <svg width="136" height="136" viewBox="0 0 136 136">
          {/* Track ring — subtle */}
          <circle cx="68" cy="68" r={R} fill="none"
            stroke="rgba(255,255,255,.07)" strokeWidth="9"/>
          {/* Progress ring — clean, no glow */}
          <circle cx="68" cy="68" r={R} fill="none"
            stroke={col} strokeWidth="9" strokeLinecap="round"
            strokeDasharray={C.toFixed(1)}
            strokeDashoffset={offset.toFixed(1)}
            className="risk-stroke"
            transform="rotate(-90 68 68)"/>
        </svg>
        {/* Center text */}
        <div style={{
          position:'absolute', inset:0,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        }}>
          <span style={{
            fontSize:28, fontWeight:700,
            color: col,
            fontFamily:"'Inter', system-ui, sans-serif",
            letterSpacing:'-.02em', lineHeight:1,
          }}>{score}</span>
          <span style={{ fontSize:11, color:'#475569', marginTop:2 }}>/100</span>
        </div>
      </div>

      {/* Risk label badge — REMOVED: Orbitron, neon bg/border */}
      <div style={{
        display:'flex', flexDirection:'column', alignItems:'center', gap:2,
      }}>
        <div style={{
          padding:'4px 14px', borderRadius:8,
          fontSize:11, fontWeight:600, letterSpacing:'.06em',
          background: `${col}12`,
          border: `1px solid ${col}25`,
          color: col,
        }}>{lbl}</div>
        <span style={{ fontSize:11, color:'#475569' }}>{humanLabel}</span>
      </div>
    </div>
  )
}

// ── Explanation List ──────────────────────────────────────────
export function ExpList({ exps, t }) {
  return (
    <div>
      <p style={{ fontSize:11, fontWeight:600, color:'#475569', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10 }}>{t?.why || 'Why flagged?'}</p>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {exps.map((e, i) => {
          const c  = SEV_COLOR[e.sev]  || '#5a5550'
          const bg = SEV_BG[e.sev]     || 'rgba(255,255,255,.03)'
          const br = SEV_BORDER[e.sev] || 'rgba(255,255,255,.07)'
          return (
            <div key={i} className="exp-item"
              style={{ animationDelay:`${i*.06}s`, padding:'9px 12px 9px 13px', borderRadius:10,
                background:bg, border:`1px solid ${br}`, borderLeft:`3px solid ${c}`,
                display:'flex', gap:9, alignItems:'flex-start' }}>
              <span style={{ fontSize:14, lineHeight:1.4, flexShrink:0 }}>{e.icon}</span>
              <span style={{ fontSize:12, color:'#cbd5e1', lineHeight:1.55, flex:1 }}>{e.txt}</span>
              <span style={{ fontSize:9, fontWeight:600, letterSpacing:'.05em', padding:'2px 7px',
                borderRadius:5, background:`${c}14`, color:c, flexShrink:0, marginTop:3,
                textTransform:'uppercase' }}>{e.sev}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Full Result Block — premium layout ────────────────────────
// BEFORE: glass card with neon accents
// AFTER:  clean card, muted section labels, refined spacing
export function ResultBlock({ res, t, context }) {
  if (!res) return null

  return (
    <div className="glass result-pop" style={{ borderRadius:18, padding:22, marginTop:14,
      boxShadow:'0 4px 32px rgba(0,0,0,.2)' }}>
      <div style={{ display:'flex', gap:22, flexWrap:'wrap', alignItems:'flex-start' }}>
        <RiskMeter score={res.score} label={res.label} t={t}/>
        <div style={{ flex:1, minWidth:200, display:'flex', flexDirection:'column', gap:14 }}>
          <ExpList exps={res.exps} t={t}/>

          {/* Category risk breakdown */}
          {res.categoryRisks && <CategoryRiskBars risks={res.categoryRisks}/>}

          {/* Detected keyword chips — softer red */}
          {res.patterns?.length > 0 && (
            <div>
              <p style={{ fontSize:11, fontWeight:600, color:'#475569', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:7 }}>{t?.patterns || 'Detected patterns'}</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                {res.patterns.slice(0, 8).map((p, i) => (
                  <span key={i} className="mono" style={{ padding:'3px 9px', borderRadius:8, fontSize:11, background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.22)', color:'#c25a5a' }}>"{p}"</span>
                ))}
              </div>
            </div>
          )}

          {/* Highlighted message text */}
          {res.hl && (
            <div style={{ padding:'12px 14px', borderRadius:12, background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)' }}>
              <p style={{ fontSize:10, fontWeight:600, color:'#475569', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:7 }}>Highlighted Message</p>
              <p style={{ fontSize:12, lineHeight:1.7, color:'#94a3b8', wordBreak:'break-word' }} dangerouslySetInnerHTML={{ __html: res.hl }}/>
            </div>
          )}

          {/* URL Sandbox preview */}
          {res.sandboxInfo && <SandboxPreview info={res.sandboxInfo}/>}

          {/* Domain — muted blue, no neon cyan */}
          {res.domain && !res.sandboxInfo && (
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:10, background:'rgba(200,169,110,.05)', border:'1px solid rgba(99,102,241,.15)' }}>
              <span>🌐</span>
              <span className="mono" style={{ fontSize:11, color:'#c8a96e', wordBreak:'break-all' }}>{res.domain}</span>
            </div>
          )}

          {/* Anomaly regions */}
          {res.regions?.length > 0 && (
            <div>
              <p style={{ fontSize:11, fontWeight:600, color:'#475569', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:7 }}>{t?.regions || 'Anomaly regions'}</p>
              {res.regions.map((r, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:7, fontSize:12, color:'#c25a5a', marginBottom:4 }}>
                  <div style={{ width:5, height:5, borderRadius:'50%', background:'#c25a5a', flexShrink:0 }}/>
                  {r}
                </div>
              ))}
            </div>
          )}

          {/* Smart action suggestions */}
          {res.actions && <ActionSuggestions actions={res.actions}/>}

          {/* Model + Confidence — muted, no neon cyan */}
          {(res.model || res.conf) && (
            <div style={{ display:'flex', gap:9, flexWrap:'wrap' }}>
              {res.model && (
                <div className="glass2" style={{ flex:1, minWidth:130, padding:'9px 12px', borderRadius:10 }}>
                  <p style={{ fontSize:10, color:'#475569', marginBottom:3, textTransform:'uppercase', letterSpacing:'.06em' }}>{t?.model || 'AI Model'}</p>
                  <p className="mono" style={{ fontSize:11, color:'#c8a96e', lineHeight:1.4 }}>{res.model}</p>
                </div>
              )}
              {res.conf && (
                <div className="glass2" style={{ padding:'9px 12px', borderRadius:10, textAlign:'center', minWidth:80 }}>
                  <p style={{ fontSize:10, color:'#475569', marginBottom:3, textTransform:'uppercase', letterSpacing:'.06em' }}>{t?.conf || 'Confidence'}</p>
                  <p style={{ fontSize:16, fontWeight:700, color:'#f1f5f9' }}>{res.conf}%</p>
                </div>
              )}
            </div>
          )}

          {/* Feedback */}
          <FeedbackWidget result={res} context={context || 'analysis'}/>
        </div>
      </div>
    </div>
  )
}

// ── Progress / Loading Block — no neon glow ───────────────────
// BEFORE: #c8a96e progress bar with neon box-shadow
// AFTER:  indigo/blue gradient, clean
export function ProgressBlock({ steps, step, pct }) {
  return (
    <div className="glass" style={{ borderRadius:14, padding:18, marginTop:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <span style={{ fontSize:12, color:'#5a5550' }}>{steps[Math.min(step, steps.length - 1)]}</span>
        <span className="mono" style={{ fontSize:12, color:'#c8a96e' }}>{Math.round(pct)}%</span>
      </div>
      <div style={{ height:3, borderRadius:3, background:'rgba(255,255,255,.07)', overflow:'hidden', marginBottom:16 }}>
        <div style={{ height:'100%', borderRadius:3, background:'linear-gradient(90deg,#a07840,#c8a96e)', width:`${pct}%`, transition:'width .35s ease' }}/>
      </div>
      {steps.map((s, i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12,
          color: i < step ? '#4a9e6b' : i === step ? '#c8a96e' : '#334155', marginBottom:6 }}>
          {i < step
            ? <span style={{ color:'#4a9e6b', fontSize:13 }}>✓</span>
            : i === step
              ? <div className="anim-spin" style={{ width:12, height:12, borderRadius:'50%', border:'1.5px solid #c8a96e', borderTopColor:'transparent', flexShrink:0 }}/>
              : <div style={{ width:12, height:12, borderRadius:'50%', border:'1px solid rgba(255,255,255,.1)', flexShrink:0 }}/>
          }
          {s}
        </div>
      ))}
    </div>
  )
}

// ── Action Suggestions — clean, no neon ──────────────────────
export function ActionSuggestions({ actions }) {
  if (!actions?.length) return null
  const priorityColor = { critical:'#c25a5a', high:'#c8803a', medium:'#b89040', safe:'#4a9e6b' }
  const priorityBg    = { critical:'rgba(239,68,68,.07)', high:'rgba(249,115,22,.07)', medium:'rgba(234,179,8,.06)', safe:'rgba(34,197,94,.07)' }
  return (
    <div style={{ marginTop: 14 }}>
      <p style={{ fontSize:11, fontWeight:600, color:'#475569', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10 }}>
        What To Do
      </p>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {actions.map((a, i) => {
          const c  = priorityColor[a.priority] || '#5a5550'
          const bg = priorityBg[a.priority]    || 'rgba(255,255,255,.03)'
          return (
            <div key={i} style={{ padding:'9px 12px 9px 13px', borderRadius:10,
              background:bg, border:`1px solid ${c}18`, borderLeft:`3px solid ${c}`,
              display:'flex', gap:9, alignItems:'flex-start' }}>
              <span style={{ fontSize:14, flexShrink:0 }}>{a.icon}</span>
              <span style={{ fontSize:12, color:'#cbd5e1', lineHeight:1.5, flex:1 }}>{a.txt}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Category Risk Bars — muted palette ───────────────────────
export function CategoryRiskBars({ risks }) {
  if (!risks) return null
  const entries = Object.entries(risks).filter(([, v]) => v > 0)
  if (!entries.length) return null
  const label = (k) => ({ text:'Text Signal', behavior:'Behavioral', url:'URL Signal', audio:'Audio', image:'Visual' }[k] || k)
  return (
    <div style={{ marginTop:14 }}>
      <p style={{ fontSize:11, fontWeight:600, color:'#475569', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:10 }}>Risk Breakdown</p>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {entries.map(([cat, val]) => {
          const col = val >= 65 ? '#ef4444' : val >= 35 ? '#f59e0b' : '#4a9e6b'
          return (
            <div key={cat}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:11, color:'#5a5550' }}>{label(cat)}</span>
                <span className="mono" style={{ fontSize:11, color:col }}>{Math.round(val)}</span>
              </div>
              <div style={{ height:3, borderRadius:3, background:'rgba(255,255,255,.06)', overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:3, background:col, width:`${val}%`, transition:'width 1s cubic-bezier(.4,0,.2,1)', opacity:.8 }}/>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── URL Sandbox Preview — clean table ────────────────────────
export function SandboxPreview({ info }) {
  if (!info) return null
  const rows = [
    ['Domain',     info.domain],
    ['Protocol',   info.scheme],
    ['TLD',        info.tld],
    ['Subdomains', String(info.subdomains)],
    ['Path depth', String(info.pathDepth)],
    ['Verdict',    info.verdict],
  ]
  const col = info.verdict?.includes('safe') ? '#4a9e6b' : info.verdict?.includes('caution') ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ marginTop:14 }}>
      <p style={{ fontSize:11, fontWeight:600, color:'#475569', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:10 }}>URL Sandbox Preview</p>
      <div style={{ borderRadius:12, overflow:'hidden', border:'1px solid rgba(255,255,255,.07)' }}>
        {rows.map(([k, v], i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 13px',
            background: i%2===0 ? 'rgba(255,255,255,.025)' : 'transparent',
            borderBottom: i<rows.length-1 ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
            <span style={{ fontSize:11, color:'#475569' }}>{k}</span>
            <span className="mono" style={{ fontSize:11, color: k === 'Verdict' ? col : '#94a3b8', maxWidth:'60%', textAlign:'right', wordBreak:'break-all' }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Feedback Widget ───────────────────────────────────────────
export function FeedbackWidget({ result, context }) {
  const [submitted, setSubmitted] = useState(false)
  const [selected, setSelected]   = useState(null)
  if (!result || submitted) {
    return submitted ? (
      <div style={{ marginTop:12, padding:'8px 14px', borderRadius:10, background:'rgba(74,158,107,.06)', border:'1px solid rgba(74,222,128,.15)', fontSize:11, color:'#4a9e6b', textAlign:'center' }}>
        ✓ Thank you — your feedback improves TrustShield AI (stored in-memory only)
      </div>
    ) : null
  }
  const opts = [
    { v:'correct',     label:'✅ Correct verdict' },
    { v:'false_pos',   label:'❌ False positive (was safe)' },
    { v:'false_neg',   label:'⚠️ Missed a scam' },
    { v:'unclear',     label:'🤔 Explanation unclear' },
  ]
  function submit() {
    if (!selected) return
    feedbackStore.push({ context, label: result.label, score: result.score, feedback: selected, ts: Date.now() })
    setSubmitted(true)
  }
  return (
    <div style={{ marginTop:14, padding:'14px', borderRadius:14, background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)' }}>
      <p style={{ fontSize:11, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10 }}>Was this verdict helpful?</p>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
        {opts.map(o => (
          <button key={o.v} onClick={() => setSelected(o.v)}
            style={{ padding:'5px 12px', borderRadius:8, fontSize:11, fontWeight:500, cursor:'pointer', fontFamily:'inherit',
              border:`1px solid ${selected===o.v ? 'rgba(200,169,110,.4)' : 'rgba(255,255,255,.1)'}`,
              background: selected===o.v ? 'rgba(200,169,110,.1)' : 'rgba(255,255,255,.04)',
              color: selected===o.v ? '#c8a96e' : '#5a5550', transition:'all .15s' }}>
            {o.label}
          </button>
        ))}
      </div>
      <button onClick={submit} disabled={!selected}
        style={{ padding:'7px 18px', borderRadius:9, border:'none',
          background: selected ? '#b08040' : 'rgba(255,255,255,.06)',
          color: selected ? 'white' : '#475569',
          fontSize:12, fontWeight:600, cursor: selected ? 'pointer' : 'not-allowed', fontFamily:'inherit' }}>
        Submit Feedback
      </button>
    </div>
  )
}

// ── Toggle Switch ─────────────────────────────────────────────
export function Toggle({ value, onChange, label, activeColor = '#c8a96e' }) {
  return (
    <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', userSelect:'none' }} onClick={onChange}>
      <div className="toggle-track" style={{ background: value ? activeColor : 'rgba(255,255,255,.12)' }}>
        <div className="toggle-thumb" style={{ transform: value ? 'translateX(15px)' : 'translateX(0)' }}/>
      </div>
      <span style={{ fontSize:11, color: value ? activeColor : '#475569' }}>{label}</span>
    </label>
  )
}
