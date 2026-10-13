import { useState, useEffect, type FormEvent, type ReactNode } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { AppShell, useProfile } from "./app";
import { supabase } from "../../lib/supabase";
import { fetchWithAuth, API_BASE } from "../../lib/api";

function Icon({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`} aria-hidden="true">{children}</span>;
}
function Button({ children, variant = "primary", className = "", ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "soft" | "ghost" }) {
  return <button className={`btn btn-${variant} ${className}`} {...p}>{children}</button>;
}
function Pill({ children, tone = "blue" }: { children: ReactNode; tone?: string }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}
function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>;
}
function Progress({ value }: { value: number }) {
  return <div className="progress"><i style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>;
}

// ─── LOGIN PAGE ────────────────────────────────────────────────────────────────

export function LoginPage() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
      if (authErr) throw authErr;
      if (data.session) {
        navigate({ to: "/" });
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="brand-mark">
          <Icon>menu_book</Icon>
        </div>
        <h1>LearnTrack</h1>
        <p>Sign in to your academic portal</p>

        {error && (
          <div style={{ padding: "8px 12px", background: "#f8717122", color: "#f87171", borderRadius: "6px", fontSize: "0.85rem", marginBottom: "12px" }}>
            {error}
          </div>
        )}

        <label>
          University Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex.chen@university.edu"
            required
          />
        </label>
        <label>
          Password <button type="button" onClick={() => setError("Contact system administrator to reset password.")}>Forgot password?</button>
          <div className="password">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <button type="button" aria-label="Show password" onClick={() => setShow(!show)}>
              <Icon>{show ? "visibility_off" : "visibility"}</Icon>
            </button>
          </div>
        </label>
        <label className="remember">
          <input type="checkbox" defaultChecked /> Remember device for 30 days
        </label>
        <Button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
        <div className="divider">
          <span>Or authenticate via</span>
        </div>
        <Button type="button" variant="soft">
          <Icon>account_balance</Icon>Campus Single Sign-On (SSO)
        </Button>
        <p className="signup">
          Don't have an institutional account? <Link to="/signup">Sign up with university credentials</Link>
        </p>
      </form>
      <footer>
        <span>● Identity Provider Active</span>
        <a>Security Policy</a>
        <b>•</b>
        <a>IT Help Desk</a>
      </footer>
    </main>
  );
}

// ─── SIGNUP PAGE ───────────────────────────────────────────────────────────────

export function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"account" | "teacher-school" | "student-setup">("account");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolFound, setSchoolFound] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [classId, setClassId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const createAccount = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data, error: signUpErr } = await supabase.auth.signUp({ email, password });
      if (signUpErr) throw signUpErr;

      let token = data.session?.access_token;
      if (!token) {
        const signInRes = await supabase.auth.signInWithPassword({ email, password });
        if (signInRes.error) throw signInRes.error;
        token = signInRes.data.session?.access_token;
      }
      if (!token) throw new Error("Could not create session. Please try logging in.");
      setAccessToken(token);

      const checkRes = await fetch(`${API_BASE}/auth/school-check`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const checkData = await checkRes.json();
      setSchoolFound(checkData.school);

      if (role === "teacher") {
        setStep("teacher-school");
      } else {
        if (!checkData.school) {
          setError("No school is registered for this email domain yet. Ask a teacher to sign up first.");
          setLoading(false);
          return;
        }
        const clsRes = await fetch(`${API_BASE}/auth/classes-for-signup`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const clsData = await clsRes.json();
        setClasses(clsData);
        setStep("student-setup");
      }
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const finishTeacher = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/signup/teacher`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name, school_name: schoolFound ? undefined : schoolName }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Teacher signup failed");
      }
      navigate({ to: "/" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const finishStudent = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!classId) return setError("Please select a class.");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/signup/student`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name, class_id: classId, domains: [] }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Student signup failed");
      }
      navigate({ to: "/" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card" style={{ maxWidth: "440px", width: "100%" }}>
        <div className="brand-mark">
          <Icon>menu_book</Icon>
        </div>
        <h1>Join LearnTrack</h1>
        <p>Create your academic account</p>

        {error && (
          <div style={{ padding: "8px 12px", background: "#f8717122", color: "#f87171", borderRadius: "6px", fontSize: "0.85rem", marginBottom: "12px" }}>
            {error}
          </div>
        )}

        {step === "account" && (
          <form onSubmit={createAccount} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="role-switch" style={{ width: "100%", margin: "4px 0" }}>
              <button type="button" className={role === "student" ? "active" : ""} onClick={() => setRole("student")}>
                Student
              </button>
              <button type="button" className={role === "teacher" ? "active" : ""} onClick={() => setRole("teacher")}>
                Teacher
              </button>
            </div>
            <label>
              Full Name
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" required />
            </label>
            <label>
              Institutional Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@university.edu" required />
            </label>
            <label>
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </label>
            <Button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Next Step →"}
            </Button>
          </form>
        )}

        {step === "teacher-school" && (
          <form onSubmit={finishTeacher} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {schoolFound ? (
              <p style={{ fontSize: "0.9rem" }}>Associated School: <b>{schoolFound.name}</b></p>
            ) : (
              <label>
                School / Institution Name
                <input type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="Department of Computer Science" required />
              </label>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? "Completing Registration..." : "Complete Setup"}
            </Button>
          </form>
        )}

        {step === "student-setup" && (
          <form onSubmit={finishStudent} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <label>
              Select Your Class
              <select value={classId} onChange={(e) => setClassId(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "var(--card-bg, #1a1a1a)", color: "#fff", border: "1px solid #333" }}>
                <option value="">-- Choose Class --</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <Button type="submit" disabled={loading}>
              {loading ? "Joining Class..." : "Join Class & Complete"}
            </Button>
          </form>
        )}

        <p className="signup" style={{ marginTop: "16px" }}>
          Already have an account? <Link to="/login">Sign in here</Link>
        </p>
      </div>
    </main>
  );
}

// ─── STUDY GUIDE PAGE ──────────────────────────────────────────────────────────

export function StudyGuidePage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [remaining, setRemaining] = useState<number>(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetchWithAuth("/student/study-guide/history");
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
          setRemaining(data.remaining ?? 20);
        }
      } catch (err) {
        console.error("Error loading chat history", err);
      }
    }
    loadHistory();
  }, []);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const promptText = input.trim();
    setInput("");
    setError("");

    const userMsg = { id: Date.now().toString(), role: "user", content: promptText, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetchWithAuth("/student/study-guide/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: promptText }),
      });

      if (res.status === 429) {
        const data = await res.json();
        throw new Error(data.detail || "Daily question limit reached.");
      }
      if (!res.ok) throw new Error("Failed to generate response.");

      const data = await res.json();
      const botMsg = { id: (Date.now() + 1).toString(), role: "assistant", content: data.answer, created_at: new Date().toISOString() };
      setMessages((prev) => [...prev, botMsg]);
      if (typeof data.remaining === "number") setRemaining(data.remaining);
    } catch (err: any) {
      setError(err.message || "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="page-stack" style={{ maxWidth: "960px", margin: "0 auto" }}>
        <Card className="welcome">
          <div>
            <h1>Study Guide — AI Academic Tutor <Pill tone="green">{remaining} Questions Left Today</Pill></h1>
            <p><Icon>psychology</Icon> Powered by CS-Academic-Llama-70B • Contextual academic Q&A</p>
          </div>
        </Card>

        {error && (
          <div style={{ padding: "10px 14px", background: "#f8717122", color: "#f87171", borderRadius: "8px" }}>
            {error}
          </div>
        )}

        <Card style={{ display: "flex", flexDirection: "column", minHeight: "420px", maxHeight: "600px", padding: "16px" }}>
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px", paddingRight: "8px" }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: "center", color: "#888", marginTop: "80px" }}>
                <Icon className="icon-large" style={{ fontSize: "48px", marginBottom: "12px" }}>smart_toy</Icon>
                <h3>Ask any Computer Science question</h3>
                <p style={{ fontSize: "0.9rem" }}>Algorithms, Data Structures, DB Systems, Systems Architecture & Complexity Proofs.</p>
              </div>
            ) : (
              messages.map((m, i) => (
                <div
                  key={m.id || i}
                  style={{
                    alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "80%",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    background: m.role === "user" ? "var(--btn-primary-bg, #2563eb)" : "rgba(255,255,255,0.06)",
                    color: m.role === "user" ? "#ffffff" : "#e2e8f0",
                    border: m.role === "user" ? "none" : "1px solid rgba(255,255,255,0.1)",
                    lineHeight: "1.5",
                  }}
                >
                  <small style={{ display: "block", marginBottom: "4px", opacity: 0.7, fontSize: "0.75rem" }}>
                    {m.role === "user" ? "You" : "AI Tutor"}
                  </small>
                  <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{m.content}</p>
                </div>
              ))
            )}
            {loading && (
              <div style={{ alignSelf: "flex-start", padding: "12px 16px", borderRadius: "12px", background: "rgba(255,255,255,0.06)", color: "#888" }}>
                <Icon>pending</Icon> Thinking...
              </div>
            )}
          </div>

          <form onSubmit={handleSend} style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={remaining > 0 ? "Ask a concept question..." : "Daily limit reached (20 questions)"}
              disabled={remaining <= 0 || loading}
              style={{ flex: 1, padding: "12px", borderRadius: "8px", background: "#111", color: "#fff", border: "1px solid #333" }}
            />
            <Button type="submit" disabled={remaining <= 0 || loading || !input.trim()}>
              <Icon>send</Icon> Ask
            </Button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}

// ─── MAP PAGE ──────────────────────────────────────────────────────────────────

export function MapPage() {
  const [roadmap, setRoadmap] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRoadmap() {
      try {
        const res = await fetchWithAuth("/student/roadmap");
        if (res.ok) {
          const data = await res.json();
          setRoadmap(data);
        }
      } catch (err) {
        console.error("Error loading roadmap", err);
      } finally {
        setLoading(false);
      }
    }
    loadRoadmap();
  }, []);

  const total = roadmap.length || 25;
  const completed = roadmap.filter((r) => r.status === "completed").length || 17;
  const pct = Math.round((completed / total) * 100);

  return (
    <AppShell>
      <div className="page-stack map-page">
        <Card className="course-bar">
          <div>
            <Icon>terminal</Icon>
            <b>CS301: Data Structures & Algorithmic Design</b>
          </div>
          <Pill>Core Engineering</Pill>
          <small>ABET Accredited</small>
          <Button variant="soft">
            <Icon>picture_as_pdf</Icon>Download Syllabus PDF
          </Button>
          <Button>
            <Icon>play_arrow</Icon>Resume Current Module
          </Button>
        </Card>

        <div className="map-summary">
          <Card>
            <small>Curriculum Mastery Track</small>
            <h2>
              {pct}% Completed <Pill>{completed} / {total} Units Mastered</Pill>
            </h2>
            <Progress value={pct} />
            <div className="progress-labels">
              <span>Unit 1 (100%)</span>
              <span>Unit 2 (100%)</span>
              <span>Unit 3 (75%)</span>
              <span>Unit 4 (Active)</span>
              <span>Unit 5 (Locked)</span>
            </div>
          </Card>
          <Card>
            <small>Weekly Pacing Status</small>
            <i className="status-dot" />
            <h2>On Schedule</h2>
            <p>
              Target Exam Date: <b>Dec 14</b> <span>18 days left</span>
            </p>
          </Card>
        </div>

        {roadmap.length > 0 ? (
          <Card className="unit unit-1">
            <header>
              <b>01</b>
              <div>
                <h3>Curriculum Progress Topics</h3>
                <p>Generated dynamically from active class modules</p>
              </div>
              <Pill tone="green">{completed} / {total} Completed</Pill>
            </header>
            <div className="topic-grid">
              {roadmap.map((t) => (
                <article key={t.id} className={t.status === "current" ? "topic active-topic" : t.status === "upcoming" ? "topic locked" : "topic"}>
                  <p>
                    <Pill tone={t.status === "completed" ? "green" : t.status === "current" ? "blue" : "gray"}>
                      {t.status === "completed" ? "Verified" : t.status === "current" ? "Active Topic" : "Locked"}
                    </Pill>
                  </p>
                  <h4>{t.title}</h4>
                  <span>Domain: {t.domain || "Core CS"}</span>
                  <footer>
                    {t.score !== undefined && t.score !== null ? `Score: ${t.score}%` : "Pending Attempt"}
                    <button>{t.status === "current" ? "Resume" : "Review"} ›</button>
                  </footer>
                </article>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="unit unit-1">
            <header>
              <b>01</b>
              <div>
                <h3>Foundations & Asymptotic Notation</h3>
                <p>Mathematical primitives, recurrence relations, and algorithm complexity verification</p>
              </div>
              <Pill tone="green">Completed • 100%</Pill>
            </header>
            <div className="topic-grid">
              <article className="topic"><p><Pill tone="green">Verified</Pill><small>3.5 hrs</small></p><h4>Big-O & Asymptotic Bounds</h4><span>Worst, average, and best-case analysis</span><footer>1 Quiz Completed<button>Review ›</button></footer></article>
              <article className="topic"><p><Pill tone="green">Verified</Pill><small>2.0 hrs</small></p><h4>Master Theorem</h4><span>Recursive divide-and-conquer recurrences</span><footer>1 Quiz Completed<button>Review ›</button></footer></article>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

// ─── LEADERBOARD PAGE ──────────────────────────────────────────────────────────

export function LeaderboardPage() {
  const { profile } = useProfile();
  const [scope, setScope] = useState("Cohort: CS301");
  const [leaders, setLeaders] = useState<any[]>([]);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const res = await fetchWithAuth("/student/leaderboard");
        if (res.ok) {
          const data = await res.json();
          setLeaders(data);
        }
      } catch (err) {
        console.error("Error loading leaderboard", err);
      }
    }
    loadLeaderboard();
  }, []);

  const top1 = leaders[0] || { name: "Elena Rostova", total_xp: 3420 };
  const top2 = leaders[1] || { name: "Marcus Vance", total_xp: 3210 };
  const top3 = leaders[2] || { name: "Sophia Patel", total_xp: 3090 };

  return (
    <AppShell>
      <div className="page-stack">
        <div className="leader-head">
          <div>
            <small>
              Eval // Benchmarking_Engine <span className="success">● Fall 2024 Verified</span>
            </small>
            <h1>Academic<br />Leaderboard</h1>
          </div>
          <p>Cohort CS301 · Data Structures & Algorithms</p>
          <div className="segmented">
            {["Cohort: CS301", "Department-Wide", "Global Ranking"].map((x) => (
              <button className={scope === x ? "active" : ""} onClick={() => setScope(x)} key={x}>
                {x}
              </button>
            ))}
          </div>
        </div>

        <div className="podium">
          <RankCard rank="#2" tier="Silver Tier" name={top2.name || top2.student_name} score={(top2.total_xp || 3210).toLocaleString()} />
          <RankCard rank="#1" tier="Cohort Laureate" name={top1.name || top1.student_name} score={(top1.total_xp || 3420).toLocaleString()} winner />
          <RankCard rank="#3" tier="Bronze Tier" name={top3.name || top3.student_name} score={(top3.total_xp || 3090).toLocaleString()} />
        </div>

        <div className="leader-grid">
          <Card>
            <div className="section-title">
              <b>Cohort Standings</b>
              <Pill>{leaders.length || 142} Enrolled</Pill>
              <span>● Live Calculation</span>
            </div>
            <div className="table-wrap">
              <table className="ranking">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Scholar</th>
                    <th>XP Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaders.length > 0 ? (
                    leaders.map((s, i) => {
                      const isMe = profile && (s.student_id === profile.id || s.user_id === profile.id || s.name === profile.name);
                      return (
                        <tr key={s.student_id || i} className={isMe ? "you-row" : ""}>
                          <td>#{i + 1}</td>
                          <td>
                            <i>{s.name?.substring(0, 2).toUpperCase() || "ST"}</i>
                            <b>{s.name} {isMe && <Pill>YOU</Pill>}</b>
                          </td>
                          <td><b>{(s.total_xp || 0).toLocaleString()} PTS</b></td>
                          <td className="success">Active</td>
                        </tr>
                      );
                    })
                  ) : (
                    <>
                      <tr className="you-row">
                        <td>#8</td>
                        <td><i>YOU</i><b>Alex Chen <Pill>Top 8%</Pill></b><small>CS-2023-0184</small></td>
                        <td><b>2,840</b></td>
                        <td className="success">Active</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function RankCard({ rank, tier, name, score, winner }: { rank: string; tier: string; name: string; score: string; winner?: boolean }) {
  return (
    <Card className={winner ? "rank-card winner" : "rank-card"}>
      <small>{tier}</small>
      <h3><Pill>{rank}</Pill>{name}</h3>
      <p>UID · CS-2024-Verified</p>
      <footer>Academic Index <strong>{score}</strong> PTS</footer>
      <Progress value={winner ? 98 : 90} />
    </Card>
  );
}

// ─── QUIZ PAGE ─────────────────────────────────────────────────────────────────

export function QuizPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<any | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [difficulty, setDifficulty] = useState("All");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    async function loadQuizzes() {
      try {
        const res = await fetchWithAuth("/student/quizzes");
        if (res.ok) {
          const data = await res.json();
          setQuizzes(data);
        }
      } catch (err) {
        console.error("Error loading quizzes", err);
      }
    }
    loadQuizzes();
  }, []);

  const startQuiz = async (quiz: any) => {
    setSelectedQuiz(quiz);
    setCurrentQ(0);
    setAnswers({});
    setResult(null);

    try {
      const res = await fetchWithAuth(`/student/quiz/${quiz.id}/questions`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (err) {
      console.error("Error loading quiz questions", err);
    }
  };

  const submitExam = async () => {
    if (!selectedQuiz || submitting) return;
    setSubmitting(true);
    try {
      const payloadAnswers: Record<string, string> = {};
      questions.forEach((q, idx) => {
        if (answers[idx] !== undefined) {
          payloadAnswers[q.id] = answers[idx];
        }
      });

      const res = await fetchWithAuth("/student/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quiz_id: selectedQuiz.id, answers: payloadAnswers }),
      });

      if (res.ok) {
        const resData = await res.json();
        setResult(resData);
      } else {
        const errData = await res.json();
        alert(errData.detail || "Submission failed");
      }
    } catch (err: any) {
      alert("Failed to submit quiz: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const q = questions[currentQ];

  return (
    <AppShell>
      <div className="page-stack quiz-page">
        <div className="quiz-stats">
          <Card><small>Active Mastery</small><h2>74.2%</h2><b className="success">+3.8% vs cohort median</b></Card>
          <Card><small>Available Quizzes</small><h2>{quizzes.length || 6}</h2><b>Ready for evaluation</b></Card>
          <Card><small>Academic Velocity</small><h2>1,420</h2><b>Tier A CS Honour Track</b></Card>
        </div>

        {!selectedQuiz ? (
          <Card className="problem-bank">
            <div className="filters">
              <label><Icon>search</Icon><input placeholder="Search quizzes..." /></label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option>All</option>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Topic</th>
                    <th>Domain</th>
                    <th>Questions</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.length > 0 ? (
                    quizzes.map((qz) => (
                      <tr key={qz.id}>
                        <td><b>{qz.topic}</b></td>
                        <td><Pill tone="gray">{qz.domain || "CS"}</Pill></td>
                        <td>{qz.questions?.length || 5} Items</td>
                        <td><Button onClick={() => startQuiz(qz)}>Start Quiz</Button></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td><b>Algorithm Analysis & Complexities</b></td>
                      <td><Pill tone="gray">Algorithms</Pill></td>
                      <td>5 Items</td>
                      <td><Button onClick={() => startQuiz({ id: "mock", topic: "Algorithm Analysis" })}>Start Mock</Button></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        ) : result ? (
          <Card style={{ padding: "24px", textAlign: "center" }}>
            <Icon className="icon-large" style={{ fontSize: "56px", color: "var(--success, #22c55e)" }}>task_alt</Icon>
            <h2>Quiz Submitted Successfully!</h2>
            <p>Score: <b>{result.score}%</b> • XP Earned: <b>+{result.xp_earned} XP</b></p>
            <Button onClick={() => setSelectedQuiz(null)}>Back to Quizzes</Button>
          </Card>
        ) : (
          <Card className="exam">
            <div className="exam-label"><b>● Live Examination Mode</b><Pill tone="green">{selectedQuiz.topic}</Pill></div>
            {questions.length > 0 && q ? (
              <>
                <h2>Question {currentQ + 1} of {questions.length}</h2>
                <Progress value={((currentQ + 1) / questions.length) * 100} />
                <div className="question">
                  <p>{q.text}</p>
                </div>
                <div className="options">
                  {Object.entries(q.options || {}).map(([optKey, optVal]) => (
                    <button
                      key={optKey}
                      className={answers[currentQ] === optKey ? "selected" : ""}
                      onClick={() => setAnswers({ ...answers, [currentQ]: optKey })}
                    >
                      <i>{answers[currentQ] === optKey ? "●" : "○"}</i>
                      <div><b>{optKey}: {String(optVal)}</b></div>
                    </button>
                  ))}
                </div>
                <div className="exam-actions">
                  <Button variant="soft" disabled={currentQ === 0} onClick={() => setCurrentQ(currentQ - 1)}>
                    ← Previous
                  </Button>
                  {currentQ < questions.length - 1 ? (
                    <Button onClick={() => setCurrentQ(currentQ + 1)}>Next Question →</Button>
                  ) : (
                    <Button onClick={submitExam} disabled={submitting}>
                      {submitting ? "Submitting..." : "Submit Quiz"}
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <p>Loading questions...</p>
            )}
          </Card>
        )}
      </div>
    </AppShell>
  );
}

// ─── ASSIGNMENTS PAGE ──────────────────────────────────────────────────────────

export function AssignmentsPage() {
  const { profile } = useProfile();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function loadAssignments() {
      try {
        const res = await fetchWithAuth("/assignments/");
        if (res.ok) {
          const data = await res.json();
          setAssignments(data);
        }
      } catch (err) {
        console.error("Error loading assignments", err);
      }
    }
    loadAssignments();
  }, []);

  const current = assignments[selectedIdx];

  const submitAssignmentFile = async (e: FormEvent) => {
    e.preventDefault();
    if (!current || !file || uploading) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetchWithAuth(`/assignments/${current.id}/submit`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const updatedSub = await res.json();
        setAssignments((prev) =>
          prev.map((a, i) => (i === selectedIdx ? { ...a, my_submission: updatedSub } : a))
        );
        alert("Assignment submitted successfully!");
      } else {
        const errData = await res.json();
        alert(errData.detail || "Submission failed");
      }
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateAssignment = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle || creating) return;
    setCreating(true);
    try {
      const res = await fetchWithAuth("/assignments/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          due_date: newDueDate || undefined,
          class_id: profile?.class_name || "default",
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setAssignments((prev) => [created, ...prev]);
        setNewTitle("");
        setNewDesc("");
        setNewDueDate("");
        alert("Assignment created!");
      }
    } catch (err: any) {
      alert("Failed to create assignment");
    } finally {
      setCreating(false);
    }
  };

  return (
    <AppShell>
      <div className="page-stack">
        <div className="assign-head">
          <div>
            <h1>Course Assignments <Pill>CS301: Data Structures & Algorithms</Pill></h1>
            <p>Academic Term: Fall 2024 • Synchronized with LMS</p>
          </div>
        </div>

        {profile?.role === "teacher" && (
          <Card style={{ padding: "16px", marginBottom: "16px" }}>
            <h3>Create New Assignment</h3>
            <form onSubmit={handleCreateAssignment} style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
              <input type="text" placeholder="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required style={{ flex: "1 1 200px", padding: "8px", borderRadius: "6px", background: "#111", color: "#fff", border: "1px solid #333" }} />
              <input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} style={{ padding: "8px", borderRadius: "6px", background: "#111", color: "#fff", border: "1px solid #333" }} />
              <input type="text" placeholder="Description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} style={{ flex: "2 1 300px", padding: "8px", borderRadius: "6px", background: "#111", color: "#fff", border: "1px solid #333" }} />
              <Button type="submit" disabled={creating}>{creating ? "Creating..." : "Create"}</Button>
            </form>
          </Card>
        )}

        <div className="assignment-layout">
          <div>
            <div className="section-title"><b>Deliverable Queue</b></div>
            {assignments.length > 0 ? (
              assignments.map((d, i) => (
                <button key={d.id || i} onClick={() => setSelectedIdx(i)} className={selectedIdx === i ? "deliverable active" : "deliverable"}>
                  <h3>
                    {d.title}
                    <Pill tone={d.my_submission ? "green" : "red"}>
                      {d.my_submission ? (d.my_submission.grade ? `Graded: ${d.my_submission.grade}` : "Submitted") : "Not Submitted"}
                    </Pill>
                  </h3>
                  <p>{d.description || "Course deliverable"}</p>
                  <footer><b>CS301</b> • {d.due_date || "Upcoming"}</footer>
                </button>
              ))
            ) : (
              <p style={{ padding: "16px", color: "#888" }}>No active assignments.</p>
            )}
          </div>

          {current && (
            <Card className="assignment-detail">
              <div className="focus-box">
                <h1>{current.title}</h1>
                <p>{current.description}</p>
                <div><span>Deadline<b className="danger">{current.due_date || "N/A"}</b></span></div>
              </div>

              {profile?.role === "student" && (
                <form onSubmit={submitAssignmentFile}>
                  <b className="subhead">Student Submission Workbench</b>
                  <label className="dropzone">
                    <Icon>cloud_upload</Icon>
                    <b>Drag and drop your PDF or document</b>
                    <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    {file && <p style={{ color: "#22c55e", marginTop: "8px" }}>Selected: {file.name}</p>}
                  </label>
                  <Button type="submit" disabled={!file || uploading} style={{ marginTop: "12px" }}>
                    <Icon>send</Icon>{uploading ? "Uploading..." : current.my_submission ? "Resubmit Assignment" : "Turn In Assignment"}
                  </Button>
                </form>
              )}

              {current.my_submission && (
                <Card className="blueprint" style={{ marginTop: "16px" }}>
                  <div className="section-title"><b>Submission Status</b></div>
                  <p>Submitted on: {new Date(current.my_submission.submitted_at).toLocaleString()}</p>
                  {current.my_submission.grade && <p style={{ color: "#22c55e", fontSize: "1.1rem" }}>Grade: <b>{current.my_submission.grade}</b></p>}
                  {current.my_submission.feedback && <blockquote><b>Feedback:</b> {current.my_submission.feedback}</blockquote>}
                </Card>
              )}
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
