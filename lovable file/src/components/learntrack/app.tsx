import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, createContext, useContext, type ReactNode } from "react";
import { supabase } from "../../lib/supabase";
import { fetchWithAuth } from "../../lib/api";

const defaultAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuD8OHIUaLFyx5a_UGtpvZDgU_1Vg1GDdEqApH6F8-I848GwMUDlX0ZnWIis3ubel1IgWVlxEINc7aEh5tAC6v3_dMpb3BXusf9U6_NXAkS9OSa-YRAfLvtluCaHFx2H9U0Py360eZ2EGApk43Cq2uh4-kWBlmzihDU_2dBELKJzUhO3rEo3ZJPhsceN6JOQRtKIgsslyVEZ_H9Q-0_9N5sx77llhYYqqsjzklPwtF62LZLnj1jQ_P-0Jg";

const nav = [
  ["/", "dashboard", "Dashboard"],
  ["/quiz", "quiz", "Quiz"],
  ["/map", "account_tree", "Map"],
  ["/leaderboard", "leaderboard", "Leaderboard"],
  ["/assignments", "assignment", "Assignments"],
] as const;

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher";
  school_name?: string;
  class_name?: string;
  avatar?: string;
}

const ProfileContext = createContext<{
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}>({
  profile: null,
  loading: true,
  logout: async () => {},
});

export function useProfile() {
  return useContext(ProfileContext);
}

function Icon({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`} aria-hidden="true">{children}</span>;
}

function Button({ children, variant = "primary", className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "soft" | "ghost" }) {
  return <button className={`btn btn-${variant} ${className}`} {...props}>{children}</button>;
}

function Pill({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "green" | "red" | "amber" | "gray" }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>;
}

function Progress({ value, tone = "blue" }: { value: number; tone?: "blue" | "green" | "ink" }) {
  return <div className="progress"><i className={`progress-${tone}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadUser() {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data?.session) {
          if (mounted) {
            setProfile(null);
            setLoading(false);
            if (path !== "/login" && path !== "/signup") {
              navigate({ to: "/login" });
            }
          }
          return;
        }

        const res = await fetchWithAuth("/me");
        if (res.ok) {
          const userProfile = await res.json();
          if (mounted) setProfile(userProfile);
        } else {
          if (mounted) setProfile(null);
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && path !== "/login" && path !== "/signup") {
        setProfile(null);
        navigate({ to: "/login" });
      }
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, [path, navigate]);

  const logout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    navigate({ to: "/login" });
  };

  const isTeacher = profile?.role === "teacher";
  const userRoleDisplay = isTeacher ? "Teacher" : "Student";
  const userNameDisplay = profile?.name || "Alex Chen";
  const userSubDisplay = isTeacher
    ? (profile?.school_name || "Faculty")
    : (profile?.class_name || profile?.school_name || "Computer Science BSc");
  const avatarUrl = profile?.avatar || defaultAvatar;

  return (
    <ProfileContext.Provider value={{ profile, loading, logout }}>
      <div className="app-shell">
        <aside className="sidebar">
          <Link to="/" className="brand">
            <span className="brand-mark"><Icon>menu_book</Icon></span>
            <strong>LearnTrack</strong>
          </Link>
          <p className="side-kicker">Academic Workspace</p>

          <nav className="side-nav">
            {nav.map(([to, icon, label]) => (
              <Link key={to} to={to} className={path === to ? "active" : ""}>
                <Icon>{icon}</Icon>
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          <button className={`tutor-link ${path === "/study-guide" ? "active" : ""}`} onClick={() => navigate({ to: "/study-guide" })}>
            <Icon>psychology</Icon>
            <span>Study Guide (AI Tutor)</span>
          </button>

          <div className="profile-mini">
            <img src={avatarUrl} alt={userNameDisplay} />
            <div>
              <b>{userNameDisplay}</b>
              <small>{userSubDisplay}</small>
            </div>
            <Pill tone={isTeacher ? "green" : "blue"}>{userRoleDisplay}</Pill>
          </div>

          <button className="settings-link" onClick={logout}>
            <Icon>logout</Icon>Sign Out <small>v2.4</small>
          </button>
        </aside>

        <div className="workspace">
          <header className="topbar">
            <label className="search">
              <Icon>search</Icon>
              <input aria-label="Search" placeholder="Search modules, topics, code..." />
            </label>
            <Button variant="soft" className="term">
              <Icon>calendar_today</Icon> Fall 2024 <Icon>expand_more</Icon>
            </Button>
            <div className="role-switch">
              <button className={!isTeacher ? "active" : ""} style={{ cursor: "default" }}>Student</button>
              <button className={isTeacher ? "active" : ""} style={{ cursor: "default" }}>Teacher</button>
            </div>
            <Button variant="ghost" aria-label="Notifications" className="icon-btn">
              <Icon>notifications</Icon>
              <i />
            </Button>
            <img className="top-avatar" src={avatarUrl} alt={userNameDisplay} />
          </header>

          <main className="content">{children}</main>
        </div>

        <nav className="mobile-nav">
          {nav.map(([to, icon, label]) => (
            <Link key={to} to={to} className={path === to ? "active" : ""}>
              <Icon>{icon}</Icon>
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </ProfileContext.Provider>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<{
    total_xp: number;
    streak: number;
    badges: any[];
  } | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [chatThreads, setChatThreads] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [dashRes, actRes, assRes, chatRes] = await Promise.all([
          fetchWithAuth("/student/dashboard"),
          fetchWithAuth("/student/activity"),
          fetchWithAuth("/assignments/"),
          fetchWithAuth("/student/study-guide/history"),
        ]);

        if (dashRes.ok) setDashboardData(await dashRes.json());
        if (actRes.ok) setActivities(await actRes.json());
        if (assRes.ok) setAssignments(await assRes.json());
        if (chatRes.ok) {
          const chatData = await chatRes.json();
          setChatThreads(chatData.messages || []);
        }
      } catch (err) {
        console.error("Failed loading dashboard data", err);
      }
    }
    loadData();
  }, []);

  const totalXp = dashboardData?.total_xp ?? 2840;
  const streak = dashboardData?.streak ?? 19;
  const pendingAssignments = assignments.filter((a) => !a.my_submission);

  // Extract recent user questions for threads sidebar
  const userQuestions = chatThreads
    .filter((m) => m.role === "user")
    .slice(-3)
    .reverse();

  return (
    <AppShell>
      <div className="page-stack dashboard-page">
        <Card className="welcome">
          <div>
            <h1>
              Welcome back, Alex <Pill>Term 3 • Computer Science BSc</Pill>
            </h1>
            <p>
              <Icon>schedule</Icon> Last active session: Today at 09:42 AM • Session IP: 142.250.190.46 (Campus Network)
            </p>
          </div>
          <div>
            <Button variant="soft" onClick={() => navigate({ to: "/assignments" })}>
              <Icon>history</Icon> Activity Log
            </Button>
            <Button onClick={() => navigate({ to: "/quiz" })}>
              <Icon>play_arrow</Icon> Resume Current Module
            </Button>
          </div>
        </Card>

        <div className="stat-grid">
          <Stat
            title="Cumulative Score & Standing"
            icon="military_tech"
            value={totalXp.toLocaleString()}
            aside="+120 this wk"
            detail="Top 8% in Cohort (Rank #34 / 420)"
            progress={92}
          />
          <Stat
            title="Evaluations Completed"
            icon="fact_check"
            value={`${activities.length} / 18`}
            aside="78% Mastery"
            detail={`${18 - activities.length} assessments pending final review`}
          />
          <Stat
            title="Assignments Workload"
            icon="notification_important"
            value={`${pendingAssignments.length} Due`}
            aside="Action Required"
            detail="Estimated effort: 6.5 hours remaining"
            tone={pendingAssignments.length > 0 ? "red" : "blue"}
          />
          <Stat
            title="Consistency Streak"
            icon="bolt"
            value={`${streak} Days`}
            aside="Personal Best: 24"
            detail="30-day commit & revision record"
            tone="green"
            dots
          />
        </div>

        <div className="dashboard-grid">
          <div className="page-stack">
            <Card className="recommend">
              <div className="feature-icon"><Icon>hub</Icon></div>
              <div>
                <p>
                  <Pill>Recommended Practice</Pill> <Pill tone="gray">Module 4.2</Pill> <Pill tone="gray">45 XP Pts</Pill>
                </p>
                <h2>Graph Theory: Dijkstra & Bellman-Ford Shortest Path</h2>
                <p>Reinforce single-source shortest path guarantees, negative weight cycle detection, and asymptotic runtime comparisons.</p>
                <small>◷ 25 mins estimated　 theoretical difficulty: Medium　 38 classmates solved</small>
              </div>
              <Button onClick={() => navigate({ to: "/quiz" })}>
                Solve Problem <Icon>arrow_forward</Icon>
              </Button>
            </Card>

            <Card>
              <SectionHead icon="history_edu" title="Recent Evaluation Records" action="View Complete Transcript" />
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Evaluation title</th>
                      <th>Course code</th>
                      <th>Score</th>
                      <th>Time spent</th>
                      <th>Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.length > 0 ? (
                      activities.map((act, i) => (
                        <tr key={i}>
                          <td>
                            <Icon className={act.score < 70 ? "warn" : "ok"}>
                              {act.score < 70 ? "error_outline" : "check_circle"}
                            </Icon>
                            {act.quizzes?.topic || "Quiz Evaluation"}
                          </td>
                          <td>{act.quizzes?.domain || "CS301"}</td>
                          <td className={act.score >= 70 ? "success" : ""}>{act.score}%</td>
                          <td>25m 10s</td>
                          <td>{new Date(act.attempted_at).toLocaleDateString()}</td>
                        </tr>
                      ))
                    ) : (
                      <>
                        <tr>
                          <td><Icon className="ok">check_circle</Icon>Red-Black Trees & AVL Rotations</td>
                          <td>CS301</td><td className="success">94%</td><td>28m 12s</td><td>Yesterday</td>
                        </tr>
                        <tr>
                          <td><Icon className="ok">check_circle</Icon>Relational Algebra & Tuple Calculus</td>
                          <td>CS305</td><td className="success">88%</td><td>35m 40s</td><td>Oct 24</td>
                        </tr>
                        <tr>
                          <td><Icon className="ok">check_circle</Icon>TCP Congestion Control & Reno Dynamics</td>
                          <td>CS310</td><td className="success">96%</td><td>19m 04s</td><td>Oct 22</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="card-foot">
                Showing {activities.length || 5} of 18 completed quizzes <span>Cohort Median: 81.4%</span>
              </div>
            </Card>

            <Card>
              <SectionHead icon="bar_chart" title="Weekly Topic Mastery Distribution" action="Cohort Normalized" />
              <div className="mastery-row">
                <Mastery label="Data Structures" val={96} note="+14% vs Cohort Median" />
                <Mastery label="Databases & Storage" val={84} note="+5% vs Cohort Median" />
                <Mastery label="Systems Architecture" val={68} note="−4% Needs Review" />
              </div>
            </Card>
          </div>

          <div className="page-stack side-column">
            <Card>
              <SectionHead icon="calendar_clock" title="Deadlines & Milestones" action={`${assignments.length} Active`} />
              {assignments.slice(0, 3).map((ass) => (
                <Deadline
                  key={ass.id}
                  badge={ass.my_submission ? "Submitted" : "Urgent"}
                  title={ass.title}
                  code="CS301"
                  date={ass.due_date || "Upcoming"}
                />
              ))}
              {assignments.length === 0 && (
                <>
                  <Deadline badge="Urgent • 48 hrs" title="Algorithm Analysis Problem Set 4" code="CS301" date="Oct 28, 23:59 EST" />
                  <Deadline badge="Upcoming" title="DB Systems: Schema Normalization & BCNF" code="CS305" date="Nov 01, 18:00 EST" />
                </>
              )}
            </Card>

            <Card>
              <SectionHead icon="psychology" title="AI Study Tutor Threads" action="+ New Chat" />
              {userQuestions.length > 0 ? (
                userQuestions.map((msg, i) => (
                  <div className="thread" key={msg.id || i} onClick={() => navigate({ to: "/study-guide" })} style={{ cursor: "pointer" }}>
                    <span className="feature-icon"><Icon>{["terminal", "data_object", "memory"][i % 3]}</Icon></span>
                    <div>
                      <b>Thread {i + 1}</b>
                      <p>“{msg.content}”</p>
                      <small>{new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                    </div>
                  </div>
                ))
              ) : (
                ["Dissecting Dijkstra vs Bellman-Ford", "SQL Indexing: B-Trees vs Hash Tables", "Virtual Memory & Page Replacement"].map((x, i) => (
                  <div className="thread" key={x} onClick={() => navigate({ to: "/study-guide" })} style={{ cursor: "pointer" }}>
                    <span className="feature-icon"><Icon>{["terminal", "data_object", "memory"][i]}</Icon></span>
                    <div>
                      <b>{x}</b>
                      <p>“{i ? "Why are clustered indexes preferred for range queries?" : "Explain why Bellman-Ford runs in O(V*E)..."}”</p>
                      <small>{i ? "Yesterday" : "2 hours ago"} • {8 + i * 6} exchanges</small>
                    </div>
                  </div>
                ))
              )}
              <div className="online">● Tutor Model: CS-Academic-Llama-70B <span>Online</span></div>
            </Card>

            <Card>
              <SectionHead title="Curriculum Mastery Node" action="Interactive Map" />
              <div className="node">
                <b>G</b>
                <div>
                  <strong>Graphs & Network Flows</strong>
                  <p>Prerequisite for Advanced Algorithms</p>
                </div>
              </div>
              <div className="card-foot">
                Mastered: 8 / 12 Concepts <span className="success">66% Completed</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ title, icon, value, aside, detail, progress, tone = "blue", dots }: { title: string; icon: string; value: string; aside: string; detail: string; progress?: number; tone?: string; dots?: boolean }) {
  return (
    <Card className="stat">
      <div className="stat-title">{title}<Icon>{icon}</Icon></div>
      <div className="stat-value">{value} <Pill tone={tone === "red" ? "red" : tone === "green" ? "green" : "blue"}>{aside}</Pill></div>
      <p>{detail}</p>
      {progress && (
        <>
          <small>Tier Progress <b>{progress}% to Master</b></small>
          <Progress value={progress} />
        </>
      )}
      {dots && (
        <div className="streak-dots">
          {Array.from({ length: 21 }, (_, i) => (
            <i key={i} className={i < 17 ? "filled" : ""} />
          ))}
        </div>
      )}
    </Card>
  );
}

function SectionHead({ icon, title, action }: { icon?: string; title: string; action?: string }) {
  return (
    <div className="section-head">
      <h3>{icon && <Icon>{icon}</Icon>}{title}</h3>
      {action && <button>{action} ›</button>}
    </div>
  );
}

function Mastery({ label, val, note }: { label: string; val: number; note: string }) {
  return (
    <div>
      <b>{label} <span>{val}% Mastery</span></b>
      <Progress value={val} />
      <small>{note}</small>
    </div>
  );
}

function Deadline({ badge, title, code, date }: { badge: string; title: string; code: string; date: string }) {
  return (
    <div className="deadline">
      <p>
        <Pill tone={badge.startsWith("Urgent") ? "red" : "blue"}>{badge}</Pill>
        <small>{code}</small>
      </p>
      <b>{title}</b>
      <span>NP-Completeness reductions and dynamic programming memoization proofs.</span>
      <footer>{date}<a>Open</a></footer>
    </div>
  );
}
