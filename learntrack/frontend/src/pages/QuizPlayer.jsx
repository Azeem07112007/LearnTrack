import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../supabaseClient'
import Loading from '../components/Loading'

const API_BASE = import.meta.env.VITE_API_BASE

export default function QuizPlayer({ onExit }) {
  const [quizzes, setQuizzes] = useState([])
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function authHeaders() {
    const { data: { session } } = await supabase.auth.getSession()
    return { Authorization: `Bearer ${session?.access_token}` }
  }

  useEffect(() => {
    async function loadQuizzes() {
      try {
        const headers = await authHeaders()
        const res = await fetch(`${API_BASE}/student/quizzes`, { headers })
        if (!res.ok) throw new Error('Could not load quizzes')
        const data = await res.json()
        setQuizzes(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadQuizzes()
  }, [])

  async function startQuiz(quiz) {
    setSelectedQuiz(quiz)
    setLoading(true)
    setError('')
    try {
      const headers = await authHeaders()
      const res = await fetch(`${API_BASE}/student/quiz/${quiz.id}/questions`, { headers })
      if (!res.ok) throw new Error('Could not load questions for this quiz')
      const data = await res.json()
      setQuestions(data)
      setCurrent(0)
      setAnswers({})
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function choose(option) {
    setAnswers((prev) => ({ ...prev, [questions[current].id]: option }))
  }

  function goTo(index) {
    setCurrent(index)
  }

  async function submitQuiz() {
    const unanswered = questions.length - Object.keys(answers).length
    if (unanswered > 0) {
      const proceed = window.confirm(
        `${unanswered} question${unanswered > 1 ? 's are' : ' is'} still unanswered. Submit anyway?`
      )
      if (!proceed) return
    }

    setLoading(true)
    setError('')
    try {
      const headers = await authHeaders()
      const res = await fetch(`${API_BASE}/student/quiz/submit`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz_id: selectedQuiz.id, answers }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.detail || `Submit failed (${res.status})`)
      }
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err.message || 'Could not submit quiz. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading text="Loading quests..." />
  if (error) {
    return (
      <div className="space-y-3 font-body">
        <p className="text-flame">{error}</p>
        <button onClick={onExit} className="text-sm text-white/50 underline">
          Back to dashboard
        </button>
      </div>
    )
  }

  if (result) {
    const newBadges = result.new_badges || []
    return (
      <div className="game-panel p-10 text-center space-y-5 font-body max-w-md mx-auto">
        <p className="font-display text-2xl text-gold hud-glow">⚔ Quest Complete!</p>
        <motion.div
          initial={{ scale: 0.2, opacity: 0, rotate: -40 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.6, ease: 'backOut' }}
          className="xp-gem w-32 h-32 mx-auto flex items-center justify-center"
        >
          <p className="font-stat text-3xl text-night font-bold">+{result.xp_earned}<br/><span className="text-sm">XP</span></p>
        </motion.div>
        <p className="text-white/70 font-stat text-lg">
          Score: {result.score} / {questions.length}
        </p>

        {newBadges.length > 0 && (
          <div className="pt-2 border-t border-violet/30">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="font-display text-cyan hud-glow mb-3"
            >
              🎖 New medallion unlocked!
            </motion.p>
            <div className="flex justify-center flex-wrap gap-6">
              {newBadges.map((badge, i) => (
                <motion.div
                  key={badge.id}
                  className="relative flex flex-col items-center medallion-ribbon"
                  initial={{ scale: 0, opacity: 0, rotate: -180 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.9 + i * 0.25, type: 'spring', stiffness: 260, damping: 14 }}
                >
                  <motion.div
                    animate={{ boxShadow: ['0 0 10px rgba(40,194,194,0.4)', '0 0 26px rgba(40,194,194,0.8)', '0 0 10px rgba(40,194,194,0.4)'] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 1 + i * 0.25 }}
                    className="medallion w-16 h-16 flex items-center justify-center"
                  >
                    <span className="text-2xl">🎖</span>
                  </motion.div>
                  <p className="text-xs text-white/80 mt-2 text-center max-w-[90px]">{badge.name}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <button onClick={onExit} className="bg-gradient-to-r from-cyan to-violet text-white rounded-xl px-6 py-3 font-display text-lg shadow-lg shadow-cyan/20">
          Back to dashboard
        </button>
      </div>
    )
  }

  if (!selectedQuiz) {
    return (
      <div className="space-y-3 font-body max-w-2xl">
        <h2 className="font-display text-2xl text-white">🗺 Available quests</h2>
        {quizzes.length === 0 && <p className="text-white/50 text-sm">No quests assigned yet.</p>}
        {quizzes.map((q) => (
          <button
            key={q.id}
            onClick={() => startQuiz(q)}
            className="w-full text-left game-panel p-4 hover:border-cyan/60 transition"
          >
            <p className="font-display text-white">{q.topic || 'Quiz'}</p>
            <p className="text-sm text-cyan/70">{q.domain}</p>
          </button>
        ))}
        <button onClick={onExit} className="text-sm text-white/50 underline">
          Back to dashboard
        </button>
      </div>
    )
  }

  const q = questions[current]
  if (!q) return <p className="p-4">No questions found for this quiz.</p>

  const answeredCount = Object.keys(answers).length
  const unansweredCount = questions.length - answeredCount
  const isLast = current + 1 === questions.length
  const picked = answers[q.id]

  return (
    <div className="font-body max-w-2xl">
      <div className="game-panel p-5">
        <div className="flex justify-between items-center mb-3 text-sm text-white/50">
          <span>Question {current + 1} of {questions.length}</span>
          <span>
            <span className="text-cyan font-semibold">{answeredCount} answered</span>
            {unansweredCount > 0 && <span className="text-white/30"> · {unansweredCount} unanswered</span>}
          </span>
        </div>

        {/* Question navigator */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {questions.map((question, i) => {
            const isAnswered = answers[question.id] !== undefined
            const isCurrent = i === current
            return (
              <button
                key={question.id}
                onClick={() => goTo(i)}
                className={`w-7 h-7 rounded-full text-xs flex items-center justify-center border font-stat font-bold transition ${
                  isCurrent
                    ? 'border-gold ring-2 ring-gold/30 text-gold'
                    : isAnswered
                    ? 'bg-cyan border-cyan text-night'
                    : 'border-violet/50 text-white/40'
                }`}
              >
                {i + 1}
              </button>
            )
          })}
        </div>

        <p className="font-display text-xl text-white mb-4">{q.text}</p>
        <div className="flex flex-col gap-2 mb-5">
          {q.options.map((opt) => {
            const isPicked = picked === opt
            return (
              <button
                key={opt}
                onClick={() => choose(opt)}
                className={`text-left rounded-lg border-2 p-3 transition ${
                  isPicked ? 'border-cyan bg-cyan/10 text-white' : 'border-violet/40 text-white/80 hover:border-violet'
                }`}
              >
                {opt}
              </button>
            )
          })}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => goTo(current - 1)}
            disabled={current === 0}
            className="flex-1 border border-violet/50 disabled:opacity-30 text-white rounded-lg py-2"
          >
            Previous
          </button>
          {!isLast && (
            <button
              onClick={() => goTo(current + 1)}
              className="flex-1 bg-violet text-white rounded-lg py-2"
            >
              Next
            </button>
          )}
        </div>

        <button
          onClick={submitQuiz}
          className="w-full bg-gradient-to-r from-cyan to-violet text-white rounded-lg py-2.5 mt-2 font-display text-lg"
        >
          Complete quest
        </button>
      </div>
    </div>
  )
}
