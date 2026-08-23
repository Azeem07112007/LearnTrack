import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import Loading from '../components/Loading'

const API_BASE = import.meta.env.VITE_API_BASE

export default function TeacherUpload() {
  const [file, setFile] = useState(null)
  const [domain, setDomain] = useState('Science')
  const [classId, setClassId] = useState('')
  const [classes, setClasses] = useState([])
  const [classesLoading, setClassesLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [message, setMessage] = useState('')
  const [leaderboard, setLeaderboard] = useState([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(false)
  const [stats, setStats] = useState(null)

  async function authHeaders() {
    const { data: { session } } = await supabase.auth.getSession()
    return { Authorization: `Bearer ${session?.access_token}` }
  }

  useEffect(() => {
    async function loadClasses() {
      try {
        const headers = await authHeaders()
        const res = await fetch(`${API_BASE}/teacher/classes`, { headers })
        if (!res.ok) throw new Error('Could not load classes')
        const data = await res.json()
        setClasses(data)
        if (data.length > 0) setClassId(data[0].id)
      } catch {
        // leave classes empty — form will show a fallback message
      } finally {
        setClassesLoading(false)
      }
    }
    loadClasses()
  }, [])

  useEffect(() => {
    async function loadStats() {
      try {
        const headers = await authHeaders()
        const res = await fetch(`${API_BASE}/teacher/stats`, { headers })
        if (res.ok) setStats(await res.json())
      } catch {
        // stats are decorative — fail silently
      }
    }
    loadStats()
  }, [])

  useEffect(() => {
    if (!classId) return
    async function loadLeaderboard() {
      setLeaderboardLoading(true)
      try {
        const headers = await authHeaders()
        const res = await fetch(`${API_BASE}/teacher/leaderboard/${classId}`, { headers })
        if (!res.ok) throw new Error()
        setLeaderboard(await res.json())
      } catch {
        setLeaderboard([])
      } finally {
        setLeaderboardLoading(false)
      }
    }
    loadLeaderboard()
  }, [classId])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file || !classId || !title) {
      setStatus('error')
      setMessage('File, class ID, and title are all required.')
      return
    }

    setStatus('loading')
    setMessage('')

    const form = new FormData()
    form.append('file', file)
    form.append('domain', domain)
    form.append('class_id', classId)
    form.append('title', title)
    if (dueDate) form.append('due_date', dueDate)

    try {
      const headers = await authHeaders()
      const res = await fetch(`${API_BASE}/teacher/upload`, {
        method: 'POST',
        headers, // no Content-Type here — browser sets multipart boundary automatically
        body: form,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Upload failed')
      setStatus('success')
      setMessage(`Generated ${data.questions_generated} questions.`)
      setFile(null)
      setTitle('')
    } catch (err) {
      setStatus('error')
      setMessage(err.message)
    }
  }

  return (
    <div className="space-y-6 font-body">
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <TeacherStat icon="🏫" label="classes" value={stats.total_classes} color="text-cyan" />
          <TeacherStat icon="🧑‍🎓" label="students" value={stats.total_students} color="text-gold" />
          <TeacherStat icon="📜" label="quests posted" value={stats.total_quests} color="text-flame" />
        </div>
      )}
      <div className="grid grid-cols-3 gap-6 items-start">
      <form onSubmit={handleSubmit} className="game-panel p-5 space-y-4 col-span-2">
        <p className="font-display text-2xl text-white">📜 Post a new quest</p>

        <div>
          <label className="text-sm text-white/60 block mb-1">Curriculum file</label>
          <div className="border-2 border-dashed border-violet/50 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-sm"
            />
            {file && <p className="text-sm text-cyan mt-2">{file.name}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-white/60 block mb-1">Domain</label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full border border-violet/50 rounded-lg p-2 bg-night2 text-white"
            >
              <option>Science</option>
              <option>Mathematics</option>
              <option>Social studies</option>
              <option>English</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-white/60 block mb-1">Class</label>
            {classesLoading ? (
              <div className="p-2"><Loading compact text="Loading classes..." /></div>
            ) : classes.length === 0 ? (
              <p className="text-sm text-flame p-2">No classes assigned to you yet.</p>
            ) : (
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full border border-violet/50 rounded-lg p-2 bg-night2 text-white"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm text-white/60 block mb-1">Quest title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Photosynthesis basics"
            className="w-full border border-violet/50 rounded-lg p-2 bg-night2 text-white placeholder-white/30"
          />
        </div>

        <div>
          <label className="text-sm text-white/60 block mb-1">Due date (optional)</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full border border-violet/50 rounded-lg p-2 bg-night2 text-white"
          />
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-gradient-to-r from-cyan to-violet disabled:opacity-40 text-white rounded-lg py-2.5 font-display text-lg"
        >
          {status === 'loading' ? 'Generating quest...' : '⚔ Post quest'}
        </button>

        {status === 'success' && <p className="text-sm text-cyan">{message}</p>}
        {status === 'error' && <p className="text-sm text-flame">{message}</p>}
      </form>

      {classId ? (
        <div className="game-panel p-5">
          <p className="font-display text-xl text-white mb-3">
            🏆 Hall of Champions — {classes.find((c) => c.id === classId)?.name}
          </p>
          {leaderboardLoading ? (
            <Loading compact text="Loading leaderboard..." />
          ) : leaderboard.length === 0 ? (
            <p className="text-sm text-white/50">No students have earned XP in this class yet.</p>
          ) : (
            leaderboard.map((row, i) => (
              <div key={row.student_id} className="flex justify-between items-center py-2 px-2 text-sm">
                <span className="flex items-center gap-2">
                  <span className={`font-stat w-6 text-center font-bold ${i < 3 ? 'text-gold' : 'text-white/40'}`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </span>
                  <span className="text-white/80">{row.name}</span>
                </span>
                <span className="font-stat text-gold">{row.total_xp} XP</span>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="game-panel p-5">
          <p className="text-sm text-white/40">Pick a class to see its leaderboard.</p>
        </div>
      )}
      </div>
    </div>
  )
}

function TeacherStat({ icon, label, value, color }) {
  return (
    <div className="game-panel text-center py-4">
      <p className="text-xl leading-none mb-1">{icon}</p>
      <p className={`font-stat text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-[11px] text-white/40 mt-0.5 uppercase tracking-wide">{label}</p>
    </div>
  )
}
