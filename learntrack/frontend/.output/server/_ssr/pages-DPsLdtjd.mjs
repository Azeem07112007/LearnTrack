import { n as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as supabase, i as fetchWithAuth, n as AppShell, o as useProfile, t as API_BASE } from "./app-CLuqIp32.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pages-DPsLdtjd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Icon({ children, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `material-symbols-outlined ${className}`,
		"aria-hidden": "true",
		children
	});
}
function Button({ children, variant = "primary", className = "", ...p }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		className: `btn btn-${variant} ${className}`,
		...p,
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
function Progress({ value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "progress",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { width: `${Math.min(100, Math.max(0, value))}%` } })
	});
}
function LoginPage() {
	const navigate = useNavigate();
	const [show, setShow] = (0, import_react.useState)(false);
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const submit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			const { data, error: authErr } = await supabase.auth.signInWithPassword({
				email,
				password
			});
			if (authErr) throw authErr;
			if (data.session) navigate({ to: "/" });
		} catch (err) {
			setError(err.message || "Failed to sign in. Please check credentials.");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "login-page",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "login-card",
			onSubmit: submit,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "brand-mark",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { children: "menu_book" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "LearnTrack" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Sign in to your academic portal" }),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						padding: "8px 12px",
						background: "#f8717122",
						color: "#f87171",
						borderRadius: "6px",
						fontSize: "0.85rem",
						marginBottom: "12px"
					},
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["University Email", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "email",
					value: email,
					onChange: (e) => setEmail(e.target.value),
					placeholder: "alex.chen@university.edu",
					required: true
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
					"Password ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setError("Contact system administrator to reset password."),
						children: "Forgot password?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "password",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: show ? "text" : "password",
							value: password,
							onChange: (e) => setPassword(e.target.value),
							placeholder: "••••••••",
							required: true
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Show password",
							onClick: () => setShow(!show),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { children: show ? "visibility_off" : "visibility" })
						})]
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "remember",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						defaultChecked: true
					}), " Remember device for 30 days"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: loading,
					children: loading ? "Signing in..." : "Sign in"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "divider",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Or authenticate via" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "soft",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { children: "account_balance" }), "Campus Single Sign-On (SSO)"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "signup",
					children: ["Don't have an institutional account? ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/signup",
						children: "Sign up with university credentials"
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "● Identity Provider Active" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { children: "Security Policy" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "•" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { children: "IT Help Desk" })
		] })]
	});
}
function SignupPage() {
	const navigate = useNavigate();
	const [step, setStep] = (0, import_react.useState)("account");
	const [role, setRole] = (0, import_react.useState)("student");
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [schoolName, setSchoolName] = (0, import_react.useState)("");
	const [schoolFound, setSchoolFound] = (0, import_react.useState)(null);
	const [classes, setClasses] = (0, import_react.useState)([]);
	const [classId, setClassId] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [accessToken, setAccessToken] = (0, import_react.useState)(null);
	const createAccount = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			const { data, error: signUpErr } = await supabase.auth.signUp({
				email,
				password
			});
			if (signUpErr) throw signUpErr;
			let token = data.session?.access_token;
			if (!token) {
				const signInRes = await supabase.auth.signInWithPassword({
					email,
					password
				});
				if (signInRes.error) throw signInRes.error;
				token = signInRes.data.session?.access_token;
			}
			if (!token) throw new Error("Could not create session. Please try logging in.");
			setAccessToken(token);
			const checkData = await (await fetch(`${API_BASE}/auth/school-check`, { headers: { Authorization: `Bearer ${token}` } })).json();
			setSchoolFound(checkData.school);
			if (role === "teacher") setStep("teacher-school");
			else {
				if (!checkData.school) {
					setError("No school is registered for this email domain yet. Ask a teacher to sign up first.");
					setLoading(false);
					return;
				}
				const clsData = await (await fetch(`${API_BASE}/auth/classes-for-signup`, { headers: { Authorization: `Bearer ${token}` } })).json();
				setClasses(clsData);
				setStep("student-setup");
			}
		} catch (err) {
			setError(err.message || "Signup failed");
		} finally {
			setLoading(false);
		}
	};
	const finishTeacher = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			const res = await fetch(`${API_BASE}/auth/signup/teacher`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					name,
					school_name: schoolFound ? void 0 : schoolName
				})
			});
			if (!res.ok) {
				const errData = await res.json();
				throw new Error(errData.detail || "Teacher signup failed");
			}
			navigate({ to: "/" });
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};
	const finishStudent = async (e) => {
		e.preventDefault();
		setError("");
		if (!classId) return setError("Please select a class.");
		setLoading(true);
		try {
			const res = await fetch(`${API_BASE}/auth/signup/student`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					name,
					class_id: classId,
					domains: []
				})
			});
			if (!res.ok) {
				const errData = await res.json();
				throw new Error(errData.detail || "Student signup failed");
			}
			navigate({ to: "/" });
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "login-page",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "login-card",
			style: {
				maxWidth: "440px",
				width: "100%"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "brand-mark",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { children: "menu_book" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Join LearnTrack" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Create your academic account" }),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						padding: "8px 12px",
						background: "#f8717122",
						color: "#f87171",
						borderRadius: "6px",
						fontSize: "0.85rem",
						marginBottom: "12px"
					},
					children: error
				}),
				step === "account" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: createAccount,
					style: {
						display: "flex",
						flexDirection: "column",
						gap: "12px"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "role-switch",
							style: {
								width: "100%",
								margin: "4px 0"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: role === "student" ? "active" : "",
								onClick: () => setRole("student"),
								children: "Student"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: role === "teacher" ? "active" : "",
								onClick: () => setRole("teacher"),
								children: "Teacher"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Full Name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							value: name,
							onChange: (e) => setName(e.target.value),
							placeholder: "Jane Smith",
							required: true
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Institutional Email", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "email",
							value: email,
							onChange: (e) => setEmail(e.target.value),
							placeholder: "jane@university.edu",
							required: true
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Password", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "password",
							value: password,
							onChange: (e) => setPassword(e.target.value),
							placeholder: "••••••••",
							required: true
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: loading,
							children: loading ? "Processing..." : "Next Step →"
						})
					]
				}),
				step === "teacher-school" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: finishTeacher,
					style: {
						display: "flex",
						flexDirection: "column",
						gap: "12px"
					},
					children: [schoolFound ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						style: { fontSize: "0.9rem" },
						children: ["Associated School: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: schoolFound.name })]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["School / Institution Name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "text",
						value: schoolName,
						onChange: (e) => setSchoolName(e.target.value),
						placeholder: "Department of Computer Science",
						required: true
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: loading,
						children: loading ? "Completing Registration..." : "Complete Setup"
					})]
				}),
				step === "student-setup" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: finishStudent,
					style: {
						display: "flex",
						flexDirection: "column",
						gap: "12px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Select Your Class", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: classId,
						onChange: (e) => setClassId(e.target.value),
						required: true,
						style: {
							width: "100%",
							padding: "10px",
							borderRadius: "6px",
							background: "var(--card-bg, #1a1a1a)",
							color: "#fff",
							border: "1px solid #333"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "-- Choose Class --"
						}), classes.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: c.id,
							children: c.name
						}, c.id))]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: loading,
						children: loading ? "Joining Class..." : "Join Class & Complete"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "signup",
					style: { marginTop: "16px" },
					children: ["Already have an account? ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/login",
						children: "Sign in here"
					})]
				})
			]
		})
	});
}
function StudyGuidePage() {
	const [messages, setMessages] = (0, import_react.useState)([]);
	const [input, setInput] = (0, import_react.useState)("");
	const [remaining, setRemaining] = (0, import_react.useState)(20);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
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
	const handleSend = async (e) => {
		e.preventDefault();
		if (!input.trim() || loading) return;
		const promptText = input.trim();
		setInput("");
		setError("");
		const userMsg = {
			id: Date.now().toString(),
			role: "user",
			content: promptText,
			created_at: (/* @__PURE__ */ new Date()).toISOString()
		};
		setMessages((prev) => [...prev, userMsg]);
		setLoading(true);
		try {
			const res = await fetchWithAuth("/student/study-guide/ask", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ question: promptText })
			});
			if (res.status === 429) {
				const data = await res.json();
				throw new Error(data.detail || "Daily question limit reached.");
			}
			if (!res.ok) throw new Error("Failed to generate response.");
			const data = await res.json();
			const botMsg = {
				id: (Date.now() + 1).toString(),
				role: "assistant",
				content: data.answer,
				created_at: (/* @__PURE__ */ new Date()).toISOString()
			};
			setMessages((prev) => [...prev, botMsg]);
			if (typeof data.remaining === "number") setRemaining(data.remaining);
		} catch (err) {
			setError(err.message || "Failed to send message.");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "page-stack",
		style: {
			maxWidth: "960px",
			margin: "0 auto"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "welcome",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", { children: ["Study Guide — AI Academic Tutor ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pill, {
					tone: "green",
					children: [remaining, " Questions Left Today"]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { children: "psychology" }), " Powered by CS-Academic-Llama-70B • Contextual academic Q&A"] })] })
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					padding: "10px 14px",
					background: "#f8717122",
					color: "#f87171",
					borderRadius: "8px"
				},
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				style: {
					display: "flex",
					flexDirection: "column",
					minHeight: "420px",
					maxHeight: "600px",
					padding: "16px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						flex: 1,
						overflowY: "auto",
						display: "flex",
						flexDirection: "column",
						gap: "14px",
						paddingRight: "8px"
					},
					children: [messages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							textAlign: "center",
							color: "#888",
							marginTop: "80px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "icon-large",
								style: {
									fontSize: "48px",
									marginBottom: "12px"
								},
								children: "smart_toy"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Ask any Computer Science question" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								style: { fontSize: "0.9rem" },
								children: "Algorithms, Data Structures, DB Systems, Systems Architecture & Complexity Proofs."
							})
						]
					}) : messages.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							alignSelf: m.role === "user" ? "flex-end" : "flex-start",
							maxWidth: "80%",
							padding: "12px 16px",
							borderRadius: "12px",
							background: m.role === "user" ? "var(--btn-primary-bg, #2563eb)" : "rgba(255,255,255,0.06)",
							color: m.role === "user" ? "#ffffff" : "#e2e8f0",
							border: m.role === "user" ? "none" : "1px solid rgba(255,255,255,0.1)",
							lineHeight: "1.5"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
							style: {
								display: "block",
								marginBottom: "4px",
								opacity: .7,
								fontSize: "0.75rem"
							},
							children: m.role === "user" ? "You" : "AI Tutor"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							style: {
								whiteSpace: "pre-wrap",
								margin: 0
							},
							children: m.content
						})]
					}, m.id || i)), loading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							alignSelf: "flex-start",
							padding: "12px 16px",
							borderRadius: "12px",
							background: "rgba(255,255,255,0.06)",
							color: "#888"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { children: "pending" }), " Thinking..."]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSend,
					style: {
						display: "flex",
						gap: "10px",
						marginTop: "16px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "text",
						value: input,
						onChange: (e) => setInput(e.target.value),
						placeholder: remaining > 0 ? "Ask a concept question..." : "Daily limit reached (20 questions)",
						disabled: remaining <= 0 || loading,
						style: {
							flex: 1,
							padding: "12px",
							borderRadius: "8px",
							background: "#111",
							color: "#fff",
							border: "1px solid #333"
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						disabled: remaining <= 0 || loading || !input.trim(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { children: "send" }), " Ask"]
					})]
				})]
			})
		]
	}) });
}
function MapPage() {
	const [roadmap, setRoadmap] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
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
	const pct = Math.round(completed / total * 100);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "page-stack map-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "course-bar",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { children: "terminal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "CS301: Data Structures & Algorithmic Design" })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { children: "Core Engineering" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "ABET Accredited" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "soft",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { children: "picture_as_pdf" }), "Download Syllabus PDF"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { children: "play_arrow" }), "Resume Current Module"] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "map-summary",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Curriculum Mastery Track" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: [
						pct,
						"% Completed ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pill, { children: [
							completed,
							" / ",
							total,
							" Units Mastered"
						] })
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, { value: pct }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "progress-labels",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Unit 1 (100%)" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Unit 2 (100%)" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Unit 3 (75%)" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Unit 4 (Active)" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Unit 5 (Locked)" })
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Weekly Pacing Status" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "status-dot" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "On Schedule" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"Target Exam Date: ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Dec 14" }),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "18 days left" })
					] })
				] })]
			}),
			roadmap.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "unit unit-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "01" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Curriculum Progress Topics" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Generated dynamically from active class modules" })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pill, {
						tone: "green",
						children: [
							completed,
							" / ",
							total,
							" Completed"
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "topic-grid",
					children: roadmap.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: t.status === "current" ? "topic active-topic" : t.status === "upcoming" ? "topic locked" : "topic",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
								tone: t.status === "completed" ? "green" : t.status === "current" ? "blue" : "gray",
								children: t.status === "completed" ? "Verified" : t.status === "current" ? "Active Topic" : "Locked"
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: t.title }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Domain: ", t.domain || "Core CS"] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", { children: [t.score !== void 0 && t.score !== null ? `Score: ${t.score}%` : "Pending Attempt", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { children: [t.status === "current" ? "Resume" : "Review", " ›"] })] })
						]
					}, t.id))
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "unit unit-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "01" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Foundations & Asymptotic Notation" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Mathematical primitives, recurrence relations, and algorithm complexity verification" })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
						tone: "green",
						children: "Completed • 100%"
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "topic-grid",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "topic",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
								tone: "green",
								children: "Verified"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "3.5 hrs" })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: "Big-O & Asymptotic Bounds" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Worst, average, and best-case analysis" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", { children: ["1 Quiz Completed", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { children: "Review ›" })] })
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "topic",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
								tone: "green",
								children: "Verified"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "2.0 hrs" })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: "Master Theorem" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Recursive divide-and-conquer recurrences" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", { children: ["1 Quiz Completed", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { children: "Review ›" })] })
						]
					})]
				})]
			})
		]
	}) });
}
function LeaderboardPage() {
	const { profile } = useProfile();
	const [scope, setScope] = (0, import_react.useState)("Cohort: CS301");
	const [leaders, setLeaders] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
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
	const top1 = leaders[0] || {
		name: "Elena Rostova",
		total_xp: 3420
	};
	const top2 = leaders[1] || {
		name: "Marcus Vance",
		total_xp: 3210
	};
	const top3 = leaders[2] || {
		name: "Sophia Patel",
		total_xp: 3090
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "page-stack",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "leader-head",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: ["Eval // Benchmarking_Engine ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "success",
						children: "● Fall 2024 Verified"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", { children: [
						"Academic",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						"Leaderboard"
					] })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Cohort CS301 · Data Structures & Algorithms" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "segmented",
						children: [
							"Cohort: CS301",
							"Department-Wide",
							"Global Ranking"
						].map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: scope === x ? "active" : "",
							onClick: () => setScope(x),
							children: x
						}, x))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "podium",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RankCard, {
						rank: "#2",
						tier: "Silver Tier",
						name: top2.name || top2.student_name,
						score: (top2.total_xp || 3210).toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RankCard, {
						rank: "#1",
						tier: "Cohort Laureate",
						name: top1.name || top1.student_name,
						score: (top1.total_xp || 3420).toLocaleString(),
						winner: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RankCard, {
						rank: "#3",
						tier: "Bronze Tier",
						name: top3.name || top3.student_name,
						score: (top3.total_xp || 3090).toLocaleString()
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "leader-grid",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "section-title",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Cohort Standings" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pill, { children: [leaders.length || 142, " Enrolled"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "● Live Calculation" })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "table-wrap",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "ranking",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Rank" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Scholar" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "XP Score" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" })
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: leaders.length > 0 ? leaders.map((s, i) => {
							const isMe = profile && (s.student_id === profile.id || s.user_id === profile.id || s.name === profile.name);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: isMe ? "you-row" : "",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: ["#", i + 1] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { children: s.name?.substring(0, 2).toUpperCase() || "ST" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
										s.name,
										" ",
										isMe && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { children: "YOU" })
									] })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [(s.total_xp || 0).toLocaleString(), " PTS"] }) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "success",
										children: "Active"
									})
								]
							}, s.student_id || i);
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "you-row",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "#8" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { children: "YOU" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: ["Alex Chen ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { children: "Top 8%" })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "CS-2023-0184" })
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "2,840" }) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "success",
									children: "Active"
								})
							]
						}) }) })]
					})
				})] })
			})
		]
	}) });
}
function RankCard({ rank, tier, name, score, winner }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: winner ? "rank-card winner" : "rank-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: tier }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { children: rank }), name] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "UID · CS-2024-Verified" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", { children: [
				"Academic Index ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: score }),
				" PTS"
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, { value: winner ? 98 : 90 })
		]
	});
}
function QuizPage() {
	const [quizzes, setQuizzes] = (0, import_react.useState)([]);
	const [selectedQuiz, setSelectedQuiz] = (0, import_react.useState)(null);
	const [questions, setQuestions] = (0, import_react.useState)([]);
	const [currentQ, setCurrentQ] = (0, import_react.useState)(0);
	const [answers, setAnswers] = (0, import_react.useState)({});
	const [difficulty, setDifficulty] = (0, import_react.useState)("All");
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [result, setResult] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
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
	const startQuiz = async (quiz) => {
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
			const payloadAnswers = {};
			questions.forEach((q, idx) => {
				if (answers[idx] !== void 0) payloadAnswers[q.id] = answers[idx];
			});
			const res = await fetchWithAuth("/student/quiz/submit", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					quiz_id: selectedQuiz.id,
					answers: payloadAnswers
				})
			});
			if (res.ok) {
				const resData = await res.json();
				setResult(resData);
			} else {
				const errData = await res.json();
				alert(errData.detail || "Submission failed");
			}
		} catch (err) {
			alert("Failed to submit quiz: " + err.message);
		} finally {
			setSubmitting(false);
		}
	};
	const q = questions[currentQ];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "page-stack quiz-page",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "quiz-stats",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Active Mastery" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "74.2%" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
						className: "success",
						children: "+3.8% vs cohort median"
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Available Quizzes" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: quizzes.length || 6 }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Ready for evaluation" })
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Academic Velocity" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "1,420" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Tier A CS Honour Track" })
				] })
			]
		}), !selectedQuiz ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "problem-bank",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "filters",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { children: "search" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { placeholder: "Search quizzes..." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					value: difficulty,
					onChange: (e) => setDifficulty(e.target.value),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "All" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Easy" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Medium" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Hard" })
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "table-wrap",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Topic" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Domain" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Questions" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Action" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: quizzes.length > 0 ? quizzes.map((qz) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: qz.topic }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
						tone: "gray",
						children: qz.domain || "CS"
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [qz.questions?.length || 5, " Items"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => startQuiz(qz),
						children: "Start Quiz"
					}) })
				] }, qz.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Algorithm Analysis & Complexities" }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
						tone: "gray",
						children: "Algorithms"
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "5 Items" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => startQuiz({
							id: "mock",
							topic: "Algorithm Analysis"
						}),
						children: "Start Mock"
					}) })
				] }) })] })
			})]
		}) : result ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			style: {
				padding: "24px",
				textAlign: "center"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					className: "icon-large",
					style: {
						fontSize: "56px",
						color: "var(--success, #22c55e)"
					},
					children: "task_alt"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Quiz Submitted Successfully!" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"Score: ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [result.score, "%"] }),
					" • XP Earned: ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
						"+",
						result.xp_earned,
						" XP"
					] })
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => setSelectedQuiz(null),
					children: "Back to Quizzes"
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "exam",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "exam-label",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "● Live Examination Mode" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
					tone: "green",
					children: selectedQuiz.topic
				})]
			}), questions.length > 0 && q ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: [
					"Question ",
					currentQ + 1,
					" of ",
					questions.length
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, { value: (currentQ + 1) / questions.length * 100 }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "question",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: q.text })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "options",
					children: Object.entries(q.options || {}).map(([optKey, optVal]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: answers[currentQ] === optKey ? "selected" : "",
						onClick: () => setAnswers({
							...answers,
							[currentQ]: optKey
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { children: answers[currentQ] === optKey ? "●" : "○" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
							optKey,
							": ",
							String(optVal)
						] }) })]
					}, optKey))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "exam-actions",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "soft",
						disabled: currentQ === 0,
						onClick: () => setCurrentQ(currentQ - 1),
						children: "← Previous"
					}), currentQ < questions.length - 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => setCurrentQ(currentQ + 1),
						children: "Next Question →"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: submitExam,
						disabled: submitting,
						children: submitting ? "Submitting..." : "Submit Quiz"
					})]
				})
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Loading questions..." })]
		})]
	}) });
}
function AssignmentsPage() {
	const { profile } = useProfile();
	const [assignments, setAssignments] = (0, import_react.useState)([]);
	const [selectedIdx, setSelectedIdx] = (0, import_react.useState)(0);
	const [file, setFile] = (0, import_react.useState)(null);
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const [newTitle, setNewTitle] = (0, import_react.useState)("");
	const [newDesc, setNewDesc] = (0, import_react.useState)("");
	const [newDueDate, setNewDueDate] = (0, import_react.useState)("");
	const [creating, setCreating] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
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
	const submitAssignmentFile = async (e) => {
		e.preventDefault();
		if (!current || !file || uploading) return;
		setUploading(true);
		try {
			const formData = new FormData();
			formData.append("file", file);
			const res = await fetchWithAuth(`/assignments/${current.id}/submit`, {
				method: "POST",
				body: formData
			});
			if (res.ok) {
				const updatedSub = await res.json();
				setAssignments((prev) => prev.map((a, i) => i === selectedIdx ? {
					...a,
					my_submission: updatedSub
				} : a));
				alert("Assignment submitted successfully!");
			} else {
				const errData = await res.json();
				alert(errData.detail || "Submission failed");
			}
		} catch (err) {
			alert("Upload failed: " + err.message);
		} finally {
			setUploading(false);
		}
	};
	const handleCreateAssignment = async (e) => {
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
					due_date: newDueDate || void 0,
					class_id: profile?.class_name || "default"
				})
			});
			if (res.ok) {
				const created = await res.json();
				setAssignments((prev) => [created, ...prev]);
				setNewTitle("");
				setNewDesc("");
				setNewDueDate("");
				alert("Assignment created!");
			}
		} catch (err) {
			alert("Failed to create assignment");
		} finally {
			setCreating(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "page-stack",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "assign-head",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", { children: ["Course Assignments ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { children: "CS301: Data Structures & Algorithms" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Academic Term: Fall 2024 • Synchronized with LMS" })] })
			}),
			profile?.role === "teacher" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				style: {
					padding: "16px",
					marginBottom: "16px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Create New Assignment" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleCreateAssignment,
					style: {
						display: "flex",
						flexWrap: "wrap",
						gap: "10px",
						marginTop: "10px"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							placeholder: "Title",
							value: newTitle,
							onChange: (e) => setNewTitle(e.target.value),
							required: true,
							style: {
								flex: "1 1 200px",
								padding: "8px",
								borderRadius: "6px",
								background: "#111",
								color: "#fff",
								border: "1px solid #333"
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "date",
							value: newDueDate,
							onChange: (e) => setNewDueDate(e.target.value),
							style: {
								padding: "8px",
								borderRadius: "6px",
								background: "#111",
								color: "#fff",
								border: "1px solid #333"
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							placeholder: "Description",
							value: newDesc,
							onChange: (e) => setNewDesc(e.target.value),
							style: {
								flex: "2 1 300px",
								padding: "8px",
								borderRadius: "6px",
								background: "#111",
								color: "#fff",
								border: "1px solid #333"
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: creating,
							children: creating ? "Creating..." : "Create"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "assignment-layout",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "section-title",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Deliverable Queue" })
				}), assignments.length > 0 ? assignments.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setSelectedIdx(i),
					className: selectedIdx === i ? "deliverable active" : "deliverable",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: [d.title, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
							tone: d.my_submission ? "green" : "red",
							children: d.my_submission ? d.my_submission.grade ? `Graded: ${d.my_submission.grade}` : "Submitted" : "Not Submitted"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: d.description || "Course deliverable" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "CS301" }),
							" • ",
							d.due_date || "Upcoming"
						] })
					]
				}, d.id || i)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					style: {
						padding: "16px",
						color: "#888"
					},
					children: "No active assignments."
				})] }), current && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "assignment-detail",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "focus-box",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: current.title }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: current.description }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Deadline", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
									className: "danger",
									children: current.due_date || "N/A"
								})] }) })
							]
						}),
						profile?.role === "student" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: submitAssignmentFile,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
									className: "subhead",
									children: "Student Submission Workbench"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "dropzone",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { children: "cloud_upload" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Drag and drop your PDF or document" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "file",
											onChange: (e) => setFile(e.target.files?.[0] || null)
										}),
										file && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											style: {
												color: "#22c55e",
												marginTop: "8px"
											},
											children: ["Selected: ", file.name]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "submit",
									disabled: !file || uploading,
									style: { marginTop: "12px" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { children: "send" }), uploading ? "Uploading..." : current.my_submission ? "Resubmit Assignment" : "Turn In Assignment"]
								})
							]
						}),
						current.my_submission && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "blueprint",
							style: { marginTop: "16px" },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "section-title",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Submission Status" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Submitted on: ", new Date(current.my_submission.submitted_at).toLocaleString()] }),
								current.my_submission.grade && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									style: {
										color: "#22c55e",
										fontSize: "1.1rem"
									},
									children: ["Grade: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: current.my_submission.grade })]
								}),
								current.my_submission.feedback && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("blockquote", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Feedback:" }),
									" ",
									current.my_submission.feedback
								] })
							]
						})
					]
				})]
			})
		]
	}) });
}
//#endregion
export { QuizPage as a, MapPage as i, LeaderboardPage as n, SignupPage as o, LoginPage as r, StudyGuidePage as s, AssignmentsPage as t };
