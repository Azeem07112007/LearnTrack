import { motion } from 'framer-motion'

function EyeIcon({ size = 48 }) {
  return (
    <div
      className="eye-wrap"
      style={{
        width: size,
        height: size,
        animation: 'pulseGlow 1.6s ease-in-out infinite',
      }}
    >
      <svg width={size} height={size} viewBox="0 0 200 200">
        <defs>
          <radialGradient id="irisGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF6B5C" />
            <stop offset="55%" stopColor="#E6483C" />
            <stop offset="100%" stopColor="#5C0F09" />
          </radialGradient>
        </defs>

        <circle
          className="eye-ring"
          cx="100" cy="100" r="92"
          fill="none" stroke="#E6483C" strokeWidth="2" strokeDasharray="6 5" opacity="0.55"
        />

        <circle cx="100" cy="100" r="76" fill="url(#irisGrad)" />

        <g className="eye-marks">
          {[0, 120, 240].map((deg) => (
            <g key={deg} transform={`rotate(${deg} 100 100)`}>
              <path
                d="M100 100 C 112 68, 136 60, 136 32 C 158 50, 162 84, 136 104 C 122 114, 106 110, 100 100 Z"
                fill="#0B0603"
              />
              <circle cx="136" cy="38" r="7" fill="#0B0603" />
            </g>
          ))}
        </g>

        <circle cx="100" cy="100" r="16" fill="#0B0603" />
        <circle cx="100" cy="100" r="4" fill="#FF9E8F" opacity="0.85" />
      </svg>

      <style>{`
        @keyframes spinCW { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spinCCW { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        @keyframes pulseGlow {
          0%, 100% { filter: drop-shadow(0 0 6px #E6483C); }
          50% { filter: drop-shadow(0 0 22px #E6483C); }
        }
        .eye-ring { transform-origin: 100px 100px; animation: spinCCW 4s linear infinite; }
        .eye-marks { transform-origin: 100px 100px; animation: spinCW 1s linear infinite; }
      `}</style>
    </div>
  )
}

export default function Loading({ text = 'Loading...', compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 font-body">
        <EyeIcon size={18} />
        <span className="text-white/40 text-sm">{text}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 font-body">
      <EyeIcon size={80} />
      <motion.p
        className="text-white/50 text-sm"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {text}
      </motion.p>
    </div>
  )
}
