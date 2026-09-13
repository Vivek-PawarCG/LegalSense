import React from 'react'
import { Player } from '@remotion/player'
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion'

export function RemotionHeroComposition() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Spring animations for entrance and breathing
  const paperEntrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 80 },
  })

  const card1Entrance = spring({
    frame: frame - 6,
    fps,
    config: { damping: 12, stiffness: 90 },
  })

  const arrowEntrance = spring({
    frame: frame - 16,
    fps,
    config: { damping: 10, stiffness: 100 },
  })

  const card2Entrance = spring({
    frame: frame - 22,
    fps,
    config: { damping: 12, stiffness: 90 },
  })

  const textEntrance = spring({
    frame: frame - 30,
    fps,
    config: { damping: 10, stiffness: 100 },
  })

  // Gentle continuous breathing float
  const floatY = Math.sin((frame / fps) * Math.PI) * 4
  const card1Float = Math.cos((frame / fps) * Math.PI * 0.9) * 3
  const card2Float = Math.sin(((frame + 15) / fps) * Math.PI * 0.9) * 3

  // Twinkle effect for doodles
  const sparkle1 = Math.abs(Math.sin((frame / 12) * Math.PI))
  const sparkle2 = Math.abs(Math.cos((frame / 15) * Math.PI))

  return (
    <div
      style={{
        width: 620,
        height: 480,
        position: 'relative',
        overflow: 'visible',
        userSelect: 'none',
      }}
    >
      {/* Subtle floating background glow */}
      <div
        style={{
          position: 'absolute',
          width: 360,
          height: 360,
          left: 240,
          top: 30,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(224, 231, 255, 0.65) 0%, rgba(255, 255, 255, 0) 70%)',
          filter: 'blur(35px)',
          zIndex: 0,
        }}
      />

      {/* Decorative floating doodles / sparkles */}
      <div
        style={{
          position: 'absolute',
          left: 560,
          top: 30,
          color: '#818cf8',
          fontSize: 22,
          fontWeight: 300,
          transform: `scale(${0.8 + sparkle1 * 0.4}) rotate(${frame * 0.8}deg)`,
          zIndex: 1,
        }}
      >
        ✦
      </div>

      <div
        style={{
          position: 'absolute',
          left: 250,
          top: 40,
          color: '#93c5fd',
          fontSize: 16,
          transform: `scale(${0.7 + sparkle2 * 0.4})`,
          zIndex: 1,
        }}
      >
        ✦
      </div>

      <div
        style={{
          position: 'absolute',
          left: 560,
          top: 260,
          color: '#c7d2fe',
          fontSize: 22,
          fontWeight: 700,
          zIndex: 1,
        }}
      >
        *
      </div>

      {/* 1. TILTED CONTRACT PAPER (Anchored on the right side) */}
      <div
        style={{
          position: 'absolute',
          left: 275,
          top: 25,
          width: 305,
          height: 385,
          background: '#ffffff',
          borderRadius: 18,
          boxShadow: '0 25px 55px rgba(99, 102, 241, 0.12), 0 4px 15px rgba(0, 0, 0, 0.03)',
          border: '1px solid #eef2f6',
          padding: '30px 26px',
          transform: `scale(${paperEntrance}) translateY(${floatY}px) rotate(-6deg)`,
          transformOrigin: 'center center',
          zIndex: 2,
        }}
      >
        {/* Paper dog-ear corner effect */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 0,
            height: 0,
            borderStyle: 'solid',
            borderWidth: '0 34px 34px 0',
            borderColor: 'transparent #e0e7ff transparent transparent',
            borderTopRightRadius: 18,
          }}
        />

        {/* Contract Title Header - Clearly visible and indented */}
        <div
          style={{
            fontSize: 23,
            fontWeight: 900,
            letterSpacing: '0.08em',
            color: '#1e1b4b',
            marginBottom: 20,
            paddingLeft: 22,
          }}
        >
          CONTRACT
        </div>

        {/* Simulated Document Lines */}
        <div style={{ width: '92%', height: 7, background: '#eef2f7', borderRadius: 999, marginBottom: 13 }} />
        <div style={{ width: '80%', height: 7, background: '#eef2f7', borderRadius: 999, marginBottom: 13 }} />
        <div style={{ width: '85%', height: 7, background: '#eef2f7', borderRadius: 999, marginBottom: 13 }} />
        <div style={{ width: '65%', height: 7, background: '#eef2f7', borderRadius: 999, marginBottom: 25 }} />

        <div style={{ width: '96%', height: 7, background: '#eef2f7', borderRadius: 999, marginBottom: 13 }} />
        <div style={{ width: '88%', height: 7, background: '#eef2f7', borderRadius: 999, marginBottom: 13 }} />
        <div style={{ width: '70%', height: 7, background: '#eef2f7', borderRadius: 999, marginBottom: 25 }} />

        <div style={{ width: '85%', height: 7, background: '#eef2f7', borderRadius: 999, marginBottom: 13 }} />
        <div style={{ width: '55%', height: 7, background: '#eef2f7', borderRadius: 999 }} />
      </div>

      {/* 2. CARD 1: COMPLEX LEGAL TEXT (Floats on the LEFT, overlapping only the outer left edge) */}
      <div
        style={{
          position: 'absolute',
          left: 30,
          top: 75,
          width: 255,
          background: '#ffffff',
          borderRadius: 14,
          padding: '16px 18px',
          boxShadow: '0 20px 45px rgba(15, 23, 42, 0.10), 0 2px 8px rgba(15, 23, 42, 0.04)',
          border: '1px solid #e8ebf2',
          transform: `scale(${card1Entrance}) translateY(${card1Float}px)`,
          zIndex: 4,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#1e293b',
            marginBottom: 6,
          }}
        >
          Complex legal text
        </div>
        <p
          style={{
            fontSize: 11.5,
            lineHeight: 1.55,
            color: '#475569',
            margin: 0,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          The Party shall indemnify and hold harmless the other Party from and any and all claims...
        </p>
      </div>

      {/* 3. CURVED ARROW SVG (Curving downward from Card 1 toward Card 2) */}
      <div
        style={{
          position: 'absolute',
          left: 175,
          top: 185,
          width: 80,
          height: 70,
          opacity: arrowEntrance,
          transform: `scale(${arrowEntrance})`,
          zIndex: 5,
          pointerEvents: 'none',
        }}
      >
        <svg width="75" height="65" viewBox="0 0 75 65" fill="none">
          <path
            d="M 15 5 C 10 32, 35 40, 55 52"
            stroke="#1e293b"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Arrowhead */}
          <path
            d="M 42 50 L 56 53 L 53 40"
            stroke="#1e293b"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>

      {/* 4. CARD 2: PLAIN ENGLISH (Floats below, offset to the right, showing checkmark) */}
      <div
        style={{
          position: 'absolute',
          left: 200,
          top: 245,
          width: 290,
          background: '#ffffff',
          borderRadius: 14,
          padding: '16px 18px',
          boxShadow: '0 22px 48px rgba(79, 70, 229, 0.12), 0 3px 10px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e2e8f0',
          transform: `scale(${card2Entrance}) translateY(${card2Float}px)`,
          zIndex: 6,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: '#3730a3',
            }}
          >
            Plain English
          </div>

          {/* Green checkmark circle badge */}
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: '#10b981',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 900,
              boxShadow: '0 4px 10px rgba(16, 185, 129, 0.35)',
            }}
          >
            ✓
          </div>
        </div>

        <p
          style={{
            fontSize: 11.5,
            lineHeight: 1.55,
            color: '#334155',
            margin: 0,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          You are responsible for covering any losses or claims that may arise...
        </p>
      </div>

      {/* 5. CUTE HANDWRITTEN SLOGAN ("Same meaning. Just clearer.") */}
      <div
        style={{
          position: 'absolute',
          left: 270,
          top: 375,
          textAlign: 'center',
          opacity: textEntrance,
          transform: `scale(${textEntrance}) rotate(-4deg)`,
          zIndex: 7,
        }}
      >
        <div
          style={{
            fontFamily: "'Caveat', cursive, sans-serif",
            fontSize: 27,
            lineHeight: 1.1,
            color: '#4338ca',
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}
        >
          Same meaning.<br />
          <span style={{ fontSize: 29, color: '#312e81' }}>Just clearer.</span>
        </div>
      </div>
    </div>
  )
}

export function RemotionHeroPlayer() {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 620,
        height: 480,
        margin: '0 auto',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Player
        component={RemotionHeroComposition}
        durationInFrames={150}
        compositionWidth={620}
        compositionHeight={480}
        fps={30}
        style={{
          width: '100%',
          height: '100%',
          background: 'transparent',
        }}
        loop
        autoPlay
        controls={false}
      />
    </div>
  )
}
