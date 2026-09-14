import React from 'react'
import { Player } from '@remotion/player'
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { Sparkles, Shield, AlertTriangle, FileCheck, CheckCircle2, X } from 'lucide-react'

// 1. Remotion Composition: Animated Laser Scanner & Legal AI Telemetry
export function DocumentScanningComposition({ progress }: { progress?: number }) {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  // Scan line Y position: sweeps down and bounces smoothly
  const scanProgress = interpolate(
    frame % 90,
    [0, 45, 90],
    [0, 100, 0],
    { extrapolateRight: 'clamp' }
  )

  // Document float effect
  const docFloat = Math.sin(frame / 15) * 4

  // Pulse effect for highlighted clauses
  const pulse = Math.sin(frame / 6) * 0.15 + 0.85

  // Active scanning stage based on continuous asymptotic progress rather than a repeating frame loop
  const currentPct = progress !== undefined
    ? Math.min(96, Math.max(15, Math.round(progress)))
    : Math.min(94, Math.floor(40 + (frame / durationInFrames) * 48))

  const stage = currentPct < 35 ? 0 : currentPct < 65 ? 1 : currentPct < 85 ? 2 : 3

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'radial-gradient(ellipse at center, #0f172a 0%, #020617 100%)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'row',
        padding: 24,
        gap: 20,
        fontFamily: 'Inter, system-ui, sans-serif',
        overflow: 'hidden',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {/* Background Cyber Grid Matrix */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(99, 102, 241, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.07) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
        }}
      />

      {/* Left Column: The Simulated Legal Document Being Scanned */}
      <div
        style={{
          flex: 1.15,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          transform: `translateY(${docFloat}px)`,
        }}
      >
        <div
          style={{
            background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: 14,
            padding: 20,
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Laser Beam Scanner Line */}
          <div
            style={{
              position: 'absolute',
              top: `${scanProgress}%`,
              left: 0,
              right: 0,
              height: 3,
              background: 'linear-gradient(90deg, transparent 0%, #38bdf8 25%, #818cf8 50%, #c084fc 75%, transparent 100%)',
              boxShadow: '0 0 18px 4px rgba(56, 189, 248, 0.8), 0 0 35px 8px rgba(129, 140, 248, 0.4)',
              zIndex: 10,
              pointerEvents: 'none',
              transform: 'translateY(-50%)',
            }}
          />

          {/* Document Header */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: 'rgba(99, 102, 241, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#818cf8',
                  }}
                >
                  <FileCheck size={14} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.04em', color: '#cbd5e1' }}>
                  CONTRACT_ANALYSIS_STREAM.PDF
                </div>
              </div>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: 999,
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              >
                LIVE OCR SCAN
              </div>
            </div>

            <div style={{ height: 6, width: '45%', background: '#475569', borderRadius: 3, marginBottom: 10 }} />
            <div style={{ height: 4, width: '90%', background: '#334155', borderRadius: 2, marginBottom: 6 }} />
            <div style={{ height: 4, width: '75%', background: '#334155', borderRadius: 2, marginBottom: 14 }} />
          </div>

          {/* Simulated Clauses & Highlight Trigger */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, justifyContent: 'center' }}>
            {/* Clause 1: High Risk Indemnity */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                background:
                  scanProgress > 25 && scanProgress < 65
                    ? `rgba(239, 68, 68, ${0.2 * pulse})`
                    : 'rgba(255, 255, 255, 0.03)',
                border:
                  scanProgress > 25 && scanProgress < 65
                    ? '1px solid rgba(239, 68, 68, 0.6)'
                    : '1px solid rgba(255, 255, 255, 0.06)',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#f87171' }}>
                  Section 3.2 Uncapped Liability & Defense Indemnity
                </span>
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 900,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: '#ef4444',
                    color: '#fff',
                  }}
                >
                  HIGH RISK
                </span>
              </div>
              <div style={{ height: 3, width: '80%', background: 'rgba(248, 113, 113, 0.3)', borderRadius: 2, marginTop: 6 }} />
            </div>

            {/* Clause 2: Medium Risk Intellectual Property */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                background:
                  scanProgress >= 55 && scanProgress <= 90
                    ? `rgba(245, 158, 11, ${0.2 * pulse})`
                    : 'rgba(255, 255, 255, 0.03)',
                border:
                  scanProgress >= 55 && scanProgress <= 90
                    ? '1px solid rgba(245, 158, 11, 0.6)'
                    : '1px solid rgba(255, 255, 255, 0.06)',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#fbbf24' }}>
                  Section 7.1 Pre-Assignment of Inventions & Background IP
                </span>
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 900,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: '#f59e0b',
                    color: '#fff',
                  }}
                >
                  MEDIUM RISK
                </span>
              </div>
              <div style={{ height: 3, width: '70%', background: 'rgba(251, 191, 36, 0.3)', borderRadius: 2, marginTop: 6 }} />
            </div>

            {/* Clause 3: Low Risk Confidentiality */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8' }}>
                  Section 9.4 Confidentiality Survival (24 Months)
                </span>
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 900,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: '#10b981',
                    color: '#fff',
                  }}
                >
                  STANDARD
                </span>
              </div>
              <div style={{ height: 3, width: '60%', background: '#334155', borderRadius: 2, marginTop: 6 }} />
            </div>
          </div>

          {/* Document Footer Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 9, color: '#64748b', marginTop: 10 }}>
            <span>Parsed 3,420 tokens</span>
            <span>Gemini 3.8 Flash • Neural Parser</span>
          </div>
        </div>
      </div>

      {/* Right Column: AI Analysis Telemetry & Progress Matrix */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.75)',
          borderRadius: 14,
          padding: 18,
          border: '1px solid rgba(99, 102, 241, 0.25)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(99, 102, 241, 0.6)',
              }}
            >
              <Sparkles size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#fff' }}>Neural Legal Analyzer</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>Real-time clause risk evaluation</div>
            </div>
          </div>

          {/* Pipeline Checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Step 1 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 11,
                color: stage >= 0 ? '#38bdf8' : '#64748b',
                fontWeight: stage === 0 ? 800 : 600,
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 999,
                  background: stage > 0 ? '#10b981' : 'rgba(56, 189, 248, 0.2)',
                  border: stage > 0 ? 'none' : '1px solid #38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {stage > 0 ? <CheckCircle2 size={12} color="#fff" /> : <span style={{ fontSize: 8 }}>1</span>}
              </div>
              <span>Extracting Document Hierarchy</span>
            </div>

            {/* Step 2 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 11,
                color: stage >= 1 ? '#818cf8' : '#64748b',
                fontWeight: stage === 1 ? 800 : 600,
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 999,
                  background: stage > 1 ? '#10b981' : stage === 1 ? 'rgba(129, 140, 248, 0.2)' : 'rgba(255,255,255,0.05)',
                  border: stage > 1 ? 'none' : stage === 1 ? '1px solid #818cf8' : '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {stage > 1 ? <CheckCircle2 size={12} color="#fff" /> : <span style={{ fontSize: 8 }}>2</span>}
              </div>
              <span>Identifying High-Risk Covenants</span>
            </div>

            {/* Step 3 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 11,
                color: stage >= 2 ? '#c084fc' : '#64748b',
                fontWeight: stage === 2 ? 800 : 600,
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 999,
                  background: stage > 2 ? '#10b981' : stage === 2 ? 'rgba(192, 132, 252, 0.2)' : 'rgba(255,255,255,0.05)',
                  border: stage > 2 ? 'none' : stage === 2 ? '1px solid #c084fc' : '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {stage > 2 ? <CheckCircle2 size={12} color="#fff" /> : <span style={{ fontSize: 8 }}>3</span>}
              </div>
              <span>Generating Plain-English Translations</span>
            </div>

            {/* Step 4 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 11,
                color: stage >= 3 ? '#34d399' : '#64748b',
                fontWeight: stage === 3 ? 800 : 600,
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 999,
                  background: stage === 3 ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255,255,255,0.05)',
                  border: stage === 3 ? '1px solid #34d399' : '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: 8 }}>4</span>
              </div>
              <span>Formulating Strategic Questions</span>
            </div>
          </div>
        </div>

        {/* Live Risk Meter Gauge */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.35)',
            borderRadius: 10,
            padding: 12,
            border: '1px solid rgba(255, 255, 255, 0.07)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>EXPOSURE METER</span>
            <span style={{ fontSize: 10, fontWeight: 900, color: '#f59e0b' }}>
              {currentPct}% COMPLETED
            </span>
          </div>

          <div style={{ height: 6, width: '100%', background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${currentPct}%`,
                background: 'linear-gradient(90deg, #38bdf8 0%, #6366f1 50%, #ec4899 100%)',
                boxShadow: '0 0 10px rgba(99, 102, 241, 0.8)',
                transition: 'width 0.2s ease-out',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// 2. The Interactive Modal Wrapper
export function RemotionAnalysisModal({
  isOpen,
  fileName,
  loadingMsg,
  onClose,
}: {
  isOpen: boolean
  fileName?: string
  loadingMsg?: string
  onClose?: () => void
}) {
  const [progress, setProgress] = React.useState(16)

  React.useEffect(() => {
    if (!isOpen) {
      setProgress(16)
      return
    }

    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000
      // Continuous asymptotic progression:
      // Starts immediately at 18%, climbs dynamically through the 60s/70s,
      // and asymptotes smoothly towards 95% without ever resetting or looping to 0%
      const calculated = Math.min(95, Math.round(18 + 77 * (1 - Math.exp(-elapsed / 4.8))))
      setProgress(prev => Math.max(prev, calculated))
    }, 120)

    return () => clearInterval(interval)
  }, [isOpen])

  React.useEffect(() => {
    if (!isOpen || !onClose) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose!()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="analysis-modal-title"
    >
      <div className="relative w-full max-w-3xl rounded-2xl overflow-hidden bg-slate-900 border border-indigo-500/30 shadow-2xl shadow-indigo-950/70 flex flex-col">
        {/* Top Control Bar */}
        <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles size={18} className="animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <div>
              <div id="analysis-modal-title" className="text-sm font-black text-white tracking-tight flex items-center gap-2">
                Analyzing Document
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  REMOTION ENGINE
                </span>
              </div>
              <div className="text-xs text-slate-400 truncate max-w-md mt-0.5">
                {fileName || 'Evaluating Contract Agreement...'}
              </div>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Run in Background
            </button>
          )}
        </div>

        {/* Remotion Player Section */}
        <div className="w-full h-80 sm:h-96 bg-black relative">
          <Player
            component={DocumentScanningComposition}
            inputProps={{ progress }}
            durationInFrames={180}
            compositionWidth={720}
            compositionHeight={400}
            fps={30}
            loop={true}
            autoPlay={true}
            controls={false}
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </div>

        {/* Status Bar */}
        <div className="px-6 py-4 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-slate-200">
              {loadingMsg || 'Gemini 3.8 Flash parsing clauses, liabilities, and exposure...'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono hidden sm:block">
            Powered by Remotion Video & Gemini AI
          </div>
        </div>
      </div>
    </div>
  )
}
