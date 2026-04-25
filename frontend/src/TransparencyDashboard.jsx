import React, { useState } from 'react'

const SECTIONS = [
  {
    icon: '🧠', title: 'How Detection Works',
    content: [
      { label: 'Hybrid Engine', desc: 'Combines rule-based heuristics + keyword weighting + context scoring. No single method alone determines the verdict.' },
      { label: 'Confidence Calibration', desc: 'If keyword signals are strong (OTP + urgent + bank in same message), the risk score is boosted even if individual signals are weak.' },
      { label: 'Smart Fallback', desc: 'When model confidence is low, rule-based scoring takes over to avoid false negatives. Both paths always return an explanation.' },
    ],
  },
  {
    icon: '📊', title: 'Risk Score Breakdown',
    content: [
      { label: '0 – 29 (Safe)', desc: 'No significant scam patterns detected. Normal communication structure. You can proceed, but always verify unknown senders.' },
      { label: '30 – 64 (Suspicious)', desc: 'Some indicators present. Could be legitimate but warrants caution. Do not share personal data. Verify through official channels.' },
      { label: '65 – 100 (Scam)', desc: 'Multiple high-confidence indicators detected. Very likely a scam or phishing attempt. Block, do not click links, report to CERT-In.' },
    ],
  },
  {
    icon: '🔒', title: 'Privacy Guarantee',
    content: [
      { label: 'Zero Storage', desc: 'Nothing you submit is saved to any database. Every analysis runs entirely in-memory and is discarded the moment the session ends.' },
      { label: 'No Tracking', desc: 'No analytics, no cookies, no user identifiers. TrustShield AI has no way to associate any submission with any individual.' },
      { label: 'Local Processing', desc: 'When running the frontend in standalone mode, all AI logic executes in your browser. Your data never leaves your device.' },
    ],
  },
  {
    icon: '⚖️', title: 'Responsible AI Principles',
    content: [
      { label: 'Human Decision is Final', desc: 'TrustShield AI is an assistive tool, not an arbiter. All verdicts are advisory. A human must make the final call on any action taken.' },
      { label: 'Bias Mitigation', desc: 'Detection patterns are reviewed to avoid false positives on legitimate multilingual communication. Hindi and Kannada patterns are scam-specific only.' },
      { label: 'Explainability First', desc: 'Every risk score is accompanied by specific, human-readable reasons. The system never returns a verdict without an explanation.' },
    ],
  },
  {
    icon: '🤖', title: 'AI Models Used',
    content: [
      { label: 'Text Analysis', desc: 'Hybrid: India-focused pattern engine (7 categories, 100+ keywords) + context scoring + behavioral analysis.' },
      { label: 'URL Scanning', desc: 'Heuristic engine: TLD reputation, domain structure, brand impersonation detection, path keyword analysis.' },
      { label: 'Audio Deepfake', desc: 'Production: MFCC + spectrogram CNN. Integrates with speechbrain/asr-wav2vec2 (HuggingFace free tier).' },
      { label: 'Image Deepfake', desc: 'Production: EfficientNet-B4 + frequency domain analysis. Integrates with dima806/deepfake_vs_real_image_detection.' },
    ],
  },
]

export default function TransparencyDashboard({ onClose }) {
  const [activeSection, setActiveSection] = useState(0)

  return (
    /* Backdrop */
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        animation: 'fadeUp .3s ease',
      }}>

      {/* Modal */}
      <div style={{
        width: '100%', maxWidth: 740, maxHeight: '88vh',
        background: '#0a0814', border: '1px solid rgba(200,169,110,.18)',
        borderRadius: 24, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 30px 80px rgba(0,0,0,.6), 0 0 0 1px rgba(34,211,238,.08)',
      }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,.07)', background: 'rgba(200,169,110,.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,rgba(140,100,60,.3),rgba(180,140,80,.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🔍</div>
            <div>
              <h2 style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 15, fontWeight: 700, color: '#f1f5f9', letterSpacing:'-.01em' }}>AI Transparency Dashboard</h2>
              <p style={{ fontSize: 11, color: '#475569', marginTop: 1 }}>How TrustShield AI works · Privacy · Responsible AI</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#64748b', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flex: 1, minHeight: 0, flexWrap: 'wrap' }}>
          {/* Sidebar */}
          <div style={{ width: 180, borderRight: '1px solid rgba(255,255,255,.07)', padding: '12px 8px', flexShrink: 0, background: 'rgba(0,0,0,.2)' }}>
            {SECTIONS.map((s, i) => (
              <button key={i} onClick={() => setActiveSection(i)} style={{
                width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: 'none', fontFamily: 'inherit', cursor: 'pointer', marginBottom: 4,
                background: activeSection === i ? 'rgba(200,169,110,.1)' : 'transparent',
                color: activeSection === i ? '#c8a96e' : '#64748b',
                fontSize: 12, fontWeight: 600,
                borderLeft: activeSection === i ? '2px solid #c8a96e' : '2px solid transparent',
                transition: 'all .15s',
              }}>
                <span style={{ marginRight: 6 }}>{s.icon}</span>{s.title}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto', minWidth: 0 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{SECTIONS[activeSection].icon}</span> {SECTIONS[activeSection].title}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {SECTIONS[activeSection].content.map((item, i) => (
                <div key={i} style={{ padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)' }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#c8a96e', marginBottom: 6 }}>{item.label}</p>
                  <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Footer note */}
            <div style={{ marginTop: 20, padding: '12px 14px', borderRadius: 12, background: 'rgba(200,169,110,.05)', border: '1px solid rgba(34,211,238,.12)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
              <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6 }}>
                <strong style={{ color: '#94a3b8' }}>Human decision is final.</strong> TrustShield AI is an advisory tool only. Always verify suspicious communications through official channels before taking action. Never share OTP, CVV, or passwords with anyone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
