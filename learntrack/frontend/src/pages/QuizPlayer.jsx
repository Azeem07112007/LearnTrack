import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../supabaseClient'
import Loading from '../components/Loading'
import { Card, Pill, Button, Icon, Progress } from '../components/ui'

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
      <Card className="p-6 max-w-md mx-auto my-8 text-center space-y-4">
        <p className="text-danger font-medium">{error}</p>
        <Button variant="soft" onClick={onExit}>
          Back to Dashboard
        </Button>
      </Card>
    )
  }

  if (result) {
    const newBadges = result.new_badges || []
    return (
      <Card className="p-8 text-center space-y-6 max-w-md mx-auto my-8">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
          <Icon className="text-3xl">emoji_events</Icon>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Quiz Complete!</h2>
          <p className="text-sm text-muted-foreground mt-1">Great job finishing your assessment.</p>
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-4 rounded-2xl bg-secondary/30 border border-border/50 inline-block px-8"
        >
          <span className="text-3xl font-extrabold text-primary">{result.score}/{questions.length}</span>
          <p className="text-xs text-muted-foreground mt-1">Points earned: {result.xp_earned}</p>
        </motion.div>

        {newBadges.length > 0 && (
          <div className="pt-4 border-t border-border/50">
            <p className="text-sm font-semibold text-primary mb-3 flex items-center justify-center gap-1">
              <Icon>workspace_premium</Icon> New Badges Unlocked!
            </p>
            <div className="flex justify-center flex-wrap gap-4">
              {newBadges.map((badge) => (
                <div key={badge.id} className="flex flex-col items-center p-3 rounded-xl border border-primary/30 bg-primary/5">
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-1">
                    <Icon>military_tech</Icon>
                  </div>
                  <span className="text-xs font-medium text-center">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button onClick={onExit} className="w-full">
          Back to Dashboard
        </Button>
      </Card>
    )
  }

  if (!selectedQuiz) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Available Quizzes</h2>
            <p className="text-sm text-muted-foreground">Select a topic to test your knowledge</p>
          </div>
          <Button variant="soft" size="sm" onClick={onExit}>
            Back to Dashboard
          </Button>
        </div>

        {quizzes.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No quizzes assigned yet for your class.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map((q) => (
              <Card
                key={q.id}
                onClick={() => startQuiz(q)}
                className="p-5 hover:border-primary/50 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <Pill variant="primary">{q.domain || 'General'}</Pill>
                    <Icon className="text-muted-foreground">arrow_forward</Icon>
                  </div>
                  <h3 className="font-semibold text-base text-foreground mb-1">{q.topic || 'Assessment Quiz'}</h3>
                </div>
                <div className="mt-4 pt-3 border-t border-border/40 flex justify-between items-center text-xs text-muted-foreground">
                  <span>Begin Quiz</span>
                  <span className="text-primary font-medium">Start →</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  const q = questions[current]
  if (!q) return <p className="p-4 text-center">No questions found for this quiz.</p>

  const answeredCount = Object.keys(answers).length
  const isLast = current + 1 === questions.length
  const picked = answers[q.id]
  const progressPercent = Math.round(((current + 1) / questions.length) * 100)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Question {current + 1} of {questions.length}</span>
          <span>{answeredCount} of {questions.length} answered</span>
        </div>

        <Progress value={progressPercent} className="mb-6" />

        {/* Question navigator */}
        <div className="flex flex-wrap gap-2 mb-6">
          {questions.map((question, i) => {
            const isAnswered = answers[question.id] !== undefined
            const isCurrent = i === current
            return (
              <button
                key={question.id}
                onClick={() => goTo(i)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                  isCurrent
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary/40'
                    : isAnswered
                    ? 'bg-secondary text-primary border border-primary/30'
                    : 'bg-muted text-muted-foreground border border-border'
                }`}
              >
                {i + 1}
              </button>
            )
          })}
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-4">{q.text}</h3>

        <div className="space-y-3 mb-6">
          {q.options.map((opt) => {
            const isPicked = picked === opt
            return (
              <button
                key={opt}
                onClick={() => choose(opt)}
                className={`w-full text-left rounded-xl border p-4 text-sm font-medium transition-all ${
                  isPicked
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-foreground hover:bg-secondary/30'
                }`}
              >
                {opt}
              </button>
            )
          })}
        </div>

        <div className="flex justify-between gap-3 pt-4 border-t border-border/50">
          <Button
            variant="soft"
            onClick={() => goTo(current - 1)}
            disabled={current === 0}
          >
            Previous
          </Button>

          {isLast ? (
            <Button onClick={submitQuiz}>
              Submit Quiz
            </Button>
          ) : (
            <Button onClick={() => goTo(current + 1)}>
              Next
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

