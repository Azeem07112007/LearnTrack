import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../supabaseClient'
import Loading from '../components/Loading'
import { Card, Pill, Icon } from '../components/ui'

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
      <Card className="p-8 text-center max-w-md mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
          <Icon className="text-2xl">map</Icon>
        </div>
        <h3 className="font-semibold text-lg mb-1">No assignments yet</h3>
        <p className="text-muted-foreground text-sm">Once your teacher posts an assignment, it will appear here as your learning path.</p>
      </Card>
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
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Icon className="text-xl">map</Icon>
          </div>
          <div>
            <h2 className="text-xl font-bold">Learning Path</h2>
            <p className="text-sm text-muted-foreground">Follow your assignments in sequence</p>
          </div>
        </div>

        <div className="relative mx-auto mt-8" style={{ width: centerX * 2, height: totalHeight }}>
          <svg width={centerX * 2} height={totalHeight} className="absolute top-0 left-0">
            <motion.path
              d={d}
              fill="none"
              stroke="currentColor"
              className="text-border"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="6 8"
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
                transition={{ delay: 0.2 + i * 0.1, type: 'spring', stiffness: 300, damping: 20 }}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  animate={isCurrent ? { boxShadow: ['0 0 0px hsl(var(--primary))', '0 0 16px hsl(var(--primary))', '0 0 0px hsl(var(--primary))'] } : {}}
                  transition={isCurrent ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : { type: 'spring' }}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0 border-2 z-10 transition-all ${
                    isCompleted
                      ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                      : isCurrent
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                      : 'bg-muted border-border text-muted-foreground'
                  }`}
                >
                  <Icon>{isCompleted ? 'star' : isCurrent ? 'play_arrow' : 'lock'}</Icon>
                </motion.div>
                <div className={labelRight ? 'text-right' : 'text-left'} style={{ maxWidth: 180 }}>
                  <p className={`font-semibold text-sm leading-snug ${isCurrent ? 'text-primary font-bold' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {q.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {q.domain}
                    {isCompleted && <span className="text-amber-500 font-semibold ml-1">({q.score} XP)</span>}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

