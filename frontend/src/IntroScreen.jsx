import React, { useEffect, useState } from 'react'

// ── Premium Intro — warm obsidian with morphing orb ──────────
export default function IntroScreen({ onDone }) {
  const [phase, setPhase] = useState('enter')
  const [progress, setProgress] = useState(0)
  const [textIn, setTextIn] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('show'),  100)
    const t2 = setTimeout(() => setTextIn(true),   350)
    const t3 = setTimeout(() => setPhase('exit'),  2800)
    const t4 = setTimeout(() => onDone(),           3300)
    return () => [t1,t2,t3,t4].forEach(clearTimeout)
  }, [onDone])

  // Animate progress bar
  useEffect(() => {
    let frame, start
    const duration = 2400
    const tick = (ts) => {
      if (!start) start = ts
      const pct = Math.min((ts - start) / duration * 100, 100)
      setProgress(pct)
      if (pct < 100) frame = requestAnimationFrame(tick)
    }
    const t = setTimeout(() => { frame = requestAnimationFrame(tick) }, 200)
    return () => { clearTimeout(t); cancelAnimationFrame(frame) }
  }, [])

  const isExit = phase === 'exit'

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9999,
      background:'#08070e',
      display:'flex', alignItems:'center', justifyContent:'center',
      overflow:'hidden',
      opacity: isExit ? 0 : 1,
      transform: isExit ? 'scale(1.02)' : 'scale(1)',
      transition:'opacity .5s ease, transform .5s ease',
    }}>

      {/* Warm mesh gradient background */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none',
        background:`
          radial-gradient(ellipse 70% 60% at 30% 40%, rgba(180,140,90,.08) 0%, transparent 65%),
          radial-gradient(ellipse 60% 50% at 70% 60%, rgba(120,80,60,.07) 0%, transparent 60%),
          radial-gradient(ellipse 40% 40% at 50% 90%, rgba(80,60,100,.06) 0%, transparent 55%)
        `,
      }}/>

      {/* Large morphing orb — centre */}
      <div style={{
        position:'absolute',
        width: 480, height: 480,
        background:'radial-gradient(circle at 40% 35%, rgba(200,169,110,.12) 0%, rgba(140,100,60,.06) 45%, transparent 70%)',
        animation:'morphBlob1 16s ease-in-out infinite',
        filter:'blur(40px)',
        willChange:'transform',
      }}/>

      {/* Secondary orb */}
      <div style={{
        position:'absolute', top:'20%', right:'15%',
        width:320, height:320,
        background:'radial-gradient(circle, rgba(120,80,140,.08) 0%, transparent 65%)',
        animation:'morphBlob2 20s ease-in-out infinite',
        filter:'blur(30px)',
      }}/>

      {/* Center content */}
      <div style={{
        position:'relative', zIndex:1,
        display:'flex', flexDirection:'column', alignItems:'center', gap:28,
        padding:'0 32px', textAlign:'center',
        opacity:    textIn ? 1 : 0,
        transform:  textIn ? 'scale(1) translateY(0)' : 'scale(.96) translateY(10px)',
        filter:     textIn ? 'blur(0)' : 'blur(8px)',
        transition:'opacity .6s ease, transform .6s ease, filter .6s ease',
      }}>

        {/* Shield mark */}
        <div style={{ position:'relative' }}>
          {/* Pulsing rings */}
          {[1.5, 1.85].map((s,i) => (
            <div key={i} style={{
              position:'absolute', inset:0,
              borderRadius:'26px',
              border:`1px solid rgba(200,169,110,${.12 - i*.04})`,
              transform:`scale(${s})`,
              animation:`ringExpand 2.8s ${i*.5}s ease-out infinite`,
            }}/>
          ))}
          <div style={{
            width:80, height:80, borderRadius:22,
            background:'linear-gradient(145deg,rgba(200,169,110,.15),rgba(140,100,60,.08))',
            border:'1px solid rgba(200,169,110,.25)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:36,
            boxShadow:'0 20px 60px rgba(200,169,110,.15), inset 0 1px 0 rgba(255,255,255,.08)',
            backdropFilter:'blur(8px)',
            animation:'orbGlow 3.5s ease-in-out infinite, orbFloat 6s ease-in-out infinite',
          }}>🛡️</div>
        </div>

        {/* Wordmark */}
        <div>
          <div style={{ display:'flex', alignItems:'baseline', gap:6, justifyContent:'center' }}>
            <span style={{
              fontSize:'clamp(28px,5vw,42px)',
              fontWeight:700,
              color:'#ede8e0',
              letterSpacing:'-.03em',
              lineHeight:1,
            }}>TrustShield</span>
            <span style={{
              fontSize:'clamp(28px,5vw,42px)',
              fontWeight:300,
              background:'linear-gradient(135deg,#e8c98e,#c8a96e)',
              WebkitBackgroundClip:'text',
              WebkitTextFillColor:'transparent',
              letterSpacing:'-.02em',
              lineHeight:1,
            }}>AI</span>
          </div>
          <p style={{
            fontSize:12, color:'#6b6560', letterSpacing:'.18em',
            textTransform:'uppercase', marginTop:10,
            fontWeight:400,
          }}>Responsible · Real-Time · Explainable</p>
        </div>

        {/* Progress bar */}
        <div style={{ width:180, height:1, borderRadius:1, background:'rgba(255,255,255,.06)', overflow:'hidden' }}>
          <div style={{
            height:'100%', borderRadius:1, width:`${progress}%`,
            transition:'width .1s linear',
          }} className="intro-loadbar"/>
        </div>

        {/* Status chips */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', justifyContent:'center' }}>
          {[
            {label:'Privacy-First', d:'.6s'},
            {label:'India-Ready',   d:'.75s'},
            {label:'No Data Stored',d:'.9s'},
          ].map(({label,d},i) => (
            <div key={i} style={{
              padding:'4px 13px', borderRadius:20,
              background:'rgba(200,169,110,.06)',
              border:'1px solid rgba(200,169,110,.15)',
              fontSize:11, color:'#9a9490', fontWeight:500,
              opacity:0, animation:`chipFade .4s ${d} ease forwards`,
            }}>{label}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
