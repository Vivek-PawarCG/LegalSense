import React from 'react'
import { Player } from '@remotion/player'
import { useCurrentFrame, useVideoConfig, spring, interpolate, Sequence } from 'remotion'
import { X, Sparkles, Shield, Scale, FileText, ArrowRightLeft, MessageCircle, CheckCircle2 } from 'lucide-react'

function WalkthroughSlide({
  title, subtitle, badge, badgeColor, icon: Icon, children
}: {
  title: string
  subtitle: string
  badge: string
  badgeColor: string
  icon: any
  children: React.ReactNode
}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const entry = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90 },
  })

  const scale = interpolate(frame, [0, 90], [0.97, 1.02], { extrapolateRight: 'clamp' })

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        color: '#ffffff',
        padding: '36px 44px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: 'Inter, sans-serif',
        transform: `scale(${entry * scale})`,
        opacity: entry,
      }}
    >
      {/* Slide Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(99, 102, 241, 0.25)',
              border: '1px solid rgba(129, 140, 248, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8',
            }}
          >
            <Icon size={20} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: '-0.02em' }}>{title}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{subtitle}</div>
          </div>
        </div>

        <div
          style={{
            padding: '5px 12px',
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 800,
            background: badgeColor,
            color: '#ffffff',
            letterSpacing: '0.04em',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          {badge}
        </div>
      </div>

      {/* Main Slide Card Area */}
      <div
        style={{
          flex: 1,
          margin: '22px 0 16px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>

      {/* Slide Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: '#64748b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Scale size={13} className="text-indigo-400" />
          <span>ClariLegal AI • AI Legal Analyst</span>
        </div>
        <div style={{ color: '#818cf8', fontWeight: 700 }}>
          Interactive Video Walkthrough
        </div>
      </div>
    </div>
  )
}

export function ProductWalkthroughComposition() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* 1. Dashboard Overview */}
      <Sequence from={0} durationInFrames={90}>
        <WalkthroughSlide
          title="Executive Contract Dashboard"
          subtitle="Real-time KPI metrics & risk intelligence distribution"
          badge="STEP 1 OF 5"
          badgeColor="#4f46e5"
          icon={Scale}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <div style={{ background: 'rgba(255,255,255,0.06)', padding: 14, borderRadius: 12 }}>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>TOTAL CONTRACTS</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#ffffff', marginTop: 4 }}>14</div>
            </div>
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: 14, borderRadius: 12 }}>
              <div style={{ fontSize: 10, color: '#fca5a5' }}>HIGH RISK FLAGS</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#ef4444', marginTop: 4 }}>3</div>
            </div>
            <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: 14, borderRadius: 12 }}>
              <div style={{ fontSize: 10, color: '#c7d2fe' }}>CLAUSES AUDITED</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#818cf8', marginTop: 4 }}>48</div>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: 14, borderRadius: 12 }}>
              <div style={{ fontSize: 10, color: '#6ee7b7' }}>TIME SAVED</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#10b981', marginTop: 4 }}>~35h</div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: '#cbd5e1', marginTop: 18, lineHeight: 1.6 }}>
            Consolidate your firm's contracts in one secure workspace. Track dangerous liability exposure, review turnaround times, and audit pending agreements.
          </p>
        </WalkthroughSlide>
      </Sequence>

      {/* 2. Document Analysis */}
      <Sequence from={90} durationInFrames={90}>
        <WalkthroughSlide
          title="Instant Risk & Executive Summaries"
          subtitle="Deep clause breakdown without reading 40 pages"
          badge="STEP 2 OF 5"
          badgeColor="#e11d48"
          icon={FileText}
        >
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', padding: 16, borderRadius: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#f43f5e', marginBottom: 6 }}>
                OVERALL RISK: HIGH (UNCAPPED INDEMNITY)
              </div>
              <p style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.6, margin: 0 }}>
                Section 11.2 strips mutual damage caps for third-party intellectual property claims, creating unlimited exposure.
              </p>
            </div>
            <div style={{ width: 180, background: 'rgba(255,255,255,0.06)', padding: 16, borderRadius: 12 }}>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>GOVERNING TERM</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#ffffff', marginTop: 4 }}>24 Months</div>
              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 12 }}>JURISDICTION</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#818cf8', marginTop: 4 }}>Delaware, USA</div>
            </div>
          </div>
        </WalkthroughSlide>
      </Sequence>

      {/* 3. Clause Details */}
      <Sequence from={180} durationInFrames={90}>
        <WalkthroughSlide
          title="Clause-by-Clause Plain English Lens"
          subtitle="Exact source quotes, party impact, and negotiation prompts"
          badge="STEP 3 OF 5"
          badgeColor="#059669"
          icon={CheckCircle2}
        >
          <div style={{ background: 'rgba(255,255,255,0.06)', padding: 16, borderRadius: 12, borderLeft: '4px solid #10b981' }}>
            <div style={{ fontSize: 11, color: '#6ee7b7', fontWeight: 800 }}>
              TRANSLATION: SECTION 14.1 (12-MONTH NON-COMPETE)
            </div>
            <p style={{ fontSize: 12.5, color: '#f8fafc', lineHeight: 1.6, margin: '8px 0 0' }}>
              “After you leave the company, you cannot work for any competitor or launch your own rival AI startup for 1 full year.”
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <span style={{ fontSize: 11, background: 'rgba(99,102,241,0.2)', color: '#c7d2fe', padding: '4px 10px', borderRadius: 8 }}>
              💡 Negotiation Tip: Request garden leave pay during the non-compete period
            </span>
          </div>
        </WalkthroughSlide>
      </Sequence>

      {/* 4. Two Contract Diff */}
      <Sequence from={270} durationInFrames={90}>
        <WalkthroughSlide
          title="Two-Way Contract Version Comparison"
          subtitle="Spot sneaky clause deletions and altered liabilities instantly"
          badge="STEP 4 OF 5"
          badgeColor="#d97706"
          icon={ArrowRightLeft}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ background: 'rgba(255,255,255,0.06)', padding: 14, borderRadius: 12 }}>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>ORIGINAL (V1)</div>
              <div style={{ fontSize: 12, color: '#e2e8f0', marginTop: 4 }}>Liability capped at 1x contract value.</div>
            </div>
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: 14, borderRadius: 12, border: '1px solid rgba(239, 68, 68, 0.4)' }}>
              <div style={{ fontSize: 10, color: '#fca5a5' }}>REVISED (V2 - COUNTERPARTY)</div>
              <div style={{ fontSize: 12, color: '#fecaca', fontWeight: 700, marginTop: 4 }}>Uncapped indemnity for third-party claims.</div>
            </div>
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: '#cbd5e1' }}>
            Diff engine spotted 3 modified clauses, 1 added restriction, and 0 deletions.
          </div>
        </WalkthroughSlide>
      </Sequence>

      {/* 5. Grounded Q&A */}
      <Sequence from={360} durationInFrames={90}>
        <WalkthroughSlide
          title="Document-Grounded AI Legal Copilot"
          subtitle="Instant answers with verified citations from your contract"
          badge="STEP 5 OF 5"
          badgeColor="#8b5cf6"
          icon={MessageCircle}
        >
          <div style={{ background: 'rgba(99, 102, 241, 0.18)', padding: 14, borderRadius: 12, marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: '#c7d2fe' }}>YOU ASKED:</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>
              What happens if the client terminates early for convenience?
            </div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: 14, borderRadius: 12 }}>
            <div style={{ fontSize: 10, color: '#818cf8', fontWeight: 800 }}>CLARILEGAL ANALYST:</div>
            <p style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.6, margin: '4px 0 0' }}>
              Under Section 14.1, they must give 45 days written notice and pay for all deliverables completed up to the termination date. (Source: Section 14.1, Page 15)
            </p>
          </div>
        </WalkthroughSlide>
      </Sequence>
    </div>
  )
}

export function RemotionDemoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  React.useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
    >
      <div className="relative w-full max-w-3xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-700/60 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 text-white">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white text-xs font-black">
              <Scale size={14} />
            </div>
            <span id="demo-modal-title" className="text-xs font-bold tracking-tight">Product Walkthrough Demo</span>
            <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full font-semibold">
              Video Guide
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close walkthrough demo"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          >
            <X size={18} />
          </button>
        </div>

        {/* Remotion Player Container */}
        <div style={{ aspectRatio: '16/9', width: '100%', background: '#0f172a' }}>
          <Player
            component={ProductWalkthroughComposition}
            durationInFrames={450}
            compositionWidth={850}
            compositionHeight={478}
            fps={30}
            style={{ width: '100%', height: '100%' }}
            controls
            autoPlay
            loop
          />
        </div>
      </div>
    </div>
  )
}
