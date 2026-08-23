import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../supabaseClient'
import Loading from '../components/Loading'

const API_BASE = import.meta.env.VITE_API_BASE

const NODE_SPACING = 130
const AMPLITUDE = 90 // how far left/right nodes swing

export default function Roadmap() {
  const [path, setPath] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const res = await fetch(`${API_BASE}/student/roadmap`, {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        })
        setPath(res.ok ? await res.json() : [])
      } catch {
        setPath([])
      }
    }
    load()
  }, [])

  if (!path) return <Loading text="Charting your quest path..." />

  if (path.length === 0) {
    return (
      <div className="game-panel p-8 text-center">
        <p className="font-display text-xl text-white mb-2">🗺 No quests posted yet</p>
        <p className="text-white/50 text-sm font-body">Once your teacher assigns a quest, it'll appear here as the start of your path.</p>
      </div>
    )
  }

  const centerX = 250
  const points = path.map((q, i) => ({
    ...q,
    x: centerX + Math.sin(i * 1.1) * AMPLITUDE,
    y: 70 + i * NODE_SPACING,
  }))
  const totalHeight = 70 + (points.length - 1) * NODE_SPACING + 90

  // smooth curved path through all node centers
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const midY = (prev.y + curr.y) / 2
    d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`
  }

  return (
    <div className="game-panel p-8">
      <p className="font-display text-2xl text-white mb-2">🗺 Your quest path</p>
      <p className="text-white/50 text-sm font-body mb-6">Follow the trail — each stop is a quest waiting to be completed.</p>

      <div className="relative mx-auto" style={{ width: centerX * 2, height: totalHeight }}>
        <svg width={centerX * 2} height={totalHeight} className="absolute top-0 left-0">
          <motion.path
            d={d}
            fill="none"
            stroke="#5B4B8A"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="1 14"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />
        </svg>

        {points.map((q, i) => {
          const isCompleted = q.status === 'completed'
          const isCurrent = q.status === 'current'
          const labelRight = q.x > centerX

          return (
            <motion.div
              key={q.id}
              className="absolute flex items-center gap-3"
              style={{
                left: q.x,
                top: q.y,
                transform: labelRight ? 'translate(-100%, -50%)' : 'translate(0%, -50%)',
                flexDirection: labelRight ? 'row-reverse' : 'row',
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.12, type: 'spring', stiffness: 300, damping: 18 }}
            >
              <motion.div
                whileHover={{ scale: 1.12 }}
                animate={isCurrent ? { boxShadow: ['0 0 0px #28C2C2', '0 0 22px #28C2C2', '0 0 0px #28C2C2'] } : {}}
                transition={isCurrent ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : { type: 'spring', stiffness: 300 }}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-stat font-bold shrink-0 border-4 z-10 ${
                  isCompleted
                    ? 'bg-gradient-to-br from-gold to-amber-600 border-white/30 text-night'
                    : isCurrent
                    ? 'bg-gradient-to-br from-cyan to-violet border-white/40 text-white'
                    : 'bg-night2 border-violet/30 text-white/30'
                }`}
              >
                {isCompleted ? '⭐' : isCurrent ? '⚔' : '🔒'}
              </motion.div>
              <div className={labelRight ? 'text-right' : 'text-left'} style={{ maxWidth: 160 }}>
                <p className={`font-display leading-tight ${isCurrent ? 'text-cyan' : isCompleted ? 'text-gold' : 'text-white/40'}`}>
                  {q.title}
                </p>
                <p className="text-xs text-white/40">{q.domain}{isCompleted ? ` · scored ${q.score}` : ''}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
