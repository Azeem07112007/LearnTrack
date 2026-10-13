import { n as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as useNavigate, g as Link, l as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-CLuqIp32.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var supabase = createClient("https://dxpcnjunwfqpjrrdhlem.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4cGNuanVud2ZxcGpycmRobGVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3NzE1OTEsImV4cCI6MjEwMDM0NzU5MX0.45EUkqSGE6NB26vnf3qlyH9RbVmZGNQBt-aLT4rZQxA");
var API_BASE = "http://127.0.0.1:8000";
async function fetchWithAuth(url, options = {}) {
	const { data } = await supabase.auth.getSession();
	const token = data.session?.access_token;
	const headers = new Headers(options.headers || {});
	if (token) headers.set("Authorization", `Bearer ${token}`);
	const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
	return await fetch(fullUrl, {
		...options,
		headers
	});
}
var defaultAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuD8OHIUaLFyx5a_UGtpvZDgU_1Vg1GDdEqApH6F8-I848GwMUDlX0ZnWIis3ubel1IgWVlxEINc7aEh5tAC6v3_dMpb3BXusf9U6_NXAkS9OSa-YRAfLvtluCaHFx2H9U0Py360eZ2EGApk43Cq2uh4-kWBlmzihDU_2dBELKJzUhO3rEo3ZJPhsceN6JOQRtKIgsslyVEZ_H9Q-0_9N5sx77llhYYqqsjzklPwtF62LZLnj1jQ_P-0Jg";
var nav = [
	[
		"/",
		"dashboard",
		"Dashboard"
	],
	[
		"/quiz",
		"quiz",
		"Quiz"
	],
	[
		"/map",
		"account_tree",
		"Map"
	],
	[
		"/leaderboard",
		"leaderboard",
		"Leaderboard"
	],
	[
		"/assignments",
		"assignment",
		"Assignments"
	]
];
var ProfileContext = (0, import_react.createContext)({
	profile: null,
	loading: true,
	logout: async () => {}
});
function useProfile() {
	return (0, import_react.useContext)(ProfileContext);
}
function Icon({ children, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `material-symbols-outlined ${className}`,
		"aria-hidden": "true",
		children
	});
}
function Button({ children, variant = "primary", className = "", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		className: `btn btn-${variant} ${className}`,
		...props,
		children
	});
}
function Pill({ children, tone = "blue" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `pill pill-${tone}`,
		children
	});
}
function Card({ children, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: `card ${className}`,
		children
	});
}
function Progress({ value, tone = "blue" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "progress",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
			className: `progress-${tone}`,
			style: { width: `${Math.min(100, Math.max(0, value))}%` }
		})
	});
}
function AppShell({ children }) {
	const path = useRouterState({ select: (s) => s.location.pathname });
	const navigate = useNavigate();
	const [profile, setProfile] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		let mounted = true;
		async function loadUser() {
			try {
				const { data } = await supabase.auth.getSession();
				if (!data?.session) {
					if (mounted) {
						setProfile(null);
						setLoading(false);
						if (path !== "/login" && path !== "/signup") navigate({ to: "/login" });
					}
					return;
				}
				const res = await fetchWithAuth("/me");
				if (res.ok) {
					const userProfile = await res.json();
					if (mounted) setProfile(userProfile);
				} else if (mounted) setProfile(null);
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
	const userSubDisplay = isTeacher ? profile?.school_name || "Faculty" : profile?.class_name || profile?.school_name || "Computer Science BSc";
	const avatarUrl = profile?.avatar || defaultAvatar;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileContext.Provider, {
		value: {
			profile,
			loading,
			logout
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "app-shell",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "sidebar",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "brand",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "brand-mark",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { children: "menu_book" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "LearnTrack" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "side-kicker",
							children: "Academic Workspace"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							className: "side-nav",
							children: nav.map(([to, icon, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to,
								className: path === to ? "active" : "",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { children: icon }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label })]
							}, to))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: `tutor-link ${path === "/study-guide" ? "active" : ""}`,
							onClick: () => navigate({ to: "/study-guide" }),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { children: "psychology" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Study Guide (AI Tutor)" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "profile-mini",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: avatarUrl,
									alt: userNameDisplay
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: userNameDisplay }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: userSubDisplay })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
									tone: isTeacher ? "green" : "blue",
									children: userRoleDisplay
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "settings-link",
							onClick: logout,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { children: "logout" }),
								"Sign Out ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "v2.4" })
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "workspace",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "topbar",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "search",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { children: "search" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									"aria-label": "Search",
									placeholder: "Search modules, topics, code..."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "soft",
								className: "term",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { children: "calendar_today" }),
									" Fall 2024 ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { children: "expand_more" })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "role-switch",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: !isTeacher ? "active" : "",
									style: { cursor: "default" },
									children: "Student"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: isTeacher ? "active" : "",
									style: { cursor: "default" },
									children: "Teacher"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								"aria-label": "Notifications",
								className: "icon-btn",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { children: "notifications" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								className: "top-avatar",
								src: avatarUrl,
								alt: userNameDisplay
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
						className: "content",
						children
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "mobile-nav",
					children: nav.map(([to, icon, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to,
						className: path === to ? "active" : "",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { children: icon }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label })]
					}, to))
				})
			]
		})
	});
}
function DashboardPage() {
	const navigate = useNavigate();
	const [dashboardData, setDashboardData] = (0, import_react.useState)(null);
	const [activities, setActivities] = (0, import_react.useState)([]);
	const [assignments, setAssignments] = (0, import_react.useState)([]);
	const [chatThreads, setChatThreads] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		async function loadData() {
			try {
				const [dashRes, actRes, assRes, chatRes] = await Promise.all([
					fetchWithAuth("/student/dashboard"),
					fetchWithAuth("/student/activity"),
					fetchWithAuth("/assignments/"),
					fetchWithAuth("/student/study-guide/history")
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
	const userQuestions = chatThreads.filter((m) => m.role === "user").slice(-3).reverse();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "page-stack dashboard-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "welcome",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", { children: ["Welcome back, Alex ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { children: "Term 3 • Computer Science BSc" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { children: "schedule" }), " Last active session: Today at 09:42 AM • Session IP: 142.250.190.46 (Campus Network)"] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "soft",
					onClick: () => navigate({ to: "/assignments" }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { children: "history" }), " Activity Log"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => navigate({ to: "/quiz" }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { children: "play_arrow" }), " Resume Current Module"]
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "stat-grid",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						title: "Cumulative Score & Standing",
						icon: "military_tech",
						value: totalXp.toLocaleString(),
						aside: "+120 this wk",
						detail: "Top 8% in Cohort (Rank #34 / 420)",
						progress: 92
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						title: "Evaluations Completed",
						icon: "fact_check",
						value: `${activities.length} / 18`,
						aside: "78% Mastery",
						detail: `${18 - activities.length} assessments pending final review`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						title: "Assignments Workload",
						icon: "notification_important",
						value: `${pendingAssignments.length} Due`,
						aside: "Action Required",
						detail: "Estimated effort: 6.5 hours remaining",
						tone: pendingAssignments.length > 0 ? "red" : "blue"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						title: "Consistency Streak",
						icon: "bolt",
						value: `${streak} Days`,
						aside: "Personal Best: 24",
						detail: "30-day commit & revision record",
						tone: "green",
						dots: true
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "dashboard-grid",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "page-stack",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "recommend",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "feature-icon",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { children: "hub" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { children: "Recommended Practice" }),
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
											tone: "gray",
											children: "Module 4.2"
										}),
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
											tone: "gray",
											children: "45 XP Pts"
										})
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Graph Theory: Dijkstra & Bellman-Ford Shortest Path" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Reinforce single-source shortest path guarantees, negative weight cycle detection, and asymptotic runtime comparisons." }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "◷ 25 mins estimated　 theoretical difficulty: Medium　 38 classmates solved" })
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: () => navigate({ to: "/quiz" }),
									children: ["Solve Problem ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { children: "arrow_forward" })]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, {
								icon: "history_edu",
								title: "Recent Evaluation Records",
								action: "View Complete Transcript"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "table-wrap",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Evaluation title" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Course code" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Score" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Time spent" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Completed" })
								] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: activities.length > 0 ? activities.map((act, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
										className: act.score < 70 ? "warn" : "ok",
										children: act.score < 70 ? "error_outline" : "check_circle"
									}), act.quizzes?.topic || "Quiz Evaluation"] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: act.quizzes?.domain || "CS301" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: act.score >= 70 ? "success" : "",
										children: [act.score, "%"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "25m 10s" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: new Date(act.attempted_at).toLocaleDateString() })
								] }, i)) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
											className: "ok",
											children: "check_circle"
										}), "Red-Black Trees & AVL Rotations"] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "CS301" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "success",
											children: "94%"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "28m 12s" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "Yesterday" })
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
											className: "ok",
											children: "check_circle"
										}), "Relational Algebra & Tuple Calculus"] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "CS305" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "success",
											children: "88%"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "35m 40s" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "Oct 24" })
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
											className: "ok",
											children: "check_circle"
										}), "TCP Congestion Control & Reno Dynamics"] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "CS310" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "success",
											children: "96%"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "19m 04s" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "Oct 22" })
									] })
								] }) })] })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "card-foot",
								children: [
									"Showing ",
									activities.length || 5,
									" of 18 completed quizzes ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Cohort Median: 81.4%" })
								]
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, {
							icon: "bar_chart",
							title: "Weekly Topic Mastery Distribution",
							action: "Cohort Normalized"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mastery-row",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mastery, {
									label: "Data Structures",
									val: 96,
									note: "+14% vs Cohort Median"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mastery, {
									label: "Databases & Storage",
									val: 84,
									note: "+5% vs Cohort Median"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mastery, {
									label: "Systems Architecture",
									val: 68,
									note: "−4% Needs Review"
								})
							]
						})] })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "page-stack side-column",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, {
								icon: "calendar_clock",
								title: "Deadlines & Milestones",
								action: `${assignments.length} Active`
							}),
							assignments.slice(0, 3).map((ass) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Deadline, {
								badge: ass.my_submission ? "Submitted" : "Urgent",
								title: ass.title,
								code: "CS301",
								date: ass.due_date || "Upcoming"
							}, ass.id)),
							assignments.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Deadline, {
								badge: "Urgent • 48 hrs",
								title: "Algorithm Analysis Problem Set 4",
								code: "CS301",
								date: "Oct 28, 23:59 EST"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Deadline, {
								badge: "Upcoming",
								title: "DB Systems: Schema Normalization & BCNF",
								code: "CS305",
								date: "Nov 01, 18:00 EST"
							})] })
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, {
								icon: "psychology",
								title: "AI Study Tutor Threads",
								action: "+ New Chat"
							}),
							userQuestions.length > 0 ? userQuestions.map((msg, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "thread",
								onClick: () => navigate({ to: "/study-guide" }),
								style: { cursor: "pointer" },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "feature-icon",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { children: [
										"terminal",
										"data_object",
										"memory"
									][i % 3] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: ["Thread ", i + 1] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
										"“",
										msg.content,
										"”"
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: new Date(msg.created_at || Date.now()).toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit"
									}) })
								] })]
							}, msg.id || i)) : [
								"Dissecting Dijkstra vs Bellman-Ford",
								"SQL Indexing: B-Trees vs Hash Tables",
								"Virtual Memory & Page Replacement"
							].map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "thread",
								onClick: () => navigate({ to: "/study-guide" }),
								style: { cursor: "pointer" },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "feature-icon",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { children: [
										"terminal",
										"data_object",
										"memory"
									][i] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: x }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
										"“",
										i ? "Why are clustered indexes preferred for range queries?" : "Explain why Bellman-Ford runs in O(V*E)...",
										"”"
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
										i ? "Yesterday" : "2 hours ago",
										" • ",
										8 + i * 6,
										" exchanges"
									] })
								] })]
							}, x)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "online",
								children: ["● Tutor Model: CS-Academic-Llama-70B ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Online" })]
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHead, {
								title: "Curriculum Mastery Node",
								action: "Interactive Map"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "node",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "G" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Graphs & Network Flows" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Prerequisite for Advanced Algorithms" })] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "card-foot",
								children: ["Mastered: 8 / 12 Concepts ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "success",
									children: "66% Completed"
								})]
							})
						] })
					]
				})]
			})
		]
	}) });
}
function Stat({ title, icon, value, aside, detail, progress, tone = "blue", dots }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "stat",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "stat-title",
				children: [title, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { children: icon })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "stat-value",
				children: [
					value,
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
						tone: tone === "red" ? "red" : tone === "green" ? "green" : "blue",
						children: aside
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: detail }),
			progress && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: ["Tier Progress ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [progress, "% to Master"] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, { value: progress })] }),
			dots && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "streak-dots",
				children: Array.from({ length: 21 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: i < 17 ? "filled" : "" }, i))
			})
		]
	});
}
function SectionHead({ icon, title, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "section-head",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: [icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { children: icon }), title] }), action && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { children: [action, " ›"] })]
	});
}
function Mastery({ label, val, note }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
			label,
			" ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [val, "% Mastery"] })
		] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, { value: val }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: note })
	] });
}
function Deadline({ badge, title, code, date }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "deadline",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
				tone: badge.startsWith("Urgent") ? "red" : "blue",
				children: badge
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: code })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: title }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "NP-Completeness reductions and dynamic programming memoization proofs." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", { children: [date, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { children: "Open" })] })
		]
	});
}
//#endregion
export { supabase as a, fetchWithAuth as i, AppShell as n, useProfile as o, DashboardPage as r, API_BASE as t };
